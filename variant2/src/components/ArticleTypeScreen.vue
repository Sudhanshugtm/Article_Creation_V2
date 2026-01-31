<template>
  <!-- ABOUTME: Article type selection screen — lets user pick Person/Place/Organization/Event -->
  <!-- ABOUTME: Includes similar-article search with SPARQL-based auto-detection of type -->
  <div>
    <h3 class="question-title">What is "{{ query }}"?</h3>

    <!-- PRIMARY: Type cards always visible -->
    <div class="type-cards-section">
      <div class="topic-list">
        <CdxCard
          v-for="type in visibleArticleTypes"
          :key="type.id"
          :class="['topic-card', { 'topic-card--suggested': detectedType === type.id }]"
          @click="$emit('select-type', type)"
        >
          <template #title>
            <span class="type-card-title">
              <CdxIcon :icon="typeIcons[type.id]" size="small" />
              {{ type.label }}
            </span>
          </template>
          <template #description>{{ type.description }}</template>
        </CdxCard>
      </div>
    </div>

    <!-- SECONDARY: Similar-article search (always visible, visually lightweight) -->
    <div class="similar-search-section">
      <label class="similar-search-label">Similar to existing articles</label>

      <div class="similar-search-input-wrapper">
        <CdxTextInput
          v-model="similarQuery"
          placeholder="Search Wikipedia or paste a URL"
          aria-label="Search for a similar Wikipedia article"
          :disabled="isDetectingType"
        />

        <ul
          v-if="similarResults.length > 0 && !selectedSimilarArticle && !isUrlInput"
          class="similar-results-dropdown"
        >
          <li
            v-for="result in similarResults"
            :key="result.title"
            class="similar-result-item"
            @click="onSelectSimilarArticle(result)"
          >
            <span class="similar-result-title">{{ result.title }}</span>
            <span v-if="result.description" class="similar-result-desc">{{ result.description }}</span>
          </li>
        </ul>

        <div v-if="isSearchingSimilar" class="loading-row">
          <CdxProgressIndicator class="title-progress" />
          <span class="loading-label">Searching...</span>
        </div>
      </div>

      <!-- Post-selection state: reads as type detection result -->
      <div v-if="selectedSimilarArticle" class="similar-selected-card">
        <template v-if="isDetectingType">
          <div class="similar-selected-header">
            <CdxProgressIndicator class="inline-progress" />
            <span class="similar-detecting-label">Detecting type...</span>
          </div>
        </template>
        <template v-else-if="detectedType">
          <p class="detection-result-line">
            Looks like a <strong>{{ TYPE_LABELS[detectedType] }}</strong>
          </p>
          <p class="detection-basis-line">
            Based on "{{ selectedSimilarArticle.title }}"
          </p>
        </template>
        <template v-else-if="detectionFailed">
          <p class="detection-failed-hint">
            Couldn't detect the type. Pick one above.
          </p>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue';
import { CdxCard, CdxIcon, CdxTextInput, CdxProgressIndicator } from '@wikimedia/codex';
import {
  visibleArticleTypes,
  typeIcons,
  TYPE_LABELS,
  parseWikipediaUrl,
  searchWikipediaArticles,
  detectArticleType
} from '../data/wikidataHelpers.js';

defineProps({
  query: { type: String, required: true }
});

defineEmits(['select-type']);

const similarQuery = ref('');
const similarResults = ref([]);
const selectedSimilarArticle = ref(null);
const isSearchingSimilar = ref(false);
const isDetectingType = ref(false);
const detectedType = ref(null);
const detectionFailed = ref(false);
const isUrlInput = ref(false);

let similarDebounceTimer = null;

async function onSelectSimilarArticle(article) {
  selectedSimilarArticle.value = article;
  similarResults.value = [];
  similarQuery.value = article.title;
  isDetectingType.value = true;
  detectionFailed.value = false;
  detectedType.value = null;

  const typeId = await detectArticleType(article.title);

  isDetectingType.value = false;
  if (typeId) {
    detectedType.value = typeId;
  } else {
    detectionFailed.value = true;
  }
}

// Watcher for similar article search with 300ms debounce + URL detection
watch(similarQuery, (val) => {
  if (similarDebounceTimer) clearTimeout(similarDebounceTimer);
  // Reset detection state when typing
  selectedSimilarArticle.value = null;
  detectedType.value = null;
  detectionFailed.value = false;
  isUrlInput.value = false;

  const trimmed = val.trim();
  if (trimmed.length < 2) {
    similarResults.value = [];
    return;
  }

  // Check if input is a Wikipedia URL
  const urlParsed = parseWikipediaUrl(trimmed);
  if (urlParsed) {
    isUrlInput.value = true;
    similarResults.value = [];
    onSelectSimilarArticle({ title: urlParsed.title, description: '' });
    return;
  }

  // Regular text input — debounce autocomplete search
  similarDebounceTimer = setTimeout(async () => {
    isSearchingSimilar.value = true;
    try {
      similarResults.value = await searchWikipediaArticles(val);
    } catch (error) {
      console.error('Wikipedia opensearch error:', error);
      similarResults.value = [];
    } finally {
      isSearchingSimilar.value = false;
    }
  }, 300);
});

// Reset state when navigating away
function reset() {
  similarQuery.value = '';
  similarResults.value = [];
  selectedSimilarArticle.value = null;
  detectedType.value = null;
  detectionFailed.value = false;
  isDetectingType.value = false;
  isUrlInput.value = false;
}

defineExpose({ reset });

onBeforeUnmount(() => {
  if (similarDebounceTimer) clearTimeout(similarDebounceTimer);
});
</script>
