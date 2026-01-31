<template>
  <!-- ABOUTME: Editor screen — contentEditable sections with suggestions, citations, toolbar -->
  <!-- ABOUTME: Loads sections per article type, provides fill-in-the-blank templates and facts -->
  <div class="editor-screen">
    <!-- Article title (serif) -->
    <h1 class="editor-article-title">{{ query }}</h1>

    <!-- Article sections container -->
    <div class="article-sections">
      <!-- Lead section (always present) -->
      <div
        class="section-block"
        :class="{ active: activeSection === 'Lead section' }"
        @click="setActiveSection('Lead section')"
      >
        <div class="section-content-area">
          <div
            ref="leadEditor"
            class="section-textarea"
            contenteditable="true"
            :data-placeholder="leadPlaceholder"
            @focus="setActiveSection('Lead section')"
            @input="onEditorInput"
          ></div>
        </div>
        <button
          v-show="activeSection === 'Lead section'"
          class="section-get-contents-btn"
          @click.stop="toggleSuggestionsPanel('Lead section')"
        >
          Get suggested contents
        </button>
      </div>

      <!-- Dynamic sections based on article type -->
      <div
        v-for="section in addedSections"
        :key="section.name"
        class="section-block"
        :class="{ active: activeSection === section.name }"
        @click="setActiveSection(section.name)"
      >
        <div class="section-header-row">
          <h2 class="section-heading-text">{{ section.name }}</h2>
          <CdxButton weight="quiet" class="section-remove-btn" aria-label="Remove section" @click.stop="removeSection(section.name)">
            <CdxIcon :icon="cdxIconClose" />
          </CdxButton>
        </div>
        <div class="section-content-area">
          <div
            :ref="el => sectionEditors[section.name] = el"
            class="section-textarea"
            contenteditable="true"
            :data-placeholder="section.placeholder"
            @focus="setActiveSection(section.name)"
          ></div>
        </div>
        <button
          v-show="activeSection === section.name"
          class="section-get-contents-btn"
          @click.stop="toggleSuggestionsPanel(section.name)"
        >
          Get suggested contents
        </button>
      </div>
    </div>

    <!-- Suggestions panel (slides up from bottom when active) -->
    <div v-if="showSuggestionsPanel" class="suggestions-panel">
      <div class="suggestions-panel-header">
        <div class="suggestions-panel-label">EDITING SECTION</div>
        <CdxButton weight="quiet" aria-label="Close" @click="showSuggestionsPanel = false">
          <CdxIcon :icon="cdxIconClose" />
        </CdxButton>
      </div>

      <div class="suggestions-panel-title-row">
        <h3 class="suggestions-panel-title">{{ activeSectionDisplay }}</h3>
        <span class="current-badge">current</span>
      </div>

      <!-- Suggested paragraphs -->
      <div class="suggested-section">
        <h4 class="panel-section-heading">SUGGESTED PARAGRAPHS</h4>
        <div
          v-for="template in currentTemplates"
          :key="template.title"
          :class="['suggestion-card', { 'suggestion-added': insertedTemplates.has(suggestionsSection + ':' + template.title) }]"
        >
          <button
            class="add-btn-circle"
            :aria-label="insertedTemplates.has(suggestionsSection + ':' + template.title) ? 'Already added' : 'Add paragraph'"
            :disabled="insertedTemplates.has(suggestionsSection + ':' + template.title)"
            @click="insertTemplate(template)"
          >
            <CdxIcon :icon="insertedTemplates.has(suggestionsSection + ':' + template.title) ? cdxIconCheck : cdxIconAdd" />
          </button>
          <div class="suggestion-content">
            <div class="suggestion-title">{{ template.title }}</div>
          </div>
        </div>
      </div>

      <!-- Verified facts from Wikidata -->
      <div v-if="currentFacts.length > 0" class="verified-facts-section">
        <h4 class="panel-section-heading">VERIFIED FACTS</h4>
        <div
          v-for="fact in currentFacts"
          :key="fact.label"
          :class="['fact-item', { 'fact-added': insertedFacts.has(fact.label + ':' + fact.value) }]"
        >
          <div class="fact-content">
            <div class="fact-label">{{ fact.label }}</div>
            <div class="fact-value">{{ fact.value }}</div>
          </div>
          <button
            class="add-btn-circle"
            :aria-label="insertedFacts.has(fact.label + ':' + fact.value) ? 'Already added' : 'Add fact'"
            :disabled="insertedFacts.has(fact.label + ':' + fact.value)"
            @click="insertFact(fact)"
          >
            <CdxIcon :icon="insertedFacts.has(fact.label + ':' + fact.value) ? cdxIconCheck : cdxIconAdd" />
          </button>
        </div>
      </div>

      <!-- View outline button -->
      <button class="view-outline-btn" @click="showOutlinePanel = true; showSuggestionsPanel = false">
        <CdxIcon :icon="cdxIconListBullet" />
        <span>View full article outline</span>
      </button>
    </div>

    <!-- Getting started panel (shown on first load) -->
    <div v-if="showGettingStarted" class="getting-started-panel">
      <div class="panel-header">
        <h3 class="panel-title">Getting started</h3>
        <CdxButton weight="quiet" aria-label="Close" @click="showGettingStarted = false">
          <CdxIcon :icon="cdxIconClose" />
        </CdxButton>
      </div>
      <div class="panel-content">
        <h4 class="panel-subheading">For the opening section of this {{ selectedArticleType }} article:</h4>
        <ul class="panel-list">
          <li v-for="item in gettingStartedItems" :key="item">{{ item }}</li>
        </ul>
      </div>
    </div>

    <!-- Article outline panel -->
    <div v-if="showOutlinePanel" class="outline-panel">
      <div class="outline-panel-header">
        <div>
          <h3 class="outline-panel-title">Article outline</h3>
          <p class="outline-panel-subtitle">Based on common {{ selectedArticleType }} articles</p>
        </div>
        <CdxButton weight="quiet" aria-label="Close" @click="showOutlinePanel = false">
          <CdxIcon :icon="cdxIconClose" />
        </CdxButton>
      </div>
      <div class="outline-sections">
        <!-- Lead section always present -->
        <div class="outline-section">
          <div class="outline-section-content">
            <h4 class="outline-section-title">Lead section</h4>
            <p class="outline-section-description">A short summary of the topic.</p>
          </div>
          <span class="outline-added-badge">Added</span>
        </div>

        <!-- Type-specific sections -->
        <div v-for="section in typeSections" :key="section.name" class="outline-section">
          <div class="outline-section-content">
            <h4 class="outline-section-title">{{ section.name }}</h4>
          </div>
          <span v-if="addedSectionNames.has(section.name)" class="outline-added-badge">Added</span>
          <CdxButton
            v-else
            size="medium"
            @click="addSection(section); showOutlinePanel = false"
          >
            Add
          </CdxButton>
        </div>

        <!-- Add custom section -->
        <button class="add-custom-section-btn" @click="showCustomSectionDialog = true">
          <CdxIcon :icon="cdxIconAdd" />
          <span>Add custom section...</span>
        </button>
      </div>
    </div>

    <!-- Custom section dialog -->
    <div v-if="showCustomSectionDialog" class="dialog-overlay" @click.self="showCustomSectionDialog = false">
      <div class="dialog-content">
        <div class="dialog-header">
          <h3 class="dialog-title">Add custom section</h3>
          <CdxButton weight="quiet" aria-label="Close" @click="showCustomSectionDialog = false">
            <CdxIcon :icon="cdxIconClose" />
          </CdxButton>
        </div>
        <div class="dialog-body">
          <label class="input-label">Section name</label>
          <CdxTextInput v-model="customSectionName" placeholder="e.g., Conservation efforts" />
        </div>
        <div class="dialog-footer">
          <CdxButton @click="showCustomSectionDialog = false">Cancel</CdxButton>
          <CdxButton
            weight="primary"
            action="progressive"
            :disabled="!customSectionName.trim()"
            @click="addCustomSection"
          >
            Add section
          </CdxButton>
        </div>
      </div>
    </div>

    <!-- Citation dialog -->
    <div v-if="showCitationDialog" class="dialog-overlay" @click.self="showCitationDialog = false">
      <div class="dialog-content citation-dialog">
        <div class="dialog-header">
          <h3 class="dialog-title">Sources for "{{ query }}"</h3>
          <CdxButton weight="quiet" aria-label="Close" @click="showCitationDialog = false">
            <CdxIcon :icon="cdxIconClose" />
          </CdxButton>
        </div>
        <div class="dialog-body">
          <div v-if="userSources.length > 0" class="citation-group">
            <h4 class="citation-group-heading">Your sources</h4>
            <div v-for="(source, i) in userSources" :key="'user-' + i" class="citation-source-item">
              <a :href="source.url" target="_blank" class="citation-source-url">{{ source.url }}</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, nextTick } from 'vue';
import { CdxButton, CdxIcon, CdxTextInput } from '@wikimedia/codex';
import {
  cdxIconAdd, cdxIconCheck, cdxIconClose, cdxIconListBullet,
  cdxIconReference
} from '@wikimedia/codex-icons';
import {
  ARTICLE_TYPE_SECTIONS, LEAD_PLACEHOLDERS,
  SECTION_TEMPLATES, GETTING_STARTED_CHECKLISTS
} from '../data/articleTypes.js';
import { fetchEntityFacts } from '../data/wikidataHelpers.js';

const props = defineProps({
  query: { type: String, required: true },
  confirmedTopic: { type: Object, default: null },
  selectedArticleType: { type: String, required: true },
  userSources: { type: Array, default: () => [] }
});

// Refs
const leadEditor = ref(null);
const sectionEditors = reactive({});
const activeSection = ref('Lead section');
const showSuggestionsPanel = ref(false);
const suggestionsSection = ref('Lead section');
const showGettingStarted = ref(true);
const showOutlinePanel = ref(false);
const showCustomSectionDialog = ref(false);
const showCitationDialog = ref(false);
const customSectionName = ref('');
const citationCounter = ref(0);

// Track inserted content
const insertedTemplates = ref(new Set());
const insertedFacts = ref(new Set());

// Facts fetched from Wikidata
const entityFacts = ref([]);

// Sections added to the editor
const addedSections = ref([]);
const addedSectionNames = computed(() => new Set(addedSections.value.map(s => s.name)));

// Type-based configuration
const typeSections = computed(() => {
  return ARTICLE_TYPE_SECTIONS[props.selectedArticleType] || [];
});

const leadPlaceholder = computed(() => {
  return LEAD_PLACEHOLDERS[props.selectedArticleType] || 'Begin writing...';
});

const gettingStartedItems = computed(() => {
  return GETTING_STARTED_CHECKLISTS[props.selectedArticleType] || [];
});

const activeSectionDisplay = computed(() => {
  return suggestionsSection.value === 'Lead section' ? 'Lead / Introduction' : suggestionsSection.value;
});

// Templates for current section
const currentTemplates = computed(() => {
  const typeTemplates = SECTION_TEMPLATES[props.selectedArticleType] || {};
  return typeTemplates[suggestionsSection.value] || [];
});

// Facts for current section
const currentFacts = computed(() => {
  return entityFacts.value;
});

function setActiveSection(name) {
  activeSection.value = name;
}

function toggleSuggestionsPanel(sectionName) {
  if (showSuggestionsPanel.value && suggestionsSection.value === sectionName) {
    showSuggestionsPanel.value = false;
  } else {
    suggestionsSection.value = sectionName;
    showSuggestionsPanel.value = true;
    showGettingStarted.value = false;
  }
}

function addSection(section) {
  if (!addedSectionNames.value.has(section.name)) {
    addedSections.value.push({ ...section });
    nextTick(() => {
      const editor = sectionEditors[section.name];
      if (editor) editor.focus();
    });
  }
}

function removeSection(name) {
  addedSections.value = addedSections.value.filter(s => s.name !== name);
  if (activeSection.value === name) {
    activeSection.value = 'Lead section';
  }
}

function addCustomSection() {
  const name = customSectionName.value.trim();
  if (name && !addedSectionNames.value.has(name)) {
    addedSections.value.push({
      name,
      placeholder: `Write about ${name.toLowerCase()}...`
    });
    customSectionName.value = '';
    showCustomSectionDialog.value = false;
    showOutlinePanel.value = false;
    nextTick(() => {
      const editor = sectionEditors[name];
      if (editor) editor.focus();
    });
  }
}

function getEditorForSection(sectionName) {
  if (sectionName === 'Lead section') {
    return leadEditor.value;
  }
  return sectionEditors[sectionName];
}

function insertTemplate(template) {
  const editor = getEditorForSection(suggestionsSection.value);
  if (!editor) return;

  const key = suggestionsSection.value + ':' + template.title;
  if (insertedTemplates.value.has(key)) return;

  const currentContent = editor.innerHTML;
  const prefix = currentContent && currentContent.trim() !== '' ? '<br><br>' : '';
  editor.innerHTML = currentContent + prefix + template.template;

  insertedTemplates.value = new Set([...insertedTemplates.value, key]);

  // Focus and place cursor at end
  editor.focus();
  const range = document.createRange();
  range.selectNodeContents(editor);
  range.collapse(false);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

function insertFact(fact) {
  const editor = getEditorForSection(suggestionsSection.value);
  if (!editor) return;

  const key = fact.label + ':' + fact.value;
  if (insertedFacts.value.has(key)) return;

  citationCounter.value++;
  const factHTML = `<br>The ${fact.label.toLowerCase()} is ${fact.value}<sup class="citation-superscript" title="Source: Wikidata">[${citationCounter.value}]</sup>`;
  editor.innerHTML += factHTML;

  insertedFacts.value = new Set([...insertedFacts.value, key]);

  // Move cursor to end
  editor.focus();
  const range = document.createRange();
  range.selectNodeContents(editor);
  range.collapse(false);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

function onEditorInput() {
  // Close getting started panel on first input
  if (showGettingStarted.value) {
    showGettingStarted.value = false;
  }
}

// Fetch facts from Wikidata on mount
onMounted(async () => {
  const qid = props.confirmedTopic?.id;
  if (qid && qid.startsWith('Q')) {
    try {
      entityFacts.value = await fetchEntityFacts(qid, props.selectedArticleType);
    } catch (error) {
      console.error('Failed to fetch entity facts:', error);
    }
  }

  // Focus lead editor
  nextTick(() => {
    if (leadEditor.value) {
      leadEditor.value.focus();
    }
  });
});
</script>

<style scoped>
.editor-screen {
  display: flex;
  flex-direction: column;
  position: relative;
}

.editor-article-title {
  margin: 0 0 16px;
  font-size: var(--font-size-xx-large, 24px);
  font-family: 'Linux Libertine', 'Georgia', 'Times', serif;
  font-weight: 700;
  color: var(--color-base, #202122);
  line-height: 1.3;
}

/* Section blocks */
.article-sections {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.section-block {
  border-left: 3px solid transparent;
  padding: 8px 0 8px 12px;
  transition: border-color 0.15s;
}

.section-block.active {
  border-left-color: var(--color-progressive, #36c);
}

.section-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.section-heading-text {
  margin: 0;
  font-size: var(--font-size-large, 18px);
  font-weight: 600;
  color: var(--color-base, #202122);
  border-bottom: 1px solid var(--border-color-subtle, #c8ccd1);
  padding-bottom: 4px;
  flex: 1;
}

.section-remove-btn {
  min-width: auto;
  padding: 4px;
}

.section-content-area {
  min-height: 60px;
}

.section-textarea {
  width: 100%;
  min-height: 48px;
  border: none;
  outline: none;
  font-size: var(--font-size-medium, 14px);
  line-height: 1.6;
  color: var(--color-base, #202122);
  padding: 4px 0;
}

.section-textarea:empty::before {
  content: attr(data-placeholder);
  color: var(--color-placeholder, #72777d);
  pointer-events: none;
}

.section-get-contents-btn {
  display: block;
  width: 100%;
  padding: 10px;
  margin-top: 8px;
  background: none;
  border: 1px dashed var(--border-color-base, #a2a9b1);
  border-radius: 4px;
  color: var(--color-progressive, #36c);
  font-size: var(--font-size-small, 14px);
  font-weight: 500;
  cursor: pointer;
  text-align: center;
}

.section-get-contents-btn:hover {
  background-color: var(--background-color-progressive-subtle, #eaf3ff);
  border-color: var(--color-progressive, #36c);
}

/* Placeholder spans in contenteditable */
:deep(.placeholder) {
  background-color: var(--background-color-interactive-subtle, #f0f2f4);
  color: var(--color-placeholder, #72777d);
  padding: 1px 6px;
  border-radius: 3px;
  font-style: italic;
}

:deep(.citation-superscript) {
  color: var(--color-progressive, #36c);
  cursor: pointer;
  font-size: 0.75em;
}

/* Suggestions panel */
.suggestions-panel {
  background: var(--background-color-base, #fff);
  border-top: 2px solid var(--color-progressive, #36c);
  padding: 16px 0 0;
  margin-top: 16px;
}

.suggestions-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.suggestions-panel-label {
  font-size: var(--font-size-x-small, 11px);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-subtle, #54595d);
}

.suggestions-panel-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.suggestions-panel-title {
  margin: 0;
  font-size: var(--font-size-large, 16px);
  font-weight: 600;
}

.current-badge {
  font-size: var(--font-size-x-small, 11px);
  color: var(--color-progressive, #36c);
  background: var(--background-color-progressive-subtle, #eaf3ff);
  padding: 2px 8px;
  border-radius: 999px;
}

.panel-section-heading {
  margin: 16px 0 8px;
  font-size: var(--font-size-x-small, 11px);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-subtle, #54595d);
}

/* Suggestion cards */
.suggested-section {
  display: flex;
  flex-direction: column;
}

.suggestion-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-color-subtle, #eaecf0);
}

.suggestion-card.suggestion-added {
  opacity: 0.5;
}

.add-btn-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid var(--border-color-base, #a2a9b1);
  background: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  padding: 0;
}

.add-btn-circle:hover:not(:disabled) {
  border-color: var(--color-progressive, #36c);
  background: var(--background-color-progressive-subtle, #eaf3ff);
}

.add-btn-circle:disabled {
  cursor: default;
  border-color: var(--color-success, #177860);
  background: var(--background-color-success-subtle, #dff2eb);
}

.suggestion-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.suggestion-title {
  font-size: var(--font-size-small, 14px);
  font-weight: 500;
  color: var(--color-base, #202122);
}

/* Verified facts */
.verified-facts-section {
  display: flex;
  flex-direction: column;
}

.fact-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-color-subtle, #eaecf0);
}

.fact-item.fact-added {
  opacity: 0.5;
}

.fact-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.fact-label {
  font-size: var(--font-size-x-small, 12px);
  font-weight: 600;
  color: var(--color-subtle, #54595d);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.fact-value {
  font-size: var(--font-size-small, 14px);
  color: var(--color-base, #202122);
}

/* View outline button */
.view-outline-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 12px 0;
  margin-top: 12px;
  background: none;
  border: none;
  color: var(--color-progressive, #36c);
  font-size: var(--font-size-small, 14px);
  font-weight: 500;
  cursor: pointer;
}

.view-outline-btn:hover {
  text-decoration: underline;
}

/* Getting started panel */
.getting-started-panel {
  background: var(--background-color-interactive-subtle, #f8f9fa);
  border: 1px solid var(--border-color-subtle, #c8ccd1);
  border-radius: 4px;
  margin-top: 16px;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-bottom: 1px solid var(--border-color-subtle, #eaecf0);
}

.panel-title {
  margin: 0;
  font-size: var(--font-size-medium, 14px);
  font-weight: 700;
}

.panel-content {
  padding: 12px;
}

.panel-subheading {
  margin: 0 0 8px;
  font-size: var(--font-size-small, 13px);
  font-weight: 600;
  color: var(--color-subtle, #54595d);
}

.panel-list {
  margin: 0;
  padding-left: 20px;
  font-size: var(--font-size-small, 13px);
  color: var(--color-subtle, #54595d);
}

.panel-list li {
  margin-bottom: 4px;
}

/* Article outline panel */
.outline-panel {
  background: var(--background-color-base, #fff);
  border: 1px solid var(--border-color-subtle, #c8ccd1);
  border-radius: 4px;
  margin-top: 16px;
  overflow: hidden;
}

.outline-panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 12px;
  border-bottom: 1px solid var(--border-color-subtle, #eaecf0);
}

.outline-panel-title {
  margin: 0;
  font-size: var(--font-size-medium, 14px);
  font-weight: 700;
}

.outline-panel-subtitle {
  margin: 4px 0 0;
  font-size: var(--font-size-x-small, 12px);
  color: var(--color-subtle, #54595d);
}

.outline-sections {
  padding: 8px 12px;
}

.outline-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-color-subtle, #eaecf0);
}

.outline-section-content {
  flex: 1;
}

.outline-section-title {
  margin: 0;
  font-size: var(--font-size-small, 14px);
  font-weight: 600;
}

.outline-section-description {
  margin: 2px 0 0;
  font-size: var(--font-size-x-small, 12px);
  color: var(--color-subtle, #54595d);
}

.outline-added-badge {
  font-size: var(--font-size-x-small, 12px);
  color: var(--color-success, #177860);
  background: var(--background-color-success-subtle, #dff2eb);
  padding: 2px 8px;
  border-radius: 999px;
}

.add-custom-section-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 12px 0;
  background: none;
  border: none;
  color: var(--color-progressive, #36c);
  font-size: var(--font-size-small, 14px);
  cursor: pointer;
}

/* Dialog overlays */
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-content {
  background: var(--background-color-base, #fff);
  border-radius: 8px;
  width: 90%;
  max-width: 320px;
  max-height: 80vh;
  overflow-y: auto;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--border-color-subtle, #c8ccd1);
}

.dialog-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
}

.dialog-body {
  padding: 16px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--border-color-subtle, #c8ccd1);
}

.input-label {
  display: block;
  margin-bottom: 4px;
  font-size: var(--font-size-small, 13px);
  font-weight: 600;
  color: var(--color-base, #202122);
}

/* Citation dialog */
.citation-dialog {
  max-width: 340px;
}

.citation-group {
  margin-bottom: 16px;
}

.citation-group-heading {
  margin: 0 0 8px;
  font-size: var(--font-size-small, 13px);
  font-weight: 700;
  color: var(--color-subtle, #54595d);
}

.citation-source-item {
  padding: 8px 0;
  border-bottom: 1px solid var(--border-color-subtle, #eaecf0);
}

.citation-source-url {
  font-size: var(--font-size-small, 13px);
  color: var(--color-progressive, #36c);
  word-break: break-all;
}
</style>
