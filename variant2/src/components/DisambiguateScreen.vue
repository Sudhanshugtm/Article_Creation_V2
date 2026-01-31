<template>
  <!-- ABOUTME: Disambiguation screen — shows creatable Wikidata topics for selection -->
  <!-- ABOUTME: Displays topic cards with thumbnails and a "None of these" fallback -->
  <div>
    <h3 class="question-title">What is "{{ query }}"?</h3>
    <p class="question-subtitle">Select a topic to get writing help.</p>

    <div class="topic-list">
      <CdxCard
        v-for="topic in creatableTopics"
        :key="topic.id"
        :thumbnail="topic.thumbnail ? { url: topic.thumbnail } : null"
        class="topic-card"
        @click="$emit('select-topic', topic)"
      >
        <template #title>{{ topic.label }}</template>
        <template #description>{{ topic.description }}</template>
      </CdxCard>
    </div>

    <p class="something-else-row">
      None of these? <a href="#" @click.prevent="$emit('select-none')">Pick a type instead</a>
    </p>
  </div>
</template>

<script setup>
import { CdxCard } from '@wikimedia/codex';

defineProps({
  query: { type: String, required: true },
  creatableTopics: { type: Array, default: () => [] }
});

defineEmits(['select-topic', 'select-none']);
</script>
