<!-- ABOUTME: Five design explorations for the "Add Sources" step in article creation -->
<!-- ABOUTME: Each variant explores a different approach to source education + collection -->
<template>
  <main class="page">
    <section class="phone">
      <header class="cdx-dialog__header">
        <CdxButton weight="quiet" class="back-button" aria-label="Go back">
          <CdxIcon :icon="cdxIconArrowPrevious" />
        </CdxButton>
        <h2 class="cdx-dialog__header__title">{{ headerTitle }}</h2>
        <span class="header-spacer"></span>
      </header>

      <div class="content">
        <!-- ========== VARIANT 1: Light Touch ========== -->
        <template v-if="variant === 1">
          <h3 class="section-title">Add sources</h3>
          <p class="section-description">
            Sources help reviewers verify your article. Add them now or while you write.
          </p>

          <div class="source-inputs">
            <div v-for="(source, i) in sources" :key="i" class="source-row">
              <CdxTextInput
                v-model="source.url"
                placeholder="Paste a URL"
                input-type="url"
              />
              <div v-if="source.status === 'checking'" class="source-feedback">
                <CdxProgressIndicator class="inline-progress" />
                <span class="feedback-text">Checking...</span>
              </div>
              <div v-else-if="source.status === 'valid'" class="source-feedback source-feedback--valid">
                <CdxIcon :icon="cdxIconCheck" class="feedback-icon feedback-icon--valid" />
                <span class="feedback-text">Looks good</span>
              </div>
              <div v-else-if="source.status === 'warning'" class="source-feedback source-feedback--warning">
                <CdxIcon :icon="cdxIconAlert" class="feedback-icon feedback-icon--warning" />
                <span class="feedback-text">Social media is not a reliable source</span>
              </div>
            </div>

            <button class="add-source-link" @click="addSourceRow">
              <CdxIcon :icon="cdxIconAdd" size="small" />
              <span>Add another source</span>
            </button>
          </div>

          <details class="tips-expander">
            <summary class="tips-summary">
              <CdxIcon :icon="cdxIconReference" size="small" />
              <span>What makes a good source?</span>
              <CdxIcon :icon="cdxIconExpand" size="small" class="tips-chevron" />
            </summary>
            <div class="tips-body">
              <p class="tip-line tip-line--good">News articles, books, academic papers</p>
              <p class="tip-line tip-line--bad">Social media, personal blogs, press releases</p>
            </div>
          </details>

          <div class="actions">
            <CdxButton weight="primary" action="progressive" class="full-width-btn">
              Start writing
            </CdxButton>
          </div>
        </template>

        <!-- ========== VARIANT 2: Show Don't Tell ========== -->
        <template v-if="variant === 2">
          <h3 class="section-title">Sources for your article</h3>
          <p class="section-description">
            Wikipedia articles need published, independent sources. Here are the kinds that work best:
          </p>

          <div class="example-cards">
            <div class="example-card">
              <CdxIcon :icon="cdxIconArticle" class="example-icon" />
              <div class="example-text">
                <span class="example-label">News articles</span>
                <span class="example-hint">BBC, Reuters, local papers</span>
              </div>
            </div>
            <div class="example-card">
              <CdxIcon :icon="cdxIconBook" class="example-icon" />
              <div class="example-text">
                <span class="example-label">Books &amp; academic papers</span>
                <span class="example-hint">Published research, textbooks</span>
              </div>
            </div>
            <div class="example-card">
              <CdxIcon :icon="cdxIconGlobe" class="example-icon" />
              <div class="example-text">
                <span class="example-label">Reference databases</span>
                <span class="example-hint">Encyclopedias, official registries</span>
              </div>
            </div>
          </div>

          <div class="divider-row">
            <span class="divider-line"></span>
            <span class="divider-text">Add yours</span>
            <span class="divider-line"></span>
          </div>

          <div class="source-inputs">
            <div v-for="(source, i) in sources" :key="i" class="source-row">
              <CdxTextInput
                v-model="source.url"
                placeholder="Paste a URL"
                input-type="url"
              />
              <div v-if="source.status === 'checking'" class="source-feedback">
                <CdxProgressIndicator class="inline-progress" />
                <span class="feedback-text">Checking...</span>
              </div>
              <div v-else-if="source.status === 'valid'" class="source-feedback source-feedback--valid">
                <CdxIcon :icon="cdxIconCheck" class="feedback-icon feedback-icon--valid" />
                <span class="feedback-text">Looks good</span>
              </div>
              <div v-else-if="source.status === 'warning'" class="source-feedback source-feedback--warning">
                <CdxIcon :icon="cdxIconAlert" class="feedback-icon feedback-icon--warning" />
                <span class="feedback-text">Social media is not a reliable source</span>
              </div>
            </div>

            <button class="add-source-link" @click="addSourceRow">
              <CdxIcon :icon="cdxIconAdd" size="small" />
              <span>Add another source</span>
            </button>
          </div>

          <div class="actions">
            <CdxButton weight="primary" action="progressive" class="full-width-btn">
              Start writing
            </CdxButton>
          </div>
        </template>

        <!-- ========== VARIANT 3: Inline Education ========== -->
        <template v-if="variant === 3">
          <h3 class="section-title">Add sources</h3>

          <div class="source-inputs">
            <div v-for="(source, i) in sources" :key="i" class="source-row">
              <CdxTextInput
                v-model="source.url"
                placeholder="News article, book, or research URL"
                input-type="url"
              />
              <div v-if="source.status === 'checking'" class="source-feedback">
                <CdxProgressIndicator class="inline-progress" />
                <span class="feedback-text">Checking...</span>
              </div>
              <div v-else-if="source.status === 'valid'" class="source-feedback source-feedback--valid">
                <CdxIcon :icon="cdxIconCheck" class="feedback-icon feedback-icon--valid" />
                <span class="feedback-text">Independent published source</span>
              </div>
              <div v-else-if="source.status === 'warning'" class="source-feedback source-feedback--warning">
                <CdxIcon :icon="cdxIconAlert" class="feedback-icon feedback-icon--warning" />
                <span class="feedback-text">Social media is not a reliable source</span>
              </div>
            </div>

            <button class="add-source-link" @click="addSourceRow">
              <CdxIcon :icon="cdxIconAdd" size="small" />
              <span>Add another source</span>
            </button>
          </div>

          <CdxMessage type="notice" :inline="true" class="inline-guidance">
            Wikipedia articles need sources written by someone independent of the topic — like a journalist or researcher.
          </CdxMessage>

          <div class="actions">
            <CdxButton weight="primary" action="progressive" class="full-width-btn">
              Start writing
            </CdxButton>
            <p class="optional-hint">You can also add sources while you write.</p>
          </div>
        </template>

        <!-- ========== VARIANT 4: Confidence Builder ========== -->
        <template v-if="variant === 4">
          <h3 class="section-title">Do you have sources?</h3>
          <p class="section-description">
            Articles with good sources are more likely to be kept.
          </p>

          <div class="do-dont">
            <div class="do-dont-column do-dont--do">
              <span class="do-dont-heading">Works</span>
              <ul class="do-dont-list">
                <li>News articles</li>
                <li>Books, academic papers</li>
                <li>Encyclopedias, databases</li>
              </ul>
            </div>
            <div class="do-dont-column do-dont--dont">
              <span class="do-dont-heading">Won't work</span>
              <ul class="do-dont-list">
                <li>Social media</li>
                <li>Personal blogs</li>
                <li>Press releases</li>
              </ul>
            </div>
          </div>

          <div class="source-inputs">
            <div v-for="(source, i) in sources" :key="i" class="source-row">
              <CdxTextInput
                v-model="source.url"
                placeholder="Paste a URL"
                input-type="url"
              />
              <div v-if="source.status === 'checking'" class="source-feedback">
                <CdxProgressIndicator class="inline-progress" />
                <span class="feedback-text">Checking...</span>
              </div>
              <div v-else-if="source.status === 'valid'" class="source-feedback source-feedback--valid">
                <CdxIcon :icon="cdxIconCheck" class="feedback-icon feedback-icon--valid" />
                <span class="feedback-text">Looks good</span>
              </div>
              <div v-else-if="source.status === 'warning'" class="source-feedback source-feedback--warning">
                <CdxIcon :icon="cdxIconAlert" class="feedback-icon feedback-icon--warning" />
                <span class="feedback-text">This won't work as a source</span>
              </div>
            </div>

            <button class="add-source-link" @click="addSourceRow">
              <CdxIcon :icon="cdxIconAdd" size="small" />
              <span>Add another source</span>
            </button>
          </div>

          <div class="actions">
            <CdxButton weight="primary" action="progressive" class="full-width-btn">
              Start writing
            </CdxButton>
            <p class="optional-hint">Sources can be added later too.</p>
          </div>
        </template>

        <!-- ========== VARIANT 5: Progressive Reveal ========== -->
        <template v-if="variant === 5">
          <h3 class="section-title">Almost ready</h3>
          <p class="section-description">
            Your article about "Siberian Tiger" is ready to write.
          </p>

          <div v-if="!showSourceInput" class="source-prompt-card" @click="showSourceInput = true">
            <CdxIcon :icon="cdxIconReference" class="prompt-icon" />
            <div class="prompt-text">
              <span class="prompt-label">Have sources? Add them now</span>
              <span class="prompt-hint">News articles, books, or research about your topic</span>
            </div>
            <CdxIcon :icon="cdxIconExpand" size="small" class="prompt-chevron" />
          </div>

          <div v-else class="source-inputs revealed">
            <div v-for="(source, i) in sources" :key="i" class="source-row">
              <CdxTextInput
                v-model="source.url"
                placeholder="Paste a URL"
                input-type="url"
              />
              <div v-if="source.status === 'checking'" class="source-feedback">
                <CdxProgressIndicator class="inline-progress" />
                <span class="feedback-text">Checking...</span>
              </div>
              <div v-else-if="source.status === 'valid'" class="source-feedback source-feedback--valid">
                <CdxIcon :icon="cdxIconCheck" class="feedback-icon feedback-icon--valid" />
                <span class="feedback-text">Looks good</span>
              </div>
              <div v-else-if="source.status === 'warning'" class="source-feedback source-feedback--warning">
                <CdxIcon :icon="cdxIconAlert" class="feedback-icon feedback-icon--warning" />
                <span class="feedback-text">Social media is not a reliable source</span>
              </div>
            </div>

            <button class="add-source-link" @click="addSourceRow">
              <CdxIcon :icon="cdxIconAdd" size="small" />
              <span>Add another source</span>
            </button>

            <CdxMessage type="notice" :inline="true" class="inline-guidance">
              Good sources are independent and published — like news articles, books, or research papers.
            </CdxMessage>
          </div>

          <div class="actions">
            <CdxButton weight="primary" action="progressive" class="full-width-btn">
              Start writing
            </CdxButton>
          </div>
        </template>

        <!-- ========== VARIANT 6: Persistent Title ========== -->
        <template v-if="variant === 6">
          <!-- Title input stays visible — document metaphor, never hides -->
          <div class="input-block">
            <CdxTextInput
              v-model="articleTitle"
              placeholder="Type article title"
              aria-label="Article title"
              class="borderless-input"
            />
          </div>

          <div class="sources-section-below-title">
            <p class="sources-intro">
              Add sources to support your article. News articles, books, and research papers work best.
            </p>

            <div class="source-inputs">
              <div v-for="(source, i) in sources" :key="i" class="source-row">
                <CdxTextInput
                  v-model="source.url"
                  placeholder="Paste a URL"
                  input-type="url"
                />
                <div v-if="source.status === 'checking'" class="source-feedback">
                  <CdxProgressIndicator class="inline-progress" />
                  <span class="feedback-text">Checking...</span>
                </div>
                <div v-else-if="source.status === 'valid'" class="source-feedback source-feedback--valid">
                  <CdxIcon :icon="cdxIconCheck" class="feedback-icon feedback-icon--valid" />
                  <span class="feedback-text">Looks good</span>
                </div>
                <div v-else-if="source.status === 'warning'" class="source-feedback source-feedback--warning">
                  <CdxIcon :icon="cdxIconAlert" class="feedback-icon feedback-icon--warning" />
                  <span class="feedback-text">Social media is not a reliable source</span>
                </div>
              </div>

              <button class="add-source-link" @click="addSourceRow">
                <CdxIcon :icon="cdxIconAdd" size="small" />
                <span>Add another source</span>
              </button>
            </div>

            <details class="tips-expander">
              <summary class="tips-summary">
                <CdxIcon :icon="cdxIconReference" size="small" />
                <span>What makes a good source?</span>
                <CdxIcon :icon="cdxIconExpand" size="small" class="tips-chevron" />
              </summary>
              <div class="tips-body">
                <p class="tip-line tip-line--good">News articles, books, academic papers</p>
                <p class="tip-line tip-line--bad">Social media, personal blogs, press releases</p>
              </div>
            </details>
          </div>

          <div class="actions">
            <CdxButton weight="primary" action="progressive" class="full-width-btn">
              Start writing
            </CdxButton>
            <p class="optional-hint">You can also add sources while you write.</p>
          </div>
        </template>

        <!-- ========== VARIANT 7: Confidence Meter ========== -->
        <template v-if="variant === 7">
          <div class="input-block">
            <CdxTextInput
              v-model="articleTitle"
              placeholder="Type article title"
              aria-label="Article title"
              class="borderless-input"
            />
          </div>

          <div class="confidence-section">
            <div class="confidence-meter-block">
              <div class="confidence-label-row">
                <span class="confidence-label">Article strength</span>
                <span class="confidence-value" :class="'confidence-value--' + confidenceLevel">{{ confidenceText }}</span>
              </div>
              <div class="confidence-track">
                <div class="confidence-fill" :class="'confidence-fill--' + confidenceLevel" :style="{ width: confidenceWidth }"></div>
              </div>
              <p class="confidence-hint">Add independent sources to strengthen your article.</p>
            </div>

            <div class="source-inputs">
              <div v-for="(source, i) in sources" :key="i" class="source-row">
                <CdxTextInput
                  v-model="source.url"
                  placeholder="Paste a URL"
                  input-type="url"
                />
                <div v-if="source.status === 'valid'" class="source-feedback source-feedback--valid">
                  <CdxIcon :icon="cdxIconCheck" class="feedback-icon feedback-icon--valid" />
                  <span class="feedback-text">Independent source</span>
                </div>
                <div v-else-if="source.status === 'warning'" class="source-feedback source-feedback--warning">
                  <CdxIcon :icon="cdxIconAlert" class="feedback-icon feedback-icon--warning" />
                  <span class="feedback-text">Not independent — won't count</span>
                </div>
              </div>

              <button class="add-source-link" @click="addSourceRow">
                <CdxIcon :icon="cdxIconAdd" size="small" />
                <span>Add another source</span>
              </button>
            </div>
          </div>

          <div class="actions">
            <CdxButton weight="primary" action="progressive" class="full-width-btn">
              Start writing
            </CdxButton>
            <p class="optional-hint">You can also add sources while you write.</p>
          </div>
        </template>

        <!-- ========== VARIANT 8: Source Assessment ========== -->
        <template v-if="variant === 8">
          <div class="input-block">
            <CdxTextInput
              v-model="articleTitle"
              placeholder="Type article title"
              aria-label="Article title"
              class="borderless-input"
            />
          </div>

          <div class="assessment-section">
            <h3 class="section-title-small">Source check</h3>
            <p class="section-description">
              Sources signal whether a topic can sustain a Wikipedia article.
            </p>

            <div class="source-inputs">
              <div v-for="(source, i) in sources" :key="i" class="source-row">
                <CdxTextInput
                  v-model="source.url"
                  placeholder="Paste a URL"
                  input-type="url"
                />
                <div v-if="source.status === 'valid'" class="source-feedback source-feedback--valid">
                  <CdxIcon :icon="cdxIconCheck" class="feedback-icon feedback-icon--valid" />
                  <span class="feedback-text">Accepted — independent source</span>
                </div>
                <div v-else-if="source.status === 'warning'" class="source-feedback source-feedback--warning">
                  <CdxIcon :icon="cdxIconAlert" class="feedback-icon feedback-icon--warning" />
                  <span class="feedback-text">Not accepted — not independent</span>
                </div>
              </div>

              <button class="add-source-link" @click="addSourceRow">
                <CdxIcon :icon="cdxIconAdd" size="small" />
                <span>Add another source</span>
              </button>
            </div>

            <div class="assessment-result" :class="{ 'assessment-result--pass': validSourceCount >= 2 }">
              <div class="assessment-result-icon">
                <CdxIcon :icon="validSourceCount >= 2 ? cdxIconCheck : cdxIconReference" />
              </div>
              <div class="assessment-result-text">
                <span class="assessment-result-title">{{ validSourceCount === 0 ? 'No sources added yet' : validSourceCount + ' independent ' + (validSourceCount === 1 ? 'source' : 'sources') + ' found' }}</span>
                <span class="assessment-result-hint">{{ validSourceCount >= 2 ? 'Good foundation — this topic looks supportable.' : 'Articles with 2–3 independent sources have the best chance of being kept.' }}</span>
              </div>
            </div>
          </div>

          <div class="actions">
            <CdxButton weight="primary" action="progressive" class="full-width-btn">
              Start writing
            </CdxButton>
          </div>
        </template>

        <!-- ========== VARIANT 9: Guided Self-Check ========== -->
        <template v-if="variant === 9">
          <div class="input-block">
            <CdxTextInput
              v-model="articleTitle"
              placeholder="Type article title"
              aria-label="Article title"
              class="borderless-input"
            />
          </div>

          <div class="self-check-section">
            <h3 class="section-title-small">Can you find published sources?</h3>
            <p class="section-description">
              Check the types of sources available about your topic.
            </p>

            <div class="check-items">
              <label class="check-item" :class="{ 'check-item--checked': selfChecks.news }">
                <input type="checkbox" v-model="selfChecks.news" class="check-input" />
                <span class="check-text">
                  <span class="check-text-label">News article</span>
                  <span class="check-text-hint">A report in a newspaper, magazine, or news site</span>
                </span>
              </label>
              <label class="check-item" :class="{ 'check-item--checked': selfChecks.academic }">
                <input type="checkbox" v-model="selfChecks.academic" class="check-input" />
                <span class="check-text">
                  <span class="check-text-label">Book or academic paper</span>
                  <span class="check-text-hint">Published research, textbook, or reference work</span>
                </span>
              </label>
              <label class="check-item" :class="{ 'check-item--checked': selfChecks.database }">
                <input type="checkbox" v-model="selfChecks.database" class="check-input" />
                <span class="check-text">
                  <span class="check-text-label">Reference database</span>
                  <span class="check-text-hint">Encyclopedia, official registry, or catalog</span>
                </span>
              </label>
            </div>

            <div v-if="selfCheckCount > 0" class="self-check-result">
              <CdxIcon :icon="cdxIconCheck" class="feedback-icon feedback-icon--valid" />
              <span class="self-check-result-text">{{ selfCheckCount }} source {{ selfCheckCount === 1 ? 'type' : 'types' }} — {{ selfCheckCount >= 2 ? 'good foundation' : 'try to find one more' }}</span>
            </div>

            <div v-if="selfCheckCount > 0" class="source-inputs">
              <p class="paste-prompt">Paste your source URLs:</p>
              <div v-for="(source, i) in sources" :key="i" class="source-row">
                <CdxTextInput
                  v-model="source.url"
                  placeholder="Paste a URL"
                  input-type="url"
                />
              </div>
              <button class="add-source-link" @click="addSourceRow">
                <CdxIcon :icon="cdxIconAdd" size="small" />
                <span>Add another</span>
              </button>
            </div>
          </div>

          <div class="actions">
            <CdxButton weight="primary" action="progressive" class="full-width-btn">
              Start writing
            </CdxButton>
            <p class="optional-hint">You can also add sources while you write.</p>
          </div>
        </template>

        <!-- ========== VARIANT 10: Risk-Aware (community voice) ========== -->
        <template v-if="variant === 10">
          <div class="input-block">
            <CdxTextInput
              v-model="articleTitle"
              placeholder="Type article title"
              aria-label="Article title"
              class="borderless-input"
            />
          </div>

          <div class="risk-section">
            <CdxMessage type="notice" :inline="true">
              Animal articles typically need at least one independent source to be kept.
            </CdxMessage>

            <div class="source-inputs">
              <div v-for="(source, i) in sources" :key="i" class="source-row">
                <CdxTextInput
                  v-model="source.url"
                  placeholder="Paste a URL"
                  input-type="url"
                />
                <div v-if="source.status === 'valid'" class="source-feedback source-feedback--valid">
                  <CdxIcon :icon="cdxIconCheck" class="feedback-icon feedback-icon--valid" />
                  <span class="feedback-text">Looks good</span>
                </div>
                <div v-else-if="source.status === 'warning'" class="source-feedback source-feedback--warning">
                  <CdxIcon :icon="cdxIconAlert" class="feedback-icon feedback-icon--warning" />
                  <span class="feedback-text">Social media is not a reliable source</span>
                </div>
              </div>

              <button class="add-source-link" @click="addSourceRow">
                <CdxIcon :icon="cdxIconAdd" size="small" />
                <span>Add another source</span>
              </button>
            </div>

            <details class="tips-expander">
              <summary class="tips-summary">
                <CdxIcon :icon="cdxIconReference" size="small" />
                <span>What the community recommends</span>
                <CdxIcon :icon="cdxIconExpand" size="small" class="tips-chevron" />
              </summary>
              <div class="tips-body">
                <p class="tip-line tip-line--good">Independent news coverage about the topic</p>
                <p class="tip-line tip-line--good">Books or papers by researchers</p>
                <p class="tip-line tip-line--bad">The subject's own website</p>
                <p class="tip-line tip-line--bad">Social media or fan pages</p>
              </div>
            </details>
          </div>

          <div class="actions">
            <CdxButton weight="primary" action="progressive" class="full-width-btn">
              Start writing
            </CdxButton>
            <p class="optional-hint">You can also add sources while you write.</p>
          </div>
        </template>

        <!-- ========== VARIANT 11: Coverage Question ========== -->
        <template v-if="variant === 11">
          <div class="input-block">
            <CdxTextInput
              v-model="articleTitle"
              placeholder="Type article title"
              aria-label="Article title"
              class="borderless-input"
            />
          </div>

          <div class="coverage-section">
            <h3 class="section-title-small">How well is this topic covered?</h3>
            <p class="section-description">
              Wikipedia articles need published, independent sources. How many can you find?
            </p>

            <div class="coverage-options">
              <button
                class="coverage-option"
                :class="{ 'coverage-option--selected': coverageChoice === 'many' }"
                @click="coverageChoice = 'many'"
              >
                <span class="coverage-option-label">Multiple sources</span>
                <span class="coverage-option-hint">News articles, books, or research</span>
              </button>
              <button
                class="coverage-option"
                :class="{ 'coverage-option--selected': coverageChoice === 'some' }"
                @click="coverageChoice = 'some'"
              >
                <span class="coverage-option-label">A few mentions</span>
                <span class="coverage-option-hint">One or two references I know of</span>
              </button>
              <button
                class="coverage-option"
                :class="{ 'coverage-option--selected': coverageChoice === 'unsure' }"
                @click="coverageChoice = 'unsure'"
              >
                <span class="coverage-option-label">Not sure</span>
                <span class="coverage-option-hint">I haven't looked yet</span>
              </button>
            </div>

            <div v-if="coverageChoice === 'many'" class="coverage-response">
              <p class="coverage-response-text">Great — paste your best sources below.</p>
              <div class="source-inputs">
                <div v-for="(source, i) in sources" :key="i" class="source-row">
                  <CdxTextInput v-model="source.url" placeholder="Paste a URL" input-type="url" />
                </div>
                <button class="add-source-link" @click="addSourceRow">
                  <CdxIcon :icon="cdxIconAdd" size="small" />
                  <span>Add another</span>
                </button>
              </div>
            </div>

            <div v-else-if="coverageChoice === 'some'" class="coverage-response">
              <p class="coverage-response-text">Even one good source helps. Paste what you have.</p>
              <div class="source-inputs">
                <div v-for="(source, i) in sources" :key="i" class="source-row">
                  <CdxTextInput v-model="source.url" placeholder="Paste a URL" input-type="url" />
                </div>
              </div>
            </div>

            <div v-else-if="coverageChoice === 'unsure'" class="coverage-response">
              <CdxMessage type="notice" :inline="true">
                Try searching for your topic on a news site or library database. Articles without independent sources are often removed.
              </CdxMessage>
            </div>
          </div>

          <div class="actions">
            <CdxButton weight="primary" action="progressive" class="full-width-btn">
              Start writing
            </CdxButton>
          </div>
        </template>

        <!-- ========== VARIANT 12: Multi-Type Sources (URL + Book + ISBN) ========== -->
        <template v-if="variant === 12">
          <div class="input-block">
            <CdxTextInput
              v-model="articleTitle"
              placeholder="Type article title"
              aria-label="Article title"
              class="borderless-input"
            />
          </div>

          <div class="multitype-section">
            <h3 class="section-title-small">Add sources</h3>
            <p class="section-description">
              Sources help verify your article. You can add web links, books, or other references.
            </p>

            <div class="source-type-tabs">
              <button
                class="source-type-tab"
                :class="{ 'source-type-tab--active': sourceTab === 'url' }"
                @click="sourceTab = 'url'"
              >
                <CdxIcon :icon="cdxIconGlobe" size="small" />
                <span>Web link</span>
              </button>
              <button
                class="source-type-tab"
                :class="{ 'source-type-tab--active': sourceTab === 'book' }"
                @click="sourceTab = 'book'"
              >
                <CdxIcon :icon="cdxIconBook" size="small" />
                <span>Book</span>
              </button>
              <button
                class="source-type-tab"
                :class="{ 'source-type-tab--active': sourceTab === 'other' }"
                @click="sourceTab = 'other'"
              >
                <CdxIcon :icon="cdxIconReference" size="small" />
                <span>Other</span>
              </button>
            </div>

            <div v-if="sourceTab === 'url'" class="source-tab-content">
              <div class="source-inputs">
                <div v-for="(source, i) in sources" :key="i" class="source-row">
                  <CdxTextInput
                    v-model="source.url"
                    placeholder="Paste a URL"
                    input-type="url"
                  />
                  <div v-if="source.status === 'valid'" class="source-feedback source-feedback--valid">
                    <CdxIcon :icon="cdxIconCheck" class="feedback-icon feedback-icon--valid" />
                    <span class="feedback-text">Looks good</span>
                  </div>
                </div>
                <button class="add-source-link" @click="addSourceRow">
                  <CdxIcon :icon="cdxIconAdd" size="small" />
                  <span>Add another URL</span>
                </button>
              </div>
            </div>

            <div v-else-if="sourceTab === 'book'" class="source-tab-content">
              <div class="book-isbn-row">
                <CdxTextInput
                  v-model="bookIsbn"
                  placeholder="Enter ISBN (e.g. 978-0-123456-78-9)"
                  aria-label="ISBN"
                />
                <CdxButton weight="primary" action="progressive" :disabled="!bookIsbn" class="isbn-lookup-btn">
                  Look up
                </CdxButton>
              </div>
              <p class="isbn-hint">Find the ISBN on the back cover or inside the front page.</p>

              <div v-if="showBookManual" class="book-manual-fields">
                <p class="manual-divider-text">Or enter details manually:</p>
                <CdxTextInput v-model="bookFields.title" placeholder="Book title" aria-label="Book title" />
                <CdxTextInput v-model="bookFields.author" placeholder="Author" aria-label="Author" />
                <div class="book-row-pair">
                  <CdxTextInput v-model="bookFields.publisher" placeholder="Publisher" aria-label="Publisher" />
                  <CdxTextInput v-model="bookFields.year" placeholder="Year" aria-label="Year" />
                </div>
              </div>
              <button v-if="!showBookManual" class="add-source-link" @click="showBookManual = true">
                <CdxIcon :icon="cdxIconAdd" size="small" />
                <span>Don't have an ISBN? Enter details manually</span>
              </button>
            </div>

            <div v-else-if="sourceTab === 'other'" class="source-tab-content">
              <CdxMessage type="notice" :inline="true" class="inline-guidance">
                For journals, news, or other sources, paste a URL or DOI above. You can also add detailed citations while writing in the editor.
              </CdxMessage>
            </div>
          </div>

          <div class="actions">
            <CdxButton weight="primary" action="progressive" class="full-width-btn">
              Start writing
            </CdxButton>
            <p class="optional-hint">You can also add sources while you write.</p>
          </div>
        </template>

        <!-- ========== VARIANT 13: High-Risk Topic Intervention ========== -->
        <template v-if="variant === 13">
          <div class="input-block">
            <CdxTextInput
              v-model="articleTitle"
              placeholder="Type article title"
              aria-label="Article title"
              class="borderless-input"
            />
          </div>

          <div class="risk-intervention-section">
            <CdxMessage type="warning" :inline="true">
              <strong>Articles about people</strong> need strong, independent sources to meet Wikipedia's notability guidelines.
            </CdxMessage>

            <div class="risk-requirements">
              <h3 class="section-title-small">What you'll need</h3>
              <div class="requirement-items">
                <div class="requirement-item">
                  <span class="requirement-num">1</span>
                  <div class="requirement-text">
                    <span class="requirement-label">Independent coverage</span>
                    <span class="requirement-hint">Sources not written by or about the subject's own organization</span>
                  </div>
                </div>
                <div class="requirement-item">
                  <span class="requirement-num">2</span>
                  <div class="requirement-text">
                    <span class="requirement-label">Multiple published sources</span>
                    <span class="requirement-hint">At least 2–3 from different publications</span>
                  </div>
                </div>
                <div class="requirement-item">
                  <span class="requirement-num">3</span>
                  <div class="requirement-text">
                    <span class="requirement-label">Significant coverage</span>
                    <span class="requirement-hint">More than a passing mention — real reporting or analysis</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="source-inputs">
              <div v-for="(source, i) in sources" :key="i" class="source-row">
                <CdxTextInput
                  v-model="source.url"
                  placeholder="Paste a URL"
                  input-type="url"
                />
                <div v-if="source.status === 'valid'" class="source-feedback source-feedback--valid">
                  <CdxIcon :icon="cdxIconCheck" class="feedback-icon feedback-icon--valid" />
                  <span class="feedback-text">Looks good</span>
                </div>
                <div v-else-if="source.status === 'warning'" class="source-feedback source-feedback--warning">
                  <CdxIcon :icon="cdxIconAlert" class="feedback-icon feedback-icon--warning" />
                  <span class="feedback-text">Not independent of the subject</span>
                </div>
              </div>
              <button class="add-source-link" @click="addSourceRow">
                <CdxIcon :icon="cdxIconAdd" size="small" />
                <span>Add another source</span>
              </button>
            </div>

            <details class="tips-expander">
              <summary class="tips-summary">
                <CdxIcon :icon="cdxIconReference" size="small" />
                <span>Consider alternatives</span>
                <CdxIcon :icon="cdxIconExpand" size="small" class="tips-chevron" />
              </summary>
              <div class="tips-body">
                <p class="alternative-line">If you can't find enough independent sources, you can:</p>
                <div class="alternative-options">
                  <button class="alternative-btn">
                    <span class="alternative-btn-label">Add to an existing article</span>
                    <span class="alternative-btn-hint">Mention this person in a related article instead</span>
                  </button>
                  <button class="alternative-btn">
                    <span class="alternative-btn-label">Create a Wikidata item</span>
                    <span class="alternative-btn-hint">Record basic facts without a full article</span>
                  </button>
                </div>
              </div>
            </details>
          </div>

          <div class="actions">
            <CdxButton weight="primary" action="progressive" class="full-width-btn">
              Start writing
            </CdxButton>
          </div>
        </template>
      </div>
    </section>
  </main>
</template>

<script setup>
// ABOUTME: Script for AddSources exploration variants
// ABOUTME: Manages source input state and variant switching via query param
import { ref, computed, onMounted } from 'vue';
import {
  CdxButton,
  CdxIcon,
  CdxMessage,
  CdxProgressIndicator,
  CdxTextInput
} from '@wikimedia/codex';
import {
  cdxIconAdd,
  cdxIconAlert,
  cdxIconArrowPrevious,
  cdxIconArticle,
  cdxIconBook,
  cdxIconCheck,
  cdxIconExpand,
  cdxIconGlobe,
  cdxIconReference
} from '@wikimedia/codex-icons';

const variant = ref(1);
const showSourceInput = ref(false);
const articleTitle = ref('Siberian Tiger');
const coverageChoice = ref(null);
const selfChecks = ref({ news: false, academic: false, database: false });
const sourceTab = ref('url');
const bookIsbn = ref('');
const showBookManual = ref(false);
const bookFields = ref({ title: '', author: '', publisher: '', year: '' });

const selfCheckCount = computed(() => {
  return [selfChecks.value.news, selfChecks.value.academic, selfChecks.value.database].filter(Boolean).length;
});

const sources = ref([{ url: '', status: null }]);

function addSourceRow() {
  sources.value.push({ url: '', status: null });
}

// Confidence meter (V7) — based on valid source count
const validSourceCount = computed(() => sources.value.filter(s => s.status === 'valid').length);
const confidenceLevel = computed(() => {
  if (validSourceCount.value === 0) return 'none';
  if (validSourceCount.value === 1) return 'low';
  if (validSourceCount.value === 2) return 'medium';
  return 'high';
});
const confidenceText = computed(() => {
  const map = { none: 'Not assessed', low: 'Weak', medium: 'Moderate', high: 'Strong' };
  return map[confidenceLevel.value];
});
const confidenceWidth = computed(() => {
  const map = { none: '5%', low: '30%', medium: '60%', high: '90%' };
  return map[confidenceLevel.value];
});

const headerTitle = computed(() => {
  return 'New article';
});

onMounted(() => {
  const params = new URLSearchParams(window.location.search);
  const v = parseInt(params.get('v'), 10);
  if (v >= 1 && v <= 13) {
    variant.value = v;
  }

  // Preset interaction states for screenshots via ?state=N
  const state = parseInt(params.get('state'), 10);
  if (!state) return;

  if (v === 7) {
    // state=1: one valid source (Weak), state=2: two valid (Moderate), state=3: three valid + one warning (Strong)
    if (state >= 1) {
      sources.value = [
        { url: 'https://www.bbc.com/news/siberian-tiger', status: 'valid' }
      ];
    }
    if (state >= 2) {
      sources.value.push({ url: 'https://doi.org/10.1038/tiger-study', status: 'valid' });
    }
    if (state >= 3) {
      sources.value.push({ url: 'https://www.instagram.com/tigers', status: 'warning' });
      sources.value.push({ url: 'https://iucnredlist.org/species/15956', status: 'valid' });
    }
  }

  if (v === 8) {
    // state=1: one valid source, state=2: two valid + assessment updates
    if (state >= 1) {
      sources.value = [
        { url: 'https://www.bbc.com/news/siberian-tiger', status: 'valid' }
      ];
    }
    if (state >= 2) {
      sources.value.push({ url: 'https://doi.org/10.1038/tiger-study', status: 'valid' });
      sources.value.push({ url: 'https://facebook.com/tigers', status: 'warning' });
    }
  }

  if (v === 9) {
    // state=1: two checks selected, state=2: checks + URLs pasted
    if (state >= 1) {
      selfChecks.value = { news: true, academic: true, database: false };
    }
    if (state >= 2) {
      sources.value = [
        { url: 'https://www.bbc.com/news/siberian-tiger', status: null },
        { url: 'https://doi.org/10.1038/tiger-study', status: null }
      ];
    }
  }

  if (v === 10) {
    // state=1: expander open (handled by DOM), state=2: source added
    if (state >= 2) {
      sources.value = [
        { url: 'https://www.bbc.com/news/siberian-tiger', status: 'valid' },
        { url: '', status: null }
      ];
    }
  }

  if (v === 11) {
    // state=1: "many" selected, state=2: "some" selected, state=3: "unsure" selected
    if (state === 1) {
      coverageChoice.value = 'many';
      sources.value = [
        { url: 'https://www.bbc.com/news/siberian-tiger', status: null },
        { url: '', status: null }
      ];
    }
    if (state === 2) {
      coverageChoice.value = 'some';
      sources.value = [{ url: '', status: null }];
    }
    if (state === 3) {
      coverageChoice.value = 'unsure';
    }
  }

  if (v === 12) {
    // state=1: book tab with ISBN entered, state=2: book tab with manual fields open
    if (state === 1) {
      sourceTab.value = 'book';
      bookIsbn.value = '978-0-521-63148-3';
    }
    if (state === 2) {
      sourceTab.value = 'book';
      showBookManual.value = true;
      bookFields.value = { title: 'Tigers of the World', author: 'R. Tilson', publisher: 'Academic Press', year: '2010' };
    }
  }

  if (v === 13) {
    // state=1: person article with sources added
    articleTitle.value = 'John Smith (entrepreneur)';
    if (state >= 1) {
      sources.value = [
        { url: 'https://www.forbes.com/john-smith-startup', status: 'valid' },
        { url: 'https://johnsmith.com/about', status: 'warning' },
        { url: '', status: null }
      ];
    }
  }
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

.cdx-dialog__header {
  display: flex;
  align-items: center;
  padding: calc(12px + env(safe-area-inset-top)) calc(16px + env(safe-area-inset-right)) 12px calc(16px + env(safe-area-inset-left));
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

.back-button { min-width: auto; padding: 4px; }
.header-spacer { width: 32px; }

.content {
  padding: 24px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Typography */
.section-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--color-base, #202122);
}

.section-description {
  margin: 0;
  font-size: 14px;
  color: var(--color-subtle, #54595d);
  line-height: 1.5;
}

/* Source inputs */
.source-inputs {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.source-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.source-feedback {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
}

.feedback-text {
  font-size: 13px;
  color: var(--color-subtle, #54595d);
}

.feedback-icon { width: 16px; height: 16px; }
.feedback-icon--valid { color: var(--color-success, #14866d); }
.feedback-icon--warning { color: var(--color-warning, #edab00); }

.source-feedback--valid .feedback-text { color: var(--color-success, #14866d); }
.source-feedback--warning .feedback-text { color: var(--color-base, #202122); }

.inline-progress { flex-shrink: 0; }

.add-source-link {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  padding: 4px 0;
  font-size: 14px;
  color: var(--color-progressive, #36c);
  cursor: pointer;
  font-family: inherit;
}

.add-source-link:hover { text-decoration: underline; }

/* Actions */
.actions {
  margin-top: auto;
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.full-width-btn { width: 100%; }

.optional-hint {
  margin: 0;
  font-size: 13px;
  color: var(--color-subtle, #72777d);
}

/* Variant 1: Tips expander */
.tips-expander {
  border: 1px solid var(--border-color-subtle, #c8ccd1);
  border-radius: 4px;
  overflow: hidden;
}

.tips-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  cursor: pointer;
  font-size: 14px;
  color: var(--color-base, #202122);
  list-style: none;
}

.tips-summary::-webkit-details-marker { display: none; }

.tips-chevron {
  margin-left: auto;
  transition: transform 0.2s;
}

details[open] .tips-chevron {
  transform: rotate(180deg);
}

.tips-body {
  padding: 0 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tip-line {
  margin: 0;
  font-size: 13px;
  padding-left: 20px;
  position: relative;
}

.tip-line--good::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--color-success, #14866d);
  font-weight: 700;
}

.tip-line--bad::before {
  content: '✗';
  position: absolute;
  left: 0;
  color: var(--color-destructive, #d73333);
  font-weight: 700;
}

/* Variant 2: Example cards */
.example-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.example-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: var(--background-color-interactive-subtle, #f8f9fa);
  border-radius: 4px;
}

.example-icon {
  color: var(--color-subtle, #54595d);
  flex-shrink: 0;
}

.example-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.example-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-base, #202122);
}

.example-hint {
  font-size: 12px;
  color: var(--color-subtle, #72777d);
}

/* Divider */
.divider-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 4px 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: var(--border-color-subtle, #c8ccd1);
}

.divider-text {
  font-size: 13px;
  color: var(--color-subtle, #72777d);
}

/* Variant 3: Inline guidance */
.inline-guidance {
  margin-top: 4px;
}

/* Variant 4: Do/Don't */
.do-dont {
  display: flex;
  gap: 12px;
}

.do-dont-column {
  flex: 1;
  padding: 10px;
  border-radius: 4px;
}

.do-dont--do {
  background: var(--background-color-success-subtle, #d5fdf4);
}

.do-dont--dont {
  background: var(--background-color-error-subtle, #ffe9e5);
}

.do-dont-heading {
  display: block;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 6px;
  color: var(--color-base, #202122);
}

.do-dont-list {
  margin: 0;
  padding-left: 16px;
  font-size: 13px;
  color: var(--color-base, #202122);
  line-height: 1.6;
}

/* Variant 5: Progressive reveal */
.source-prompt-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 12px;
  border: 1px solid var(--border-color-subtle, #c8ccd1);
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.15s;
}

.source-prompt-card:hover {
  background: var(--background-color-interactive-subtle, #f8f9fa);
}

.prompt-icon {
  color: var(--color-subtle, #54595d);
  flex-shrink: 0;
}

.prompt-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.prompt-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-base, #202122);
}

.prompt-hint {
  font-size: 12px;
  color: var(--color-subtle, #72777d);
}

.prompt-chevron {
  color: var(--color-subtle, #72777d);
  transform: rotate(90deg);
}

.revealed {
  animation: fadeSlideIn 0.2s ease-out;
}

@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Variant 6: Persistent title */
.input-block {
  display: flex;
  flex-direction: column;
  gap: 0;
}

:deep(.borderless-input .cdx-text-input__input) {
  border: none;
  border-bottom: 1px solid var(--border-color-base, #a2a9b1);
  border-radius: 0;
  box-shadow: none;
  background: transparent;
  font-size: 20px;
  line-height: 1.875rem;
  font-family: 'Linux Libertine', 'Georgia', 'Times', serif;
  padding-bottom: 8px;
}

:deep(.borderless-input .cdx-text-input__input:focus) {
  border: none;
  border-bottom: 2px solid var(--color-progressive, #36c);
  box-shadow: none;
  outline: none;
}

.sources-section-below-title {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sources-intro {
  margin: 0;
  font-size: 14px;
  color: var(--color-subtle, #54595d);
  line-height: 1.5;
}

/* Variant 7: Confidence Meter */
.confidence-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.confidence-meter-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.confidence-label-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.confidence-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-base, #202122);
}

.confidence-value {
  font-size: 13px;
  font-weight: 600;
}

.confidence-value--none { color: var(--color-subtle, #72777d); }
.confidence-value--low { color: var(--color-warning, #edab00); }
.confidence-value--medium { color: var(--color-progressive, #36c); }
.confidence-value--high { color: var(--color-success, #14866d); }

.confidence-track {
  height: 6px;
  background: var(--background-color-interactive-subtle, #eaecf0);
  border-radius: 3px;
  overflow: hidden;
}

.confidence-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s ease, background-color 0.3s ease;
}

.confidence-fill--none { background: var(--color-subtle, #a2a9b1); }
.confidence-fill--low { background: var(--color-warning, #edab00); }
.confidence-fill--medium { background: var(--color-progressive, #36c); }
.confidence-fill--high { background: var(--color-success, #14866d); }

.confidence-hint {
  margin: 0;
  font-size: 13px;
  color: var(--color-subtle, #72777d);
  line-height: 1.4;
}

/* Variant 8: Source Assessment */
.assessment-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title-small {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-base, #202122);
}

.assessment-result {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: var(--background-color-interactive-subtle, #f8f9fa);
  border-radius: 4px;
  align-items: flex-start;
}

.assessment-result-icon {
  color: var(--color-subtle, #72777d);
  flex-shrink: 0;
  margin-top: 1px;
}

.assessment-result-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.assessment-result-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-base, #202122);
}

.assessment-result-hint {
  font-size: 13px;
  color: var(--color-subtle, #54595d);
  line-height: 1.4;
}

.assessment-result--pass {
  background: var(--background-color-success-subtle, #d5fdf4);
}

.assessment-result--pass .assessment-result-icon {
  color: var(--color-success, #14866d);
}

.assessment-result--pass .assessment-result-title {
  color: var(--color-success, #14866d);
}

/* Variant 9: Guided Self-Check */
.self-check-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.check-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.check-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid var(--border-color-subtle, #c8ccd1);
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.15s, border-color 0.15s;
}

.check-item:hover {
  background: var(--background-color-interactive-subtle, #f8f9fa);
}

.check-item--checked {
  border-color: var(--color-progressive, #36c);
  background: var(--background-color-progressive-subtle, #eaf3ff);
}

.check-input {
  margin-top: 2px;
  accent-color: var(--color-progressive, #36c);
}

.check-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.check-text-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-base, #202122);
}

.check-text-hint {
  font-size: 12px;
  color: var(--color-subtle, #72777d);
  line-height: 1.4;
}

.self-check-result {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
}

.self-check-result-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-success, #14866d);
}

.paste-prompt {
  margin: 0;
  font-size: 14px;
  color: var(--color-subtle, #54595d);
}

/* Variant 10: Risk-Aware */
.risk-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Variant 11: Coverage Question */
.coverage-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.coverage-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.coverage-option {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px;
  border: 1px solid var(--border-color-subtle, #c8ccd1);
  border-radius: 4px;
  background: var(--background-color-base, #fff);
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: background-color 0.15s, border-color 0.15s;
}

.coverage-option:hover {
  background: var(--background-color-interactive-subtle, #f8f9fa);
}

.coverage-option--selected {
  border-color: var(--color-progressive, #36c);
  background: var(--background-color-progressive-subtle, #eaf3ff);
}

.coverage-option-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-base, #202122);
}

.coverage-option-hint {
  font-size: 12px;
  color: var(--color-subtle, #72777d);
}

.coverage-response {
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: fadeSlideIn 0.2s ease-out;
}

.coverage-response-text {
  margin: 0;
  font-size: 14px;
  color: var(--color-base, #202122);
}

/* Variant 12: Multi-Type Sources */
.multitype-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.source-type-tabs {
  display: flex;
  gap: 0;
  border: 1px solid var(--border-color-subtle, #c8ccd1);
  border-radius: 4px;
  overflow: hidden;
}

.source-type-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 8px;
  background: var(--background-color-base, #fff);
  border: none;
  border-right: 1px solid var(--border-color-subtle, #c8ccd1);
  font-size: 13px;
  font-family: inherit;
  color: var(--color-base, #202122);
  cursor: pointer;
  transition: background-color 0.15s;
}

.source-type-tab:last-child { border-right: none; }

.source-type-tab:hover {
  background: var(--background-color-interactive-subtle, #f8f9fa);
}

.source-type-tab--active {
  background: var(--background-color-progressive-subtle, #eaf3ff);
  color: var(--color-progressive, #36c);
  font-weight: 600;
}

.source-tab-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.book-isbn-row {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.book-isbn-row .cdx-text-input { flex: 1; }

.isbn-lookup-btn {
  flex-shrink: 0;
  white-space: nowrap;
}

.isbn-hint {
  margin: 0;
  font-size: 12px;
  color: var(--color-subtle, #72777d);
}

.book-manual-fields {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.manual-divider-text {
  margin: 0;
  font-size: 13px;
  color: var(--color-subtle, #72777d);
}

.book-row-pair {
  display: flex;
  gap: 8px;
}

.book-row-pair .cdx-text-input { flex: 1; }

/* Variant 13: High-Risk Topic Intervention */
.risk-intervention-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.risk-requirements {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.requirement-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.requirement-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.requirement-num {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--background-color-interactive-subtle, #eaecf0);
  border-radius: 50%;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-base, #202122);
  flex-shrink: 0;
}

.requirement-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.requirement-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-base, #202122);
}

.requirement-hint {
  font-size: 12px;
  color: var(--color-subtle, #72777d);
  line-height: 1.4;
}

.alternative-line {
  margin: 0;
  font-size: 13px;
  color: var(--color-subtle, #54595d);
  line-height: 1.4;
}

.alternative-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.alternative-btn {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 12px;
  border: 1px solid var(--border-color-subtle, #c8ccd1);
  border-radius: 4px;
  background: var(--background-color-base, #fff);
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: background-color 0.15s;
}

.alternative-btn:hover {
  background: var(--background-color-interactive-subtle, #f8f9fa);
}

.alternative-btn-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-progressive, #36c);
}

.alternative-btn-hint {
  font-size: 12px;
  color: var(--color-subtle, #72777d);
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
