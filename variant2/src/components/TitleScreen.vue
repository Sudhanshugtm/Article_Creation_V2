<template>
  <!-- ABOUTME: Title input screen — first step of article creation flow -->
  <!-- ABOUTME: Shows CdxTextInput, Wikidata search with debounce, exact-match warnings -->
  <div>
    <div class="input-block">
      <CdxTextInput
        :model-value="query"
        placeholder="Type article title"
        aria-label="Article title"
        class="borderless-input"
        @update:model-value="$emit('update:query', $event)"
      />
      <div v-if="isLoading" class="loading-row">
        <CdxProgressIndicator class="title-progress" />
        <span class="loading-label">Checking...</span>
      </div>

      <p v-if="exactMatch && !isLoading" class="exists-hint">
        "<strong>{{ exactMatch.label }}</strong>" already exists in {{ exactMatch.wikiLang }} Wikipedia.
        <a :href="exactMatch.localWikiUrl" target="_blank">Read it</a> or try another.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue';
import { CdxTextInput, CdxProgressIndicator } from '@wikimedia/codex';
import { fetchWikidataResults } from '../data/wikidataHelpers.js';

const props = defineProps({
  query: { type: String, default: '' }
});

const emit = defineEmits(['update:query', 'advance']);

const isLoading = ref(false);
const exactMatch = ref(null);

let loadingTimer = null;
let completeTimer = null;

watch(() => props.query, (val) => {
  isLoading.value = false;
  exactMatch.value = null;
  if (loadingTimer) clearTimeout(loadingTimer);
  if (completeTimer) clearTimeout(completeTimer);

  if (val.trim().length > 0) {
    loadingTimer = setTimeout(() => {
      isLoading.value = true;
      completeTimer = setTimeout(async () => {
        try {
          const result = await fetchWikidataResults(val);
          isLoading.value = false;

          if (result.exactMatch) {
            exactMatch.value = result.exactMatch;
            return;
          }

          // Filter to creatable topics (no local article)
          const creatableTopics = result.results.filter(t => !t.hasLocalArticle);

          if (creatableTopics.length > 0) {
            emit('advance', 'disambiguate', {
              wikidataResults: result.results,
              creatableTopics
            });
          } else if (result.results.length > 0) {
            // All results have local articles — go to manual type selection
            emit('advance', 'article-type', {
              wikidataResults: result.results,
              creatableTopics: []
            });
          } else {
            // No results at all — go to article-type
            emit('advance', 'article-type', {
              wikidataResults: [],
              creatableTopics: []
            });
          }
        } catch (error) {
          console.error('Wikidata fetch error:', error);
          isLoading.value = false;
        }
      }, 1000);
    }, 500);
  }
});

// Reset state when screen becomes visible again
function reset() {
  isLoading.value = false;
  exactMatch.value = null;
  if (loadingTimer) clearTimeout(loadingTimer);
  if (completeTimer) clearTimeout(completeTimer);
}

defineExpose({ reset });

onBeforeUnmount(() => {
  if (loadingTimer) clearTimeout(loadingTimer);
  if (completeTimer) clearTimeout(completeTimer);
});
</script>
