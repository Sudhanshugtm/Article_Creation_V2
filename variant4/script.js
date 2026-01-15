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

    // --- MOCK DATA ---
    const mockTopics = {
        'siberian tiger': [
            { title: 'Siberian tiger', description: 'subspecies of tiger', thumbnail: 'assets/images/siberian-tiger-1-thumb.jpg' },
            { title: 'Siberian Tiger', description: 'Sculpture by Kurt Bauer in Hamburg', thumbnail: 'assets/images/siberian-tiger-2-thumb.jpg' },
            { title: 'Siberian Tiger Park', description: 'zoological park in Harbin, China', thumbnail: 'assets/images/siberian-tiger-3-thumb.jpg' },
            { title: 'Siberian Tiger Re-population Project', description: 'reestablishment of Siberian tiger populations', thumbnail: 'assets/images/siberian-tiger-4-thumb.jpg' }
        ]
    };

    // --- CATEGORY DATA ---
    const categories = {
        root: [
            { id: 'people', name: 'People' },
            { id: 'culture', name: 'Culture' },
            { id: 'geography', name: 'Geography' },
            { id: 'history', name: 'History' },
            { id: 'science', name: 'Science' },
            { id: 'organizations', name: 'Organizations' },
            { id: 'animal', name: 'Animal' }
        ],
        animal: [
            { id: 'mammals', name: 'Mammals' },
            { id: 'birds', name: 'Birds' },
            { id: 'fish', name: 'Fish' },
            { id: 'reptiles', name: 'Reptiles' },
            { id: 'insects', name: 'Insects' },
            { id: 'amphibians', name: 'Amphibians' }
        ],
        people: [
            { id: 'biography', name: 'Biography' },
            { id: 'artist', name: 'Artist' },
            { id: 'politician', name: 'Politician' },
            { id: 'athlete', name: 'Athlete' },
            { id: 'scientist', name: 'Scientist' },
            { id: 'writer', name: 'Writer' }
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

    // --- TOPIC MATCHING (Mock Data) ---
    function showTopicMatching(query) {
        const normalizedQuery = query.toLowerCase().trim();
        const topics = mockTopics[normalizedQuery] || [];
        topicList.innerHTML = '';

        if (topics.length > 0) {
            topics.forEach(topic => {
                const li = document.createElement('li');
                li.className = 'topic-item';

                const thumbSrc = topic.thumbnail || '';
                const thumbHtml = thumbSrc
                    ? `<img src="${thumbSrc}" alt="${topic.title}" class="topic-thumbnail" onerror="this.style.display='none'">`
                    : '<div class="topic-thumbnail"></div>';

                li.innerHTML = `
                    ${thumbHtml}
                    <div class="topic-content">
                        <div class="topic-title">${topic.title}</div>
                        <div class="topic-description">${topic.description}</div>
                    </div>
                `;

                li.addEventListener('click', function() {
                    currentArticleTitle = topic.title;

                    // Auto-detect category from description
                    const desc = topic.description.toLowerCase();
                    if (desc.includes('subspecies') || desc.includes('tiger') || desc.includes('animal')) {
                        currentCategory = 'animal';
                    }

                    // Show eligibility badge for Siberian tiger
                    const badge = document.getElementById('eligibilityBadge');
                    if (topic.title.toLowerCase().includes('siberian tiger') && !topic.title.includes('Park') && !topic.title.includes('Project')) {
                        badge.style.display = 'inline-flex';
                    } else {
                        badge.style.display = 'none';
                    }

                    showScreen(2.5);
                });

                topicList.appendChild(li);
            });
            topicMatching.style.display = 'block';
        } else {
            topicMatching.style.display = 'none';
        }
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

    // Title input with debounced mock search
    articleTitle.addEventListener('input', function() {
        currentArticleTitle = this.value.trim();
        autoResizeTextarea(this);

        clearTimeout(searchTimeout);
        if (currentArticleTitle.length > 2) {
            searchTimeout = setTimeout(() => {
                showTopicMatching(currentArticleTitle);
            }, 500);
        } else {
            topicMatching.style.display = 'none';
        }
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
            // Try to show topic matching first
            showTopicMatching(currentArticleTitle);
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
