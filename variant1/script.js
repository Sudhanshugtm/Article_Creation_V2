// ABOUTME: Main JavaScript file for article creation functionality
// ABOUTME: Handles user interactions, auto-resize textarea, topic matching, and navigation

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
    const sourcesInputContainer = document.getElementById('sourcesInputContainer');
    const skipSourcesBtn = document.getElementById('skipSourcesBtn');
    const typeSelectionTitle = document.getElementById('typeSelectionTitle');
    const typeSearchInput = document.getElementById('typeSearchInput');
    const categoryList = document.getElementById('categoryList');
    const editorTextarea = document.getElementById('editorTextarea');
    const panelCloseBtn = document.getElementById('panelCloseBtn');
    const gettingStartedPanel = document.getElementById('gettingStartedPanel');
    const getContentsBtn = document.getElementById('getContentsBtn');
    const editingSectionPanel = document.getElementById('editingSectionPanel');
    const editingPanelCloseBtn = document.getElementById('editingPanelCloseBtn');
    const articleOutlinePanel = document.getElementById('articleOutlinePanel');
    const outlinePanelCloseBtn = document.getElementById('outlinePanelCloseBtn');
    const viewOutlineBtn = document.querySelector('.view-outline-btn');
    const addCustomSectionBtnTrigger = document.querySelector('.add-custom-section-btn');
    const customSectionDialog = document.getElementById('customSectionDialog');
    const dialogCloseBtn = document.getElementById('dialogCloseBtn');
    const cancelCustomSectionBtn = document.getElementById('cancelCustomSectionBtn');
    const addCustomSectionBtn = document.getElementById('addCustomSectionBtn');
    const customSectionInput = document.getElementById('customSectionInput');
    const customSectionDescription = document.getElementById('customSectionDescription');
    const outlineSections = document.querySelector('.outline-sections');
    const header = document.getElementById('header');
    const headerTitle = document.getElementById('headerTitle');
    const headerDivider = document.getElementById('headerDivider');
    const headerToolbar = document.getElementById('headerToolbar');
    const citationDialog = document.getElementById('citationDialog');
    const citationDialogCloseBtn = document.getElementById('citationDialogCloseBtn');
    const citationSourcesList = document.getElementById('citationSourcesList');

    // --- STATE VARIABLES ---
    let searchTimeout;
    let currentArticleTitle = '';
    let currentCategory = null;
    const addedSections = new Set();
    let currentEditingSection = 'Lead/Introduction';
    let activeSection = null;
    const insertedTemplates = new Map();
    const insertedFacts = new Map();
    const userSources = [];
    let citationCounter = 0;
    const wikidataCitations = []; // Added missing initialization

    // --- DATA (Mocks) ---
    const sectionOrder = ['Lead section', 'Characteristics', 'Distribution and habitat', 'Ecology and behaviour'];

    const sectionPlaceholders = {
        'Lead section': 'Begin writing about Siberian tiger, or type "/" for article outline',
        'Characteristics': 'Describe the physical traits and appearance of the Siberian tiger...',
        'Distribution and habitat': 'Explain where the Siberian tiger lives and its environment...',
        'Ecology and behaviour': 'Describe the diet, activity and social behaviour of the Siberian tiger...'
    };

    const sectionSuggestions = {
        'Lead section': [
            { title: 'Short overview', description: 'A brief introduction to the topic.' },
            { title: 'Taxonomy in brief', description: 'How it is classified scientifically.' }
        ],
        'Characteristics': [
            { title: 'Physical description', description: 'Detailed physical appearance and features.' },
            { title: 'Size and weight', description: 'Typical dimensions and mass ranges.' },
            { title: 'Coat and coloration', description: 'Fur patterns and seasonal variations.' }
        ],
        'Distribution and habitat': [
            { title: 'Geographic range', description: 'Current and historical distribution areas.' },
            { title: 'Habitat preferences', description: 'Preferred ecosystems and terrain types.' },
            { title: 'Population estimates', description: 'Current population numbers and trends.' }
        ],
        'Ecology and behaviour': [
            { title: 'Diet and hunting', description: 'Prey species and hunting strategies.' },
            { title: 'Social structure', description: 'Territorial behavior and social interactions.' },
            { title: 'Reproduction', description: 'Breeding patterns and life cycle.' }
        ]
    };

    const sectionFacts = {
        'Lead section': [
            { label: 'Scientific name', value: 'Panthera tigris altaica' },
            { label: 'Conservation status', value: 'Endangered' }
        ],
        'Characteristics': [
            { label: 'Average length', value: '2.7–3.3 m (males)' },
            { label: 'Average weight', value: '180–306 kg (males)' },
            { label: 'Coat color', value: 'Pale orange with dark stripes' }
        ],
        'Distribution and habitat': [
            { label: 'Primary habitat', value: 'Temperate forests' },
            { label: 'Geographic range', value: 'Russian Far East, Northeast China' },
            { label: 'Altitude range', value: 'Up to 1,600 m' }
        ],
        'Ecology and behaviour': [
            { label: 'Primary prey', value: 'Wild boar, deer species' },
            { label: 'Territory size', value: '500–4,000 km² (males)' },
            { label: 'Gestation period', value: '3–3.5 months' }
        ]
    };

    const mockWikidataSources = {
        'Siberian Tiger': [
            { title: 'IUCN Red List entry - Panthera tigris altaica', type: 'Red List entry', publisher: 'IUCN', year: '2010', icon: 'article', url: 'https://www.iucnredlist.org/species/15956/5333650' },
            { title: 'Mammal Species of the World, 3rd ed.', type: 'Reference book', publisher: 'Wilson & Reeder', year: '2005', icon: 'book', url: 'https://www.departments.bucknell.edu/biology/resources/msw3/' },
            { title: 'Encyclopedia of Life - Panthera tigris tigris', type: 'Online database', publisher: 'eol.org', year: '', icon: 'globe', url: 'https://eol.org/pages/328606' },
            { title: 'Tigers of the World: The Science, Politics and Conservation of Panthera tigris', type: 'Book', publisher: 'Elsevier', year: '2009', icon: 'book', url: 'https://books.google.com/books?id=hFqOAAAAQBAJ' },
            { title: 'Molecular phylogeography and evolutionary history of the tiger (Panthera tigris)', type: 'Journal Article', publisher: 'Molecular Phylogenetics and Evolution', year: '2004', icon: 'article', url: 'https://doi.org/10.1016/j.ympev.2004.05.006' }
        ]
    };

    // ... (existing code) ...

    // --- SUGGESTED SOURCES LOGIC ---
    let selectedSuggestedSources = [];

    function renderSuggestedSources(sources) {
        const listContainer = document.getElementById('suggestedSourcesList');
        if (!listContainer) return;

        listContainer.innerHTML = '';
        selectedSuggestedSources = [];

        sources.forEach((source, index) => {
            const item = document.createElement('div');
            item.className = 'suggested-source-item';
            item.dataset.index = index;
            item.innerHTML = `
                <div class="source-checkbox">
                    <img src="node_modules/@wikimedia/codex-icons/dist/images/check.svg" alt="" width="14" height="14">
                </div>
                <div class="suggested-source-content">
                    <div class="suggested-source-title">${source.title}</div>
                    <div class="suggested-source-meta">
                        <span class="meta-tag">${source.type}</span>
                        <span>${source.publisher}</span>
                        ${source.year ? `<span>• ${source.year}</span>` : ''}
                    </div>
                </div>
            `;

            item.addEventListener('click', () => {
                item.classList.toggle('selected');
                if (item.classList.contains('selected')) {
                    selectedSuggestedSources.push(source);
                } else {
                    selectedSuggestedSources = selectedSuggestedSources.filter(s => s.url !== source.url);
                }
                updateAddSelectedButton();
            });

            listContainer.appendChild(item);
        });
    }

    function updateAddSelectedButton() {
        const btn = document.getElementById('addSelectedSourcesBtn');
        const gotItBtn = document.getElementById('goodSourceGotItBtn');
        if (btn && gotItBtn) {
            if (selectedSuggestedSources.length > 0) {
                btn.style.display = 'block';
                btn.textContent = `Add ${selectedSuggestedSources.length} selected source${selectedSuggestedSources.length > 1 ? 's' : ''}`;
                gotItBtn.style.display = 'none';
            } else {
                btn.style.display = 'none';
                gotItBtn.style.display = 'block';
            }
        }
    }

    const addSelectedSourcesBtn = document.getElementById('addSelectedSourcesBtn');
    if (addSelectedSourcesBtn) {
        addSelectedSourcesBtn.addEventListener('click', () => {
            const editorTextarea = document.getElementById('editorTextarea');
            let references = '';

            selectedSuggestedSources.forEach(source => {
                // Simple wikitext reference format
                const refContent = `${source.title}, ${source.publisher} (${source.year || 'n.d.'}). Available at: ${source.url}`;
                references += `<ref>${refContent}</ref> `;
            });

            if (editorTextarea) {
                // Append references to existing content or start new
                editorTextarea.value += (editorTextarea.value ? '\n\n' : '') + references;
                // Trigger input event to save state if needed
                editorTextarea.dispatchEvent(new Event('input'));
            }

            document.getElementById('goodSourceModal').style.display = 'none';
            showScreen(3);
        });
    }

    const mockTopics = {
        'siberian tiger': [
            { title: 'Siberian Tiger', description: 'subspecies of tiger', thumbnail: 'assets/images/siberian-tiger-1-thumb.jpg' },
            { title: 'Siberian Tiger', description: 'Sculpture by Kurt Bauer in Hamburg', thumbnail: 'assets/images/siberian-tiger-2-thumb.jpg' },
            { title: 'Siberian Tiger Park', description: 'zoological park in Harbin, China', thumbnail: 'assets/images/siberian-tiger-3-thumb.jpg' },
            { title: 'Siberian Tiger Re-population Project', description: 'reestablishment of Siberian tiger populations', thumbnail: 'assets/images/siberian-tiger-4-thumb.jpg' }
        ]
    };

    const categories = {
        root: [
            { id: 'people', name: 'People' }, { id: 'culture', name: 'Culture' }, { id: 'geography', name: 'Geography' },
            { id: 'history', name: 'History' }, { id: 'science', name: 'Science' }, { id: 'organizations', name: 'Organizations' },
            { id: 'animal', name: 'Animal' }
        ],
        animal: [
            { id: 'mammals', name: 'Mammals' }, { id: 'birds', name: 'Birds' }, { id: 'fish', name: 'Fish' },
            { id: 'reptiles', name: 'Reptiles' }, { id: 'insects', name: 'Insects' }, { id: 'amphibians', name: 'Amphibians' }
        ],
        people: [
            { id: 'biography', name: 'Biography' }, { id: 'artist', name: 'Artist' }, { id: 'politician', name: 'Politician' },
            { id: 'athlete', name: 'Athlete' }, { id: 'scientist', name: 'Scientist' }, { id: 'writer', name: 'Writer' }
        ],
        organizations: [
            { id: 'company', name: 'Company' }, { id: 'nonprofit', name: 'Non-profit' }, { id: 'school', name: 'School' },
            { id: 'government', name: 'Government agency' }
        ]
    };

    // --- NAVIGATION FUNCTIONS ---
    function showScreen(screenNum) {
        screen1.style.display = 'none';
        screen2.style.display = 'none';
        screen25.style.display = 'none';
        screen3.style.display = 'none';
        headerTitle.style.display = 'none';
        headerDivider.style.display = 'none';
        headerToolbar.style.display = 'none';
        nextBtn.style.display = 'block';
        nextBtn.classList.remove('btn-progressive');

        // Handle main content scrolling
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            if (screenNum === 2.5) {
                mainContent.classList.add('no-scroll');
            } else {
                mainContent.classList.remove('no-scroll');
            }
        }

        if (screenNum === 1) {
            screen1.style.display = 'block';
            headerTitle.style.display = 'block';
            headerTitle.textContent = 'New article';
        } else if (screenNum === 2) {
            screen2.style.display = 'block';
            headerTitle.style.display = 'block';
            headerTitle.textContent = 'New article';
        } else if (screenNum === 2.5) {
            screen25.style.display = 'grid';
            headerTitle.style.display = 'block';
            headerTitle.textContent = 'Add sources';
            nextBtn.style.display = 'none';
            const addSourcesTitle = document.getElementById('addSourcesTitle');
            addSourcesTitle.textContent = currentArticleTitle ? `Add key sources for "${currentArticleTitle}"` : 'Add key sources';

            // Check for Suggested Sources (Siberian Tiger)
            const goodSourceTip = document.getElementById('goodSourceTip');
            const goodSourceTitle = goodSourceTip.querySelector('.good-source-title');
            const goodSourceSubtitle = goodSourceTip.querySelector('.good-source-subtitle');
            const suggestedSourcesList = document.getElementById('suggestedSourcesList');
            const principlesList = document.querySelector('.good-source-principles-list');
            const modalHeading = document.querySelector('.good-source-heading');
            const modalIntro = document.querySelector('.good-source-intro');
            const divider = document.getElementById('goodSourceDivider');
            const suggestionsHeading = document.getElementById('suggestionsHeading');

            // Default State (Always show principles)
            if (principlesList) principlesList.style.display = 'block';
            if (modalHeading) modalHeading.textContent = 'What makes a good source?';
            if (modalIntro) modalIntro.textContent = 'Good sources are reliable, independent, and published. They provide evidence for the information in an article.';

            if (currentArticleTitle === 'Siberian Tiger' && mockWikidataSources['Siberian Tiger']) {
                // Update Trigger Card
                goodSourceTip.classList.add('has-suggestions');
                goodSourceTitle.textContent = 'Tips and suggestions';
                goodSourceSubtitle.textContent = 'Quick check what sources work and what won\'t';

                // Update Modal Content
                if (suggestedSourcesList) {
                    renderSuggestedSources(mockWikidataSources['Siberian Tiger']);
                    suggestedSourcesList.style.display = 'block';
                }

                // Show Divider and Suggestions Heading
                if (divider) divider.style.display = 'block';
                if (suggestionsHeading) {
                    suggestionsHeading.style.display = 'block';
                    suggestionsHeading.textContent = `Suggestions for ${currentArticleTitle}`;
                }

            } else {
                // Reset Trigger Card
                goodSourceTip.classList.remove('has-suggestions');
                goodSourceTitle.textContent = 'Tips and suggestions';
                goodSourceSubtitle.textContent = 'Quick check what sources work and what won\'t';

                // Hide Suggestions Content
                if (suggestedSourcesList) suggestedSourcesList.style.display = 'none';
                if (divider) divider.style.display = 'none';
                if (suggestionsHeading) suggestionsHeading.style.display = 'none';
            }

        } else if (screenNum === 3) {
            screen3.style.display = 'block';
            headerDivider.style.display = 'block';
            headerToolbar.style.display = 'flex';
            nextBtn.classList.add('btn-progressive');

            // Ensure editor is clean for placeholder to show
            const editor = document.getElementById('editorTextarea');
            if (editor && (!editor.textContent.trim())) {
                editor.innerHTML = '';
            }
        }
    }

    function renderCategories(categoryKey) {
        categoryList.innerHTML = '';
        const categoriesToShow = categories[categoryKey] || categories.root;
        categoriesToShow.forEach(category => {
            const li = document.createElement('li');
            li.className = 'category-item';
            li.innerHTML = `<span class="category-name">${category.name}</span>
                            <svg class="category-chevron" width="20" height="20" viewBox="0 0 20 20"><path d="M7 1 5.6 2.5 13 10l-7.4 7.5L7 19l9-9z"/></svg>`;
            li.addEventListener('click', () => handleCategoryClick(category));
            categoryList.appendChild(li);
        });
    }

    function handleCategoryClick(category) {
        currentCategory = category.id;

        // Check for Yellow Pages Friction (Organization -> Company)
        if (category.id === 'company' || category.title === 'Company' || category.name === 'Company') {
            const yellowPagesModal = document.getElementById('yellowPagesModal');
            yellowPagesModal.style.display = 'flex';

            // Handle Modal Buttons
            document.getElementById('yellowPagesCancelBtn').onclick = () => {
                yellowPagesModal.style.display = 'none';
            };
            document.getElementById('yellowPagesCloseBtn').onclick = () => {
                yellowPagesModal.style.display = 'none';
            };

            document.getElementById('yellowPagesProceedBtn').onclick = () => {
                yellowPagesModal.style.display = 'none';
                showScreen(2.5); // Proceed to sources
            };
            return;
        }

        if (categories[category.id]) {
            typeSelectionTitle.textContent = `What kind of ${category.name.toLowerCase()}?`;
            document.querySelector('.type-selection-description').textContent = `You've selected '${category.name.toLowerCase()}'. Now choose a more specific category.`;
            renderCategories(category.id);
        } else {
            showScreen(2.5);
        }
    }

    function autoResize() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    }

    function showTopicMatching(query) {
        const normalizedQuery = query.toLowerCase().trim();
        const topics = mockTopics[normalizedQuery] || [];
        topicList.innerHTML = '';

        if (topics.length > 0) {
            topics.forEach(topic => {
                const li = document.createElement('li');
                li.className = 'topic-item';

                const thumbSrc = topic.thumbnail || '';
                const thumbHtml = thumbSrc ? `<img src="${thumbSrc}" alt="${topic.title}" class="topic-thumbnail" onerror="this.replaceWith(document.createElement('div').className='topic-thumbnail')">` : '<div class="topic-thumbnail"></div>';

                li.innerHTML = `${thumbHtml}
                                <div class="topic-content">
                                    <div class="topic-title">${topic.title}</div>
                                    <div class="topic-description">${topic.description}</div>
                                </div>`;

                li.addEventListener('click', function () {
                    currentArticleTitle = topic.title;
                    // MOCK LOGIC: If it's the tiger, show the positive signal
                    const badge = document.getElementById('eligibilityBadge');
                    if (topic.title.includes('Siberian tiger')) {
                        badge.style.display = 'inline-flex';
                        // Ensure it has the base class plus any specific styling if needed
                        badge.className = 'eligibility-banner';
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

    // --- EVENT LISTENERS: NAVIGATION & SETUP ---
    articleTitle.addEventListener('input', function () {
        autoResize.call(this);
        clearTimeout(searchTimeout);
        const query = this.value.trim();
        if (query.length > 2) {
            searchTimeout = setTimeout(() => showTopicMatching(query), 500);
        } else {
            topicMatching.style.display = 'none';
        }
    });

    closeBtn.addEventListener('click', function () {
        if (screen3.style.display === 'block') {
            currentCategory ? showScreen(2) : showScreen(1);
        } else if (screen2.style.display === 'block') {
            showScreen(1);
        } else {
            window.location.replace('../index.html');
        }
    });



    nextBtn.addEventListener('click', function () {
        if (screen1.style.display === 'block') {
            const title = articleTitle.value.trim();
            if (title) {
                currentArticleTitle = title;
                showTopicMatching(title);
            }
        } else if (screen2.style.display === 'block') {
            // Should be handled by category selection
        } else if (screen25.style.display === 'grid') {
            // ELIGIBILITY CHECK: Intercept transition to editor
            // Check if we have at least one "Green" source
            // We need to check the inputs in #sourcesInputContainer
            const inputs = document.querySelectorAll('.cdx-text-input__input');
            let hasGoodSource = false;

            inputs.forEach(input => {
                const val = input.value.toLowerCase();
                if (val.includes('bbc.com') || val.includes('nytimes.com') || val.includes('nature.com')) {
                    hasGoodSource = true;
                }
            });

            if (hasGoodSource) {
                // FAST TRACK: High confidence
                showScreen(3);
            } else {
                // SLOW TRACK: Show Eligibility Modal
                const eligibilityModal = document.getElementById('eligibilityModal');
                eligibilityModal.style.display = 'flex';

                // Handle Modal Buttons
                document.getElementById('eligibilityAddSourceBtn').onclick = () => {
                    eligibilityModal.style.display = 'none';
                    // Focus on the first empty input or add new one
                    const emptyInput = Array.from(inputs).find(i => !i.value);
                    if (emptyInput) emptyInput.focus();
                };
                document.getElementById('eligibilityModalCloseBtn').onclick = () => {
                    eligibilityModal.style.display = 'none';
                };

                document.getElementById('eligibilityProceedBtn').onclick = () => {
                    eligibilityModal.style.display = 'none';
                    showScreen(3); // Proceed anyway
                };
            }
        }
    });

    topicNotListedBtn.addEventListener('click', function () {
        currentArticleTitle = articleTitle.value.trim();
        typeSelectionTitle.textContent = `What is "${currentArticleTitle}" about?`;
        renderCategories('root');
        showScreen(2);
    });

    typeSearchInput.addEventListener('input', function () {
        const query = this.value.toLowerCase().trim();
        const items = categoryList.querySelectorAll('.category-item');
        items.forEach(item => {
            const name = item.querySelector('.category-name').textContent.toLowerCase();
            item.style.display = name.includes(query) ? 'flex' : 'none';
        });
    });

    panelCloseBtn.addEventListener('click', () => gettingStartedPanel.style.display = 'none');

    function setActiveSection(sectionBlock) {
        document.querySelectorAll('.section-block').forEach(section => {
            section.classList.remove('active');
            // Re-evaluate button visibility for ALL sections to ensure old ones are hidden
            // We do this BEFORE adding active class to the new one, but we need to do it after removing active class
            // Actually, we can just do it in a second pass or right here.
        });

        if (sectionBlock) {
            sectionBlock.classList.add('active');
            activeSection = sectionBlock.dataset.sectionName;

            // Move the editing panel to be after this section
            if (editingSectionPanel && sectionBlock.parentNode) {
                // Insert after the section block
                sectionBlock.parentNode.insertBefore(editingSectionPanel, sectionBlock.nextSibling);
            }

            updateNextSectionButton();
        }

        // Update visibility for ALL sections now that active state is settled
        document.querySelectorAll('.section-block').forEach(section => {
            updateGetContentsButtonVisibility(section);
        });
    }

    function updateNextSectionButton() {
        const upNextBtn = document.querySelector('.up-next-btn');
        const upNextTitle = document.querySelector('.up-next-title');
        if (!upNextBtn || !upNextTitle) return;

        const currentIndex = sectionOrder.indexOf(activeSection);
        let nextSection = null;
        for (let i = currentIndex + 1; i < sectionOrder.length; i++) {
            if (!addedSections.has(sectionOrder[i])) {
                nextSection = sectionOrder[i];
                break;
            }
        }

        if (nextSection) {
            upNextTitle.textContent = nextSection;
            upNextBtn.style.display = 'flex';
        } else {
            upNextBtn.style.display = 'none';
        }
    }

    // --- CRITICAL FEATURE: PLACEHOLDER INTERACTION & INSERTION (DESKTOP + MOBILE) ---

    // Helper to determine if current selection is "inside", "targeting", or "adjacent" to a placeholder
    function getPlaceholderFromSelection(sel) {
        if (!sel.rangeCount) return null;

        const node = sel.anchorNode;
        const offset = sel.anchorOffset;

        // Case 1: Cursor is inside a text node which is inside a placeholder span
        if (node.nodeType === 3 && node.parentElement && node.parentElement.classList.contains('placeholder')) {
            return node.parentElement;
        }

        // Case 2: Cursor is on the placeholder span element itself
        if (node.nodeType === 1 && node.classList.contains('placeholder')) {
            return node;
        }

        // Case 3: Cursor is in the parent container, right at the start boundary of the placeholder
        if (node.nodeType === 1) {
            const child = node.childNodes[offset];
            if (child && child.nodeType === 1 && child.classList.contains('placeholder')) {
                return child;
            }
        }

        // Case 4: DESKTOP ARROW KEY FIX
        // Cursor is at the very END of a text node, and the NEXT SIBLING is a placeholder.
        // When using arrow keys, the browser often places the caret here instead of inside the span.
        if (node.nodeType === 3 && offset === node.length) {
            const nextSib = node.nextSibling;
            if (nextSib && nextSib.nodeType === 1 && nextSib.classList.contains('placeholder')) {
                return nextSib;
            }
        }

        return null;
    }

    // GLOBAL Handler for typing logic
    document.addEventListener('beforeinput', function (e) {
        // We only care about text insertion events
        if (e.inputType === 'insertText' || e.inputType === 'insertCompositionText') {
            const sel = window.getSelection();
            if (!sel.rangeCount) return;

            // Check if we are interacting with a placeholder (including adjacency)
            const placeholder = getPlaceholderFromSelection(sel);

            if (placeholder) {
                // STOP the browser from putting text inside the gray box or before it
                e.preventDefault();

                const textToInsert = e.data;

                if (textToInsert) {
                    const newTextNode = document.createTextNode(textToInsert);

                    // Replace the ENTIRE placeholder span with the new clean text node
                    placeholder.parentNode.replaceChild(newTextNode, placeholder);

                    // Set cursor position immediately after the new character
                    const range = document.createRange();
                    range.setStartAfter(newTextNode);
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }
        }
    });

    // Function to set cursor to the start of a node
    function setCursorToStart(node) {
        const range = document.createRange();
        const sel = window.getSelection();

        // Safety check for node type to determine start container
        if (node.nodeType === 3) { // Text node
            range.setStart(node, 0);
        } else { // Element node
            range.setStart(node, 0);
        }

        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);

        // Ensure the editor has focus
        const editor = node.nodeType === 3 ? node.parentElement.closest('[contenteditable="true"]') : node.closest('[contenteditable="true"]');
        if (editor) editor.focus();
    }

    // GLOBAL Handler for Click/Focus
    document.addEventListener('click', function (e) {
        // 1. Handle "Add Source" markers
        if (e.target.closest('.add-source-marker')) {
            e.preventDefault();
            e.stopPropagation();
            openCitationDialog();
            return;
        }

        // 2. Handle Placeholder clicks
        const placeholder = e.target.closest('.placeholder');
        if (placeholder) {
            e.preventDefault();
            e.stopPropagation();
            // Focus the text node inside if it exists, otherwise the span
            setCursorToStart(placeholder.firstChild || placeholder);
        }
    });

    // GLOBAL Handler for Keyboard Navigation (Tab to next placeholder)
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Tab') {
            const sel = window.getSelection();
            if (!sel.rangeCount) return;

            // Only hijack tab if we are in an editor
            const editor = sel.anchorNode.nodeType === 3
                ? sel.anchorNode.parentElement.closest('[contenteditable="true"]')
                : sel.anchorNode.closest('[contenteditable="true"]');

            if (!editor) return;

            e.preventDefault(); // Stop normal tab behavior

            const placeholders = Array.from(editor.querySelectorAll('.placeholder'));
            const anchor = sel.anchorNode;

            // 1. Check if we are currently inside a placeholder
            const currentIndex = placeholders.findIndex(p => p.contains(anchor) || p === anchor);

            let nextPlaceholder;
            if (currentIndex !== -1) {
                // We are in a placeholder, go to next
                nextPlaceholder = placeholders[currentIndex + 1];
            } else {
                // We are not in a placeholder, find first one after cursor
                nextPlaceholder = placeholders.find(p =>
                    (anchor.compareDocumentPosition(p) & Node.DOCUMENT_POSITION_FOLLOWING)
                );
            }

            if (nextPlaceholder) {
                setCursorToStart(nextPlaceholder.firstChild || nextPlaceholder);
            }
        }
    });



    // Double-Spacebar Navigation Logic (using input event for better mobile support)
    let lastSpaceTime = 0;

    document.addEventListener('input', function (e) {
        // Check for space or Android's double-space-to-period conversion (". ")
        // Also check if the input is a period that replaced a space (common in some IMEs)
        const isSpace = e.data === ' ';
        const isAndroidDoubleSpace = e.data === '. ';
        const isPeriod = e.data === '.';

        if (isSpace || isAndroidDoubleSpace || isPeriod) {
            const currentTime = new Date().getTime();
            const timeDiff = currentTime - lastSpaceTime;

            // If it's a period, we only consider it a double-space action if it was very quick
            // and likely replaced the previous space

            if (timeDiff < 500) { // Increased threshold for mobile
                const sel = window.getSelection();
                if (!sel.rangeCount) return;

                // Only hijack if in an editor
                const editor = e.target.closest('[contenteditable="true"]');

                if (!editor) return;

                // We need to undo the character insertion (space or ". ")
                // AND potentially the previous space if it was part of the gesture.

                // 1. Undo the current action (reverts ". " or " ")
                document.execCommand('undo');

                // 2. Check if the character before the caret is now a space (the first tap)
                // We need to check the text content around the caret
                const range = sel.getRangeAt(0);
                const startContainer = range.startContainer;
                const startOffset = range.startOffset;

                if (startContainer.nodeType === 3 && startOffset > 0) {
                    const text = startContainer.textContent;
                    const charBefore = text[startOffset - 1];

                    if (charBefore === ' ') {
                        // Remove the preceding space as well
                        const deleteRange = document.createRange();
                        deleteRange.setStart(startContainer, startOffset - 1);
                        deleteRange.setEnd(startContainer, startOffset);
                        deleteRange.deleteContents();
                    }
                }

                // Find placeholders
                const placeholders = Array.from(editor.querySelectorAll('.placeholder'));
                const anchor = sel.anchorNode;

                let nextPlaceholder;

                // Check if we are currently inside a placeholder
                const currentIndex = placeholders.findIndex(p => p.contains(anchor) || p === anchor);

                if (currentIndex !== -1) {
                    // Go to next
                    nextPlaceholder = placeholders[currentIndex + 1];
                } else {
                    // Find first after cursor
                    nextPlaceholder = placeholders.find(p =>
                        (anchor.compareDocumentPosition(p) & Node.DOCUMENT_POSITION_FOLLOWING)
                    );
                }

                // LOOPING LOGIC: If no next placeholder found, wrap to the first one
                if (!nextPlaceholder && placeholders.length > 0) {
                    nextPlaceholder = placeholders[0];
                }

                if (nextPlaceholder) {
                    // Move to next placeholder
                    setCursorToStart(nextPlaceholder.firstChild || nextPlaceholder);

                    // Reset timer
                    lastSpaceTime = 0;
                } else {
                    // If no next placeholder (and no looping? but we added looping), 
                    // we just let the characters stay?
                    // Or we still consume them?
                    // If looping is active, we ALWAYS have a nextPlaceholder (unless list is empty).
                    // If list is empty, we do nothing.
                    lastSpaceTime = currentTime;
                }
            } else {
                lastSpaceTime = currentTime;
            }
        } else {
            // Reset if any other input occurs
            lastSpaceTime = 0;
        }
    });

    function handleInsertSuggestion(suggestionTitle, sectionName) {
        let targetTextarea;

        if (sectionName === 'Lead section') {
            targetTextarea = editorTextarea;
        } else {
            const sectionBlocks = document.querySelectorAll('.section-block');
            sectionBlocks.forEach(block => {
                if (block.dataset.sectionName === sectionName) {
                    targetTextarea = block.querySelector('.section-textarea');
                }
            });
        }

        if (!targetTextarea) return;

        const templateContent = getTemplateContent(suggestionTitle, sectionName);
        const isContentEditable = targetTextarea.contentEditable === 'true';

        if (isContentEditable) {
            let currentContent = targetTextarea.innerHTML;

            // Remove trailing slash if present (handling potential HTML tags wrapping it)
            // This allows the template to replace the slash command
            if (currentContent.match(/\/\s*(?:<\/[^>]+>\s*)*$/)) {
                currentContent = currentContent.replace(/\/\s*((?:<\/[^>]+>\s*)*)$/, '$1');
            }

            const prefix = currentContent && currentContent.trim() !== '' ? '<br><br>' : '';
            // Add double break at the end to create empty line below
            const suffix = '<br><br>';
            targetTextarea.innerHTML = currentContent + prefix + templateContent + suffix;

            // --- IMMEDIATE FOCUS LOGIC ---
            targetTextarea.focus();

            // Find the FIRST placeholder that was just added.
            // We just grab the first valid placeholder found in the element.
            const placeholders = targetTextarea.querySelectorAll('.placeholder');

            if (placeholders.length > 0) {
                const firstPlaceholder = placeholders[0];
                setCursorToStart(firstPlaceholder.firstChild || firstPlaceholder);
            }
        } else {
            targetTextarea.value += "\n" + templateContent.replace(/<[^>]*>/g, '') + "\n\n";
        }

        if (!insertedTemplates.has(sectionName)) insertedTemplates.set(sectionName, new Set());
        insertedTemplates.get(sectionName).add(suggestionTitle);

        updateEditingPanelContent(sectionName);
        editingSectionPanel.style.display = 'none';
    }

    function handleInsertFact(fact, sectionName) {
        let targetTextarea;
        if (sectionName === 'Lead section') {
            targetTextarea = editorTextarea;
        } else {
            document.querySelectorAll('.section-block').forEach(block => {
                if (block.dataset.sectionName === sectionName) {
                    targetTextarea = block.querySelector('.section-textarea');
                }
            });
        }

        if (!targetTextarea) return;

        citationCounter++;
        wikidataCitations.push({
            number: citationCounter,
            label: fact.label,
            value: fact.value,
            source: 'Wikidata'
        });

        const factHTML = `<br>The ${fact.label.toLowerCase()} is ${fact.value}<sup class="citation-superscript">[${citationCounter}]</sup>`;
        targetTextarea.innerHTML += factHTML;

        // Move cursor to end
        targetTextarea.focus();
        const range = document.createRange();
        range.selectNodeContents(targetTextarea);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);

        if (!insertedFacts.has(sectionName)) insertedFacts.set(sectionName, new Set());
        insertedFacts.get(sectionName).add(`${fact.label}:${fact.value}`);

        updateEditingPanelContent(sectionName);
    }

    function getTemplateContent(suggestionTitle, sectionName) {
        const sourceMarker = '<span class="add-source-marker"><img src="node_modules/@wikimedia/codex-icons/dist/images/reference.svg" alt="">add source</span>';
        // Use standardized HTML spans for placeholders
        const templates = {
            'Short overview': `The <span class="placeholder">animal name</span> is a <span class="placeholder">type of animal</span> native to <span class="placeholder">broad region</span>${sourceMarker}. It is known for <span class="placeholder">key distinctive feature</span>${sourceMarker}.`,
            'Taxonomy in brief': `The <span class="placeholder">animal name</span> belongs to the <span class="placeholder">taxonomic family</span> family${sourceMarker}. It was first described by <span class="placeholder">scientist name</span> in <span class="placeholder">year</span>${sourceMarker}.`,
            'Physical description': `The <span class="placeholder">animal name</span> has <span class="placeholder">describe physical appearance</span>${sourceMarker}. <span class="placeholder">Add details about coloration, body structure, notable features</span>.`,
            'Size and weight': `Adult <span class="placeholder">animal name</span> typically measure <span class="placeholder">length range</span> in length and weigh <span class="placeholder">weight range</span>${sourceMarker}. <span class="placeholder">Add information about sexual dimorphism if applicable</span>.`,
            'Coat and coloration': `The <span class="placeholder">animal name</span> has <span class="placeholder">describe coat type and color</span>${sourceMarker}. <span class="placeholder">Add details about seasonal variations, regional differences, or distinctive markings</span>.`,
            'Geographic range': `The <span class="placeholder">animal name</span> is found in <span class="placeholder">list countries/regions</span>${sourceMarker}. <span class="placeholder">Add details about historical vs current range</span>.`,
            'Habitat preferences': `The <span class="placeholder">animal name</span> inhabits <span class="placeholder">describe habitat types</span>${sourceMarker}. <span class="placeholder">Add details about elevation range, vegetation types, climate preferences</span>.`,
            'Population estimates': `Current population estimates suggest <span class="placeholder">number</span> individuals in the wild${sourceMarker}. <span class="placeholder">Add information about population trends and conservation status</span>.`,
            'Diet and hunting': `The <span class="placeholder">animal name</span> primarily feeds on <span class="placeholder">list prey species</span>${sourceMarker}. <span class="placeholder">Add details about hunting strategies, feeding behavior</span>.`,
            'Social structure': `The <span class="placeholder">animal name</span> is <span class="placeholder">solitary/social</span>${sourceMarker}. <span class="placeholder">Add details about territorial behavior, group size, social hierarchy</span>.`,
            'Reproduction': `The <span class="placeholder">animal name</span> breeds <span class="placeholder">breeding season/frequency</span>${sourceMarker}. <span class="placeholder">Add details about gestation period, litter size, parental care</span>.`
        };
        return templates[suggestionTitle] || `<span class="placeholder">[Content for ${suggestionTitle}]</span>`;
    }

    function updateEditingPanelContent(sectionName) {
        const editingSectionTitle = document.querySelector('.editing-section-title');
        const displayName = sectionName === 'Lead section' ? 'Lead/Introduction' : sectionName;
        editingSectionTitle.textContent = displayName;
        currentEditingSection = displayName;

        const suggestedSection = document.querySelector('.suggested-section');
        const suggestions = sectionSuggestions[sectionName] || sectionSuggestions['Lead section'];

        // Remove old cards, keep header
        Array.from(suggestedSection.children).forEach(child => {
            if (child.classList.contains('suggestion-card')) child.remove();
        });

        suggestions.forEach(suggestion => {
            const card = document.createElement('div');
            card.className = 'suggestion-card';
            const isInserted = insertedTemplates.has(sectionName) && insertedTemplates.get(sectionName).has(suggestion.title);
            if (isInserted) card.classList.add('suggestion-added');

            card.innerHTML = `
                <button class="add-btn-circle" aria-label="${isInserted ? 'Already added' : 'Add paragraph'}" ${isInserted ? 'disabled' : ''}>
                    <img src="node_modules/@wikimedia/codex-icons/dist/images/${isInserted ? 'check.svg' : 'add.svg'}" alt="" width="16" height="16">
                </button>
                <div class="suggestion-content">
                    <div class="suggestion-title">${suggestion.title}</div>
                    <div class="suggestion-description">${suggestion.description}</div>
                </div>
            `;

            if (!isInserted) {
                card.querySelector('.add-btn-circle').addEventListener('click', () => handleInsertSuggestion(suggestion.title, sectionName));
            }
            suggestedSection.appendChild(card);
        });

        const verifiedFactsSection = document.querySelector('.verified-facts-section');
        const facts = sectionFacts[sectionName] || sectionFacts['Lead section'];

        verifiedFactsSection.innerHTML = '';

        facts.forEach(fact => {
            const factItem = document.createElement('div');
            factItem.className = 'fact-item';
            const factKey = `${fact.label}:${fact.value}`;
            const isInserted = insertedFacts.has(sectionName) && insertedFacts.get(sectionName).has(factKey);
            if (isInserted) factItem.classList.add('fact-added');

            factItem.innerHTML = `
                <div class="fact-content">
                    <div class="fact-label">${fact.label}</div>
                    <div class="fact-value">${fact.value}</div>
                </div>
                <button class="add-btn-circle" aria-label="${isInserted ? 'Already added' : 'Add fact'}" ${isInserted ? 'disabled' : ''}>
                    <img src="node_modules/@wikimedia/codex-icons/dist/images/${isInserted ? 'check.svg' : 'add.svg'}" alt="" width="16" height="16">
                </button>
            `;

            if (!isInserted) {
                factItem.querySelector('.add-btn-circle').addEventListener('click', () => handleInsertFact(fact, sectionName));
            }
            verifiedFactsSection.appendChild(factItem);
        });
    }

    getContentsBtn.addEventListener('click', function () {
        if (editingSectionPanel.style.display === 'block' && activeSection === 'Lead section') {
            editingSectionPanel.style.display = 'none';
        } else {
            // Ensure we treat the lead section as active if this button is clicked
            const leadSection = document.getElementById('leadSectionBlock');
            setActiveSection(leadSection);

            updateEditingPanelContent('Lead section');
            editingSectionPanel.style.display = 'block';
            gettingStartedPanel.style.display = 'none';
        }
    });

    editingPanelCloseBtn.addEventListener('click', function () {
        editingSectionPanel.style.display = 'none';
        gettingStartedPanel.style.display = 'none';
    });

    editorTextarea.addEventListener('input', function () {
        const text = this.textContent || '';
        if (text === '/' || text.endsWith('\n/')) {
            const leadSection = document.getElementById('leadSectionBlock');
            setActiveSection(leadSection);

            updateEditingPanelContent('Lead section');
            editingSectionPanel.style.display = 'block';
            gettingStartedPanel.style.display = 'none';
        }
    });

    editorTextarea.addEventListener('click', function () {
        if (gettingStartedPanel.style.display !== 'none') {
            gettingStartedPanel.style.display = 'none';
        }
    });

    viewOutlineBtn.addEventListener('click', function () {
        editingSectionPanel.style.display = 'none';
        articleOutlinePanel.style.display = 'block';
    });

    outlinePanelCloseBtn.addEventListener('click', function () {
        articleOutlinePanel.style.display = 'none';
        editingSectionPanel.style.display = 'block';
    });

    addCustomSectionBtnTrigger.addEventListener('click', function () {
        customSectionDialog.style.display = 'flex';
        setTimeout(() => customSectionInput.focus(), 100);
    });

    function closeCustomSectionDialog() {
        customSectionDialog.style.display = 'none';
        customSectionInput.value = '';
        customSectionDescription.value = '';
    }
    dialogCloseBtn.addEventListener('click', closeCustomSectionDialog);
    cancelCustomSectionBtn.addEventListener('click', closeCustomSectionDialog);

    customSectionDialog.addEventListener('click', (e) => {
        if (e.target.classList.contains('dialog-overlay')) closeCustomSectionDialog();
    });

    addCustomSectionBtn.addEventListener('click', function () {
        const sectionName = customSectionInput.value.trim();
        const sectionDesc = customSectionDescription.value.trim();
        if (sectionName) {
            const newSection = document.createElement('div');
            newSection.className = 'outline-section';
            newSection.innerHTML = `
                <div class="outline-section-content">
                    <h3 class="outline-section-title">${sectionName}</h3>
                    ${sectionDesc ? `<p class="outline-section-description">${sectionDesc}</p>` : ''}
                </div>
                <button class="outline-add-btn">Add</button>
            `;
            outlineSections.insertBefore(newSection, addCustomSectionBtnTrigger);

            const addBtn = newSection.querySelector('.outline-add-btn');
            addBtn.addEventListener('click', function () {
                handleAddSectionClick(sectionName, sectionDesc);
                articleOutlinePanel.style.display = 'none';
                editingSectionPanel.style.display = 'block';
            });
            closeCustomSectionDialog();
        }
    });

    customSectionInput.addEventListener('input', function () {
        addCustomSectionBtn.disabled = !this.value.trim();
    });

    function createSectionBlock(sectionName, sectionDescription) {
        const sectionBlock = document.createElement('div');
        sectionBlock.className = 'section-block';
        sectionBlock.dataset.sectionName = sectionName;

        sectionBlock.innerHTML = `
            <div class="section-header-row">
                <h2 class="section-heading-text">${sectionName}</h2>
                <button class="section-remove-btn" aria-label="Remove section">
                    <img src="node_modules/@wikimedia/codex-icons/dist/images/close.svg" alt="" width="20" height="20">
                </button>
            </div>
            <div class="section-content-area">
                <div class="section-textarea" contenteditable="true" data-placeholder="${sectionPlaceholders[sectionName] || `Write about ${sectionName.toLowerCase()}...`}"></div>
            </div>
            <button class="section-get-contents-btn">Get suggested contents</button>
        `;

        const textarea = sectionBlock.querySelector('.section-textarea');
        textarea.addEventListener('focus', () => setActiveSection(sectionBlock));

        sectionBlock.querySelector('.section-get-contents-btn').addEventListener('click', () => {
            if (editingSectionPanel.style.display === 'block' && activeSection === sectionName) {
                editingSectionPanel.style.display = 'none';
            } else {
                setActiveSection(sectionBlock);
                updateEditingPanelContent(sectionName);
                editingSectionPanel.style.display = 'block';
                gettingStartedPanel.style.display = 'none';
            }
        });

        // Conditional visibility for "Get suggested contents"
        textarea.addEventListener('keyup', () => updateGetContentsButtonVisibility(sectionBlock));
        textarea.addEventListener('click', () => updateGetContentsButtonVisibility(sectionBlock));

        sectionBlock.querySelector('.section-remove-btn').addEventListener('click', () => {
            sectionBlock.remove();
            addedSections.delete(sectionName);
            updateOutlineSectionStatus(sectionName, false);
        });

        return sectionBlock;
    }

    function updateOutlineSectionStatus(sectionName, isAdded) {
        const outlineSectionItems = articleOutlinePanel.querySelectorAll('.outline-section');
        outlineSectionItems.forEach(item => {
            const titleElement = item.querySelector('.outline-section-title');
            if (titleElement && titleElement.textContent === sectionName) {
                const addBtn = item.querySelector('.outline-add-btn');
                const addedBadge = item.querySelector('.outline-added-badge');

                if (isAdded) {
                    if (addBtn) addBtn.style.display = 'none';
                    if (!addedBadge) {
                        const badge = document.createElement('span');
                        badge.className = 'outline-added-badge';
                        badge.textContent = 'Added';
                        item.appendChild(badge);
                    }
                } else {
                    if (addBtn) addBtn.style.display = 'inline-flex';
                    if (addedBadge) addedBadge.remove();
                }
            }
        });
    }

    function handleAddSectionClick(sectionName, sectionDescription) {
        if (addedSections.has(sectionName)) return;
        const sectionBlock = createSectionBlock(sectionName, sectionDescription);
        document.getElementById('articleSections').appendChild(sectionBlock);
        addedSections.add(sectionName);
        updateOutlineSectionStatus(sectionName, true);
        updateNextSectionButton();
        setTimeout(() => sectionBlock.querySelector('.section-textarea').focus(), 100);
    }

    const upNextBtn = document.querySelector('.up-next-btn');
    if (upNextBtn) {
        upNextBtn.addEventListener('click', function () {
            const upNextTitle = document.querySelector('.up-next-title');
            const nextSectionName = upNextTitle ? upNextTitle.textContent : null;
            if (nextSectionName && !addedSections.has(nextSectionName)) {
                editingSectionPanel.style.display = 'none';
                handleAddSectionClick(nextSectionName, '');
            }
        });
    }

    function attachOutlineAddButtonHandlers() {
        const outlineSectionItems = articleOutlinePanel.querySelectorAll('.outline-section');
        outlineSectionItems.forEach(item => {
            const addBtn = item.querySelector('.outline-add-btn');
            if (addBtn) {
                addBtn.addEventListener('click', function () {
                    const sectionName = item.querySelector('.outline-section-title').textContent;
                    handleAddSectionClick(sectionName, '');
                    articleOutlinePanel.style.display = 'none';
                    editingSectionPanel.style.display = 'block';
                });
            }
        });
    }
    attachOutlineAddButtonHandlers();

    editorTextarea.addEventListener('focus', function () {
        setActiveSection(document.getElementById('leadSectionBlock'));
    });

    // Initial visibility check
    editorTextarea.addEventListener('keyup', () => updateGetContentsButtonVisibility(document.getElementById('leadSectionBlock')));
    editorTextarea.addEventListener('click', () => updateGetContentsButtonVisibility(document.getElementById('leadSectionBlock')));

    function updateGetContentsButtonVisibility(sectionBlock) {
        if (!sectionBlock) return;
        const btn = sectionBlock.querySelector('.section-get-contents-btn');
        const textarea = sectionBlock.querySelector('.section-textarea');
        if (!btn || !textarea) return;

        // Check if cursor is on a new line or at the end
        const sel = window.getSelection();
        if (!sel.rangeCount) return;

        const text = textarea.innerText;
        const isEmpty = text.trim() === '';
        const endsWithNewline = text.endsWith('\n') || text.endsWith('\n\n');
        const isActive = sectionBlock.classList.contains('active');

        // Show if active AND (empty OR ends with newline)
        if (isActive && (isEmpty || endsWithNewline)) {
            btn.style.visibility = 'visible';
            btn.style.pointerEvents = 'auto';
        } else {
            btn.style.visibility = 'hidden';
            btn.style.pointerEvents = 'none';
        }
    }

    addedSections.add('Lead section');
    setActiveSection(document.getElementById('leadSectionBlock'));
    setTimeout(() => articleTitle.focus(), 100);

    // --- SOURCES LOGIC ---
    function createSourceCard(source, isVerified = false) {
        const sourceCard = document.createElement('div');
        sourceCard.className = 'source-card';
        const iconMap = { 'article': 'article', 'book': 'book', 'globe': 'globe' };

        const verifiedBadge = isVerified ?
            `<span style="display: inline-flex; align-items: center; gap: 4px; background-color: #eaf3ff; color: #36c; font-size: 11px; font-weight: 500; padding: 2px 6px; border-radius: 2px; margin-left: 8px; vertical-align: middle;">
                <img src="node_modules/@wikimedia/codex-icons/dist/images/check.svg" alt="" width="10" height="10"> Verified
             </span>` : '';

        sourceCard.innerHTML = `
            <div class="source-icon"><img src="node_modules/@wikimedia/codex-icons/dist/images/${iconMap[source.icon] || 'link'}.svg" alt="" width="20" height="20"></div>
            <div class="source-content">
                <div class="source-title">${source.title}${verifiedBadge}</div>
                <div class="source-meta">
                    <span class="source-type">${source.type}</span>
                    ${source.publisher ? `<span class="source-publisher"> · ${source.publisher}${source.year ? ` · ${source.year}` : ''}</span>` : ''}
                </div>
                <div class="source-actions">
                    <a href="${source.url}" target="_blank" class="source-action-link">Visit source <img src="node_modules/@wikimedia/codex-icons/dist/images/linkExternal.svg" alt="" width="12" height="12"></a>
                    <button class="source-action-btn"><img src="node_modules/@wikimedia/codex-icons/dist/images/add.svg" alt="" width="16" height="16"> Add source</button>
                </div>
            </div>
        `;
        sourceCard.querySelector('.source-action-btn').addEventListener('click', () => citationDialog.style.display = 'none');
        return sourceCard;
    }

    function openCitationDialog() {
        const wikidataSources = mockWikidataSources['Siberian Tiger'] || [];
        citationSourcesList.innerHTML = '';

        if (userSources.length > 0) {
            citationSourcesList.innerHTML += '<div class="sources-section-header">Sources you added</div><p class="sources-section-description">At the time of article creation, these sources were added.</p>';
            const userSourcesContainer = document.createElement('div');
            userSourcesContainer.className = 'citation-sources-group';
            userSources.forEach(source => userSourcesContainer.appendChild(createSourceCard(source)));
            citationSourcesList.appendChild(userSourcesContainer);
            citationSourcesList.innerHTML += `<div class="source-card add-own-source-card"><div class="source-icon"><img src="node_modules/@wikimedia/codex-icons/dist/images/add.svg" alt="" width="20" height="20"></div><div class="source-content"><div class="source-title">Add more sources</div></div></div><div class="sources-section-separator"></div>`;
        }

        citationSourcesList.innerHTML += '<div class="sources-section-header">Community Verified Sources</div><p class="sources-section-description">Reliable sources verified by the Wikipedia community. Choose one to support your text.</p>';
        const wikidataSourcesContainer = document.createElement('div');
        wikidataSourcesContainer.className = 'citation-sources-group';
        wikidataSources.forEach(source => wikidataSourcesContainer.appendChild(createSourceCard(source, true)));
        citationSourcesList.appendChild(wikidataSourcesContainer);

        if (userSources.length === 0) {
            citationSourcesList.innerHTML += `<div class="source-card add-own-source-card"><div class="source-icon"><img src="node_modules/@wikimedia/codex-icons/dist/images/add.svg" alt="" width="20" height="20"></div><div class="source-content"><div class="source-title">Add your own source...</div></div></div>`;
        }

        if (document.activeElement) document.activeElement.blur();
        citationDialog.style.display = 'flex';
    }

    citationDialogCloseBtn.addEventListener('click', () => citationDialog.style.display = 'none');
    citationDialog.addEventListener('click', (e) => { if (e.target === citationDialog) citationDialog.style.display = 'none'; });

    const addAnotherSourceBtn = document.getElementById('addAnotherSourceBtn');
    addAnotherSourceBtn.addEventListener('click', function () {
        const newRow = document.createElement('div');
        newRow.className = 'source-input-row';
        newRow.innerHTML = `
            <div class="cdx-text-input">
                <input class="cdx-text-input__input" type="url" placeholder="Paste a URL here..." />
                <div class="verification-status" style="display: none;"></div>
            </div>`;
        sourcesInputContainer.insertBefore(newRow, addAnotherSourceBtn);
        const newInput = newRow.querySelector('.cdx-text-input__input');
        attachVerificationListeners(newInput);
        newInput.focus();
    });

    // --- FAKE VERIFICATION LOGIC ---
    function attachVerificationListeners(input) {
        const container = input.closest('.cdx-text-input');
        const statusDiv = container.querySelector('.verification-status');
        if (!statusDiv) return;

        let debounceTimer;

        input.addEventListener('input', function () {
            const url = this.value.trim().toLowerCase();

            // Reset status to pending on input and update button
            this.dataset.verificationStatus = 'pending';
            updateStartWritingButtonState();

            // Clear previous timer
            clearTimeout(debounceTimer);

            if (url && url.length > 3 && url.includes('.')) {
                // Show checking state immediately or after short delay?
                // User asked for "self-run check... maybe a little bit of spinner animation"

                debounceTimer = setTimeout(() => {
                    // Show spinner
                    statusDiv.style.display = 'flex';
                    statusDiv.innerHTML = '<div class="verification-spinner"></div><span class="verification-text">Checking source...</span>';

                    // Fake network delay
                    setTimeout(() => {
                        const urlLower = url.toLowerCase();

                        if (urlLower.includes('linkedin.com') || urlLower.includes('facebook.com')) {
                            // 🔴 RED STATE: The Interceptor
                            input.classList.add('input-error');
                            input.dataset.verificationStatus = 'invalid'; // Mark as invalid
                            statusDiv.innerHTML = `
                                <div class="verification-badge badge-error">
                                    <img src="node_modules/@wikimedia/codex-icons/dist/images/alert.svg" alt="" width="12" height="12">
                                    Non-Independent Source
                                </div>
                                <div class="interceptor-tooltip">
                                    Social media profiles cannot be used to prove notability. Try finding a news article instead.
                                </div>`;
                        }
                        else if (urlLower.includes('bbc.com') || urlLower.includes('nytimes.com') || urlLower.includes('nature.com')) {
                            // 🟢 GREEN STATE: Good source - no message needed
                            input.classList.remove('input-error');
                            input.dataset.verificationStatus = 'valid'; // Mark as valid
                            statusDiv.style.display = 'none';
                            statusDiv.innerHTML = '';
                        }
                        else {
                            // Unknown source - gentle note with link to guidelines
                            input.classList.remove('input-error');
                            input.dataset.verificationStatus = 'valid'; // Mark as valid (unknowns are allowed to proceed)
                            statusDiv.innerHTML = `
                                <div class="verification-badge badge-unknown">
                                    <span class="cdx-icon cdx-icon--small">
                                        <img src="node_modules/@wikimedia/codex-icons/dist/images/reference.svg" alt="" width="16" height="16">
                                    </span>
                                    <a href="#" class="guidelines-link">Check it meets the guidelines</a>
                                </div>`;
                            // Attach click handler to open Good Sources modal
                            const guidelinesLink = statusDiv.querySelector('.guidelines-link');
                            if (guidelinesLink) {
                                guidelinesLink.addEventListener('click', (e) => {
                                    e.preventDefault();
                                    const goodSourceModal = document.getElementById('goodSourceModal');
                                    if (goodSourceModal) goodSourceModal.style.display = 'flex';
                                });
                            }
                        }
                        // Update button state after verification is complete
                        updateStartWritingButtonState();
                    }, 1500);
                }, 600); // 600ms debounce before starting check
            } else {
                statusDiv.style.display = 'none';
                input.classList.remove('input-error');
                input.dataset.verificationStatus = 'pending'; // Too short/invalid format
                updateStartWritingButtonState();
            }
        });

        // Auto-format URL on blur
        input.addEventListener('blur', function () {
            let val = this.value.trim();
            if (val && !val.startsWith('http://') && !val.startsWith('https://')) {
                this.value = 'https://' + val;
            }
        });
    }

    // Attach to existing inputs
    document.querySelectorAll('.cdx-text-input__input').forEach(attachVerificationListeners);

    // --- START WRITING BUTTON STATE MANAGEMENT ---
    const startWritingBtn = document.getElementById('startWritingBtn');

    function updateStartWritingButtonState() {
        const sourceInputs = sourcesInputContainer.querySelectorAll('.cdx-text-input__input');
        let hasValidSource = false;

        sourceInputs.forEach(input => {
            // Only enable if verification has completed and status is valid
            if (input.dataset.verificationStatus === 'valid') {
                hasValidSource = true;
            }
        });

        startWritingBtn.disabled = !hasValidSource;
    }

    // Listen for input changes on all source fields
    // sourcesInputContainer.addEventListener('input', updateStartWritingButtonState); // Removed global listener, handled in attachVerificationListeners

    document.getElementById('startWritingBtn').addEventListener('click', function () {
        captureUserSources();
        showScreen(3);
        setTimeout(() => editorTextarea.focus(), 100);
    });

    skipSourcesBtn.addEventListener('click', function () {
        showScreen(3);
        setTimeout(() => editorTextarea.focus(), 100);
    });

    function captureUserSources() {
        const sourceInputs = sourcesInputContainer.querySelectorAll('.cdx-text-input__input');
        sourceInputs.forEach(input => {
            const url = input.value.trim();
            if (url) {
                userSources.push({ title: url, type: 'Website', url: url, icon: 'globe' });
            }
        });
    }
    // --- GOOD SOURCES MODAL LOGIC ---
    const goodSourceTip = document.getElementById('goodSourceTip');
    const goodSourceModal = document.getElementById('goodSourceModal');
    const goodSourceBackBtn = document.getElementById('goodSourceBackBtn');
    const goodSourceGotItBtn = document.getElementById('goodSourceGotItBtn');

    if (goodSourceTip) {
        goodSourceTip.addEventListener('click', () => {
            goodSourceModal.style.display = 'flex';
        });
    }

    if (goodSourceBackBtn) {
        goodSourceBackBtn.addEventListener('click', () => {
            goodSourceModal.style.display = 'none';
        });
    }

    if (goodSourceGotItBtn) {
        goodSourceGotItBtn.addEventListener('click', () => {
            goodSourceModal.style.display = 'none';
        });
    }

    // Toggle Good Source Cards
    const goodSourceCards = document.querySelectorAll('.good-source-card');
    goodSourceCards.forEach(card => {
        const header = card.querySelector('.good-source-card-header');
        if (header) {
            header.addEventListener('click', () => {
                // Toggle current card
                card.classList.toggle('collapsed');
            });
        }
    });
});