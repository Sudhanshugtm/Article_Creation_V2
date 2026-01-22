<template>
  <main class="page">
    <section class="phone">
      <header class="cdx-dialog__header">
        <CdxButton weight="quiet" class="back-button" aria-label="Go back" @click="onBack">
          <CdxIcon :icon="cdxIconArrowPrevious" />
        </CdxButton>
        <h2 class="cdx-dialog__header__title">New article</h2>
        <span class="header-spacer"></span>
      </header>

      <div class="content">
        <div v-show="step === 'title'">
          <div class="screen-heading">
            <h3 class="screen-title">Article title</h3>
          </div>

          <div class="input-block">
            <CdxTypeaheadSearch
              :id="typeaheadFormId"
              ref="typeahead"
              form-action="#"
              :search-results="typeaheadResults"
              :debounce-interval="0"
              is-mobile-view
              show-thumbnail
              :class="{ 'typeahead--menu-hidden': shouldHideMenu }"
              placeholder="e.g. Siberian tiger"
              aria-label="Article title"
              @input="onInput"
              @search-result-click="onSearchResultClick"
            >
              <template #search-results-pending>Searching…</template>
              <template #search-no-results-text>No topics found.</template>
            </CdxTypeaheadSearch>
          </div>

          <template v-if="certainMatch">
            <p class="prompt">Suggested match</p>
            <CdxCard class="confirm-card" :thumbnail="certainMatch.thumbnail" force-thumbnail>
              <template #title>{{ certainMatch.label }}</template>
              <template #description>{{ certainMatch.description }}</template>
            </CdxCard>

            <CdxButton weight="primary" action="progressive" @click="confirmCertainMatch">
              Continue
            </CdxButton>
          </template>
        </div>

        <div v-show="step !== 'title'">
          <p class="next-step-title">Next step (prototype)</p>
          <CdxCard
            v-if="confirmedTopic"
            class="confirm-card"
            :thumbnail="confirmedTopic.thumbnail"
            force-thumbnail
          >
            <template #title>{{ confirmedTopic.label }}</template>
            <template #description>{{ confirmedTopic.description }}</template>
          </CdxCard>

          <CdxButton weight="quiet" @click="step = 'title'">
            Change title
          </CdxButton>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
// ABOUTME: Vue component for article creation title entry with topic matching
// ABOUTME: Uses Codex TypeaheadSearch for title input + topic suggestion selection
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import {
  CdxButton,
  CdxCard,
  CdxIcon,
  CdxTypeaheadSearch
} from '@wikimedia/codex';
import { cdxIconArrowPrevious } from '@wikimedia/codex-icons';

const step = ref('title');
const query = ref('');
const confirmedTopic = ref(null);

const typeahead = ref(null);
const typeaheadFormId = 'article-title-form';
const typeaheadResults = ref([]);

const mockNetworkDelayMs = 650;
const topicHeaderValue = '__topic_header__';

const mockData = [
  { value: 'Q69581', label: 'Siberian tiger', description: 'subspecies of tiger', thumbnail: { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/P.t.altaica_Tomak_Male.jpg/100px-P.t.altaica_Tomak_Male.jpg' } },
  { value: 'Q118496461', label: 'Siberian tiger', description: 'sculpture by Kurt Bauer in Hamburg', thumbnail: null },
  { value: 'Q23583041', label: 'Siberian Tiger Re-population Project', description: 'reestablishment of Siberian tiger populations', thumbnail: null },
  { value: 'Q42', label: 'Douglas Adams', description: 'English author and humourist (1952–2001)', thumbnail: { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Douglas_adams_portrait_cropped.jpg/100px-Douglas_adams_portrait_cropped.jpg' } }
];

const normalizedQuery = computed(() => query.value.trim().toLowerCase());
const actualResults = computed(
  () => typeaheadResults.value.filter((r) => r.value !== topicHeaderValue)
);
const shouldHideMenu = computed(() => query.value.trim().length < 2 || !!certainMatch.value);
const certainMatch = computed(() => {
  if (normalizedQuery.value.length < 2) return null;
  if (actualResults.value.length === 0) return null;

  const top = actualResults.value[0];
  const exactCount = actualResults.value.filter(
    (r) => r.label.trim().toLowerCase() === normalizedQuery.value
  ).length;

  if (exactCount !== 1) return null;
  if (top.label.trim().toLowerCase() !== normalizedQuery.value) return null;
  return top;
});

const runSearch = (val) => {
  const normalized = val.trim().toLowerCase();
  if (normalized.length < 2) {
    typeaheadResults.value.splice(0);
    return;
  }

  const nextMatches = mockData
    .filter((d) => d.label.toLowerCase().includes(normalized))
    .slice(0, 5)
    .map((d) => ({
      value: d.value,
      label: d.label,
      description: d.description,
      thumbnail: d.thumbnail ?? null
    }));

  typeaheadResults.value = nextMatches.length > 0 ? [
    {
      value: topicHeaderValue,
      label: 'Choose a topic',
      description: 'Select a topic to get writing help.',
      disabled: true,
      showThumbnail: false,
      class: 'topic-menu-header'
    },
    ...nextMatches
  ] : [];
};

let requestId = 0;
let pendingTimer;
const clearPendingTimer = () => {
  if (pendingTimer) {
    clearTimeout(pendingTimer);
    pendingTimer = undefined;
  }
};

function onInput(val) {
  query.value = val;

  requestId += 1;
  const currentRequestId = requestId;

  clearPendingTimer();

  const trimmed = val.trim();
  if (trimmed.length < 2) {
    // Replace the array reference so Codex clears its pending state immediately.
    typeaheadResults.value = [];
    return;
  }

  // Clear existing results without changing the array reference so Codex can show its
  // built-in pending state (progress bar + "Searching…" slot) while we "fetch".
  typeaheadResults.value.splice(0);

  pendingTimer = setTimeout(() => {
    if (currentRequestId !== requestId) return;
    runSearch(val);
  }, mockNetworkDelayMs);
}

function onSearchResultClick(event) {
  if (!event?.searchResult) return;
  if (event.searchResult.value === topicHeaderValue) return;
  confirmedTopic.value = event.searchResult;
  step.value = 'next';
}

function confirmCertainMatch() {
  if (!certainMatch.value) return;
  confirmedTopic.value = certainMatch.value;
  step.value = 'next';
}

function onBack() {
  if (step.value === 'next') {
    step.value = 'title';
    typeahead.value?.focus?.();
    return;
  }
}

let removeSubmitHandler = null;
onMounted(() => {
  const form = document.getElementById(typeaheadFormId);
  if (!form) return;

  const preventSubmit = (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();
  };
  form.addEventListener('submit', preventSubmit, true);
  removeSubmitHandler = () => form.removeEventListener('submit', preventSubmit, true);
});

onBeforeUnmount(() => {
  removeSubmitHandler?.();
  clearPendingTimer();
});
</script>

<style scoped>
.page {
  min-height: 100vh;
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
  padding: 12px 16px;
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

.content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.screen-heading {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}

.screen-title {
  margin: 0;
  font-size: var(--font-size-x-large, 1.25rem);
  line-height: var(--line-height-x-large, 1.875rem);
  font-weight: 700;
  color: var(--color-base, #202122);
}

.screen-description {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-subtle, #54595d);
}

.input-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.helper-text {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-subtle, #54595d);
}

.confirm-card {
  background: var(--background-color-interactive-subtle, #f8f9fa);
}

.prompt {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-base, #202122);
}

.next-step-title {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-base, #202122);
}

.typeahead--menu-hidden :deep(.cdx-typeahead-search__menu) {
  display: none;
}

.typeahead--menu-hidden.cdx-typeahead-search--expanded :deep(.cdx-typeahead-search__input.cdx-search-input .cdx-text-input) {
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
}

:deep(.topic-menu-header) {
  cursor: default;
}

:deep(.topic-menu-header .cdx-menu-item__content) {
  padding-top: 12px;
  padding-bottom: 12px;
  background-color: var(--background-color-interactive-subtle, #f8f9fa);
}

:deep(.topic-menu-header .cdx-menu-item__text__label) {
  color: var(--color-base, #202122);
  font-weight: 700;
  letter-spacing: 0.2px;
}

:deep(.topic-menu-header .cdx-menu-item__text__description) {
  color: var(--color-subtle, #54595d);
}

@media (max-width: 420px) {
  .page {
    display: block;
    padding: 0;
    background: var(--background-color-base, #fff);
  }

  .phone {
    width: 100%;
    min-height: 100vh;
    border: none;
    border-radius: 0;
    box-shadow: none;
  }
}
</style>
