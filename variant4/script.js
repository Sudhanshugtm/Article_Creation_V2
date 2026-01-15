// ABOUTME: Article Creation Guidance - Initial Intervention
// ABOUTME: Simplified flow: Title → Topic Match → Type → Sources → Guidance → VE Handoff

document.addEventListener('DOMContentLoaded', function () {

    // --- ELEMENT REFERENCES ---
    const articleTitle = document.getElementById('articleTitle');
    const closeBtn = document.getElementById('closeBtn');
    const nextBtn = document.getElementById('nextBtn');
    const topicMatching = document.getElementById('topicMatching');
    const topicList = document.getElementById('topicList');
    const topicNotListedBtn = document.getElementById('topicNotListedBtn');
    const screen1 = document.getElementById('screen1');
    const screen2 = document.getElementById('screen2');
    const screen25 = document.getElementById('screen25');
    const screen3 = document.getElementById('screen3');
    const screen4 = document.getElementById('screen4');
    const headerTitle = document.getElementById('headerTitle');
    const typeSelectionTitle = document.getElementById('typeSelectionTitle');
    const typeSearchInput = document.getElementById('typeSearchInput');
    const categoryList = document.getElementById('categoryList');
    const sourcesInputContainer = document.getElementById('sourcesInputContainer');
    const startWritingBtn = document.getElementById('startWritingBtn');
    const skipSourcesBtn = document.getElementById('skipSourcesBtn');
    const addAnotherSourceBtn = document.getElementById('addAnotherSourceBtn');
    const goodSourceTip = document.getElementById('goodSourceTip');
    const goodSourceModal = document.getElementById('goodSourceModal');
    const goodSourceBackBtn = document.getElementById('goodSourceBackBtn');
    const goodSourceGotItBtn = document.getElementById('goodSourceGotItBtn');
    const yellowPagesModal = document.getElementById('yellowPagesModal');
    const guidanceTitle = document.getElementById('guidanceTitle');
    const guidanceSources = document.getElementById('guidanceSources');
    const sourcesList = document.getElementById('sourcesList');
    const openEditorBtn = document.getElementById('openEditorBtn');
    const handoffArticleTitle = document.getElementById('handoffArticleTitle');

    // --- STATE VARIABLES ---
    let searchTimeout;
    let currentArticleTitle = '';
    let currentCategory = null;
    let currentScreen = 1;
    const userSources = [];

    // --- CATEGORY DATA ---
    const categories = {
        root: [
            { id: 'people', name: 'Person' },
            { id: 'places', name: 'Place' },
            { id: 'things', name: 'Thing' },
            { id: 'organizations', name: 'Organization' },
            { id: 'events', name: 'Event' },
            { id: 'concepts', name: 'Concept' }
        ],
        people: [
            { id: 'artist', name: 'Artist' },
            { id: 'athlete', name: 'Athlete' },
            { id: 'politician', name: 'Politician' },
            { id: 'scientist', name: 'Scientist' },
            { id: 'writer', name: 'Writer' }
        ],
        places: [
            { id: 'city', name: 'City' },
            { id: 'country', name: 'Country' },
            { id: 'landmark', name: 'Landmark' },
            { id: 'natural', name: 'Natural feature' }
        ],
        things: [
            { id: 'animal', name: 'Animal' },
            { id: 'plant', name: 'Plant' },
            { id: 'food', name: 'Food' },
            { id: 'technology', name: 'Technology' },
            { id: 'vehicle', name: 'Vehicle' }
        ],
        organizations: [
            { id: 'company', name: 'Company' },
            { id: 'nonprofit', name: 'Non-profit' },
            { id: 'school', name: 'School' },
            { id: 'government', name: 'Government agency' }
        ]
    };

    // --- GUIDANCE CONTENT BY CATEGORY ---
    const guidanceByCategory = {
        animal: {
            title: 'Tips for writing about animals',
            tips: [
                'Say what kind of animal it is',
                'Mention where it lives',
                'Add one thing that makes it notable (size, rarity, conservation status)'
            ]
        },
        person: {
            title: 'Tips for writing about people',
            tips: [
                'State why they are notable',
                'Mention their profession or role',
                'Include key accomplishments or contributions'
            ]
        },
        company: {
            title: 'Tips for writing about companies',
            tips: [
                'State what the company does',
                'Mention when and where it was founded',
                'Include notable achievements or products'
            ]
        },
        default: {
            title: 'Tips for writing your article',
            tips: [
                'Start with a clear definition',
                'Explain why the topic is notable',
                'Include key facts and context'
            ]
        }
    };

    // --- NAVIGATION FUNCTIONS ---
    function showScreen(screenNum) {
        screen1.style.display = 'none';
        screen2.style.display = 'none';
        screen25.style.display = 'none';
        screen3.style.display = 'none';
        screen4.style.display = 'none';
        nextBtn.style.display = 'block';
        currentScreen = screenNum;

        const mainContent = document.querySelector('.main-content');

        if (screenNum === 1) {
            screen1.style.display = 'block';
            headerTitle.textContent = 'New article';
        } else if (screenNum === 2) {
            screen2.style.display = 'block';
            headerTitle.textContent = 'New article';
        } else if (screenNum === 2.5) {
            screen25.style.display = 'grid';
            headerTitle.textContent = 'Add sources';
            nextBtn.style.display = 'none';
            if (mainContent) mainContent.classList.add('no-scroll');

            const addSourcesTitle = document.getElementById('addSourcesTitle');
            if (addSourcesTitle) {
                addSourcesTitle.innerHTML = currentArticleTitle
                    ? `Add key sources for "${currentArticleTitle}"`
                    : 'Add key sources';
            }
        } else if (screenNum === 3) {
            screen3.style.display = 'flex';
            screen3.style.flexDirection = 'column';
            headerTitle.textContent = 'Before you write';
            nextBtn.style.display = 'none';
            if (mainContent) mainContent.classList.remove('no-scroll');

            // Update guidance content based on category
            updateGuidanceContent();
            // Show user sources if any
            displayUserSources();
        } else if (screenNum === 4) {
            screen4.style.display = 'flex';
            headerTitle.textContent = '';
            nextBtn.style.display = 'none';
            closeBtn.style.display = 'none';

            // Update handoff title
            if (handoffArticleTitle) {
                handoffArticleTitle.textContent = currentArticleTitle || 'your article';
            }

            // Simulate VE loading (in real implementation, this would redirect)
            setTimeout(() => {
                alert('This is where Visual Editor would open with your article: "' + currentArticleTitle + '"');
            }, 2000);
        }
    }

    function updateGuidanceContent() {
        const guidance = guidanceByCategory[currentCategory] || guidanceByCategory.default;

        if (guidanceTitle) {
            guidanceTitle.textContent = guidance.title;
        }

        const guidanceList = document.querySelector('.guidance-content .guidance-list');
        if (guidanceList && guidance.tips) {
            guidanceList.innerHTML = guidance.tips.map(tip => `<li>${tip}</li>`).join('');
        }
    }

    function displayUserSources() {
        if (userSources.length > 0 && guidanceSources && sourcesList) {
            guidanceSources.style.display = 'block';
            sourcesList.innerHTML = userSources.map(url => `<li>${url}</li>`).join('');
        } else if (guidanceSources) {
            guidanceSources.style.display = 'none';
        }
    }

    // --- WIKIDATA SEARCH ---
    async function searchWikidata(query) {
        if (!query || query.length < 2) {
            topicMatching.style.display = 'none';
            return;
        }

        try {
            const response = await fetch(
                `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(query)}&language=en&limit=5&format=json&origin=*`
            );
            const data = await response.json();

            if (data.search && data.search.length > 0) {
                displayTopicResults(data.search);
            } else {
                topicMatching.style.display = 'none';
            }
        } catch (error) {
            console.error('Wikidata search error:', error);
            topicMatching.style.display = 'none';
        }
    }

    function displayTopicResults(results) {
        topicList.innerHTML = '';
        topicMatching.style.display = 'block';

        results.forEach(result => {
            const li = document.createElement('li');
            li.className = 'topic-item';
            li.innerHTML = `
                <div class="topic-info">
                    <span class="topic-title">${result.label}</span>
                    ${result.description ? `<span class="topic-description">${result.description}</span>` : ''}
                </div>
                <svg class="topic-chevron" width="20" height="20" viewBox="0 0 20 20">
                    <path d="M7 1 5.6 2.5 13 10l-7.4 7.5L7 19l9-9z"/>
                </svg>
            `;
            li.addEventListener('click', () => selectTopic(result));
            topicList.appendChild(li);
        });
    }

    function selectTopic(topic) {
        currentArticleTitle = topic.label;
        articleTitle.value = topic.label;

        // Auto-detect category from Wikidata description
        if (topic.description) {
            const desc = topic.description.toLowerCase();
            if (desc.includes('animal') || desc.includes('species') || desc.includes('subspecies')) {
                currentCategory = 'animal';
            } else if (desc.includes('person') || desc.includes('human')) {
                currentCategory = 'person';
            } else if (desc.includes('company') || desc.includes('corporation')) {
                currentCategory = 'company';
            }
        }

        showScreen(2.5);
    }

    // --- CATEGORY RENDERING ---
    function renderCategories(categoryKey) {
        categoryList.innerHTML = '';
        const categoriesToShow = categories[categoryKey] || categories.root;

        categoriesToShow.forEach(category => {
            const li = document.createElement('li');
            li.className = 'category-item';
            li.innerHTML = `
                <span class="category-name">${category.name}</span>
                <svg class="category-chevron" width="20" height="20" viewBox="0 0 20 20">
                    <path d="M7 1 5.6 2.5 13 10l-7.4 7.5L7 19l9-9z"/>
                </svg>
            `;
            li.addEventListener('click', () => handleCategoryClick(category));
            categoryList.appendChild(li);
        });
    }

    function handleCategoryClick(category) {
        currentCategory = category.id;

        // Check for Yellow Pages Friction (Company)
        if (category.id === 'company') {
            yellowPagesModal.style.display = 'flex';
            return;
        }

        if (categories[category.id]) {
            typeSelectionTitle.textContent = `What kind of ${category.name.toLowerCase()}?`;
            document.querySelector('.type-selection-description').textContent =
                `You've selected '${category.name.toLowerCase()}'. Now choose a more specific category.`;
            renderCategories(category.id);
        } else {
            showScreen(2.5);
        }
    }

    // --- SOURCE HANDLING ---
    function validateSources() {
        const inputs = sourcesInputContainer.querySelectorAll('input[type="url"]');
        let hasValidSource = false;

        userSources.length = 0;

        inputs.forEach(input => {
            const url = input.value.trim();
            if (url && isValidUrl(url)) {
                hasValidSource = true;
                userSources.push(url);
            }
        });

        startWritingBtn.disabled = !hasValidSource;
    }

    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    function addSourceInput() {
        const newRow = document.createElement('div');
        newRow.className = 'source-input-row';
        newRow.innerHTML = `
            <div class="cdx-text-input">
                <input class="cdx-text-input__input" type="url" placeholder="Paste a URL here..." />
                <div class="verification-status" style="display: none;"></div>
            </div>
        `;

        const addBtn = sourcesInputContainer.querySelector('.add-another-source-btn');
        sourcesInputContainer.insertBefore(newRow, addBtn);

        const newInput = newRow.querySelector('input');
        newInput.addEventListener('input', validateSources);
        newInput.focus();
    }

    // --- EVENT LISTENERS ---

    // Title input with debounced Wikidata search
    articleTitle.addEventListener('input', function() {
        currentArticleTitle = this.value.trim();
        autoResizeTextarea(this);

        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchWikidata(currentArticleTitle);
        }, 300);
    });

    // Auto-resize textarea
    function autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }

    // Topic not listed button
    topicNotListedBtn.addEventListener('click', () => {
        showScreen(2);
        typeSelectionTitle.textContent = `What is "${currentArticleTitle}" about?`;
        renderCategories('root');
    });

    // Type search filter
    typeSearchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        const items = categoryList.querySelectorAll('.category-item');

        items.forEach(item => {
            const name = item.querySelector('.category-name').textContent.toLowerCase();
            item.style.display = name.includes(query) ? 'flex' : 'none';
        });
    });

    // Close button
    closeBtn.addEventListener('click', () => {
        if (currentScreen > 1) {
            if (currentScreen === 2.5) {
                showScreen(2);
            } else if (currentScreen === 3) {
                showScreen(2.5);
            } else {
                showScreen(currentScreen - 1);
            }
        } else {
            if (confirm('Are you sure you want to close? Your progress will be lost.')) {
                window.location.reload();
            }
        }
    });

    // Next button
    nextBtn.addEventListener('click', () => {
        if (currentScreen === 1 && currentArticleTitle) {
            showScreen(2);
            typeSelectionTitle.textContent = `What is "${currentArticleTitle}" about?`;
            renderCategories('root');
        }
    });

    // Source input listeners
    sourcesInputContainer.querySelectorAll('input[type="url"]').forEach(input => {
        input.addEventListener('input', validateSources);
    });

    // Add another source
    addAnotherSourceBtn.addEventListener('click', addSourceInput);

    // Start writing button (goes to guidance screen)
    startWritingBtn.addEventListener('click', () => {
        showScreen(3);
    });

    // Skip sources button
    skipSourcesBtn.addEventListener('click', () => {
        showScreen(3);
    });

    // Good source tip - open modal
    goodSourceTip.addEventListener('click', () => {
        goodSourceModal.style.display = 'flex';
    });

    // Good source modal - close
    goodSourceBackBtn.addEventListener('click', () => {
        goodSourceModal.style.display = 'none';
    });

    goodSourceGotItBtn.addEventListener('click', () => {
        goodSourceModal.style.display = 'none';
    });

    // Yellow Pages Modal handlers
    document.getElementById('yellowPagesCancelBtn').addEventListener('click', () => {
        yellowPagesModal.style.display = 'none';
    });

    document.getElementById('yellowPagesCloseBtn').addEventListener('click', () => {
        yellowPagesModal.style.display = 'none';
    });

    document.getElementById('yellowPagesProceedBtn').addEventListener('click', () => {
        yellowPagesModal.style.display = 'none';
        showScreen(2.5);
    });

    // Open Editor button (goes to handoff screen)
    openEditorBtn.addEventListener('click', () => {
        showScreen(4);
    });

    // --- INITIALIZATION ---
    showScreen(1);
    articleTitle.focus();

});
