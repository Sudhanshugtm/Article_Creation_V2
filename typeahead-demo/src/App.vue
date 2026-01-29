<template>
  <main class="page">
    <section class="phone">
      <header class="cdx-dialog__header">
        <CdxButton v-if="step !== 'title'" weight="quiet" class="back-button" aria-label="Go back" @click="onBack">
          <CdxIcon :icon="cdxIconArrowPrevious" />
        </CdxButton>
        <span v-else class="header-spacer"></span>
        <h2 class="cdx-dialog__header__title">New article</h2>
        <span class="header-spacer"></span>
      </header>

      <div class="content">
        <div v-show="step === 'title'">
          <div class="input-block">
            <CdxTextInput
              v-model="query"
              placeholder="Type article title"
              aria-label="Article title"
              class="borderless-input"
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

        <div v-show="step === 'disambiguate' && creatableTopics.length > 0">
          <h3 class="question-title">What is "{{ query }}"?</h3>

          <p class="question-subtitle">Select a topic to get writing help.</p>

          <div class="topic-list">
            <CdxCard
              v-for="topic in creatableTopics"
              :key="topic.id"
              :thumbnail="topic.thumbnail ? { url: topic.thumbnail } : null"
              class="topic-card"
              @click="selectTopic(topic)"
            >
              <template #title>{{ topic.label }}</template>
              <template #description>{{ topic.description }}</template>
            </CdxCard>
          </div>

          <p class="something-else-row">
            Something else? <a href="#" @click.prevent="selectNone">Skip to type selection</a>
          </p>
        </div>

        <div v-show="step === 'article-type'">
          <h3 class="question-title">What is "{{ query }}"?</h3>

          <!-- Similar article search -->
          <div class="similar-search-block">
            <p class="similar-search-hint">
              Find a similar Wikipedia article so we can detect the right type.
            </p>

            <div class="similar-search-input-wrapper">
              <CdxTextInput
                v-model="similarQuery"
                placeholder="Article title or Wikipedia URL..."
                aria-label="Search for a similar article"
                :disabled="isDetectingType"
              />

              <!-- Autocomplete dropdown (hidden for URL input) -->
              <ul
                v-if="similarResults.length > 0 && !selectedSimilarArticle && !isUrlInput"
                class="similar-results-dropdown"
              >
                <li
                  v-for="result in similarResults"
                  :key="result.title"
                  class="similar-result-item"
                  @click="selectSimilarArticle(result)"
                >
                  <span class="similar-result-title">{{ result.title }}</span>
                  <span v-if="result.description" class="similar-result-desc">{{ result.description }}</span>
                </li>
              </ul>

              <!-- Searching indicator -->
              <div v-if="isSearchingSimilar" class="loading-row">
                <CdxProgressIndicator class="title-progress" />
                <span class="loading-label">Searching...</span>
              </div>
            </div>

            <!-- URL detected hint -->
            <p v-if="isUrlInput && extractedUrlTitle && isDetectingType" class="url-detected-hint">
              Detected: "<strong>{{ extractedUrlTitle }}</strong>"
            </p>

            <!-- Detecting type indicator -->
            <div v-if="isDetectingType" class="loading-row">
              <CdxProgressIndicator class="title-progress" />
              <span class="loading-label">Detecting type...</span>
            </div>

            <!-- Detection success: confirmation -->
            <div v-if="detectedType && selectedSimilarArticle" class="similar-confirmation">
              <p class="similar-confirmation-text">
                Similar to "<strong>{{ selectedSimilarArticle.title }}</strong>"
                <span class="detected-type-badge">{{ TYPE_LABELS[detectedType] }}</span>
              </p>
              <CdxButton
                weight="primary"
                action="progressive"
                @click="confirmDetectedType"
              >
                Continue
              </CdxButton>
            </div>

            <!-- Detection failed: fallback message -->
            <p v-if="detectionFailed" class="detection-failed-hint">
              We couldn't detect the type. Please pick one below.
            </p>
          </div>

          <!-- Manual pick link (visible only when cards are hidden) -->
          <p v-if="!showManualCards" class="manual-pick-link">
            <a href="#" @click.prevent="revealManualCards">or pick a type manually</a>
          </p>

          <!-- Manual type cards (hidden by default, revealed on link click or detection failure) -->
          <Transition name="cards-reveal">
            <div v-if="showManualCards" class="manual-cards-section">
              <div class="topic-list" :class="{ 'type-cards-highlighted': detectionFailed }">
                <CdxCard
                  v-for="type in visibleArticleTypes"
                  :key="type.id"
                  class="topic-card"
                  @click="selectArticleType(type)"
                >
                  <template #title>{{ type.label }}</template>
                  <template #description>{{ type.description }}</template>
                </CdxCard>
              </div>
            </div>
          </Transition>
        </div>

        <div v-show="step === 'next'" class="prototype-end">
          <p class="prototype-end__text">End of prototype</p>
          <p class="prototype-end__subtext">The remaining steps (structure, writing, review) are not yet built.</p>
          <CdxButton weight="quiet" action="progressive" @click="goBackToTitle">
            Start over
          </CdxButton>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
// ABOUTME: Vue component for article creation title entry with topic matching
// ABOUTME: Uses Codex TypeaheadSearch for title input + topic suggestion selection
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import {
  CdxButton,
  CdxCard,
  CdxIcon,
  CdxProgressIndicator,
  CdxTextInput
} from '@wikimedia/codex';
import { cdxIconAdd, cdxIconArticle, cdxIconArrowPrevious, cdxIconCheck, cdxIconEdit, cdxIconSearch } from '@wikimedia/codex-icons';

const step = ref('title');
const query = ref('');
const confirmedTopic = ref(null);
const selectedTopic = ref(null);
const isLoading = ref(false);
const checkComplete = ref(false);
const exactMatch = ref(null);
let loadingTimer = null;
let completeTimer = null;

// Stepper configuration
const steps = [
  { id: 'title', label: 'Title' },
  { id: 'disambiguate', label: 'Topic' },
  { id: 'structure', label: 'Structure' },
  { id: 'write', label: 'Write' },
  { id: 'review', label: 'Review' }
];

const currentStepIndex = computed(() => {
  const index = steps.findIndex(s => s.id === step.value);
  return index >= 0 ? index : 0;
});

const wikidataResults = ref([]);
const isLoadingResults = ref(false);

// Similar-article search state
const similarQuery = ref('');
const similarResults = ref([]);
const selectedSimilarArticle = ref(null);
const isSearchingSimilar = ref(false);
const isDetectingType = ref(false);
const detectedType = ref(null);
const detectionFailed = ref(false);
const showManualCards = ref(false);
const isUrlInput = ref(false);
const extractedUrlTitle = ref(null);
let similarDebounceTimer = null;

// Only show topics without local articles in disambiguation (those are candidates for creation)
const creatableTopics = computed(() =>
  wikidataResults.value.filter(topic => !topic.hasLocalArticle)
);

// Detect script type from input
function detectScript(text) {
  if (/[\u0980-\u09FF]/.test(text)) return 'bn'; // Bengali
  if (/[\u0D00-\u0D7F]/.test(text)) return 'ml'; // Malayalam
  if (/[\u0900-\u097F]/.test(text)) return 'hi'; // Hindi/Devanagari
  return 'en'; // Default to English (Latin script)
}

async function fetchWikidataResults(searchQuery) {
  isLoadingResults.value = true;
  try {
    // Detect script and determine search/display languages
    const detectedScript = detectScript(searchQuery);
    const displayLang = detectedScript; // Show results in user's script language
    const searchLanguages = detectedScript === 'en'
      ? ['en', 'bn', 'ml', 'hi']  // Latin input: search English first, then others
      : [detectedScript, 'en'];   // Non-Latin input: search detected language first, then English

    // Step 1: Search entities across multiple languages, display in user's language
    const searchPromises = searchLanguages.map(lang =>
      fetch(`https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(searchQuery)}&language=${lang}&uselang=${displayLang}&limit=10&format=json&origin=*`)
        .then(r => r.json())
        .then(data => ({ lang, results: data.search || [] }))
        .catch(() => ({ lang, results: [] }))
    );

    const searchResults = await Promise.all(searchPromises);

    // Merge and dedupe by QID, keeping first occurrence (priority by language order)
    const seen = new Set();
    const mergedResults = [];
    for (const { lang, results } of searchResults) {
      for (const item of results) {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          mergedResults.push({ ...item, searchLang: lang });
        }
      }
    }

    if (!mergedResults.length) {
      wikidataResults.value = [];
      exactMatch.value = null;
      // Skip empty disambiguate screen, go directly to article-type selection
      step.value = 'article-type';
      return;
    }

    // Step 2: Get entities with images (P18) and sitelinks
    const ids = mergedResults.slice(0, 15).map(item => item.id).join('|');
    const entitiesUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${ids}&props=claims|sitelinks&format=json&origin=*`;
    const entitiesResponse = await fetch(entitiesUrl);
    const entitiesData = await entitiesResponse.json();

    // Step 3: Map and score results
    const queryLower = searchQuery.toLowerCase().trim();
    const scored = mergedResults.slice(0, 15).map(item => {
      const entity = entitiesData.entities?.[item.id];
      const imageFile = entity?.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
      const thumbnail = imageFile
        ? `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(imageFile)}?width=100`
        : null;
      const hasWikipedia = !!entity?.sitelinks?.enwiki;
      const hasBnWiki = !!entity?.sitelinks?.bnwiki;
      const hasMlWiki = !!entity?.sitelinks?.mlwiki;
      const hasHiWiki = !!entity?.sitelinks?.hiwiki;
      const exactMatch = item.label.toLowerCase().trim() === queryLower;

      // Only check wiki matching detected script (English input = no "exists" message)
      let hasTargetWiki = false;
      let wikiLang = null;
      let localWikiUrl = null;

      if (detectedScript === 'bn' && hasBnWiki) {
        hasTargetWiki = true;
        wikiLang = 'Bengali';
        localWikiUrl = `https://bn.wikipedia.org/wiki/${encodeURIComponent(entity?.sitelinks?.bnwiki?.title)}`;
      } else if (detectedScript === 'hi' && hasHiWiki) {
        hasTargetWiki = true;
        wikiLang = 'Hindi';
        localWikiUrl = `https://hi.wikipedia.org/wiki/${encodeURIComponent(entity?.sitelinks?.hiwiki?.title)}`;
      } else if (detectedScript === 'ml' && hasMlWiki) {
        hasTargetWiki = true;
        wikiLang = 'Malayalam';
        localWikiUrl = `https://ml.wikipedia.org/wiki/${encodeURIComponent(entity?.sitelinks?.mlwiki?.title)}`;
      } else if (detectedScript === 'en' && hasWikipedia) {
        hasTargetWiki = true;
        wikiLang = 'English';
        localWikiUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(entity?.sitelinks?.enwiki?.title)}`;
      }

      // Score: Target wiki (5) + Any Wikipedia (3) + Image (2) + Exact match (1)
      const score = (hasTargetWiki ? 5 : 0) + (hasWikipedia ? 3 : 0) + (thumbnail ? 2 : 0) + (exactMatch ? 1 : 0);

      return {
        id: item.id,
        label: item.label,
        description: item.description || '',
        thumbnail,
        searchLang: item.searchLang,
        hasLocalArticle: hasTargetWiki,
        wikiLang,
        localWikiUrl,
        score
      };
    });

    // Step 4: Sort by score and take top 3
    scored.sort((a, b) => b.score - a.score);
    const topResults = scored.slice(0, 3).map(({ score, searchLang, ...rest }) => rest);
    wikidataResults.value = topResults;

    // Check for exact match with local article - show inline instead of disambiguation
    const queryNormalized = searchQuery.toLowerCase().trim();
    const exactMatchResult = topResults.find(
      r => r.label.toLowerCase().trim() === queryNormalized && r.hasLocalArticle
    );
    exactMatch.value = exactMatchResult || null;
  } catch (error) {
    console.error('Wikidata fetch error:', error);
    wikidataResults.value = [];
    exactMatch.value = null;
  } finally {
    isLoadingResults.value = false;
  }
}

function selectTopic(topic) {
  confirmedTopic.value = topic;
  step.value = 'next';
}

function selectNone() {
  step.value = 'article-type';
}

// Visible article types for manual selection (reduced set)
const visibleArticleTypes = [
  { id: 'person', label: 'Person', description: "Someone's biography", wikidataClass: 'Q5' },
  { id: 'place', label: 'Place', description: 'Location, city, or landmark', wikidataClass: 'Q2221906' },
  { id: 'organization', label: 'Organization', description: 'School, company, group, or team', wikidataClass: 'Q43229' }
];

// Full type map for SPARQL-based auto-detection (maps Wikidata class → our type)
const TYPE_MAP = {
  Q5: 'person',
  Q2221906: 'place',        // geographic location
  Q43229: 'organization',
  Q1190554: 'event',
  Q17537576: 'creative-work',
  Q16521: 'species',
  Q151885: 'concept'
};

// Priority order when multiple types match
const TYPE_PRIORITY = ['person', 'place', 'organization', 'event', 'creative-work', 'species', 'concept'];

// Labels for detected types (used in confirmation UI)
const TYPE_LABELS = {
  person: 'Person',
  place: 'Place',
  organization: 'Organization',
  event: 'Event',
  'creative-work': 'Creative work',
  species: 'Species',
  concept: 'Concept'
};

// Parse a Wikipedia URL and extract language + title
function parseWikipediaUrl(input) {
  const match = input.trim().match(/^https?:\/\/([a-z]{2,3})\.wikipedia\.org\/wiki\/(.+)/i);
  if (!match) return null;
  const lang = match[1];
  let title = match[2];
  // Strip fragment and query string
  title = title.split('#')[0].split('?')[0];
  // Decode URL encoding and replace underscores with spaces
  title = decodeURIComponent(title).replace(/_/g, ' ');
  return { lang, title };
}

// Reveal the manual type cards (used by link click and detection failure)
function revealManualCards() {
  showManualCards.value = true;
}

// Search Wikipedia for similar articles using opensearch API
async function searchWikipediaArticles(searchText) {
  const trimmed = searchText.trim();
  if (trimmed.length < 2) {
    similarResults.value = [];
    return;
  }
  isSearchingSimilar.value = true;
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(trimmed)}&limit=5&namespace=0&format=json&origin=*`;
    const response = await fetch(url);
    const data = await response.json();
    // opensearch returns [query, titles[], descriptions[], urls[]]
    const titles = data[1] || [];
    const descriptions = data[2] || [];
    similarResults.value = titles.map((title, i) => ({
      title,
      description: descriptions[i] || ''
    }));
  } catch (error) {
    console.error('Wikipedia opensearch error:', error);
    similarResults.value = [];
  } finally {
    isSearchingSimilar.value = false;
  }
}

// Detect article type via Wikidata: resolve article → QID → SPARQL P31/P279 chain
async function detectArticleType(articleTitle) {
  try {
    // Step 1: Resolve Wikipedia article title to Wikidata QID via pageprops
    const ppUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(articleTitle)}&prop=pageprops&ppprop=wikibase_item&format=json&origin=*`;
    const ppResponse = await fetch(ppUrl);
    const ppData = await ppResponse.json();
    const pages = ppData.query?.pages || {};
    const page = Object.values(pages)[0];
    const qid = page?.pageprops?.wikibase_item;
    if (!qid) return null;

    // Step 2: SPARQL query to walk P31 → P279 chain and match known types
    const knownClasses = Object.keys(TYPE_MAP).join(' wd:');
    const sparql = `
      SELECT ?type WHERE {
        wd:${qid} wdt:P31/wdt:P279* ?type .
        VALUES ?type { wd:${knownClasses} }
      } LIMIT 10
    `;
    const sparqlUrl = `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparql)}&format=json`;
    const sparqlResponse = await fetch(sparqlUrl);
    const sparqlData = await sparqlResponse.json();
    const bindings = sparqlData.results?.bindings || [];

    if (bindings.length === 0) return null;

    // Extract matched type IDs and pick by priority
    const matchedTypeIds = bindings.map(b => {
      const uri = b.type.value;
      return uri.split('/').pop(); // e.g. "Q5" from full URI
    });

    const matchedTypes = matchedTypeIds
      .map(qid => TYPE_MAP[qid])
      .filter(Boolean);

    // Return the highest-priority match
    for (const typeId of TYPE_PRIORITY) {
      if (matchedTypes.includes(typeId)) {
        return typeId;
      }
    }
    return null;
  } catch (error) {
    console.error('Type detection error:', error);
    return null;
  }
}

// Handle user selecting a similar article from the dropdown
async function selectSimilarArticle(article) {
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
    showManualCards.value = true;
  }
}

// Continue with the detected type from similar article
function confirmDetectedType() {
  const typeId = detectedType.value;
  // Find the matching type definition (check visibleArticleTypes first, then use TYPE_MAP)
  const matchedVisible = visibleArticleTypes.find(t => t.id === typeId);
  const typeObj = matchedVisible || {
    id: typeId,
    label: TYPE_LABELS[typeId] || typeId,
    wikidataClass: Object.entries(TYPE_MAP).find(([, v]) => v === typeId)?.[0] || ''
  };

  confirmedTopic.value = {
    id: 'new',
    label: query.value,
    articleType: typeObj,
    isNew: true
  };
  step.value = 'next';
}

// Clear similar article search state
function clearSimilarSearch() {
  similarQuery.value = '';
  similarResults.value = [];
  selectedSimilarArticle.value = null;
  detectedType.value = null;
  detectionFailed.value = false;
  isDetectingType.value = false;
  showManualCards.value = false;
  isUrlInput.value = false;
  extractedUrlTitle.value = null;
}

// Watcher for similar article search with 300ms debounce + URL detection
watch(similarQuery, (val) => {
  if (similarDebounceTimer) clearTimeout(similarDebounceTimer);
  // Reset detection state when typing
  selectedSimilarArticle.value = null;
  detectedType.value = null;
  detectionFailed.value = false;
  isUrlInput.value = false;
  extractedUrlTitle.value = null;

  const trimmed = val.trim();
  if (trimmed.length < 2) {
    similarResults.value = [];
    return;
  }

  // Check if input is a Wikipedia URL
  const urlParsed = parseWikipediaUrl(trimmed);
  if (urlParsed) {
    isUrlInput.value = true;
    extractedUrlTitle.value = urlParsed.title;
    similarResults.value = [];
    // Directly trigger detection (skip autocomplete)
    selectSimilarArticle({ title: urlParsed.title, description: '' });
    return;
  }

  // Regular text input — debounce autocomplete search
  similarDebounceTimer = setTimeout(() => {
    searchWikipediaArticles(val);
  }, 300);
});

function selectArticleType(type) {
  confirmedTopic.value = {
    id: 'new',
    label: query.value,
    articleType: type,
    isNew: true
  };
  step.value = 'next';
}

watch(query, (val) => {
  isLoading.value = false;
  checkComplete.value = false;
  if (loadingTimer) clearTimeout(loadingTimer);
  if (completeTimer) clearTimeout(completeTimer);

  if (val.trim().length > 0) {
    loadingTimer = setTimeout(() => {
      isLoading.value = true;
      completeTimer = setTimeout(async () => {
        await fetchWikidataResults(val);
        isLoading.value = false;
        // If exact match with local article exists, stay on title screen with inline message
        if (exactMatch.value) {
          return;
        }
        // If there are creatable topics (without local articles), show disambiguation
        // Otherwise go to article-type selection
        if (creatableTopics.value.length > 0) {
          step.value = 'disambiguate';
        } else if (wikidataResults.value.length > 0) {
          // All results have local articles - go to manual type selection
          step.value = 'article-type';
        }
        // fetchWikidataResults handles the case when no results at all
      }, 1000);
    }, 500);
  }
});

const typeahead = ref(null);
const typeaheadFormId = 'article-title-form';
const typeaheadResults = ref([]);

const mockNetworkDelayMs = 650;
const topicHeaderValue = '__topic_header__';

const svgToDataUri = (svg) => `data:image/svg+xml,${encodeURIComponent(svg)}`;

const searchIconDataUri = svgToDataUri(
  `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="#72777d">${cdxIconSearch}</svg>`
);
const somethingElseIconMask = `url("${svgToDataUri(
  `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="#000">${cdxIconSearch}</svg>`
)}")`;

const mockData = [
  {
    value: 'Q69581',
    label: 'Siberian tiger',
    description: 'Animal · Endangered…',
    supportingText: 'article exists',
    thumbnail: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/P.t.altaica_Tomak_Male.jpg/100px-P.t.altaica_Tomak_Male.jpg'
    },
    class: 'topic-result--exists'
  },
  {
    value: 'Q_in_captivity',
    label: 'Siberian tiger in captivity',
    description: 'Conservation project',
    thumbnail: null,
    class: 'topic-thumbnail--plain-icon'
  },
  {
    value: 'Q_habitat',
    label: 'Siberian tiger habitat',
    description: 'Geographic region',
    thumbnail: null,
    class: 'topic-thumbnail--plain-icon'
  },
  {
    value: 'Q42',
    label: 'Douglas Adams',
    description: 'English author and humourist (1952–2001)',
    thumbnail: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Douglas_adams_portrait_cropped.jpg/100px-Douglas_adams_portrait_cropped.jpg'
    }
  }
];

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
      supportingText: d.supportingText ?? '',
      description: d.description,
      thumbnail: d.thumbnail ?? null,
      class: d.class
    }));

  const results = [];
  if (nextMatches.length > 0) {
    results.push({
      value: topicHeaderValue,
      label: 'Choose a topic',
      description: 'Select a topic to get writing help.',
      disabled: true,
      class: 'topic-menu-header'
    });
  }

  results.push(...nextMatches);

  typeaheadResults.value = results;
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
  if (!event) return;
  if (!event.searchResult) {
    confirmedTopic.value = {
      value: 'something_else',
      label: 'Something else',
      description: 'Is it a person, place, event, or…?',
      thumbnail: null
    };
    step.value = 'next';
    return;
  }
  if (event.searchResult.value === topicHeaderValue) return;
  confirmedTopic.value = event.searchResult;
  step.value = 'next';
}

function onBack() {
  if (step.value === 'next') {
    step.value = 'disambiguate';
    return;
  }
  if (step.value === 'article-type') {
    // Skip disambiguate if there are no creatable topics to show
    if (creatableTopics.value.length === 0) {
      goBackToTitle();
    } else {
      step.value = 'disambiguate';
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
  checkComplete.value = false;
  isLoading.value = false;
  selectedTopic.value = null;
  clearSimilarSearch();
  if (loadingTimer) clearTimeout(loadingTimer);
  if (completeTimer) clearTimeout(completeTimer);
}

function readArticle() {
  // Open Wikipedia article (mock for now)
  window.open(`https://en.wikipedia.org/wiki/${encodeURIComponent(query.value)}`, '_blank');
}

function searchElse() {
  query.value = '';
  checkComplete.value = false;
}

function proceedToDisambiguate() {
  exactMatch.value = null;
  step.value = 'disambiguate';
}

function clearAndSearch() {
  query.value = '';
  exactMatch.value = null;
  wikidataResults.value = [];
}

let removeSubmitHandler = null;
let removeFooterClickHandler = null;
onMounted(() => {
  const form = document.getElementById(typeaheadFormId);
  if (!form) return;

  const preventSubmit = (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();
  };
  const preventFooterNavigation = (e) => {
    const target = e.target instanceof Element ? e.target : null;
    if (!target) return;
    if (!target.closest('.cdx-typeahead-search__search-footer')) return;
    e.preventDefault();
  };
  form.addEventListener('submit', preventSubmit, true);
  form.addEventListener('click', preventFooterNavigation, true);
  removeSubmitHandler = () => form.removeEventListener('submit', preventSubmit, true);
  removeFooterClickHandler = () => form.removeEventListener('click', preventFooterNavigation, true);
});

onBeforeUnmount(() => {
  removeSubmitHandler?.();
  removeFooterClickHandler?.();
  clearPendingTimer();
});
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

.step-counter {
  font-size: var(--font-size-small, 14px);
  color: var(--color-subtle, #54595d);
  min-width: 32px;
  text-align: right;
}

.back-button {
  min-width: auto;
  padding: 4px;
}

.header-spacer {
  width: 32px;
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
  gap: 0;
}

.loading-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
}

.loading-label {
  font-size: var(--font-size-small, 14px);
  color: var(--color-subtle, #54595d);
}

.exists-hint {
  margin: 16px 0 0;
  font-size: var(--font-size-small, 14px);
  color: var(--color-subtle, #54595d);
}

.exists-hint a {
  color: var(--color-progressive, #36c);
  text-decoration: none;
  margin-left: 4px;
}

.exists-hint a:hover {
  text-decoration: underline;
}

.fixed-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.fixed-title-text {
  font-size: var(--font-size-x-large, 20px);
  font-family: 'Linux Libertine', 'Georgia', 'Times', serif;
  font-weight: 700;
  color: var(--color-base, #202122);
}

.edit-title-btn {
  min-width: auto;
  padding: 4px;
}

.question-title {
  margin: 0;
  font-size: var(--font-size-large, 18px);
  font-weight: 700;
  color: var(--color-base, #202122);
}

.question-subtitle {
  margin: 4px 0 16px;
  font-size: var(--font-size-small, 14px);
  color: var(--color-subtle, #54595d);
}

/* Topic List - Disambiguation UI */
.topic-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.topic-card {
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

.topic-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.exists-badge {
  display: inline-flex;
  align-items: center;
  margin-left: 6px;
  padding: 2px 8px;
  border-radius: 999px;
  background-color: var(--background-color-success-subtle, #dff2eb);
  color: var(--color-success, #177860);
  font-size: var(--font-size-x-small, 0.75rem);
  font-weight: 400;
  vertical-align: middle;
}

.exists-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-left: 4px;
  font-size: var(--font-size-small, 13px);
}

.read-link {
  color: var(--color-progressive, #36c);
  text-decoration: none;
}

.read-link:hover {
  text-decoration: underline;
}

.action-divider {
  color: var(--color-subtle, #a2a9b1);
}

.create-link {
  color: var(--color-subtle, #72777d);
  text-decoration: none;
}

.create-link:hover {
  text-decoration: underline;
  color: var(--color-base, #202122);
}

.something-else-row {
  margin: 16px 0 0;
  font-size: var(--font-size-small, 14px);
  color: var(--color-subtle, #54595d);
}

.something-else-row a {
  color: var(--color-progressive, #36c);
  text-decoration: none;
  font-weight: 600;
}

.something-else-row a:hover {
  text-decoration: underline;
}

/* Manual pick link — centered subtle CTA */
.manual-pick-link {
  margin: 20px 0 0;
  font-size: var(--font-size-small, 14px);
  color: var(--color-subtle, #54595d);
  text-align: center;
}

.manual-pick-link a {
  color: var(--color-progressive, #36c);
  text-decoration: none;
}

.manual-pick-link a:hover {
  text-decoration: underline;
}

/* URL detected inline hint */
.url-detected-hint {
  margin: 8px 0 0;
  font-size: var(--font-size-small, 14px);
  color: var(--color-subtle, #54595d);
}

/* Manual cards section wrapper */
.manual-cards-section {
  margin-top: 16px;
}

/* Vue transition: cards reveal (fade + slide-up) */
.cards-reveal-enter-active {
  transition: all 0.3s ease-out;
}

.cards-reveal-leave-active {
  transition: all 0.2s ease-in;
}

.cards-reveal-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.cards-reveal-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

.empty-state {
  margin-top: 24px;
}

.empty-state__text {
  margin: 0 0 16px;
  font-size: var(--font-size-small, 14px);
  color: var(--color-subtle, #54595d);
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

.helper-text {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-subtle, #54595d);
}

.next-step-title {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-base, #202122);
}

:deep(.topic-menu-header) {
  cursor: default;
}

:deep(.topic-menu-header .cdx-menu-item__thumbnail) {
  display: none;
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

:deep(.topic-result--exists .cdx-menu-item__text__supporting-text) {
  display: inline-flex;
  align-items: center;
  margin-left: 6px;
  padding: 2px 8px;
  border-radius: 999px;
  background-color: var(--background-color-success-subtle, #dff2eb);
  color: var(--color-success, #177860);
  font-size: var(--font-size-x-small, 0.75rem);
  line-height: var(--line-height-small, 1.375rem);
  white-space: nowrap;
}

:deep(.topic-thumbnail--plain-icon .cdx-thumbnail__placeholder),
:deep(.topic-thumbnail--plain-icon .cdx-thumbnail__image) {
  border-color: transparent;
  background-color: transparent;
}

:deep(.topic-thumbnail--plain-icon .cdx-thumbnail__image),
:deep(.cdx-typeahead-search__search-footer__icon) {
  background-size: 20px 20px;
}

:deep(.cdx-typeahead-search__search-footer__icon) {
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid var(--border-color-subtle, #c8ccd1);
  border-radius: 2px;
  background-color: var(--background-color-interactive-subtle, #f8f9fa);
  color: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

:deep(.cdx-typeahead-search__search-footer__icon svg) {
  display: none;
}

:deep(.cdx-typeahead-search__search-footer__icon)::before {
  content: '';
  width: 20px;
  height: 20px;
  background-color: var(--color-subtle, #54595d);
  -webkit-mask-image: var(--something-else-icon-mask);
  mask-image: var(--something-else-icon-mask);
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
  -webkit-mask-size: 20px 20px;
  mask-size: 20px 20px;
}

:deep(.cdx-typeahead-search__search-footer__text) {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

:deep(.cdx-typeahead-search__search-footer__text strong) {
  font-weight: 700;
}

.search-footer-label {
  font-weight: 700;
}

.search-footer-description {
  color: var(--color-subtle, #54595d);
  font-weight: 400;
}

/* Similar article search */
.similar-search-block {
  margin-bottom: 4px;
}

.similar-search-hint {
  margin: 4px 0 12px;
  font-size: var(--font-size-small, 14px);
  color: var(--color-subtle, #54595d);
}

.similar-search-input-wrapper {
  position: relative;
}

.similar-results-dropdown {
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

.similar-result-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 12px;
  cursor: pointer;
}

.similar-result-item:hover {
  background-color: var(--background-color-interactive-subtle, #f8f9fa);
}

.similar-result-title {
  font-size: var(--font-size-medium, 14px);
  color: var(--color-base, #202122);
  font-weight: 500;
}

.similar-result-desc {
  font-size: var(--font-size-small, 13px);
  color: var(--color-subtle, #54595d);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Detection confirmation */
.similar-confirmation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
  padding: 12px;
  background: var(--background-color-interactive-subtle, #f8f9fa);
  border-radius: 4px;
  border: 1px solid var(--border-color-subtle, #c8ccd1);
}

.similar-confirmation-text {
  margin: 0;
  font-size: var(--font-size-small, 14px);
  color: var(--color-base, #202122);
}

.detected-type-badge {
  display: inline-block;
  margin-left: 6px;
  padding: 2px 8px;
  border-radius: 999px;
  background-color: var(--background-color-progressive-subtle, #eaf3ff);
  color: var(--color-progressive, #36c);
  font-size: var(--font-size-x-small, 0.75rem);
  font-weight: 600;
}

.detection-failed-hint {
  margin: 12px 0 0;
  font-size: var(--font-size-small, 14px);
  color: var(--color-warning, #edab00);
}

/* Highlight type cards when detection fails */
.type-cards-highlighted {
  animation: highlight-pulse 0.6s ease-out;
}

@keyframes highlight-pulse {
  0% { outline: 2px solid var(--color-warning, #edab00); outline-offset: 4px; border-radius: 4px; }
  100% { outline: 2px solid transparent; outline-offset: 4px; }
}

/* End-of-prototype placeholder screen */
.prototype-end {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48px 16px;
}

.prototype-end__text {
  margin: 0;
  font-size: var(--font-size-large, 18px);
  font-weight: 600;
  color: var(--color-subtle, #54595d);
}

.prototype-end__subtext {
  margin: 8px 0 24px;
  font-size: var(--font-size-small, 14px);
  color: var(--color-placeholder, #72777d);
}

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
