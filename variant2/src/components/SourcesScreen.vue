<template>
  <!-- ABOUTME: Sources screen — lets users add URLs for verification before writing -->
  <!-- ABOUTME: Domain-based heuristic verification, Wikidata suggested sources, skip option -->
  <div class="sources-screen">
    <div class="sources-scroll-area">
      <h3 class="question-title">Add sources for "{{ query }}"</h3>
      <p class="question-subtitle">Sources help reviewers verify what you write.</p>

      <!-- Source input rows -->
      <div class="sources-input-list">
        <div v-for="(source, index) in sources" :key="index" class="source-input-row">
          <div class="source-input-wrapper">
            <CdxTextInput
              v-model="source.url"
              type="url"
              placeholder="Paste a URL here..."
              :aria-label="'Source URL ' + (index + 1)"
              :status="source.status === 'invalid' ? 'error' : undefined"
              @update:model-value="onSourceInput(index)"
            />
            <!-- Verification status -->
            <div v-if="source.checking" class="verification-row">
              <CdxProgressIndicator class="inline-progress" />
              <span class="verification-text">Checking source...</span>
            </div>
            <div v-else-if="source.status === 'invalid'" class="verification-row verification-error">
              <CdxIcon :icon="cdxIconAlert" class="verification-icon--error" />
              <span class="verification-text--error">
                Non-independent source. Social media profiles cannot prove notability.
                Try finding a news article instead.
              </span>
            </div>
            <div v-else-if="source.status === 'unknown' && source.url.trim()" class="verification-row verification-hint">
              <CdxIcon :icon="cdxIconReference" class="verification-icon--hint" />
              <a href="#" class="guidelines-link" @click.prevent="showGuidelines = true">
                Check it meets the guidelines
              </a>
            </div>
          </div>
        </div>

        <!-- Add another source button -->
        <CdxButton
          weight="quiet"
          class="add-source-btn"
          @click="addSourceRow"
        >
          <CdxIcon :icon="cdxIconAdd" />
          Add another source
        </CdxButton>
      </div>

      <!-- Wikidata suggested sources -->
      <div v-if="wikidataSources.length > 0" class="suggested-sources-section">
        <h4 class="suggested-sources-heading">Suggested from Wikidata</h4>
        <div
          v-for="(ws, i) in wikidataSources"
          :key="i"
          :class="['suggested-source-item', { 'suggested-source-item--selected': ws.selected }]"
          @click="toggleWikidataSource(i)"
        >
          <div class="source-checkbox">
            <CdxIcon v-if="ws.selected" :icon="cdxIconCheck" class="check-icon" />
          </div>
          <div class="suggested-source-content">
            <span class="suggested-source-title">{{ ws.title }}</span>
            <span class="suggested-source-meta">Wikidata reference</span>
          </div>
        </div>
      </div>

      <!-- Good sources guide (expandable) -->
      <details class="good-sources-guide">
        <summary class="good-sources-summary">
          <CdxIcon :icon="cdxIconReference" />
          <span>What makes a good source?</span>
        </summary>
        <div class="good-sources-content">
          <p class="guide-subheading">Good sources are:</p>
          <ul class="guide-list guide-list--pass">
            <li>Written by someone with no connection to the subject</li>
            <li>Published by a reputable source with editorial standards</li>
            <li>Substantial and focused on the subject, not just a mention</li>
          </ul>
          <p class="guide-subheading">These will not work:</p>
          <ul class="guide-list guide-list--fail">
            <li>The subject's own website or press releases</li>
            <li>Social media (LinkedIn, Facebook, Instagram)</li>
            <li>Blogs without editorial oversight</li>
          </ul>
        </div>
      </details>
    </div>

    <!-- Fixed footer -->
    <div class="sources-footer">
      <CdxButton
        weight="primary"
        action="progressive"
        :disabled="!hasValidSource"
        @click="onProceed"
      >
        Start writing
      </CdxButton>
      <a href="#" class="skip-link" @click.prevent="$emit('skip')">
        I'll add sources later
      </a>
    </div>

    <!-- Guidelines overlay (simple) -->
    <div v-if="showGuidelines" class="guidelines-overlay" @click.self="showGuidelines = false">
      <div class="guidelines-panel">
        <div class="guidelines-header">
          <h3>Good sources</h3>
          <CdxButton weight="quiet" aria-label="Close" @click="showGuidelines = false">
            <CdxIcon :icon="cdxIconClose" />
          </CdxButton>
        </div>
        <div class="guidelines-body">
          <p><strong>Examples of good sources:</strong> BBC, NYT, Nature, Reuters, Britannica</p>
          <p><strong>Examples of bad sources:</strong> LinkedIn, Reddit, IMDB, company websites, press releases</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { CdxButton, CdxTextInput, CdxIcon, CdxProgressIndicator } from '@wikimedia/codex';
import { cdxIconAdd, cdxIconCheck, cdxIconAlert, cdxIconReference, cdxIconClose } from '@wikimedia/codex-icons';
import { classifySourceDomain } from '../data/articleTypes.js';
import { fetchEntitySources } from '../data/wikidataHelpers.js';

const props = defineProps({
  query: { type: String, required: true },
  confirmedTopic: { type: Object, default: null },
  selectedArticleType: { type: String, default: null }
});

const emit = defineEmits(['proceed', 'skip']);

const sources = ref([
  { url: '', status: null, checking: false }
]);

const wikidataSources = ref([]);
const showGuidelines = ref(false);

let debounceTimers = {};

const hasValidSource = computed(() => {
  const hasManualValid = sources.value.some(
    s => s.url.trim() && (s.status === 'valid' || s.status === 'unknown')
  );
  const hasWikidataSelected = wikidataSources.value.some(ws => ws.selected);
  return hasManualValid || hasWikidataSelected;
});

function addSourceRow() {
  sources.value.push({ url: '', status: null, checking: false });
}

function onSourceInput(index) {
  const source = sources.value[index];
  source.status = null;
  source.checking = false;

  // Clear existing debounce for this row
  if (debounceTimers[index]) clearTimeout(debounceTimers[index]);

  const url = source.url.trim();
  if (!url || url.length < 4 || !url.includes('.')) {
    return;
  }

  // Auto-prepend https:// for classification
  let normalizedUrl = url;
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = 'https://' + normalizedUrl;
  }

  // Start checking with small debounce
  debounceTimers[index] = setTimeout(() => {
    source.checking = true;

    // Brief artificial delay for UX feel
    setTimeout(() => {
      const classification = classifySourceDomain(normalizedUrl);
      source.status = classification;
      source.checking = false;
    }, 300);
  }, 400);
}

function toggleWikidataSource(index) {
  wikidataSources.value[index].selected = !wikidataSources.value[index].selected;
}

function onProceed() {
  const validSources = sources.value
    .filter(s => s.url.trim() && s.status !== 'invalid')
    .map(s => {
      let url = s.url.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      return { url, status: s.status };
    });

  // Include selected Wikidata sources
  const selectedWikidata = wikidataSources.value
    .filter(ws => ws.selected)
    .map(ws => ({ url: ws.url, status: 'valid', source: 'wikidata' }));

  emit('proceed', [...validSources, ...selectedWikidata]);
}

// Fetch Wikidata suggested sources when topic has a QID
onMounted(async () => {
  const qid = props.confirmedTopic?.id;
  if (qid && qid.startsWith('Q')) {
    try {
      const entitySources = await fetchEntitySources(qid);
      wikidataSources.value = entitySources.map(s => ({
        ...s,
        selected: false
      }));
    } catch (error) {
      console.error('Failed to fetch Wikidata sources:', error);
    }
  }
});
</script>

<style scoped>
.sources-screen {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.sources-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 16px;
}

.sources-input-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.source-input-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.source-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.verification-row {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 4px 0;
  font-size: var(--font-size-small, 13px);
}

.verification-text {
  color: var(--color-subtle, #54595d);
}

.verification-error {
  color: var(--color-error, #d73333);
}

.verification-text--error {
  color: var(--color-error, #d73333);
  font-size: var(--font-size-small, 13px);
}

.verification-icon--error {
  color: var(--color-error, #d73333);
  flex-shrink: 0;
}

.verification-hint {
  color: var(--color-subtle, #54595d);
}

.verification-icon--hint {
  color: var(--color-subtle, #72777d);
  flex-shrink: 0;
}

.guidelines-link {
  color: var(--color-progressive, #36c);
  text-decoration: none;
  font-size: var(--font-size-small, 13px);
}

.guidelines-link:hover {
  text-decoration: underline;
}

.add-source-btn {
  align-self: flex-start;
}

/* Suggested sources from Wikidata */
.suggested-sources-section {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color-subtle, #c8ccd1);
}

.suggested-sources-heading {
  margin: 0 0 12px;
  font-size: var(--font-size-small, 14px);
  font-weight: 600;
  color: var(--color-subtle, #54595d);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.suggested-source-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  border: 1px solid var(--border-color-subtle, #c8ccd1);
  border-radius: 4px;
  margin-bottom: 8px;
  cursor: pointer;
}

.suggested-source-item:hover {
  background-color: var(--background-color-interactive-subtle, #f8f9fa);
}

.suggested-source-item--selected {
  border-color: var(--color-progressive, #36c);
  background-color: var(--background-color-progressive-subtle, #eaf3ff);
}

.source-checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-color-base, #a2a9b1);
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.suggested-source-item--selected .source-checkbox {
  border-color: var(--color-progressive, #36c);
  background-color: var(--color-progressive, #36c);
}

.check-icon {
  color: #fff;
}

.suggested-source-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.suggested-source-title {
  font-size: var(--font-size-small, 14px);
  color: var(--color-base, #202122);
  word-break: break-all;
}

.suggested-source-meta {
  font-size: var(--font-size-x-small, 12px);
  color: var(--color-subtle, #54595d);
}

/* Good sources guide (expandable) */
.good-sources-guide {
  margin-top: 24px;
  border: 1px solid var(--border-color-subtle, #c8ccd1);
  border-radius: 4px;
  overflow: hidden;
}

.good-sources-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  cursor: pointer;
  font-size: var(--font-size-small, 14px);
  color: var(--color-base, #202122);
  font-weight: 500;
}

.good-sources-summary::-webkit-details-marker {
  display: none;
}

.good-sources-content {
  padding: 0 12px 12px;
}

.guide-subheading {
  margin: 8px 0 4px;
  font-size: var(--font-size-small, 13px);
  font-weight: 600;
  color: var(--color-subtle, #54595d);
}

.guide-list {
  margin: 4px 0 12px;
  padding-left: 20px;
  font-size: var(--font-size-small, 13px);
  color: var(--color-subtle, #54595d);
}

.guide-list li {
  margin-bottom: 4px;
}

.guide-list--pass li::marker {
  color: var(--color-success, #177860);
}

.guide-list--fail li::marker {
  color: var(--color-error, #d73333);
}

/* Fixed footer */
.sources-footer {
  padding-top: 16px;
  border-top: 1px solid var(--border-color-subtle, #c8ccd1);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
}

.sources-footer .cdx-button {
  width: 100%;
}

.skip-link {
  text-align: center;
  color: var(--color-subtle, #54595d);
  font-size: var(--font-size-small, 14px);
  text-decoration: none;
}

.skip-link:hover {
  text-decoration: underline;
  color: var(--color-progressive, #36c);
}

/* Guidelines overlay */
.guidelines-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.guidelines-panel {
  background: var(--background-color-base, #fff);
  border-radius: 12px 12px 0 0;
  width: 100%;
  max-width: 360px;
  max-height: 70vh;
  overflow-y: auto;
}

.guidelines-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--border-color-subtle, #c8ccd1);
}

.guidelines-header h3 {
  margin: 0;
  font-size: 1rem;
}

.guidelines-body {
  padding: 16px;
  font-size: var(--font-size-small, 14px);
  color: var(--color-subtle, #54595d);
}

.guidelines-body p {
  margin: 8px 0;
}
</style>
