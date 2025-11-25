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
    const insertedFacts = new Map(); // Track which facts have been inserted per section
    const userSources = []; // Store user-added sources
    let citationCounter = 0; // Track citation numbers globally
    const wikidataCitations = []; // Store Wikidata citations

    // NLP autocomplete variables
    let nlpSuggestions = {};
    let currentSuggestion = '';
    let suggestionOverlay = null;

    // Example paragraphs from similar articles (loaded from tiger_templates.json)
    let exampleParagraphs = {};

    // Smart suggestion tracking system
    const usedSuggestions = new Set(); // Track suggestions that have been accepted
    const triggerIndices = new Map(); // Track which suggestion index to use next for each trigger
    let lastAcceptedContent = ''; // Track the last accepted suggestion content

    // Load NLP suggestions and example paragraphs from tiger_templates.json
    fetch('tiger_templates.json')
        .then(response => response.json())
        .then(data => {
            if (data.nlp_suggestions) {
                nlpSuggestions = data.nlp_suggestions;
                console.log('NLP suggestions loaded:', nlpSuggestions);
            }
            if (data.example_paragraphs) {
                exampleParagraphs = data.example_paragraphs;
                console.log('Example paragraphs loaded:', exampleParagraphs);
            }
        })
        .catch(error => console.error('Error loading template data:', error));

    // Define section order for "Next section" functionality
    const sectionOrder = ['Lead section', 'Characteristics', 'Distribution and habitat', 'Ecology and behaviour'];

    // Section placeholder mapping
    const sectionPlaceholders = {
        'Lead section': 'Begin writing about Siberian tiger, or type "/" for article outline',
        'Characteristics': 'Describe the physical traits and appearance of the Siberian tiger...',
        'Distribution and habitat': 'Explain where the Siberian tiger lives and its environment...',
        'Ecology and behaviour': 'Describe the diet, activity and social behaviour of the Siberian tiger...'
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

    // ===== INLINE AUTOCOMPLETE FUNCTIONS =====

    // Function to get section key from section name
    function getSectionKey(sectionName) {
        const keyMap = {
            'Lead section': 'lead_section',
            'Characteristics': 'characteristics',
            'Distribution and habitat': 'distribution_habitat',
            'Ecology and behaviour': 'ecology_behaviour'
        };
        return keyMap[sectionName] || 'lead_section';
    }

    // Default suggestions for when user starts typing (used when editor is empty)
    const defaultSuggestions = {
        'lead_section': [
            ' Siberian tiger is a subspecies of tiger native to the Russian Far East.',
            ' Amur tiger, as it is also known, inhabits temperate forests.',
            ' species is classified as Endangered on the IUCN Red List.'
        ],
        'characteristics': [
            ' Siberian tiger has a reddish-rusty coat with narrow black stripes.',
            ' tiger is the largest living cat species by body mass.',
            ' subspecies is distinguished by its pale coat and thick fur.'
        ],
        'distribution_habitat': [
            ' Siberian tiger inhabits temperate forests in the Russian Far East.',
            ' habitat includes coniferous, deciduous, and mixed forests.',
            ' species is found primarily in the Primorsky region.'
        ],
        'ecology_behaviour': [
            ' Siberian tiger is a solitary and territorial animal.',
            ' diet consists primarily of large ungulates like deer and wild boar.',
            ' species is primarily crepuscular, active at dawn and dusk.'
        ]
    };

    // Track default suggestion indices per section
    const defaultSuggestionIndices = new Map();

    // Function to get the full content of the editor for a section
    function getEditorContent(sectionName) {
        let textarea;
        if (sectionName === 'Lead section') {
            textarea = editorTextarea;
        } else {
            const sectionBlocks = document.querySelectorAll('.section-block');
            sectionBlocks.forEach(block => {
                if (block.dataset.sectionName === sectionName) {
                    textarea = block.querySelector('.section-textarea');
                }
            });
        }
        return textarea ? (textarea.innerText || textarea.textContent || '') : '';
    }

    // Function to check if content is already written in the editor
    function isContentAlreadyWritten(suggestion, sectionName) {
        const editorContent = getEditorContent(sectionName).toLowerCase();
        if (!editorContent) return false;

        // Extract key phrases from the suggestion (words with 4+ characters)
        const keyPhrases = suggestion.toLowerCase().split(/\s+/).filter(word => word.length >= 4);
        
        // Check if significant portions of the suggestion are already in the editor
        let matchCount = 0;
        for (const phrase of keyPhrases) {
            if (editorContent.includes(phrase)) {
                matchCount++;
            }
        }
        
        // If more than 40% of key phrases are already present, consider it duplicate
        return keyPhrases.length > 0 && (matchCount / keyPhrases.length) > 0.4;
    }

    // Function to get the next available suggestion from an array
    function getNextSuggestion(triggerKey, suggestions, sectionName) {
        if (!Array.isArray(suggestions) || suggestions.length === 0) {
            return typeof suggestions === 'string' ? suggestions : null;
        }

        // Create a unique key for this trigger+section combination
        const uniqueKey = `${sectionName}:${triggerKey}`;
        
        // Get current index for this trigger
        let currentIndex = triggerIndices.get(uniqueKey) || 0;
        
        // Find the next available suggestion that hasn't been used and isn't already written
        let attempts = 0;
        while (attempts < suggestions.length) {
            const suggestion = suggestions[currentIndex % suggestions.length];
            const suggestionKey = `${sectionName}:${triggerKey}:${suggestion}`;
            
            // Check if this suggestion hasn't been used and isn't already in content
            if (!usedSuggestions.has(suggestionKey) && !isContentAlreadyWritten(suggestion, sectionName)) {
                return suggestion;
            }
            
            // Try next suggestion
            currentIndex++;
            attempts++;
        }
        
        // If all suggestions were used/written, reset and return the first one that isn't in content
        currentIndex = 0;
        for (let i = 0; i < suggestions.length; i++) {
            if (!isContentAlreadyWritten(suggestions[i], sectionName)) {
                triggerIndices.set(uniqueKey, i);
                return suggestions[i];
            }
        }
        
        // All suggestions are already in content - return null to hide ghost text
        return null;
    }

    // Function to mark a suggestion as used and advance to next
    function markSuggestionUsed(triggerKey, suggestion, sectionName) {
        const uniqueKey = `${sectionName}:${triggerKey}`;
        const suggestionKey = `${sectionName}:${triggerKey}:${suggestion}`;
        
        usedSuggestions.add(suggestionKey);
        lastAcceptedContent = suggestion;
        
        // Advance the index for this trigger
        const currentIndex = triggerIndices.get(uniqueKey) || 0;
        triggerIndices.set(uniqueKey, currentIndex + 1);
    }

    // Function to detect sentence position (start, middle, after period)
    function getSentencePosition(text) {
        if (!text || text.trim() === '') {
            return 'paragraph_start';
        }
        
        const trimmed = text.trimEnd();
        const lastChar = trimmed.slice(-1);
        
        // After punctuation that ends a sentence
        if (['.', '!', '?'].includes(lastChar)) {
            return 'after_period';
        }
        
        // Check if we're at the start of a new line/paragraph
        if (trimmed.endsWith('\n') || trimmed.endsWith('\n\n')) {
            return 'paragraph_start';
        }
        
        // Check if we're mid-sentence
        const lastSentence = trimmed.split(/[.!?]/).pop();
        if (lastSentence && lastSentence.trim().length > 0) {
            return 'mid_sentence';
        }
        
        return 'start';
    }

    // Store the current trigger key for marking as used when accepted
    let currentTriggerKey = null;

    // Function to find matching suggestion based on current text
    function findSuggestion(text, sectionName) {
        const sectionKey = getSectionKey(sectionName);
        const sectionData = nlpSuggestions[sectionKey];
        const triggers = sectionData?.triggers || {};

        // Trim trailing whitespace but preserve the text for matching
        const trimmedText = text.trimEnd();
        
        // If text is empty, don't show suggestion (wait for user to type)
        if (!trimmedText) {
            return null;
        }

        // Detect sentence position
        const position = getSentencePosition(trimmedText);

        // For after period, check if we have specific after_period suggestions
        if (position === 'after_period' && sectionData?.after_period) {
            const afterPeriodSuggestions = sectionData.after_period;
            const suggestion = getNextSuggestion('after_period', afterPeriodSuggestions, sectionName);
            if (suggestion) {
                currentTriggerKey = 'after_period';
                return suggestion;
            }
        }

        // Find the longest matching trigger (case-insensitive)
        let bestMatch = null;
        let bestMatchLength = 0;
        let bestTriggerKey = null;

        for (const [trigger, completions] of Object.entries(triggers)) {
            const lowerTrimmedText = trimmedText.toLowerCase();
            const lowerTrigger = trigger.toLowerCase();
            
            // Check if text ends with trigger (case-insensitive) - exact match
            if (lowerTrimmedText.endsWith(lowerTrigger) && trigger.length > bestMatchLength) {
                const suggestion = getNextSuggestion(trigger, completions, sectionName);
                if (suggestion) {
                    bestMatch = suggestion;
                    bestMatchLength = trigger.length;
                    bestTriggerKey = trigger;
                }
            }
        }

        if (bestMatch) {
            currentTriggerKey = bestTriggerKey;
            return bestMatch;
        }

        return null;
    }

    // Function to get default suggestion for empty editor
    function getDefaultSuggestion(sectionName) {
        const sectionKey = getSectionKey(sectionName);
        const defaults = defaultSuggestions[sectionKey];
        
        if (!defaults || defaults.length === 0) return null;
        
        // Get the current index for this section's defaults
        let index = defaultSuggestionIndices.get(sectionKey) || 0;
        
        // Find a suggestion that isn't already in the editor
        for (let i = 0; i < defaults.length; i++) {
            const suggestion = defaults[(index + i) % defaults.length];
            if (!isContentAlreadyWritten(suggestion, sectionName)) {
                currentTriggerKey = `default_${sectionKey}`;
                return suggestion;
            }
        }
        
        return null;
    }

    // Function to show ghost text suggestion
    function showGhostText(textarea, suggestion) {
        if (!suggestion || !textarea) return;

        // Remove existing overlay if any
        hideGhostText();

        // Create overlay element
        suggestionOverlay = document.createElement('span');
        suggestionOverlay.className = 'autocomplete-ghost-text';
        suggestionOverlay.textContent = suggestion;
        suggestionOverlay.contentEditable = false;

        // Insert after cursor position
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.collapse(false);
            range.insertNode(suggestionOverlay);

            // Move cursor back before the ghost text
            range.setStartBefore(suggestionOverlay);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        }

        currentSuggestion = suggestion;
    }

    // Function to hide ghost text
    function hideGhostText() {
        if (suggestionOverlay && suggestionOverlay.parentNode) {
            suggestionOverlay.parentNode.removeChild(suggestionOverlay);
        }
        suggestionOverlay = null;
        currentSuggestion = '';
    }

    // Function to accept ghost text suggestion
    function acceptSuggestion() {
        if (!currentSuggestion || !suggestionOverlay) return false;

        // Mark the suggestion as used before accepting
        if (currentTriggerKey) {
            markSuggestionUsed(currentTriggerKey, currentSuggestion, activeSection || 'Lead section');
        }

        // Replace ghost text with actual text
        const textNode = document.createTextNode(currentSuggestion);
        suggestionOverlay.parentNode.replaceChild(textNode, suggestionOverlay);

        // Move cursor to end of inserted text
        const selection = window.getSelection();
        const range = document.createRange();
        range.setStartAfter(textNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);

        hideGhostText();
        currentTriggerKey = null;
        return true;
    }

    // Function to handle autocomplete on input
    function handleAutocomplete(textarea, sectionName) {
        const text = textarea.innerText || textarea.textContent || '';
        
        // Remove any ghost text from the text we're analyzing
        const cleanText = text.replace(/[\u200B-\u200D\uFEFF]/g, '');
        
        // Get the text after the last period for trigger matching
        const sentences = cleanText.split(/[.!?]/);
        const lastSentence = sentences[sentences.length - 1] || '';
        
        // First try to find a trigger-based suggestion
        let suggestion = findSuggestion(lastSentence.trim() ? lastSentence : cleanText, sectionName);

        if (suggestion) {
            showGhostText(textarea, suggestion);
        } else {
            // If no trigger match and text is empty or very short, show default
            const trimmedContent = cleanText.trim();
            if (!trimmedContent) {
                const defaultSugg = getDefaultSuggestion(sectionName);
                if (defaultSugg) {
                    showGhostText(textarea, defaultSugg);
                } else {
                    hideGhostText();
                }
            } else {
                hideGhostText();
            }
        }
    }

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

    // Function to update editing panel content based on section
    function updateEditingPanelContent(sectionName) {
        // Update section title
        const editingSectionTitle = document.querySelector('.editing-section-title');
        const displayName = sectionName === 'Lead section' ? 'Lead/Introduction' : sectionName;
        editingSectionTitle.textContent = displayName;
        currentEditingSection = displayName;

        // Get the section key for example paragraphs
        const sectionKey = getSectionKey(sectionName);
        
        // Update example paragraphs section
        const suggestedSection = document.querySelector('.suggested-section');
        const examples = exampleParagraphs[sectionKey] || exampleParagraphs['lead_section'] || [];

        // Clear existing example cards (keep the heading)
        const existingCards = suggestedSection.querySelectorAll('.example-paragraph-card');
        existingCards.forEach(card => card.remove());

        // Add new example paragraph cards
        examples.forEach(example => {
            const card = document.createElement('div');
            card.className = 'example-paragraph-card';

            card.innerHTML = `
                <div class="example-source">
                    <span class="example-source-label">From:</span>
                    <span class="example-source-article">${example.source_article}</span>
                </div>
                <div class="example-paragraph-text">${example.paragraph}</div>
                <div class="example-notice">
                    <span class="example-notice-icon">💡</span>
                    <span class="example-notice-text">${example.what_to_notice}</span>
                </div>
            `;

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

        // Handle autocomplete
        handleAutocomplete(this, 'Lead section');
    });

    // Keyboard handler for accepting suggestions (Tab or Right Arrow)
    editorTextarea.addEventListener('keydown', function(e) {
        if (currentSuggestion && (e.key === 'Tab' || e.key === 'ArrowRight')) {
            e.preventDefault();
            acceptSuggestion();
        }
        // Escape key to dismiss suggestion
        if (e.key === 'Escape') {
            hideGhostText();
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

        // Set active section on focus and show default suggestion if empty
        textarea.addEventListener('focus', function() {
            setActiveSection(sectionBlock);
            const text = this.innerText || this.textContent || '';
            if (!text.trim()) {
                // Show default suggestion when section editor is empty
                const defaultSuggestion = getDefaultSuggestion(sectionName);
                if (defaultSuggestion) {
                    setTimeout(() => {
                        showGhostText(this, defaultSuggestion);
                    }, 100);
                }
            }
        });

        // Add autocomplete handler for this textarea
        textarea.addEventListener('input', function() {
            handleAutocomplete(this, sectionName);
        });

        // Add keyboard handler for accepting suggestions
        textarea.addEventListener('keydown', function(e) {
            if (currentSuggestion && (e.key === 'Tab' || e.key === 'ArrowRight')) {
                e.preventDefault();
                acceptSuggestion();
            }
            if (e.key === 'Escape') {
                hideGhostText();
            }
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
        
        // Show default suggestion when editor is empty
        const text = this.innerText || this.textContent || '';
        if (!text.trim()) {
            const defaultSuggestion = getDefaultSuggestion('Lead section');
            if (defaultSuggestion) {
                setTimeout(() => {
                    showGhostText(this, defaultSuggestion);
                }, 100);
            }
        }
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
