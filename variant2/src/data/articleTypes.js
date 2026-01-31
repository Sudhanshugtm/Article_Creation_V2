// ABOUTME: Article type configuration — section templates, domain lists for source verification
// ABOUTME: Provides per-type structure templates and URL domain classification

// Section templates per article type — defines the initial structure for each type
export const ARTICLE_TYPE_SECTIONS = {
  person: [
    { name: 'Early life', placeholder: 'Describe their childhood, family background, and education...' },
    { name: 'Career', placeholder: 'Write about their professional achievements and career milestones...' },
    { name: 'Personal life', placeholder: 'Describe their personal relationships, interests, and activities...' }
  ],
  place: [
    { name: 'Geography', placeholder: 'Describe the physical location, terrain, and features...' },
    { name: 'History', placeholder: 'Write about the historical development and notable events...' },
    { name: 'Demographics', placeholder: 'Describe the population, ethnic groups, and cultural aspects...' }
  ],
  organization: [
    { name: 'History', placeholder: 'Write about when and how the organization was founded...' },
    { name: 'Operations', placeholder: 'Describe what the organization does and how it operates...' },
    { name: 'Notable activities', placeholder: 'Write about significant achievements or controversies...' }
  ],
  event: [
    { name: 'Background', placeholder: 'Describe the context and circumstances leading to the event...' },
    { name: 'Description', placeholder: 'Write about what happened during the event...' },
    { name: 'Aftermath', placeholder: 'Describe the consequences and impact of the event...' }
  ]
};

// Lead section placeholder per article type
export const LEAD_PLACEHOLDERS = {
  person: 'Begin writing about this person...',
  place: 'Begin writing about this place...',
  organization: 'Begin writing about this organization...',
  event: 'Begin writing about this event...'
};

// Fill-in-the-blank templates per section for the suggestions panel
export const SECTION_TEMPLATES = {
  person: {
    'Lead section': [
      {
        title: 'Short biography',
        template: '<span class="placeholder">Full name</span> is a <span class="placeholder">nationality</span> <span class="placeholder">occupation</span> known for <span class="placeholder">notable achievement</span>.'
      },
      {
        title: 'Career summary',
        template: '<span class="placeholder">Name</span> began their career in <span class="placeholder">field</span> in <span class="placeholder">year</span> and has since <span class="placeholder">key accomplishment</span>.'
      }
    ],
    'Early life': [
      {
        title: 'Birth and family',
        template: '<span class="placeholder">Name</span> was born on <span class="placeholder">date</span> in <span class="placeholder">place</span> to <span class="placeholder">parents/family background</span>.'
      },
      {
        title: 'Education',
        template: '<span class="placeholder">Name</span> attended <span class="placeholder">school or university</span>, where they studied <span class="placeholder">subject</span>.'
      }
    ],
    'Career': [
      {
        title: 'Career beginnings',
        template: '<span class="placeholder">Name</span> started their career as a <span class="placeholder">role</span> at <span class="placeholder">organization</span> in <span class="placeholder">year</span>.'
      },
      {
        title: 'Major achievement',
        template: 'In <span class="placeholder">year</span>, <span class="placeholder">name</span> achieved <span class="placeholder">significant accomplishment</span>, which led to <span class="placeholder">impact</span>.'
      }
    ],
    'Personal life': [
      {
        title: 'Family',
        template: '<span class="placeholder">Name</span> is married to <span class="placeholder">spouse name</span> and has <span class="placeholder">number</span> children.'
      }
    ]
  },
  place: {
    'Lead section': [
      {
        title: 'Location overview',
        template: '<span class="placeholder">Place name</span> is a <span class="placeholder">type (city/town/region)</span> located in <span class="placeholder">country/region</span>, known for <span class="placeholder">notable feature</span>.'
      }
    ],
    'Geography': [
      {
        title: 'Physical geography',
        template: '<span class="placeholder">Place name</span> is situated at <span class="placeholder">coordinates or relative location</span>. The terrain consists of <span class="placeholder">describe landscape</span>.'
      },
      {
        title: 'Climate',
        template: '<span class="placeholder">Place name</span> has a <span class="placeholder">climate type</span> climate, with <span class="placeholder">temperature range</span> and <span class="placeholder">precipitation details</span>.'
      }
    ],
    'History': [
      {
        title: 'Early history',
        template: '<span class="placeholder">Place name</span> was founded in <span class="placeholder">year</span> by <span class="placeholder">founders</span>. It was originally <span class="placeholder">early purpose or character</span>.'
      }
    ],
    'Demographics': [
      {
        title: 'Population',
        template: 'As of <span class="placeholder">year</span>, <span class="placeholder">place name</span> has a population of <span class="placeholder">number</span>, making it the <span class="placeholder">rank</span> largest in <span class="placeholder">region</span>.'
      }
    ]
  },
  organization: {
    'Lead section': [
      {
        title: 'Organization overview',
        template: '<span class="placeholder">Organization name</span> is a <span class="placeholder">type (company/nonprofit/school)</span> founded in <span class="placeholder">year</span>, headquartered in <span class="placeholder">location</span>.'
      }
    ],
    'History': [
      {
        title: 'Founding',
        template: '<span class="placeholder">Organization name</span> was founded by <span class="placeholder">founder names</span> in <span class="placeholder">year</span> with the goal of <span class="placeholder">mission</span>.'
      }
    ],
    'Operations': [
      {
        title: 'Core activities',
        template: '<span class="placeholder">Organization name</span> primarily operates in <span class="placeholder">industry/sector</span>, providing <span class="placeholder">products or services</span>.'
      }
    ],
    'Notable activities': [
      {
        title: 'Key milestone',
        template: 'In <span class="placeholder">year</span>, <span class="placeholder">organization name</span> achieved <span class="placeholder">milestone</span>, which <span class="placeholder">significance</span>.'
      }
    ]
  },
  event: {
    'Lead section': [
      {
        title: 'Event overview',
        template: 'The <span class="placeholder">event name</span> was a <span class="placeholder">type of event</span> that took place on <span class="placeholder">date</span> in <span class="placeholder">location</span>.'
      }
    ],
    'Background': [
      {
        title: 'Context',
        template: 'The <span class="placeholder">event name</span> occurred in the context of <span class="placeholder">broader situation</span>. Prior to the event, <span class="placeholder">preceding circumstances</span>.'
      }
    ],
    'Description': [
      {
        title: 'What happened',
        template: 'The event began when <span class="placeholder">triggering action</span>. Over <span class="placeholder">duration</span>, <span class="placeholder">key developments</span>.'
      }
    ],
    'Aftermath': [
      {
        title: 'Consequences',
        template: 'Following the <span class="placeholder">event name</span>, <span class="placeholder">immediate consequences</span>. The long-term impact included <span class="placeholder">lasting effects</span>.'
      }
    ]
  }
};

// Getting-started checklist per article type (shown on editor first load)
export const GETTING_STARTED_CHECKLISTS = {
  person: [
    'State their full name and what they are known for.',
    'Mention their nationality and occupation.',
    'Add one thing that makes them notable (award, position, discovery).',
    'Include at least one reliable source.'
  ],
  place: [
    'Say what kind of place it is (city, village, mountain, etc.).',
    'Mention where it is located (country, region).',
    'Add one thing that makes it notable (population, history, feature).',
    'Include at least one reliable source.'
  ],
  organization: [
    'State the full name and what kind of organization it is.',
    'Mention when and where it was founded.',
    'Add one thing that makes it notable (size, impact, achievement).',
    'Include at least one reliable source.'
  ],
  event: [
    'Say what the event was and when it happened.',
    'Mention where it took place.',
    'Add one thing that makes it notable (scale, impact, significance).',
    'Include at least one reliable source.'
  ]
};

// Reliable source domains — these get a "valid" status during verification
export const RELIABLE_DOMAINS = [
  'bbc.com', 'bbc.co.uk',
  'nytimes.com',
  'nature.com',
  'reuters.com',
  'theguardian.com',
  'britannica.com',
  'washingtonpost.com',
  'apnews.com',
  'sciencedirect.com',
  'springer.com',
  'academic.oup.com',
  'jstor.org',
  'pubmed.ncbi.nlm.nih.gov',
  'nationalgeographic.com',
  'smithsonianmag.com',
  'economist.com',
  'theatlantic.com',
  'newyorker.com',
  'time.com',
  'aljazeera.com',
  'dw.com',
  'france24.com',
  'cnn.com',
  'nbcnews.com',
  'abcnews.go.com',
  'cbsnews.com',
  'pbs.org',
  'npr.org',
  'wired.com',
  'arstechnica.com'
];

// Rejected source domains — these get an "invalid" status during verification
export const REJECTED_DOMAINS = [
  'linkedin.com',
  'facebook.com',
  'twitter.com',
  'x.com',
  'instagram.com',
  'reddit.com',
  'tiktok.com',
  'pinterest.com',
  'tumblr.com',
  'quora.com',
  'medium.com',
  'blogspot.com',
  'wordpress.com',
  'imdb.com',
  'yelp.com',
  'tripadvisor.com',
  'amazon.com',
  'ebay.com'
];

// Extract domain from URL for source verification
export function extractDomain(url) {
  try {
    let normalized = url.trim();
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = 'https://' + normalized;
    }
    const parsed = new URL(normalized);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

// Check a URL against domain lists: returns 'valid', 'invalid', or 'unknown'
export function classifySourceDomain(url) {
  const domain = extractDomain(url);
  if (!domain) return 'unknown';

  if (RELIABLE_DOMAINS.some(d => domain === d || domain.endsWith('.' + d))) {
    return 'valid';
  }
  if (REJECTED_DOMAINS.some(d => domain === d || domain.endsWith('.' + d))) {
    return 'invalid';
  }
  return 'unknown';
}
