// ABOUTME: Entry point for the article creation prototype
// ABOUTME: Routes to AddSourcesExploration when ?explore=sources is in the URL
import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import AddSourcesExploration from './AddSourcesExploration.vue';

import '@wikimedia/codex/dist/codex.style.css';

const params = new URLSearchParams(window.location.search);
const rootComponent = params.get('explore') === 'sources' ? AddSourcesExploration : App;

createApp(rootComponent).mount('#app');
