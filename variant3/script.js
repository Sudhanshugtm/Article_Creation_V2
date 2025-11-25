// ABOUTME: Main JavaScript file for article creation functionality - Variant 3
// ABOUTME: Writing Coach experience with progress tracking, tips, and example paragraphs

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
    const writingCoachPanel = document.getElementById('writingCoachPanel');
    const coachPanelCloseBtn = document.getElementById('coachPanelCloseBtn');
    const writingTipsBtn = document.getElementById('writingTipsBtn');
    const seeExamplesBtn = document.getElementById('seeExamplesBtn');
    const examplesPanel = document.getElementById('examplesPanel');
    const examplesPanelCloseBtn = document.getElementById('examplesPanelCloseBtn');
    const examplesPanelContent = document.getElementById('examplesPanelContent');
    const articleOutlinePanel = document.getElementById('articleOutlinePanel');
    const outlinePanelCloseBtn = document.getElementById('outlinePanelCloseBtn');
    const viewOutlineBtn = document.getElementById('viewOutlineBtn');
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
    const progressBarFill = document.getElementById('progressBarFill');
    const progressPercentage = document.getElementById('progressPercentage');
    const sentenceStartersList = document.getElementById('sentenceStartersList');

    let searchTimeout;
    let currentArticleTitle = '';
    let currentCategory = null;
    const addedSections = new Set();
    let activeSection = null;
    const userSources = [];
    let citationCounter = 0;

    // Define section order
    const sectionOrder = ['Lead section', 'Characteristics', 'Distribution and habitat', 'Ecology and behaviour'];

    // Section placeholder mapping
    const sectionPlaceholders = {
        'Lead section': 'Begin writing about Siberian tiger...',
        'Characteristics': 'Describe the physical traits and appearance...',
        'Distribution and habitat': 'Explain where the Siberian tiger lives...',
        'Ecology and behaviour': 'Describe the diet and social behaviour...'
    };

    // Section-specific writing tips
    const sectionTips = {
        'Lead section': [
            { id: 'definition', text: 'Start with what the topic IS (definition)', keywords: ['is a', 'is the', 'are a', 'are the'] },
            { id: 'classification', text: 'Include the scientific classification', keywords: ['Panthera', 'subspecies', 'species', 'family', 'genus'] },
            { id: 'location', text: 'Mention where it is found', keywords: ['native to', 'found in', 'inhabits', 'lives in', 'Russia', 'Far East', 'China'] },
            { id: 'notable', text: 'Add what makes it notable', keywords: ['largest', 'endangered', 'known for', 'recognized', 'distinctive'] }
        ],
        'Characteristics': [
            { id: 'appearance', text: 'Describe physical appearance', keywords: ['coat', 'fur', 'color', 'stripes', 'body'] },
            { id: 'size', text: 'Include size measurements', keywords: ['length', 'weight', 'kg', 'cm', 'meters', 'tall'] },
            { id: 'features', text: 'Mention distinctive features', keywords: ['distinctive', 'unique', 'characteristic', 'recognizable'] },
            { id: 'comparison', text: 'Compare to related species', keywords: ['compared to', 'unlike', 'similar to', 'larger than', 'smaller than'] }
        ],
        'Distribution and habitat': [
            { id: 'range', text: 'Describe geographic range', keywords: ['range', 'found in', 'native to', 'distributed', 'occurs'] },
            { id: 'habitat_type', text: 'Specify habitat types', keywords: ['forest', 'mountains', 'grassland', 'habitat', 'ecosystem'] },
            { id: 'population', text: 'Include population estimates', keywords: ['population', 'individuals', 'estimated', 'approximately'] },
            { id: 'historical', text: 'Mention historical range changes', keywords: ['historically', 'formerly', 'declined', 'reduced', 'expanded'] }
        ],
        'Ecology and behaviour': [
            { id: 'diet', text: 'Describe diet and hunting', keywords: ['prey', 'hunt', 'eat', 'diet', 'feed'] },
            { id: 'social', text: 'Explain social structure', keywords: ['solitary', 'social', 'territorial', 'group'] },
            { id: 'reproduction', text: 'Include reproduction info', keywords: ['mate', 'breed', 'cubs', 'offspring', 'gestation'] },
            { id: 'activity', text: 'Mention activity patterns', keywords: ['nocturnal', 'diurnal', 'active', 'crepuscular'] }
        ]
    };

    // Section-specific sentence starters
    const sentenceStarters = {
        'Lead section': [
            'The Siberian tiger is...',
            'Also known as the Amur tiger,...',
            'Native to the Russian Far East,...',
            'As an apex predator,...',
            'This subspecies is...'
        ],
        'Characteristics': [
            'The Siberian tiger has...',
            'Males typically weigh...',
            'Their coat is...',
            'Compared to other subspecies,...',
            'Distinctive features include...'
        ],
        'Distribution and habitat': [
            'Siberian tigers inhabit...',
            'Their range extends across...',
            'The primary habitat consists of...',
            'Population estimates suggest...',
            'Historically, they were found...'
        ],
        'Ecology and behaviour': [
            'As solitary hunters,...',
            'Their diet consists primarily of...',
            'Territorial behaviour includes...',
            'Breeding occurs...',
            'They are most active during...'
        ]
    };

    // Example paragraphs from real Wikipedia articles
    const exampleParagraphs = {
        'Lead section': [
            {
                source: 'Bengal tiger',
                text: 'The Bengal tiger is a population of the Panthera tigris tigris subspecies and the nominate tiger subspecies. It ranks among the biggest wild cats alive today.',
                notice: 'Starts with definition, mentions scientific name, ends with significance'
            },
            {
                source: 'Snow leopard',
                text: 'The snow leopard, also known as the ounce, is a felid in the genus Panthera native to the mountain ranges of Central Asia. It is listed as Vulnerable on the IUCN Red List.',
                notice: 'Includes alternative name, habitat region, and conservation status'
            }
        ],
        'Characteristics': [
            {
                source: 'Bengal tiger',
                text: "The Bengal tiger's coat is yellow to light orange, with stripes ranging from dark brown to black; the belly and the interior parts of the limbs are white, and the tail is orange with black rings.",
                notice: 'Specific color descriptions with anatomical details'
            },
            {
                source: 'African lion',
                text: 'The lion is a muscular, broad-chested cat with a short, rounded head, a reduced neck and round ears. Its fur varies in colour from light buff to silvery grey, yellowish red and dark brown.',
                notice: 'Body structure followed by coloration'
            }
        ],
        'Distribution and habitat': [
            {
                source: 'Bengal tiger',
                text: 'Bengal tigers live in many types of forests, including wet, evergreen, and semi-evergreen forests of Assam and eastern Bengal; the swampy mangrove forest of the Ganges Delta; and the deciduous forests of Nepal.',
                notice: 'Lists multiple habitat types with specific geographic locations'
            },
            {
                source: 'Snow leopard',
                text: 'The snow leopard inhabits alpine and subalpine zones at elevations of 3,000 to 4,500 m, occasionally ranging to 5,500 m in summer. It prefers steep cliffs, rocky outcrops and ravines.',
                notice: 'Includes elevation ranges and terrain preferences'
            }
        ],
        'Ecology and behaviour': [
            {
                source: 'Bengal tiger',
                text: 'Tigers are mostly solitary, apart from associations between mother and offspring. Each tiger maintains a home range where it can meet its needs. Adult females establish ranges that provide sufficient prey.',
                notice: 'Social structure, then territory explanation'
            },
            {
                source: 'African lion',
                text: 'The lion is a social species, forming groups called prides. A pride consists of a few adult males, related females, and cubs. Groups of female lions usually hunt together, preying mostly on large ungulates.',
                notice: 'Social structure unique to lions, then hunting behavior'
            }
        ]
    };

    // Mock Wikidata verified sources
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
            }
        ]
    };

    // Topic data
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
            }
        ]
    };

    // Category hierarchy
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

    // ===== PROGRESS TRACKING =====
    function updateProgress() {
        let progress = 0;
        let milestones = {
            intro: false,
            body: false,
            sources: false,
            complete: false
        };

        // Check lead section content
        const leadContent = editorTextarea.innerText || editorTextarea.textContent || '';
        const leadWordCount = leadContent.trim().split(/\s+/).filter(w => w.length > 0).length;
        
        if (leadWordCount >= 20) {
            progress += 25;
            milestones.intro = true;
        } else if (leadWordCount > 0) {
            progress += Math.min(25, (leadWordCount / 20) * 25);
        }

        // Check additional sections
        const additionalSections = addedSections.size - 1; // Exclude lead section
        if (additionalSections > 0) {
            progress += Math.min(25, additionalSections * 12.5);
            milestones.body = additionalSections >= 2;
        }

        // Check for sources
        if (userSources.length > 0 || citationCounter > 0) {
            progress += 25;
            milestones.sources = true;
        }

        // Check total word count for completion
        let totalWords = leadWordCount;
        document.querySelectorAll('.section-block').forEach(block => {
            if (block.id !== 'leadSectionBlock') {
                const textarea = block.querySelector('.section-textarea');
                if (textarea) {
                    const content = textarea.innerText || textarea.textContent || '';
                    totalWords += content.trim().split(/\s+/).filter(w => w.length > 0).length;
                }
            }
        });

        if (totalWords >= 100 && milestones.sources && milestones.body) {
            progress = 100;
            milestones.complete = true;
        }

        // Update UI
        const displayProgress = Math.min(100, Math.round(progress));
        progressBarFill.style.width = displayProgress + '%';
        progressPercentage.textContent = displayProgress + '%';

        // Update milestones
        Object.keys(milestones).forEach(key => {
            const milestone = document.querySelector(`.milestone[data-milestone="${key}"]`);
            if (milestone) {
                milestone.classList.toggle('completed', milestones[key]);
            }
        });

        // Update quality checklist
        updateQualityChecklist(totalWords);
    }

    function updateQualityChecklist(totalWords) {
        const checklist = document.getElementById('qualityChecklist');
        if (!checklist) return;

        // Check neutral tone (simple check - no first person)
        const content = editorTextarea.innerText || '';
        const hasFirstPerson = /\b(I|we|my|our|me|us)\b/i.test(content);
        updateChecklistItem('neutral', !hasFirstPerson && content.length > 0);

        // Check sources
        updateChecklistItem('sources', userSources.length > 0 || citationCounter > 0);

        // Check length
        updateChecklistItem('length', totalWords >= 100);

        // Check sections
        updateChecklistItem('sections', addedSections.size >= 2);
    }

    function updateChecklistItem(checkId, isComplete) {
        const item = document.querySelector(`.checklist-item[data-check="${checkId}"]`);
        if (item) {
            item.classList.toggle('completed', isComplete);
        }
    }

    // ===== WRITING TIPS =====
    function updateWritingTips(sectionName) {
        const tips = sectionTips[sectionName] || sectionTips['Lead section'];
        const tipsContainer = document.getElementById('currentSectionTips');
        if (!tipsContainer) return;

        // Update section title
        const titleEl = tipsContainer.querySelector('.coach-section-title');
        if (titleEl) {
            titleEl.textContent = `Tips for ${sectionName === 'Lead section' ? 'the Lead Section' : sectionName}`;
        }

        // Update tips list
        const tipsList = tipsContainer.querySelector('.coach-tips-list');
        if (tipsList) {
            tipsList.innerHTML = '';
            tips.forEach(tip => {
                const li = document.createElement('li');
                li.className = 'coach-tip';
                li.dataset.tip = tip.id;
                li.innerHTML = `
                    <span class="tip-checkbox"></span>
                    <span class="tip-text">${tip.text}</span>
                `;
                tipsList.appendChild(li);
            });
        }

        // Check which tips are already completed
        checkTipsCompletion(sectionName);
    }

    function checkTipsCompletion(sectionName) {
        const tips = sectionTips[sectionName] || sectionTips['Lead section'];
        let textarea;

        if (sectionName === 'Lead section') {
            textarea = editorTextarea;
        } else {
            const block = Array.from(document.querySelectorAll('.section-block')).find(
                b => b.dataset.sectionName === sectionName
            );
            textarea = block?.querySelector('.section-textarea');
        }

        if (!textarea) return;

        const content = (textarea.innerText || textarea.textContent || '').toLowerCase();

        tips.forEach(tip => {
            const tipEl = document.querySelector(`.coach-tip[data-tip="${tip.id}"]`);
            if (tipEl) {
                const isComplete = tip.keywords.some(keyword => content.includes(keyword.toLowerCase()));
                tipEl.classList.toggle('completed', isComplete);
            }
        });
    }

    // ===== SENTENCE STARTERS =====
    function updateSentenceStarters(sectionName) {
        const starters = sentenceStarters[sectionName] || sentenceStarters['Lead section'];
        
        if (!sentenceStartersList) return;

        sentenceStartersList.innerHTML = '';
        starters.forEach(starter => {
            const chip = document.createElement('button');
            chip.className = 'sentence-starter-chip';
            chip.textContent = starter;
            chip.addEventListener('click', function() {
                insertSentenceStarter(starter, sectionName);
            });
            sentenceStartersList.appendChild(chip);
        });
    }

    function insertSentenceStarter(starter, sectionName) {
        let textarea;
        if (sectionName === 'Lead section') {
            textarea = editorTextarea;
        } else {
            const block = Array.from(document.querySelectorAll('.section-block')).find(
                b => b.dataset.sectionName === sectionName
            );
            textarea = block?.querySelector('.section-textarea');
        }

        if (!textarea) return;

        // Insert the starter text
        const currentContent = textarea.innerText || textarea.textContent || '';
        const needsNewLine = currentContent.trim().length > 0;
        
        if (needsNewLine) {
            textarea.innerHTML += '<br><br>' + starter;
        } else {
            textarea.textContent = starter;
        }

        // Focus and move cursor to end
        textarea.focus();
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(textarea);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);

        updateProgress();
        checkTipsCompletion(sectionName);
    }

    // ===== EXAMPLE PARAGRAPHS =====
    function showExamplesPanel(sectionName) {
        const examples = exampleParagraphs[sectionName] || exampleParagraphs['Lead section'];
        
        examplesPanelContent.innerHTML = '';
        examples.forEach(example => {
            const card = document.createElement('div');
            card.className = 'example-card';
            card.innerHTML = `
                <div class="example-card-header">
                    <span class="example-source-label">From:</span>
                    <span class="example-source-article">${example.source}</span>
                </div>
                <p class="example-text">${example.text}</p>
                <p class="example-notice-text">💡 ${example.notice}</p>
            `;
            examplesPanelContent.appendChild(card);
        });

        writingCoachPanel.style.display = 'none';
        examplesPanel.style.display = 'block';
    }

    // ===== NAVIGATION =====
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
            nextBtn.style.display = 'none';

            const addSourcesTitle = document.getElementById('addSourcesTitle');
            if (currentArticleTitle) {
                addSourcesTitle.textContent = `Add key sources for "${currentArticleTitle}"`;
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

            // Initialize coach panel
            updateWritingTips('Lead section');
            updateSentenceStarters('Lead section');
            updateProgress();
        }
    }

    // ===== CATEGORY RENDERING =====
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

    function handleCategoryClick(category) {
        currentCategory = category.id;

        if (categories[category.id]) {
            typeSelectionTitle.textContent = `What kind of ${category.name.toLowerCase()}?`;
            const description = document.querySelector('.type-selection-description');
            description.textContent = `You've selected '${category.name.toLowerCase()}'. Now choose a more specific category.`;
            renderCategories(category.id);
        } else {
            showScreen(2.5);
        }
    }

    // ===== TOPIC MATCHING =====
    function autoResize() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    }

    function showTopicMatching(query) {
        const normalizedQuery = query.toLowerCase().trim();
        const topics = mockTopics[normalizedQuery] || [];

        if (topics.length > 0) {
            topicList.innerHTML = '';
            topics.forEach(topic => {
                const li = document.createElement('li');
                li.className = 'topic-item';

                let thumbnailEl;
                if (topic.thumbnail) {
                    thumbnailEl = document.createElement('img');
                    thumbnailEl.src = topic.thumbnail;
                    thumbnailEl.alt = topic.title;
                    thumbnailEl.className = 'topic-thumbnail';
                    thumbnailEl.onerror = function() {
                        const placeholder = document.createElement('div');
                        placeholder.className = 'topic-thumbnail';
                        this.replaceWith(placeholder);
                    };
                } else {
                    thumbnailEl = document.createElement('div');
                    thumbnailEl.className = 'topic-thumbnail';
                }

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

    // ===== SECTION MANAGEMENT =====
    function setActiveSection(sectionBlock) {
        const allSections = document.querySelectorAll('.section-block');
        allSections.forEach(section => section.classList.remove('active'));

        if (sectionBlock) {
            sectionBlock.classList.add('active');
            activeSection = sectionBlock.dataset.sectionName;
            
            // Update coach panel for active section
            updateWritingTips(activeSection);
            updateSentenceStarters(activeSection);
        }
    }

    function createSectionBlock(sectionName, sectionDescription) {
        const sectionBlock = document.createElement('div');
        sectionBlock.className = 'section-block';
        sectionBlock.dataset.sectionName = sectionName;

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

        const contentArea = document.createElement('div');
        contentArea.className = 'section-content-area';

        const textarea = document.createElement('div');
        textarea.className = 'section-textarea';
        textarea.contentEditable = 'true';
        textarea.dataset.placeholder = sectionPlaceholders[sectionName] || `Write about ${sectionName.toLowerCase()}...`;

        textarea.addEventListener('focus', function() {
            setActiveSection(sectionBlock);
        });

        textarea.addEventListener('input', function() {
            updateProgress();
            checkTipsCompletion(sectionName);
        });

        contentArea.appendChild(textarea);

        // Action buttons
        const actionButtons = document.createElement('div');
        actionButtons.className = 'section-action-buttons';

        const tipsBtn = document.createElement('button');
        tipsBtn.className = 'section-writing-tips-btn';
        tipsBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" class="btn-icon">
                <path d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm1 16H9v-2h2v2zm0-4H9V4h2v8z"/>
            </svg>
            Writing tips
        `;
        tipsBtn.addEventListener('click', function() {
            writingCoachPanel.style.display = 'block';
            examplesPanel.style.display = 'none';
            articleOutlinePanel.style.display = 'none';
        });

        const examplesBtn = document.createElement('button');
        examplesBtn.className = 'section-see-examples-btn';
        examplesBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" class="btn-icon">
                <path d="M10 12.5c-2 0-4-1.5-5-3.5 1-2 3-3.5 5-3.5s4 1.5 5 3.5c-1 2-3 3.5-5 3.5zm0-5.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
            </svg>
            See examples
        `;
        examplesBtn.addEventListener('click', function() {
            showExamplesPanel(sectionName);
        });

        const addSourceBtn = document.createElement('button');
        addSourceBtn.className = 'section-add-source-btn';
        addSourceBtn.textContent = 'Add source';
        addSourceBtn.addEventListener('click', openCitationDialog);

        actionButtons.appendChild(tipsBtn);
        actionButtons.appendChild(examplesBtn);
        actionButtons.appendChild(addSourceBtn);

        sectionBlock.appendChild(headerRow);
        sectionBlock.appendChild(contentArea);
        sectionBlock.appendChild(actionButtons);

        removeBtn.addEventListener('click', function() {
            sectionBlock.remove();
            addedSections.delete(sectionName);
            updateOutlineSectionStatus(sectionName, false);
            updateProgress();
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
        const articleSectionsContainer = document.getElementById('articleSections');
        articleSectionsContainer.appendChild(sectionBlock);

        addedSections.add(sectionName);
        updateOutlineSectionStatus(sectionName, true);
        updateProgress();

        setTimeout(() => {
            sectionBlock.querySelector('.section-textarea').focus();
        }, 100);
    }

    // ===== CITATION DIALOG =====
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

        sourceCard.innerHTML = `
            <div class="source-icon">
                <img src="node_modules/@wikimedia/codex-icons/dist/images/${iconName}.svg" alt="" width="20" height="20">
            </div>
            <div class="source-content">
                <div class="source-title">${source.title}</div>
                <div class="source-meta">
                    <span class="source-type">${source.type}</span>
                    ${source.publisher ? `<span> · ${source.publisher}${yearDisplay}</span>` : ''}
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

        const addSourceBtn = sourceCard.querySelector('.source-action-btn');
        addSourceBtn.addEventListener('click', function() {
            citationCounter++;
            updateProgress();
            citationDialog.style.display = 'none';
        });

        return sourceCard;
    }

    function openCitationDialog() {
        const wikidataSources = mockWikidataSources['Siberian Tiger'] || [];

        citationSourcesList.innerHTML = '';

        // User sources section
        if (userSources.length > 0) {
            const userHeader = document.createElement('div');
            userHeader.className = 'sources-section-header';
            userHeader.textContent = 'Your sources';
            citationSourcesList.appendChild(userHeader);

            const userDesc = document.createElement('p');
            userDesc.className = 'sources-section-description';
            userDesc.textContent = 'Sources you added earlier.';
            citationSourcesList.appendChild(userDesc);

            const userContainer = document.createElement('div');
            userContainer.className = 'citation-sources-group';
            userSources.forEach(source => {
                userContainer.appendChild(createSourceCard(source));
            });
            citationSourcesList.appendChild(userContainer);

            const separator = document.createElement('div');
            separator.className = 'sources-section-separator';
            citationSourcesList.appendChild(separator);
        }

        // Wikidata sources
        const wikidataHeader = document.createElement('div');
        wikidataHeader.className = 'sources-section-header';
        wikidataHeader.textContent = 'Suggested sources';
        citationSourcesList.appendChild(wikidataHeader);

        const wikidataDesc = document.createElement('p');
        wikidataDesc.className = 'sources-section-description';
        wikidataDesc.textContent = 'Reliable sources about this topic.';
        citationSourcesList.appendChild(wikidataDesc);

        const wikidataContainer = document.createElement('div');
        wikidataContainer.className = 'citation-sources-group';
        wikidataSources.forEach(source => {
            wikidataContainer.appendChild(createSourceCard(source));
        });
        citationSourcesList.appendChild(wikidataContainer);

        // Add own source card
        const addOwnCard = document.createElement('div');
        addOwnCard.className = 'source-card add-own-source-card';
        addOwnCard.innerHTML = `
            <div class="source-icon">
                <img src="node_modules/@wikimedia/codex-icons/dist/images/add.svg" alt="" width="20" height="20">
            </div>
            <div class="source-content">
                <div class="source-title">Add your own source...</div>
            </div>
        `;
        citationSourcesList.appendChild(addOwnCard);

        if (document.activeElement) document.activeElement.blur();
        citationDialog.style.display = 'flex';
    }

    // ===== EVENT LISTENERS =====
    
    articleTitle.addEventListener('input', function() {
        autoResize.call(this);
        clearTimeout(searchTimeout);
        const query = this.value.trim();

        if (query.length > 2) {
            searchTimeout = setTimeout(() => showTopicMatching(query), 500);
        } else {
            topicMatching.style.display = 'none';
        }
    });

    closeBtn.addEventListener('click', function() {
        if (screen3.style.display === 'block') {
            if (currentCategory) {
                showScreen(2);
            } else {
                showScreen(1);
            }
        } else if (screen2.style.display === 'block') {
            showScreen(1);
        } else {
            window.location.replace('../index.html');
        }
    });

    nextBtn.addEventListener('click', function() {
        const title = articleTitle.value.trim();
        if (title) {
            alert('Article submitted! Title: ' + title);
        } else {
            alert('Please enter an article title');
        }
    });

    topicNotListedBtn.addEventListener('click', function() {
        currentArticleTitle = articleTitle.value.trim();
        typeSelectionTitle.textContent = `What is "${currentArticleTitle}" about?`;
        renderCategories('root');
        showScreen(2);
    });

    typeSearchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        const items = categoryList.querySelectorAll('.category-item');

        items.forEach(item => {
            const name = item.querySelector('.category-name').textContent.toLowerCase();
            item.style.display = name.includes(query) ? 'flex' : 'none';
        });
    });

    // Coach panel
    coachPanelCloseBtn.addEventListener('click', function() {
        writingCoachPanel.style.display = 'none';
    });

    writingTipsBtn.addEventListener('click', function() {
        writingCoachPanel.style.display = 'block';
        examplesPanel.style.display = 'none';
        articleOutlinePanel.style.display = 'none';
    });

    seeExamplesBtn.addEventListener('click', function() {
        showExamplesPanel(activeSection || 'Lead section');
    });

    examplesPanelCloseBtn.addEventListener('click', function() {
        examplesPanel.style.display = 'none';
        writingCoachPanel.style.display = 'block';
    });

    // Outline panel
    viewOutlineBtn.addEventListener('click', function() {
        writingCoachPanel.style.display = 'none';
        examplesPanel.style.display = 'none';
        articleOutlinePanel.style.display = 'block';
    });

    outlinePanelCloseBtn.addEventListener('click', function() {
        articleOutlinePanel.style.display = 'none';
        writingCoachPanel.style.display = 'block';
    });

    // Custom section dialog
    addCustomSectionBtnTrigger.addEventListener('click', function() {
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

    customSectionDialog.addEventListener('click', function(e) {
        if (e.target.classList.contains('dialog-overlay')) {
            closeCustomSectionDialog();
        }
    });

    addCustomSectionBtn.addEventListener('click', function() {
        const sectionName = customSectionInput.value.trim();
        const sectionDesc = customSectionDescription.value.trim();

        if (sectionName) {
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

            outlineSections.insertBefore(newSection, addCustomSectionBtnTrigger);

            addBtn.addEventListener('click', function() {
                handleAddSectionClick(sectionName, sectionDesc);
                articleOutlinePanel.style.display = 'none';
                writingCoachPanel.style.display = 'block';
            });

            closeCustomSectionDialog();
        }
    });

    customSectionInput.addEventListener('input', function() {
        addCustomSectionBtn.disabled = !this.value.trim();
    });

    // Citation dialog
    sectionAddSourceBtn.addEventListener('click', openCitationDialog);

    citationDialogCloseBtn.addEventListener('click', function() {
        citationDialog.style.display = 'none';
    });

    citationDialog.addEventListener('click', function(e) {
        if (e.target === citationDialog) {
            citationDialog.style.display = 'none';
        }
    });

    // Editor textarea
    editorTextarea.addEventListener('focus', function() {
        const leadSectionBlock = document.getElementById('leadSectionBlock');
        setActiveSection(leadSectionBlock);
    });

    editorTextarea.addEventListener('input', function() {
        updateProgress();
        checkTipsCompletion('Lead section');
    });

    // Outline add buttons
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
                        articleOutlinePanel.style.display = 'none';
                        writingCoachPanel.style.display = 'block';
                    }
                });
            }
        });
    }

    // Sources screen
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
        newRow.querySelector('.cdx-text-input__input').focus();
    });

    const startWritingBtn = document.getElementById('startWritingBtn');
    startWritingBtn.addEventListener('click', function() {
        captureUserSources();
        showScreen(3);
        setTimeout(() => editorTextarea.focus(), 100);
    });

    skipSourcesBtn.addEventListener('click', function() {
        showScreen(3);
        setTimeout(() => editorTextarea.focus(), 100);
    });

    function captureUserSources() {
        const sourceInputs = sourcesInputContainer.querySelectorAll('.cdx-text-input__input');
        sourceInputs.forEach(input => {
            const url = input.value.trim();
            if (url) {
                userSources.push({
                    title: url,
                    type: 'Website',
                    url: url,
                    icon: 'globe'
                });
            }
        });
        updateProgress();
    }

    // ===== INITIALIZATION =====
    addedSections.add('Lead section');
    
    const leadSectionBlock = document.getElementById('leadSectionBlock');
    if (leadSectionBlock) {
        setActiveSection(leadSectionBlock);
    }

    attachOutlineAddButtonHandlers();

    setTimeout(() => articleTitle.focus(), 100);
});
