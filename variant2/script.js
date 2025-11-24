// ABOUTME: Main JavaScript file for article creation functionality
// ABOUTME: Handles user interactions, auto-resize textarea, topic matching, and navigation

document.addEventListener('DOMContentLoaded', function() {
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
    const sectionAddSourceBtn = document.getElementById('sectionAddSourceBtn');

    let searchTimeout;
    let currentArticleTitle = '';
    let currentCategory = null;
    const addedSections = new Set(); // Track which sections are added to editor
    let currentEditingSection = 'Lead/Introduction'; // Track which section is being edited
    let activeSection = null; // Track which section has focus
    const insertedTemplates = new Map(); // Track which templates have been inserted per section
    const insertedFacts = new Map(); // Track which facts have been inserted per section
    const userSources = []; // Store user-added sources
    let citationCounter = 0; // Track citation numbers globally
    const wikidataCitations = []; // Store Wikidata citations

    // NLP autocomplete variables
    let nlpSuggestions = {};
    let currentSuggestion = '';
    let suggestionOverlay = null;

    // Define section order for "Next section" functionality
    const sectionOrder = ['Lead section', 'Characteristics', 'Distribution and habitat', 'Ecology and behaviour'];

    // Section placeholder mapping
    const sectionPlaceholders = {
        'Lead section': 'Begin writing about Siberian tiger, or type "/" for article outline',
        'Characteristics': 'Describe the physical traits and appearance of the Siberian tiger...',
        'Distribution and habitat': 'Explain where the Siberian tiger lives and its environment...',
        'Ecology and behaviour': 'Describe the diet, activity and social behaviour of the Siberian tiger...'
    };

    // Section-specific suggested paragraphs
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

    // Section-specific verified facts
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

    // Mock Wikidata verified sources for prototype
    const mockWikidataSources = {
        'Siberian Tiger': [
            {
                title: 'IUCN Red List entry - Panthera tigris altaica',
                type: 'Red List entry',
                publisher: 'IUCN',
                year: '2010',
                icon: 'article',
                url: 'https://www.iucnredlist.org/species/15956/5333650'
            },
            {
                title: 'Mammal Species of the World, 3rd ed.',
                type: 'Reference book',
                publisher: 'Wilson & Reeder',
                year: '2005',
                icon: 'book',
                url: 'https://www.departments.bucknell.edu/biology/resources/msw3/'
            },
            {
                title: 'Encyclopedia of Life - Panthera tigris tigris',
                type: 'Online database',
                publisher: 'eol.org',
                year: '',
                icon: 'globe',
                url: 'https://eol.org/pages/328606'
            }
        ]
    };

    // Topic data with locally stored thumbnail images from Wikimedia Commons
    const mockTopics = {
        'siberian tiger': [
            {
                title: 'Siberian tiger',
                description: 'subspecies of tiger',
                thumbnail: 'assets/images/siberian-tiger-1-thumb.jpg'
            },
            {
                title: 'Siberian tiger',
                description: 'Sculpture by Kurt Bauer in Hamburg',
                thumbnail: 'assets/images/siberian-tiger-2-thumb.jpg'
            },
            {
                title: 'Siberian Tiger Park',
                description: 'zoological park in Harbin, China',
                thumbnail: 'assets/images/siberian-tiger-3-thumb.jpg'
            },
            {
                title: 'Siberian Tiger Re-population Project',
                description: 'reestablishment of Siberian tiger populations',
                thumbnail: 'assets/images/siberian-tiger-4-thumb.jpg'
            }
        ]
    };

    // Category hierarchy for type selection
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
        ]
    };

    // Navigation functions
    function showScreen(screenNum) {
        if (screenNum === 1) {
            screen1.style.display = 'block';
            screen2.style.display = 'none';
            screen25.style.display = 'none';
            screen3.style.display = 'none';
            headerTitle.style.display = 'block';
            headerDivider.style.display = 'none';
            headerToolbar.style.display = 'none';
            nextBtn.style.display = 'block';
            nextBtn.classList.remove('btn-progressive');
        } else if (screenNum === 2) {
            screen1.style.display = 'none';
            screen2.style.display = 'block';
            screen25.style.display = 'none';
            screen3.style.display = 'none';
            headerTitle.style.display = 'block';
            headerDivider.style.display = 'none';
            headerToolbar.style.display = 'none';
            nextBtn.style.display = 'block';
            nextBtn.classList.remove('btn-progressive');
        } else if (screenNum === 2.5) {
            screen1.style.display = 'none';
            screen2.style.display = 'none';
            screen25.style.display = 'block';
            screen3.style.display = 'none';
            headerTitle.style.display = 'block';
            headerTitle.textContent = 'Add sources';
            headerDivider.style.display = 'none';
            headerToolbar.style.display = 'none';
            nextBtn.style.display = 'none'; // Hide next button on Add sources screen

            // Update the main title with article name
            const addSourcesTitle = document.getElementById('addSourcesTitle');
            if (currentArticleTitle) {
                addSourcesTitle.textContent = `Add key sources for "${currentArticleTitle}"`;
            } else {
                addSourcesTitle.textContent = 'Add key sources';
            }
        } else if (screenNum === 3) {
            screen1.style.display = 'none';
            screen2.style.display = 'none';
            screen25.style.display = 'none';
            screen3.style.display = 'block';
            headerTitle.style.display = 'none';
            headerDivider.style.display = 'block';
            headerToolbar.style.display = 'flex';
            nextBtn.style.display = 'block';
            nextBtn.classList.add('btn-progressive');
        }
    }

    // Render categories
    function renderCategories(categoryKey) {
        categoryList.innerHTML = '';
        const categoriesToShow = categories[categoryKey] || categories.root;

        categoriesToShow.forEach(category => {
            const li = document.createElement('li');
            li.className = 'category-item';

            const nameSpan = document.createElement('span');
            nameSpan.className = 'category-name';
            nameSpan.textContent = category.name;

            const chevron = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            chevron.setAttribute('class', 'category-chevron');
            chevron.setAttribute('width', '20');
            chevron.setAttribute('height', '20');
            chevron.setAttribute('viewBox', '0 0 20 20');

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', 'M7 1 5.6 2.5 13 10l-7.4 7.5L7 19l9-9z');

            chevron.appendChild(path);
            li.appendChild(nameSpan);
            li.appendChild(chevron);

            li.addEventListener('click', function() {
                handleCategoryClick(category);
            });

            categoryList.appendChild(li);
        });
    }

    // Handle category selection
    function handleCategoryClick(category) {
        currentCategory = category.id;

        if (categories[category.id]) {
            // Has subcategories - show drill-down
            typeSelectionTitle.textContent = `What kind of ${category.name.toLowerCase()}?`;
            const description = document.querySelector('.type-selection-description');
            description.textContent = `You've selected '${category.name.toLowerCase()}'. Now choose a more specific category.`;
            renderCategories(category.id);
        } else {
            // Leaf category - proceed to add sources screen
            console.log('Selected final category:', category.name);
            showScreen(2.5);
        }
    }

    // Auto-resize textarea as user types
    function autoResize() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    }

    // Show topic matching results
    function showTopicMatching(query) {
        const normalizedQuery = query.toLowerCase().trim();
        const topics = mockTopics[normalizedQuery] || [];

        if (topics.length > 0) {
            topicList.innerHTML = '';
            topics.forEach(topic => {
                const li = document.createElement('li');
                li.className = 'topic-item';

                // Create thumbnail element
                let thumbnailEl;
                if (topic.thumbnail) {
                    thumbnailEl = document.createElement('img');
                    thumbnailEl.src = topic.thumbnail;
                    thumbnailEl.alt = topic.title;
                    thumbnailEl.className = 'topic-thumbnail';

                    // Add error handler to show placeholder if image fails to load
                    thumbnailEl.onerror = function() {
                        const placeholder = document.createElement('div');
                        placeholder.className = 'topic-thumbnail';
                        this.replaceWith(placeholder);
                    };
                } else {
                    thumbnailEl = document.createElement('div');
                    thumbnailEl.className = 'topic-thumbnail';
                }

                // Create content container
                const contentDiv = document.createElement('div');
                contentDiv.className = 'topic-content';

                const titleDiv = document.createElement('div');
                titleDiv.className = 'topic-title';
                titleDiv.textContent = topic.title;

                const descDiv = document.createElement('div');
                descDiv.className = 'topic-description';
                descDiv.textContent = topic.description;

                contentDiv.appendChild(titleDiv);
                contentDiv.appendChild(descDiv);

                li.appendChild(thumbnailEl);
                li.appendChild(contentDiv);

                li.addEventListener('click', function() {
                    console.log('Selected topic:', topic.title);
                    currentArticleTitle = topic.title;
                    showScreen(2.5);
                });

                topicList.appendChild(li);
            });

            topicMatching.style.display = 'block';
        } else {
            topicMatching.style.display = 'none';
        }
    }

    // Handle input changes with debounce
    articleTitle.addEventListener('input', function() {
        autoResize.call(this);

        clearTimeout(searchTimeout);
        const query = this.value.trim();

        if (query.length > 2) {
            searchTimeout = setTimeout(() => {
                showTopicMatching(query);
            }, 500);
        } else {
            topicMatching.style.display = 'none';
        }
    });

    // Close button handler (also works as back button on screen 2 and 3)
    closeBtn.addEventListener('click', function() {
        if (screen3.style.display === 'block') {
            // Go back to screen 2 if we came from there, otherwise screen 1
            if (currentCategory) {
                showScreen(2);
            } else {
                showScreen(1);
            }
        } else if (screen2.style.display === 'block') {
            // Go back to screen 1
            showScreen(1);
        } else {
            // Navigate back to landing page (experience selector)
            window.location.replace('../index.html');
        }
    });

    // Next button handler
    nextBtn.addEventListener('click', function() {
        const title = articleTitle.value.trim();
        if (title) {
            console.log('Article title:', title);
            alert('Next screen coming soon! Title: ' + title);
        } else {
            alert('Please enter an article title');
        }
    });

    // Topic not listed button handler
    topicNotListedBtn.addEventListener('click', function() {
        console.log('User clicked: topic not listed');
        currentArticleTitle = articleTitle.value.trim();
        typeSelectionTitle.textContent = `What is "${currentArticleTitle}" about?`;
        renderCategories('root');
        showScreen(2);
    });

    // Type search functionality (basic filtering)
    typeSearchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        const items = categoryList.querySelectorAll('.category-item');

        items.forEach(item => {
            const name = item.querySelector('.category-name').textContent.toLowerCase();
            if (name.includes(query)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    });

    // Panel close button handler
    panelCloseBtn.addEventListener('click', function() {
        gettingStartedPanel.style.display = 'none';
    });

    // Function to set active section
    function setActiveSection(sectionBlock) {
        // Remove active class from all sections
        const allSections = document.querySelectorAll('.section-block');
        allSections.forEach(section => section.classList.remove('active'));

        // Add active class to current section
        if (sectionBlock) {
            sectionBlock.classList.add('active');
            activeSection = sectionBlock.dataset.sectionName;
            updateNextSectionButton();
        }
    }

    // Function to update "Next section" button
    function updateNextSectionButton() {
        const upNextBtn = document.querySelector('.up-next-btn');
        const upNextTitle = document.querySelector('.up-next-title');

        if (!upNextBtn || !upNextTitle) return;

        // Find the next section that hasn't been added
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

    // Function to insert suggested content into the editor
    function handleInsertSuggestion(suggestionTitle, sectionName) {
        // Find the active section's textarea
        let targetTextarea;
        let targetContainer;

        if (sectionName === 'Lead section') {
            // For lead section, use the main editor textarea
            targetTextarea = editorTextarea;
            targetContainer = document.querySelector('#leadSectionBlock .section-content-area');
        } else {
            // For other sections, find the section block's textarea
            const sectionBlocks = document.querySelectorAll('.section-block');
            sectionBlocks.forEach(block => {
                if (block.dataset.sectionName === sectionName) {
                    targetTextarea = block.querySelector('.section-textarea');
                    targetContainer = block.querySelector('.section-content-area');
                }
            });
        }

        if (!targetTextarea) {
            console.error('Could not find textarea for section:', sectionName);
            return;
        }

        // Get template content based on suggestion title
        const templateContent = getTemplateContent(suggestionTitle, sectionName);

        // Check if textarea is contenteditable or regular textarea
        const isContentEditable = targetTextarea.contentEditable === 'true';

        if (isContentEditable) {
            // For contenteditable, insert HTML content
            const currentContent = targetTextarea.innerHTML;
            const prefix = currentContent && currentContent !== '' ? '<br><br>' : '';
            targetTextarea.innerHTML = currentContent + prefix + templateContent;

            // Focus at the end
            targetTextarea.focus();
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(targetTextarea);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
        } else {
            // For regular textarea, strip HTML and insert plain text
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = templateContent;
            const plainText = tempDiv.textContent || tempDiv.innerText;

            const cursorPos = targetTextarea.selectionStart;
            const textBefore = targetTextarea.value.substring(0, cursorPos);
            const textAfter = targetTextarea.value.substring(cursorPos);

            // Add newlines if needed
            const prefix = textBefore && !textBefore.endsWith('\n\n') ? '\n\n' : '';
            const suffix = textAfter && !textAfter.startsWith('\n') ? '\n' : '';

            targetTextarea.value = textBefore + prefix + plainText + suffix + textAfter;

            // Trigger auto-resize
            targetTextarea.style.height = 'auto';
            targetTextarea.style.height = targetTextarea.scrollHeight + 'px';

            // Focus the textarea and set cursor position
            targetTextarea.focus();
            const newCursorPos = (textBefore + prefix + plainText).length;
            targetTextarea.setSelectionRange(newCursorPos, newCursorPos);
        }

        // Add visual indicators for [Add source] markers
        addSourceMarkerHighlights(targetTextarea, targetContainer);

        // Track that this template has been inserted for this section
        if (!insertedTemplates.has(sectionName)) {
            insertedTemplates.set(sectionName, new Set());
        }
        insertedTemplates.get(sectionName).add(suggestionTitle);

        // Update the panel to show the template as added
        updateEditingPanelContent(sectionName);

        // Hide the editing panel after insertion
        editingSectionPanel.style.display = 'none';
    }

    // Function to add visual highlights and click handlers for [Add source] markers
    function addSourceMarkerHighlights(textarea, container) {
        // Mark textarea as having source markers
        textarea.dataset.hasSourceMarkers = 'true';
    }

    // Function to insert verified fact into the editor
    function handleInsertFact(fact, sectionName) {
        // Find the active section's textarea
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

        if (!targetTextarea) {
            console.error('Could not find textarea for section:', sectionName);
            return;
        }

        // Check if textarea is contenteditable
        const isContentEditable = targetTextarea.contentEditable === 'true';

        if (!isContentEditable) {
            console.error('Textarea must be contenteditable for fact insertion');
            return;
        }

        // Increment citation counter
        citationCounter++;

        // Store citation metadata for this Wikidata fact
        wikidataCitations.push({
            number: citationCounter,
            label: fact.label,
            value: fact.value,
            source: 'Wikidata'
        });

        // Format the fact as a proper sentence
        // Example: "The scientific name is panthera tigris altaica"
        const factSentence = `The ${fact.label.toLowerCase()} is ${fact.value}`;

        // Create the HTML content with superscript citation
        const factHTML = `<br>${factSentence}<sup class="citation-superscript">[${citationCounter}]</sup>`;

        // Get current content
        const currentContent = targetTextarea.innerHTML;

        // Insert at the end (always new line)
        targetTextarea.innerHTML = currentContent + factHTML;

        // Focus the textarea
        targetTextarea.focus();

        // Position cursor at the end (after the inserted fact)
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(targetTextarea);
        range.collapse(false); // Collapse to end
        sel.removeAllRanges();
        sel.addRange(range);

        // Track that this fact has been inserted for this section
        if (!insertedFacts.has(sectionName)) {
            insertedFacts.set(sectionName, new Set());
        }
        const factKey = `${fact.label}:${fact.value}`;
        insertedFacts.get(sectionName).add(factKey);

        // Update the panel to show the fact as added
        updateEditingPanelContent(sectionName);

        // Don't hide panel for facts (user might want to add multiple facts)
    }

    // Function to get template content based on suggestion title
    function getTemplateContent(suggestionTitle, sectionName) {
        // Template content mapping with proper [Add source] markers
        // Based on the UI mockup and tiger_templates.json structure
        const templates = {
            'Short overview': 'The <span class="placeholder">animal name</span> is a <span class="placeholder">type of animal</span> native to <span class="placeholder">broad region</span> <span class="add-source-marker"><img src="node_modules/@wikimedia/codex-icons/dist/images/reference.svg" alt="" width="14" height="14">Add source</span>. It is known for <span class="placeholder">Key distinctive feature</span> <span class="add-source-marker"><img src="node_modules/@wikimedia/codex-icons/dist/images/reference.svg" alt="" width="14" height="14">Add source</span>.',
            'Taxonomy in brief': 'The <span class="placeholder">animal name</span> belongs to the <span class="placeholder">taxonomic family</span> family <span class="add-source-marker"><img src="node_modules/@wikimedia/codex-icons/dist/images/reference.svg" alt="" width="14" height="14">Add source</span>. It was first described by <span class="placeholder">scientist name</span> in <span class="placeholder">year</span> <span class="add-source-marker"><img src="node_modules/@wikimedia/codex-icons/dist/images/reference.svg" alt="" width="14" height="14">Add source</span>.',
            'Physical description': 'The <span class="placeholder">animal name</span> has <span class="placeholder">describe physical appearance</span> <span class="add-source-marker"><img src="node_modules/@wikimedia/codex-icons/dist/images/reference.svg" alt="" width="14" height="14">Add source</span>. <span class="placeholder">Add details about coloration, body structure, notable features</span>.',
            'Size and weight': 'Adult <span class="placeholder">animal name</span> typically measure <span class="placeholder">length range</span> in length and weigh <span class="placeholder">weight range</span> <span class="add-source-marker"><img src="node_modules/@wikimedia/codex-icons/dist/images/reference.svg" alt="" width="14" height="14">Add source</span>. <span class="placeholder">Add information about sexual dimorphism if applicable</span>.',
            'Coat and coloration': 'The <span class="placeholder">animal name</span> has <span class="placeholder">describe coat type and color</span> <span class="add-source-marker"><img src="node_modules/@wikimedia/codex-icons/dist/images/reference.svg" alt="" width="14" height="14">Add source</span>. <span class="placeholder">Add details about seasonal variations, regional differences, or distinctive markings</span>.',
            'Geographic range': 'The <span class="placeholder">animal name</span> is found in <span class="placeholder">list countries/regions</span> <span class="add-source-marker"><img src="node_modules/@wikimedia/codex-icons/dist/images/reference.svg" alt="" width="14" height="14">Add source</span>. <span class="placeholder">Add details about historical vs current range</span>.',
            'Habitat preferences': 'The <span class="placeholder">animal name</span> inhabits <span class="placeholder">describe habitat types</span> <span class="add-source-marker"><img src="node_modules/@wikimedia/codex-icons/dist/images/reference.svg" alt="" width="14" height="14">Add source</span>. <span class="placeholder">Add details about elevation range, vegetation types, climate preferences</span>.',
            'Population estimates': 'Current population estimates suggest <span class="placeholder">number</span> individuals in the wild <span class="add-source-marker"><img src="node_modules/@wikimedia/codex-icons/dist/images/reference.svg" alt="" width="14" height="14">Add source</span>. <span class="placeholder">Add information about population trends and conservation status</span>.',
            'Diet and hunting': 'The <span class="placeholder">animal name</span> primarily feeds on <span class="placeholder">list prey species</span> <span class="add-source-marker"><img src="node_modules/@wikimedia/codex-icons/dist/images/reference.svg" alt="" width="14" height="14">Add source</span>. <span class="placeholder">Add details about hunting strategies, feeding behavior</span>.',
            'Social structure': 'The <span class="placeholder">animal name</span> is <span class="placeholder">solitary/social</span> <span class="add-source-marker"><img src="node_modules/@wikimedia/codex-icons/dist/images/reference.svg" alt="" width="14" height="14">Add source</span>. <span class="placeholder">Add details about territorial behavior, group size, social hierarchy</span>.',
            'Reproduction': 'The <span class="placeholder">animal name</span> breeds <span class="placeholder">breeding season/frequency</span> <span class="add-source-marker"><img src="node_modules/@wikimedia/codex-icons/dist/images/reference.svg" alt="" width="14" height="14">Add source</span>. <span class="placeholder">Add details about gestation period, litter size, parental care</span>.'
        };

        return templates[suggestionTitle] || `<span class="placeholder">[Content for ${suggestionTitle}]</span>`;
    }

    // Function to update editing panel content based on section
    function updateEditingPanelContent(sectionName) {
        // Update section title
        const editingSectionTitle = document.querySelector('.editing-section-title');
        const displayName = sectionName === 'Lead section' ? 'Lead/Introduction' : sectionName;
        editingSectionTitle.textContent = displayName;
        currentEditingSection = displayName;

        // Update suggested paragraphs
        const suggestedSection = document.querySelector('.suggested-section');
        const suggestions = sectionSuggestions[sectionName] || sectionSuggestions['Lead section'];

        // Clear existing suggestions (keep the heading)
        const existingSuggestions = suggestedSection.querySelectorAll('.suggestion-card');
        existingSuggestions.forEach(card => card.remove());

        // Add new suggestions
        suggestions.forEach(suggestion => {
            const card = document.createElement('div');
            card.className = 'suggestion-card';

            // Check if this template has already been inserted for this section
            const isInserted = insertedTemplates.has(sectionName) &&
                              insertedTemplates.get(sectionName).has(suggestion.title);

            if (isInserted) {
                card.classList.add('suggestion-added');
            }

            card.innerHTML = `
                <button class="add-btn-circle" aria-label="${isInserted ? 'Already added' : 'Add paragraph'}" ${isInserted ? 'disabled' : ''}>
                    <img src="node_modules/@wikimedia/codex-icons/dist/images/${isInserted ? 'check.svg' : 'add.svg'}" alt="" width="16" height="16">
                </button>
                <div class="suggestion-content">
                    <div class="suggestion-title">${suggestion.title}</div>
                    <div class="suggestion-description">${suggestion.description}</div>
                </div>
            `;

            // Add click handler to insert content into editor (only if not already inserted)
            if (!isInserted) {
                const addBtn = card.querySelector('.add-btn-circle');
                addBtn.addEventListener('click', function() {
                    handleInsertSuggestion(suggestion.title, sectionName);
                });
            }

            suggestedSection.appendChild(card);
        });

        // Update verified facts
        const verifiedFactsSection = document.querySelector('.verified-facts-section');
        const facts = sectionFacts[sectionName] || sectionFacts['Lead section'];

        // Clear existing facts
        const existingFacts = verifiedFactsSection.querySelectorAll('.fact-item');
        existingFacts.forEach(fact => fact.remove());

        // Add new facts
        facts.forEach(fact => {
            const factItem = document.createElement('div');
            factItem.className = 'fact-item';

            // Check if this fact has already been inserted for this section
            const factKey = `${fact.label}:${fact.value}`;
            const isInserted = insertedFacts.has(sectionName) &&
                              insertedFacts.get(sectionName).has(factKey);

            if (isInserted) {
                factItem.classList.add('fact-added');
            }

            factItem.innerHTML = `
                <div class="fact-content">
                    <div class="fact-label">${fact.label}</div>
                    <div class="fact-value">${fact.value}</div>
                </div>
                <button class="add-btn-circle" aria-label="${isInserted ? 'Already added' : 'Add fact'}" ${isInserted ? 'disabled' : ''}>
                    <img src="node_modules/@wikimedia/codex-icons/dist/images/${isInserted ? 'check.svg' : 'add.svg'}" alt="" width="16" height="16">
                </button>
            `;

            // Add click handler to insert fact into editor (only if not already inserted)
            if (!isInserted) {
                const addBtn = factItem.querySelector('.add-btn-circle');
                addBtn.addEventListener('click', function() {
                    handleInsertFact(fact, sectionName);
                });
            }

            verifiedFactsSection.appendChild(factItem);
        });
    }

    // Get suggested contents button handler - toggle the panel
    getContentsBtn.addEventListener('click', function() {
        if (editingSectionPanel.style.display === 'block') {
            // If panel is already visible, hide it
            editingSectionPanel.style.display = 'none';
        } else {
            // Update content for Lead section
            updateEditingPanelContent('Lead section');
            // Show editing panel and hide getting started panel
            editingSectionPanel.style.display = 'block';
            gettingStartedPanel.style.display = 'none';
        }
    });

    // Section Add source button handler - opens citation dialog
    sectionAddSourceBtn.addEventListener('click', function() {
        openCitationDialog();
    });

    // Editing panel close button handler
    editingPanelCloseBtn.addEventListener('click', function() {
        editingSectionPanel.style.display = 'none';
        gettingStartedPanel.style.display = 'none';
    });

    // Editor textarea auto-resize and forward slash detection
    editorTextarea.addEventListener('input', function() {
        // Check if user typed forward slash
        const text = this.textContent || '';
        if (text === '/' || text.endsWith('\n/')) {
            editingSectionPanel.style.display = 'block';
            gettingStartedPanel.style.display = 'none';
        }
    });

    // Click on editor textarea - hide getting started panel
    editorTextarea.addEventListener('click', function() {
        if (gettingStartedPanel.style.display !== 'none') {
            gettingStartedPanel.style.display = 'none';
        }
    });

    // View full article outline button handler
    viewOutlineBtn.addEventListener('click', function() {
        // Hide editing section panel and show article outline panel
        editingSectionPanel.style.display = 'none';
        articleOutlinePanel.style.display = 'block';
    });

    // Article outline panel close button handler
    outlinePanelCloseBtn.addEventListener('click', function() {
        // Hide article outline panel and show editing section panel
        articleOutlinePanel.style.display = 'none';
        editingSectionPanel.style.display = 'block';
    });

    // Add custom section button handler
    addCustomSectionBtnTrigger.addEventListener('click', function() {
        customSectionDialog.style.display = 'flex';
        setTimeout(() => {
            customSectionInput.focus();
        }, 100);
    });

    // Close dialog handlers
    function closeCustomSectionDialog() {
        customSectionDialog.style.display = 'none';
        customSectionInput.value = '';
        customSectionDescription.value = '';
    }

    dialogCloseBtn.addEventListener('click', closeCustomSectionDialog);
    cancelCustomSectionBtn.addEventListener('click', closeCustomSectionDialog);

    // Close dialog when clicking on overlay
    customSectionDialog.addEventListener('click', function(e) {
        if (e.target.classList.contains('dialog-overlay')) {
            closeCustomSectionDialog();
        }
    });

    // Add custom section submit handler
    addCustomSectionBtn.addEventListener('click', function() {
        const sectionName = customSectionInput.value.trim();
        const sectionDesc = customSectionDescription.value.trim();

        if (sectionName) {
            // Create new section element
            const newSection = document.createElement('div');
            newSection.className = 'outline-section';

            const sectionContent = document.createElement('div');
            sectionContent.className = 'outline-section-content';

            const sectionTitle = document.createElement('h3');
            sectionTitle.className = 'outline-section-title';
            sectionTitle.textContent = sectionName;

            sectionContent.appendChild(sectionTitle);

            if (sectionDesc) {
                const sectionDescription = document.createElement('p');
                sectionDescription.className = 'outline-section-description';
                sectionDescription.textContent = sectionDesc;
                sectionContent.appendChild(sectionDescription);
            }

            const addBtn = document.createElement('button');
            addBtn.className = 'outline-add-btn';
            addBtn.textContent = 'Add';

            newSection.appendChild(sectionContent);
            newSection.appendChild(addBtn);

            // Insert before the "Add custom section" button
            outlineSections.insertBefore(newSection, addCustomSectionBtnTrigger);

            // Attach click handler to the new add button
            addBtn.addEventListener('click', function() {
                handleAddSectionClick(sectionName, sectionDesc);
                // Close the outline panel and show editing panel
                articleOutlinePanel.style.display = 'none';
                editingSectionPanel.style.display = 'block';
            });

            // Close dialog and reset
            closeCustomSectionDialog();
        }
    });

    // Enable/disable add button based on input
    customSectionInput.addEventListener('input', function() {
        if (this.value.trim()) {
            addCustomSectionBtn.disabled = false;
        } else {
            addCustomSectionBtn.disabled = true;
        }
    });

    // Function to create a section block in the editor
    function createSectionBlock(sectionName, sectionDescription) {
        const sectionBlock = document.createElement('div');
        sectionBlock.className = 'section-block';
        sectionBlock.dataset.sectionName = sectionName;

        // Header row with title and remove button
        const headerRow = document.createElement('div');
        headerRow.className = 'section-header-row';

        const heading = document.createElement('h2');
        heading.className = 'section-heading-text';
        heading.textContent = sectionName;

        const removeBtn = document.createElement('button');
        removeBtn.className = 'section-remove-btn';
        removeBtn.setAttribute('aria-label', 'Remove section');
        removeBtn.innerHTML = '<img src="node_modules/@wikimedia/codex-icons/dist/images/close.svg" alt="" width="20" height="20">';

        headerRow.appendChild(heading);
        headerRow.appendChild(removeBtn);

        // Content area
        const contentArea = document.createElement('div');
        contentArea.className = 'section-content-area';

        const textarea = document.createElement('div');
        textarea.className = 'section-textarea';
        textarea.contentEditable = 'true';
        textarea.dataset.placeholder = sectionPlaceholders[sectionName] || `Write about ${sectionName.toLowerCase()}...`;

        // Set active section on focus
        textarea.addEventListener('focus', function() {
            setActiveSection(sectionBlock);
        });

        contentArea.appendChild(textarea);

        // Get suggested contents button
        const getSuggestedBtn = document.createElement('button');
        getSuggestedBtn.className = 'section-get-contents-btn';
        getSuggestedBtn.textContent = 'Get suggested contents';

        // Get suggested contents handler for this section
        getSuggestedBtn.addEventListener('click', function() {
            updateEditingPanelContent(sectionName);
            editingSectionPanel.style.display = 'block';
            gettingStartedPanel.style.display = 'none';
        });

        // Assemble the section
        sectionBlock.appendChild(headerRow);
        sectionBlock.appendChild(contentArea);
        sectionBlock.appendChild(getSuggestedBtn);

        // Remove section handler
        removeBtn.addEventListener('click', function() {
            sectionBlock.remove();
            addedSections.delete(sectionName);
            updateOutlineSectionStatus(sectionName, false);
        });

        return sectionBlock;
    }

    // Function to update outline section status
    function updateOutlineSectionStatus(sectionName, isAdded) {
        const outlineSectionItems = articleOutlinePanel.querySelectorAll('.outline-section');
        outlineSectionItems.forEach(item => {
            const titleElement = item.querySelector('.outline-section-title');
            if (titleElement && titleElement.textContent === sectionName) {
                const addBtn = item.querySelector('.outline-add-btn');
                const addedBadge = item.querySelector('.outline-added-badge');

                if (isAdded) {
                    if (addBtn) {
                        addBtn.style.display = 'none';
                    }
                    if (!addedBadge) {
                        const badge = document.createElement('span');
                        badge.className = 'outline-added-badge';
                        badge.textContent = 'Added';
                        item.appendChild(badge);
                    }
                } else {
                    if (addBtn) {
                        addBtn.style.display = 'inline-flex';
                    }
                    if (addedBadge) {
                        addedBadge.remove();
                    }
                }
            }
        });
    }

    // Handle clicking "Add" buttons in the outline panel
    function handleAddSectionClick(sectionName, sectionDescription) {
        if (addedSections.has(sectionName)) {
            // Already added, don't add again
            return;
        }

        const sectionBlock = createSectionBlock(sectionName, sectionDescription);
        const articleSectionsContainer = document.getElementById('articleSections');

        // Append section at the end of the container
        articleSectionsContainer.appendChild(sectionBlock);

        // Mark as added
        addedSections.add(sectionName);
        updateOutlineSectionStatus(sectionName, true);
        updateNextSectionButton();

        // Focus on the new section's textarea
        setTimeout(() => {
            sectionBlock.querySelector('.section-textarea').focus();
        }, 100);
    }

    // "Next section" button handler
    const upNextBtn = document.querySelector('.up-next-btn');
    if (upNextBtn) {
        upNextBtn.addEventListener('click', function() {
            const upNextTitle = document.querySelector('.up-next-title');
            const nextSectionName = upNextTitle ? upNextTitle.textContent : null;

            if (nextSectionName && !addedSections.has(nextSectionName)) {
                // Find the section description from outline
                const outlineSectionItems = articleOutlinePanel.querySelectorAll('.outline-section');
                let sectionDescription = '';

                outlineSectionItems.forEach(item => {
                    const titleElement = item.querySelector('.outline-section-title');
                    if (titleElement && titleElement.textContent === nextSectionName) {
                        const descElement = item.querySelector('.outline-section-description');
                        sectionDescription = descElement ? descElement.textContent : '';
                    }
                });

                // Hide the editing section panel
                editingSectionPanel.style.display = 'none';

                // Add the section
                handleAddSectionClick(nextSectionName, sectionDescription);
            }
        });
    }

    // Add click handlers to all outline "Add" buttons
    function attachOutlineAddButtonHandlers() {
        const outlineSectionItems = articleOutlinePanel.querySelectorAll('.outline-section');
        outlineSectionItems.forEach(item => {
            const addBtn = item.querySelector('.outline-add-btn');
            if (addBtn) {
                addBtn.addEventListener('click', function() {
                    const titleElement = item.querySelector('.outline-section-title');
                    const descElement = item.querySelector('.outline-section-description');
                    const sectionName = titleElement ? titleElement.textContent : '';
                    const sectionDescription = descElement ? descElement.textContent : '';

                    if (sectionName) {
                        handleAddSectionClick(sectionName, sectionDescription);
                        // Close the outline panel and show editing panel
                        articleOutlinePanel.style.display = 'none';
                        editingSectionPanel.style.display = 'block';
                    }
                });
            }
        });
    }

    // Initialize outline button handlers
    attachOutlineAddButtonHandlers();

    // Contenteditable doesn't need auto-resize
    // Removed duplicate input listener

    // Add focus handler to lead section textarea
    editorTextarea.addEventListener('focus', function() {
        const leadSectionBlock = document.getElementById('leadSectionBlock');
        setActiveSection(leadSectionBlock);
    });

    // Mark lead section as added by default
    addedSections.add('Lead section');

    // Initialize with lead section as active
    const leadSectionBlock = document.getElementById('leadSectionBlock');
    if (leadSectionBlock) {
        setActiveSection(leadSectionBlock);
    }

    // Auto-focus the textarea on load
    setTimeout(() => {
        articleTitle.focus();
    }, 100);

    // Helper function to create source card
    function createSourceCard(source) {
        const sourceCard = document.createElement('div');
        sourceCard.className = 'source-card';

        const iconMap = {
            'article': 'article',
            'book': 'book',
            'globe': 'globe'
        };

        const iconName = iconMap[source.icon] || 'link';
        const yearDisplay = source.year ? ` · ${source.year}` : '';
        const publisher = source.publisher || '';

        sourceCard.innerHTML = `
            <div class="source-icon">
                <img src="node_modules/@wikimedia/codex-icons/dist/images/${iconName}.svg" alt="" width="20" height="20">
            </div>
            <div class="source-content">
                <div class="source-title">${source.title}</div>
                <div class="source-meta">
                    <span class="source-type">${source.type}</span>
                    ${publisher ? `<span class="source-publisher"> · ${publisher}${yearDisplay}</span>` : ''}
                </div>
                <div class="source-actions">
                    <a href="${source.url}" target="_blank" class="source-action-link">
                        Visit source
                        <img src="node_modules/@wikimedia/codex-icons/dist/images/linkExternal.svg" alt="" width="12" height="12">
                    </a>
                    <button class="source-action-btn">
                        <img src="node_modules/@wikimedia/codex-icons/dist/images/add.svg" alt="" width="16" height="16">
                        Add source
                    </button>
                </div>
            </div>
        `;

        // Add click handler for "Add source" button
        const addSourceBtn = sourceCard.querySelector('.source-action-btn');
        addSourceBtn.addEventListener('click', function() {
            citationDialog.style.display = 'none';
        });

        return sourceCard;
    }

    // Citation dialog functions
    function openCitationDialog() {
        const wikidataSources = mockWikidataSources['Siberian Tiger'] || [];

        // Clear existing sources
        citationSourcesList.innerHTML = '';

        // Add user sources section if any exist
        if (userSources.length > 0) {
            const userSourcesHeader = document.createElement('div');
            userSourcesHeader.className = 'sources-section-header';
            userSourcesHeader.textContent = 'Sources you added';
            citationSourcesList.appendChild(userSourcesHeader);

            const userSourcesDescription = document.createElement('p');
            userSourcesDescription.className = 'sources-section-description';
            userSourcesDescription.textContent = 'At the time of article creation, these sources were added.';
            citationSourcesList.appendChild(userSourcesDescription);

            const userSourcesContainer = document.createElement('div');
            userSourcesContainer.className = 'citation-sources-group';

            userSources.forEach(source => {
                const sourceCard = createSourceCard(source);
                userSourcesContainer.appendChild(sourceCard);
            });

            citationSourcesList.appendChild(userSourcesContainer);

            // Add "Add more sources" card after user sources
            const addMoreSourcesCard = document.createElement('div');
            addMoreSourcesCard.className = 'source-card add-own-source-card';
            addMoreSourcesCard.innerHTML = `
                <div class="source-icon">
                    <img src="node_modules/@wikimedia/codex-icons/dist/images/add.svg" alt="" width="20" height="20">
                </div>
                <div class="source-content">
                    <div class="source-title">Add more sources</div>
                </div>
            `;

            addMoreSourcesCard.addEventListener('click', function() {
                console.log('Add more sources clicked');
            });

            citationSourcesList.appendChild(addMoreSourcesCard);

            // Add separator between user sources and Wikidata sources
            const separator = document.createElement('div');
            separator.className = 'sources-section-separator';
            citationSourcesList.appendChild(separator);
        }

        // Add Wikidata sources section
        const wikidataSourcesHeader = document.createElement('div');
        wikidataSourcesHeader.className = 'sources-section-header';
        wikidataSourcesHeader.textContent = 'Sources from Wikidata';
        citationSourcesList.appendChild(wikidataSourcesHeader);

        const wikidataDescription = document.createElement('p');
        wikidataDescription.className = 'sources-section-description';
        wikidataDescription.textContent = 'These works are cited on Wikipedia. Choose one to support your text.';
        citationSourcesList.appendChild(wikidataDescription);

        const wikidataSourcesContainer = document.createElement('div');
        wikidataSourcesContainer.className = 'citation-sources-group';

        // Populate Wikidata source cards
        wikidataSources.forEach(source => {
            const sourceCard = createSourceCard(source);
            wikidataSourcesContainer.appendChild(sourceCard);
        });

        citationSourcesList.appendChild(wikidataSourcesContainer);

        // If no user sources, add "Add your own source" at the end
        if (userSources.length === 0) {
            const addOwnSourceCard = document.createElement('div');
            addOwnSourceCard.className = 'source-card add-own-source-card';
            addOwnSourceCard.innerHTML = `
                <div class="source-icon">
                    <img src="node_modules/@wikimedia/codex-icons/dist/images/add.svg" alt="" width="20" height="20">
                </div>
                <div class="source-content">
                    <div class="source-title">Add your own source...</div>
                </div>
            `;

            addOwnSourceCard.addEventListener('click', function() {
                console.log('Add your own source clicked');
            });

            citationSourcesList.appendChild(addOwnSourceCard);
        }

        // Blur any active contenteditable to remove cursor
        if (document.activeElement) {
            document.activeElement.blur();
        }

        // Show dialog
        citationDialog.style.display = 'flex';
    }

    // Citation dialog close handler
    citationDialogCloseBtn.addEventListener('click', function() {
        citationDialog.style.display = 'none';
    });

    // Close dialog when clicking on overlay
    citationDialog.addEventListener('click', function(e) {
        if (e.target === citationDialog) {
            citationDialog.style.display = 'none';
        }
    });

    // Removed old add own source button - now handled inline in the list

    // Make "Add source" markers in contenteditable clickable
    document.addEventListener('click', function(e) {
        if (e.target.closest('.add-source-marker')) {
            e.preventDefault();
            openCitationDialog();
        }
    });

    // Add Sources screen functionality
    // Handle "Add another source" button
    const addAnotherSourceBtn = document.getElementById('addAnotherSourceBtn');
    addAnotherSourceBtn.addEventListener('click', function() {
        const newRow = document.createElement('div');
        newRow.className = 'source-input-row';
        newRow.innerHTML = `
            <div class="cdx-text-input">
                <input class="cdx-text-input__input" type="url" placeholder="Paste a URL here..." />
            </div>
        `;
        sourcesInputContainer.appendChild(newRow);

        // Focus the new input
        newRow.querySelector('.cdx-text-input__input').focus();
    });

    // Handle start writing button
    const startWritingBtn = document.getElementById('startWritingBtn');
    startWritingBtn.addEventListener('click', function() {
        // Capture user-added sources from the input fields
        captureUserSources();
        showScreen(3);
        setTimeout(() => {
            editorTextarea.focus();
        }, 100);
    });

    // Handle skip sources button
    skipSourcesBtn.addEventListener('click', function() {
        showScreen(3);
        setTimeout(() => {
            editorTextarea.focus();
        }, 100);
    });

    // Function to capture sources from Screen 2.5
    function captureUserSources() {
        const sourceInputs = sourcesInputContainer.querySelectorAll('.cdx-text-input__input');
        sourceInputs.forEach(input => {
            const url = input.value.trim();
            if (url) {
                // Create a source object with URL
                userSources.push({
                    title: url,
                    type: 'Website',
                    url: url,
                    icon: 'globe'
                });
            }
        });
    }

    // Handle next button on add sources screen
    nextBtn.addEventListener('click', function() {
        if (screen25.style.display === 'block') {
            // Collect all source URLs
            const sourceInputs = sourcesInputContainer.querySelectorAll('.source-url-input');
            userSources.length = 0; // Clear existing

            sourceInputs.forEach(input => {
                const url = input.value.trim();
                if (url) {
                    userSources.push({
                        url: url,
                        title: extractTitleFromURL(url),
                        type: 'User-added source'
                    });
                }
            });

            showScreen(3);
            setTimeout(() => {
                editorTextarea.focus();
            }, 100);
        }
    });

    // Helper function to extract title from URL
    function extractTitleFromURL(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname + urlObj.pathname;
        } catch (e) {
            return url;
        }
    }
});
