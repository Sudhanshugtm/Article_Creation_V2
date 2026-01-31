<template>
  <!-- ABOUTME: App shell — phone frame, header, step router, shared state for article creation -->
  <!-- ABOUTME: Orchestrates 5 screen components: Title, Disambiguate, ArticleType, Sources, Editor -->
  <main class="page">
    <section class="phone">
      <header class="cdx-dialog__header">
        <CdxButton v-if="step !== 'title'" weight="quiet" class="back-button" aria-label="Go back" @click="onBack">
          <CdxIcon :icon="cdxIconArrowPrevious" />
        </CdxButton>
        <span v-else class="header-spacer"></span>

        <!-- Toolbar replaces title on editor screen -->
        <template v-if="step === 'editor'">
          <div class="header-toolbar">
            <CdxButton weight="quiet" class="toolbar-btn" aria-label="Undo">
              <CdxIcon :icon="cdxIconUndo" />
            </CdxButton>
            <CdxButton weight="quiet" class="toolbar-btn" aria-label="Bold / Italic">
              <CdxIcon :icon="cdxIconTextStyle" />
            </CdxButton>
            <CdxButton weight="quiet" class="toolbar-btn" aria-label="Insert link">
              <CdxIcon :icon="cdxIconLink" />
            </CdxButton>
            <CdxButton weight="quiet" class="toolbar-btn" aria-label="Insert quote">
              <CdxIcon :icon="cdxIconQuotes" />
            </CdxButton>
          </div>
        </template>
        <h2 v-else class="cdx-dialog__header__title">New article</h2>

        <span class="header-spacer"></span>
      </header>

      <div class="content">
        <div v-show="step === 'title'">
          <TitleScreen
            ref="titleScreen"
            :query="query"
            @update:query="query = $event"
            @advance="onTitleAdvance"
          />
        </div>

        <div v-show="step === 'disambiguate'">
          <DisambiguateScreen
            :query="query"
            :creatable-topics="creatableTopics"
            @select-topic="onSelectTopic"
            @select-none="step = 'article-type'"
          />
        </div>

        <div v-show="step === 'article-type'">
          <ArticleTypeScreen
            ref="articleTypeScreen"
            :query="query"
            @select-type="onSelectArticleType"
          />
        </div>

        <div v-show="step === 'sources'">
          <SourcesScreen
            v-if="sourcesReady"
            :query="query"
            :confirmed-topic="confirmedTopic"
            :selected-article-type="selectedArticleType"
            @proceed="onSourcesProceed"
            @skip="onSourcesSkip"
          />
        </div>

        <div v-show="step === 'editor'">
          <EditorScreen
            v-if="editorReady"
            :query="query"
            :confirmed-topic="confirmedTopic"
            :selected-article-type="selectedArticleType"
            :user-sources="userSources"
          />
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue';
import { CdxButton, CdxIcon } from '@wikimedia/codex';
import {
  cdxIconArrowPrevious,
  cdxIconUndo,
  cdxIconTextStyle,
  cdxIconLink,
  cdxIconQuotes
} from '@wikimedia/codex-icons';

import TitleScreen from './components/TitleScreen.vue';
import DisambiguateScreen from './components/DisambiguateScreen.vue';
import ArticleTypeScreen from './components/ArticleTypeScreen.vue';
import SourcesScreen from './components/SourcesScreen.vue';
import EditorScreen from './components/EditorScreen.vue';

// --- Shared state ---
const step = ref('title');
const query = ref('');
const confirmedTopic = ref(null);
const selectedArticleType = ref('person'); // default
const wikidataResults = ref([]);
const creatableTopics = ref([]);
const userSources = ref([]);

// Component refs
const titleScreen = ref(null);
const articleTypeScreen = ref(null);

// Lazy-mount flags: only render Sources/Editor once their step is first reached
const sourcesReady = ref(false);
const editorReady = ref(false);

// --- Navigation handlers ---

function onTitleAdvance(nextStep, data) {
  if (data) {
    wikidataResults.value = data.wikidataResults || [];
    creatableTopics.value = data.creatableTopics || [];
  }
  step.value = nextStep;
}

function onSelectTopic(topic) {
  confirmedTopic.value = topic;
  sourcesReady.value = true;
  step.value = 'sources';
}

function onSelectArticleType(type) {
  selectedArticleType.value = type.id;
  confirmedTopic.value = {
    id: 'new',
    label: query.value,
    articleType: type,
    isNew: true
  };
  sourcesReady.value = true;
  step.value = 'sources';
}

function onSourcesProceed(sources) {
  userSources.value = sources;
  editorReady.value = true;
  step.value = 'editor';
}

function onSourcesSkip() {
  userSources.value = [];
  editorReady.value = true;
  step.value = 'editor';
}

function onBack() {
  if (step.value === 'editor') {
    step.value = 'sources';
    return;
  }
  if (step.value === 'sources') {
    step.value = 'article-type';
    return;
  }
  if (step.value === 'article-type') {
    if (creatableTopics.value.length > 0) {
      step.value = 'disambiguate';
    } else {
      goBackToTitle();
    }
    return;
  }
  if (step.value === 'disambiguate') {
    goBackToTitle();
    return;
  }
}

function goBackToTitle() {
  step.value = 'title';
  wikidataResults.value = [];
  creatableTopics.value = [];
  confirmedTopic.value = null;
  titleScreen.value?.reset();
  articleTypeScreen.value?.reset();
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  min-height: 100dvh;
  display: grid;
  place-items: start center;
  padding: 32px 16px;
  background: var(--background-color-interactive-subtle, #f8f9fa);
}

.phone {
  width: min(100%, 360px);
  min-height: 720px;
  background: var(--background-color-base, #fff);
  border: 1px solid var(--border-color-subtle, #c8ccd1);
  border-radius: 18px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* Use Codex dialog header pattern */
.cdx-dialog__header {
  display: flex;
  align-items: center;
  padding-top: calc(12px + env(safe-area-inset-top));
  padding-right: calc(16px + env(safe-area-inset-right));
  padding-left: calc(16px + env(safe-area-inset-left));
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color-subtle, #c8ccd1);
  gap: 8px;
}

.cdx-dialog__header__title {
  flex: 1;
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  text-align: center;
}

.back-button {
  min-width: auto;
  padding: 4px;
}

.header-spacer {
  width: 32px;
}

/* Header toolbar for editor screen */
.header-toolbar {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.toolbar-btn {
  min-width: auto;
  padding: 6px;
}

.content {
  padding-top: 24px;
  padding-right: calc(16px + env(safe-area-inset-right));
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  padding-left: calc(16px + env(safe-area-inset-left));
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* --- Shared styles for child components (applied via :deep) --- */

:deep(.question-title) {
  margin: 0;
  font-size: var(--font-size-large, 18px);
  font-weight: 700;
  color: var(--color-base, #202122);
}

:deep(.question-subtitle) {
  margin: 4px 0 16px;
  font-size: var(--font-size-small, 14px);
  color: var(--color-subtle, #54595d);
}

:deep(.input-block) {
  display: flex;
  flex-direction: column;
  gap: 0;
}

:deep(.loading-row) {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
}

:deep(.loading-label) {
  font-size: var(--font-size-small, 14px);
  color: var(--color-subtle, #54595d);
}

:deep(.exists-hint) {
  margin: 16px 0 0;
  font-size: var(--font-size-small, 14px);
  color: var(--color-subtle, #54595d);
}

:deep(.exists-hint a) {
  color: var(--color-progressive, #36c);
  text-decoration: none;
  margin-left: 4px;
}

:deep(.exists-hint a:hover) {
  text-decoration: underline;
}

:deep(.borderless-input .cdx-text-input__input) {
  border: none;
  border-bottom: 1px solid var(--border-color-base, #a2a9b1);
  border-radius: 0;
  box-shadow: none;
  background: transparent;
  font-size: var(--font-size-x-large, 20px);
  line-height: var(--line-height-x-large, 1.875rem);
  font-family: 'Linux Libertine', 'Georgia', 'Times', serif;
  padding-bottom: 8px;
}

:deep(.borderless-input .cdx-text-input__input:focus) {
  border: none;
  border-bottom: 2px solid var(--color-progressive, #36c);
  box-shadow: none;
  outline: none;
}

:deep(.borderless-input .cdx-text-input__input::placeholder) {
  color: var(--color-subtle, #54595d);
  font-size: var(--font-size-x-large, 20px);
  font-weight: 400;
  opacity: 0.5;
  font-family: 'Linux Libertine', 'Georgia', 'Times', serif;
}

:deep(.borderless-input .cdx-text-input__input) {
  caret-color: var(--color-progressive, #36c);
}

/* Topic list — shared between Disambiguate and ArticleType */
:deep(.topic-list) {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

:deep(.topic-card) {
  cursor: pointer;
}

:deep(.topic-card:hover) {
  background-color: var(--background-color-interactive-subtle, #f8f9fa);
}

:deep(.topic-card:active) {
  background-color: var(--background-color-interactive, #eaecf0);
}

:deep(.topic-card:focus-visible) {
  outline: 2px solid var(--color-progressive, #36c);
  outline-offset: 1px;
}

:deep(.topic-card--suggested) {
  border-color: var(--color-progressive, #36c);
  box-shadow: 0 0 0 1px var(--color-progressive, #36c);
}

:deep(.something-else-row) {
  margin: 16px 0 0;
  font-size: var(--font-size-small, 14px);
  color: var(--color-subtle, #54595d);
}

:deep(.something-else-row a) {
  color: var(--color-progressive, #36c);
  text-decoration: none;
  font-weight: 600;
}

:deep(.something-else-row a:hover) {
  text-decoration: underline;
}

/* Type cards section */
:deep(.type-cards-section) {
  margin-top: 16px;
}

:deep(.type-card-title) {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

/* Similar-article search */
:deep(.similar-search-section) {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color-subtle, #c8ccd1);
}

:deep(.similar-search-label) {
  display: block;
  margin-bottom: 8px;
  font-size: var(--font-size-small, 14px);
  color: var(--color-subtle, #54595d);
}

:deep(.similar-search-input-wrapper) {
  position: relative;
}

:deep(.similar-results-dropdown) {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 10;
  margin: 0;
  padding: 0;
  list-style: none;
  background: var(--background-color-base, #fff);
  border: 1px solid var(--border-color-base, #a2a9b1);
  border-top: none;
  border-radius: 0 0 4px 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  max-height: 240px;
  overflow-y: auto;
}

:deep(.similar-result-item) {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 12px;
  cursor: pointer;
}

:deep(.similar-result-item:hover) {
  background-color: var(--background-color-interactive-subtle, #f8f9fa);
}

:deep(.similar-result-title) {
  font-size: var(--font-size-medium, 14px);
  color: var(--color-base, #202122);
  font-weight: 500;
}

:deep(.similar-result-desc) {
  font-size: var(--font-size-small, 13px);
  color: var(--color-subtle, #54595d);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.similar-selected-card) {
  margin-top: 12px;
  padding: 12px;
  background: var(--background-color-interactive-subtle, #f8f9fa);
  border: 1px solid var(--border-color-subtle, #c8ccd1);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

:deep(.similar-selected-header) {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.similar-detecting-label) {
  font-size: var(--font-size-small, 14px);
  color: var(--color-subtle, #54595d);
}

:deep(.inline-progress) {
  flex-shrink: 0;
}

:deep(.detection-result-line) {
  margin: 0;
  font-size: var(--font-size-small, 14px);
  color: var(--color-base, #202122);
}

:deep(.detection-basis-line) {
  margin: 0;
  font-size: var(--font-size-x-small, 12px);
  color: var(--color-subtle, #54595d);
}

:deep(.detection-failed-hint) {
  margin: 0;
  font-size: var(--font-size-small, 14px);
  color: var(--color-warning, #edab00);
}

/* Mobile: drop the phone frame */
@media (max-width: 600px), (hover: none) and (pointer: coarse) {
  .page {
    display: block;
    padding: 0;
    background: var(--background-color-base, #fff);
  }

  .phone {
    width: 100%;
    min-height: 100vh;
    min-height: 100dvh;
    border: none;
    border-radius: 0;
    box-shadow: none;
  }
}
</style>
