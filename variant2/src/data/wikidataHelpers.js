// ABOUTME: Shared Wikidata and Wikipedia API helper functions for article creation
// ABOUTME: Provides search, script detection, URL parsing, and SPARQL-based type detection

// Detect script type from input text
export function detectScript(text) {
  if (/[\u0980-\u09FF]/.test(text)) return 'bn'; // Bengali
  if (/[\u0D00-\u0D7F]/.test(text)) return 'ml'; // Malayalam
  if (/[\u0900-\u097F]/.test(text)) return 'hi'; // Hindi/Devanagari
  return 'en'; // Default to English (Latin script)
}

// Full type map for SPARQL-based auto-detection (maps Wikidata class → our type)
export const TYPE_MAP = {
  Q5: 'person',
  Q2221906: 'place',        // geographic location
  Q43229: 'organization',
  Q1190554: 'event',
  Q17537576: 'creative-work',
  Q16521: 'species',
  Q151885: 'concept'
};

// Priority order when multiple types match
export const TYPE_PRIORITY = ['person', 'place', 'organization', 'event', 'creative-work', 'species', 'concept'];

// Labels for detected types (used in confirmation UI)
export const TYPE_LABELS = {
  person: 'Person',
  place: 'Place',
  organization: 'Organization',
  event: 'Event',
  'creative-work': 'Creative work',
  species: 'Species',
  concept: 'Concept'
};

// Visible article types for manual selection (reduced set)
export const visibleArticleTypes = [
  { id: 'person', label: 'Person', description: "Someone's biography", wikidataClass: 'Q5' },
  { id: 'place', label: 'Place', description: 'Location, city, or landmark', wikidataClass: 'Q2221906' },
  { id: 'organization', label: 'Organization', description: 'School, company, group, or team', wikidataClass: 'Q43229' },
  { id: 'event', label: 'Event', description: 'Festival, battle, election, or ceremony', wikidataClass: 'Q1190554' }
];

// Icons mapping for article types (Codex icon references)
import {
  cdxIconUserAvatar,
  cdxIconMapPin,
  cdxIconUserGroup,
  cdxIconCalendar
} from '@wikimedia/codex-icons';

export const typeIcons = {
  person: cdxIconUserAvatar,
  place: cdxIconMapPin,
  organization: cdxIconUserGroup,
  event: cdxIconCalendar
};

// Search Wikidata entities and return scored results with thumbnails and sitelinks
export async function fetchWikidataResults(searchQuery) {
  const detectedScriptLang = detectScript(searchQuery);
  const displayLang = detectedScriptLang;
  const searchLanguages = detectedScriptLang === 'en'
    ? ['en', 'bn', 'ml', 'hi']
    : [detectedScriptLang, 'en'];

  // Step 1: Search entities across multiple languages, display in user's language
  const searchPromises = searchLanguages.map(lang =>
    fetch(`https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(searchQuery)}&language=${lang}&uselang=${displayLang}&limit=10&format=json&origin=*`)
      .then(r => r.json())
      .then(data => ({ lang, results: data.search || [] }))
      .catch(() => ({ lang, results: [] }))
  );

  const searchResults = await Promise.all(searchPromises);

  // Merge and dedupe by QID, keeping first occurrence (priority by language order)
  const seen = new Set();
  const mergedResults = [];
  for (const { lang, results } of searchResults) {
    for (const item of results) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        mergedResults.push({ ...item, searchLang: lang });
      }
    }
  }

  if (!mergedResults.length) {
    return { results: [], exactMatch: null, detectedScript: detectedScriptLang };
  }

  // Step 2: Get entities with images (P18) and sitelinks
  const ids = mergedResults.slice(0, 15).map(item => item.id).join('|');
  const entitiesUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${ids}&props=claims|sitelinks&format=json&origin=*`;
  const entitiesResponse = await fetch(entitiesUrl);
  const entitiesData = await entitiesResponse.json();

  // Step 3: Map and score results
  const queryLower = searchQuery.toLowerCase().trim();
  const scored = mergedResults.slice(0, 15).map(item => {
    const entity = entitiesData.entities?.[item.id];
    const imageFile = entity?.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
    const thumbnail = imageFile
      ? `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(imageFile)}?width=100`
      : null;
    const hasWikipedia = !!entity?.sitelinks?.enwiki;
    const hasBnWiki = !!entity?.sitelinks?.bnwiki;
    const hasMlWiki = !!entity?.sitelinks?.mlwiki;
    const hasHiWiki = !!entity?.sitelinks?.hiwiki;
    const isExactMatch = item.label.toLowerCase().trim() === queryLower;

    // Only check wiki matching detected script
    let hasTargetWiki = false;
    let wikiLang = null;
    let localWikiUrl = null;

    if (detectedScriptLang === 'bn' && hasBnWiki) {
      hasTargetWiki = true;
      wikiLang = 'Bengali';
      localWikiUrl = `https://bn.wikipedia.org/wiki/${encodeURIComponent(entity?.sitelinks?.bnwiki?.title)}`;
    } else if (detectedScriptLang === 'hi' && hasHiWiki) {
      hasTargetWiki = true;
      wikiLang = 'Hindi';
      localWikiUrl = `https://hi.wikipedia.org/wiki/${encodeURIComponent(entity?.sitelinks?.hiwiki?.title)}`;
    } else if (detectedScriptLang === 'ml' && hasMlWiki) {
      hasTargetWiki = true;
      wikiLang = 'Malayalam';
      localWikiUrl = `https://ml.wikipedia.org/wiki/${encodeURIComponent(entity?.sitelinks?.mlwiki?.title)}`;
    } else if (detectedScriptLang === 'en' && hasWikipedia) {
      hasTargetWiki = true;
      wikiLang = 'English';
      localWikiUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(entity?.sitelinks?.enwiki?.title)}`;
    }

    // Score: Target wiki (5) + Any Wikipedia (3) + Image (2) + Exact match (1)
    const score = (hasTargetWiki ? 5 : 0) + (hasWikipedia ? 3 : 0) + (thumbnail ? 2 : 0) + (isExactMatch ? 1 : 0);

    return {
      id: item.id,
      label: item.label,
      description: item.description || '',
      thumbnail,
      searchLang: item.searchLang,
      hasLocalArticle: hasTargetWiki,
      wikiLang,
      localWikiUrl,
      score
    };
  });

  // Step 4: Sort by score and take top 3
  scored.sort((a, b) => b.score - a.score);
  const topResults = scored.slice(0, 3).map(({ score, searchLang, ...rest }) => rest);

  // Check for exact match with local article
  const queryNormalized = searchQuery.toLowerCase().trim();
  const exactMatchResult = topResults.find(
    r => r.label.toLowerCase().trim() === queryNormalized && r.hasLocalArticle
  );

  return {
    results: topResults,
    exactMatch: exactMatchResult || null,
    detectedScript: detectedScriptLang
  };
}

// Parse a Wikipedia URL and extract language + title
export function parseWikipediaUrl(input) {
  const match = input.trim().match(/^https?:\/\/([a-z]{2,3})\.wikipedia\.org\/wiki\/(.+)/i);
  if (!match) return null;
  const lang = match[1];
  let title = match[2];
  // Strip fragment and query string
  title = title.split('#')[0].split('?')[0];
  // Decode URL encoding and replace underscores with spaces
  title = decodeURIComponent(title).replace(/_/g, ' ');
  return { lang, title };
}

// Search Wikipedia for similar articles using opensearch API
export async function searchWikipediaArticles(searchText) {
  const trimmed = searchText.trim();
  if (trimmed.length < 2) {
    return [];
  }
  const url = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(trimmed)}&limit=5&namespace=0&format=json&origin=*`;
  const response = await fetch(url);
  const data = await response.json();
  // opensearch returns [query, titles[], descriptions[], urls[]]
  const titles = data[1] || [];
  const descriptions = data[2] || [];
  return titles.map((title, i) => ({
    title,
    description: descriptions[i] || ''
  }));
}

// Detect article type via Wikidata: resolve article → QID → SPARQL P31/P279 chain
export async function detectArticleType(articleTitle) {
  try {
    // Step 1: Resolve Wikipedia article title to Wikidata QID via pageprops
    const ppUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(articleTitle)}&prop=pageprops&ppprop=wikibase_item&format=json&origin=*`;
    const ppResponse = await fetch(ppUrl);
    const ppData = await ppResponse.json();
    const pages = ppData.query?.pages || {};
    const page = Object.values(pages)[0];
    const qid = page?.pageprops?.wikibase_item;
    if (!qid) return null;

    // Step 2: SPARQL query to walk P31 → P279 chain and match known types
    const knownClasses = Object.keys(TYPE_MAP).join(' wd:');
    const sparql = `
      SELECT ?type WHERE {
        wd:${qid} wdt:P31/wdt:P279* ?type .
        VALUES ?type { wd:${knownClasses} }
      } LIMIT 10
    `;
    const sparqlUrl = `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparql)}&format=json`;
    const sparqlResponse = await fetch(sparqlUrl);
    const sparqlData = await sparqlResponse.json();
    const bindings = sparqlData.results?.bindings || [];

    if (bindings.length === 0) return null;

    // Extract matched type IDs and pick by priority
    const matchedTypeIds = bindings.map(b => {
      const uri = b.type.value;
      return uri.split('/').pop();
    });

    const matchedTypes = matchedTypeIds
      .map(id => TYPE_MAP[id])
      .filter(Boolean);

    // Return the highest-priority match
    for (const typeId of TYPE_PRIORITY) {
      if (matchedTypes.includes(typeId)) {
        return typeId;
      }
    }
    return null;
  } catch (error) {
    console.error('Type detection error:', error);
    return null;
  }
}

// Fetch Wikidata entity claims for a given QID (used for facts and sources)
export async function fetchEntityClaims(qid) {
  try {
    const url = `https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=${qid}&format=json&origin=*`;
    const response = await fetch(url);
    const data = await response.json();
    return data.claims || {};
  } catch (error) {
    console.error('Entity claims fetch error:', error);
    return {};
  }
}

// Fetch facts relevant to an article type from a Wikidata entity
export async function fetchEntityFacts(qid, articleType) {
  const claims = await fetchEntityClaims(qid);
  const facts = [];

  // Property mappings per article type
  const typeProperties = {
    person: {
      P569: 'Date of birth',
      P570: 'Date of death',
      P27: 'Country of citizenship',
      P106: 'Occupation',
      P19: 'Place of birth'
    },
    place: {
      P625: 'Coordinates',
      P17: 'Country',
      P1082: 'Population',
      P36: 'Capital',
      P421: 'Timezone'
    },
    organization: {
      P571: 'Founded',
      P159: 'Headquarters',
      P112: 'Founded by',
      P17: 'Country',
      P856: 'Official website'
    },
    event: {
      P585: 'Date',
      P276: 'Location',
      P17: 'Country',
      P1120: 'Deaths',
      P710: 'Participants'
    }
  };

  const props = typeProperties[articleType] || {};

  for (const [propId, label] of Object.entries(props)) {
    const claim = claims[propId]?.[0];
    if (claim?.mainsnak?.datavalue) {
      const dv = claim.mainsnak.datavalue;
      let value = '';

      if (dv.type === 'wikibase-entityid') {
        // Resolve entity label
        try {
          const entityUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${dv.value.id}&props=labels&languages=en&format=json&origin=*`;
          const resp = await fetch(entityUrl);
          const entityData = await resp.json();
          value = entityData.entities?.[dv.value.id]?.labels?.en?.value || dv.value.id;
        } catch {
          value = dv.value.id;
        }
      } else if (dv.type === 'time') {
        value = dv.value.time?.replace(/^\+/, '').split('T')[0] || '';
      } else if (dv.type === 'quantity') {
        value = dv.value.amount?.replace(/^\+/, '') || '';
      } else if (dv.type === 'string') {
        value = dv.value;
      } else if (dv.type === 'globecoordinate') {
        value = `${dv.value.latitude.toFixed(4)}°, ${dv.value.longitude.toFixed(4)}°`;
      }

      if (value) {
        facts.push({ label, value, property: propId });
      }
    }
  }

  return facts;
}

// Fetch reference URLs (P854) from entity claims for suggested sources
export async function fetchEntitySources(qid) {
  const claims = await fetchEntityClaims(qid);
  const sources = [];

  // Check for P854 (reference URL) in any claims
  for (const [propId, claimList] of Object.entries(claims)) {
    for (const claim of claimList) {
      const refs = claim.references || [];
      for (const ref of refs) {
        const urlSnaks = ref.snaks?.P854 || [];
        for (const snak of urlSnaks) {
          const url = snak.datavalue?.value;
          if (url && !sources.some(s => s.url === url)) {
            sources.push({
              url,
              title: url,
              source: 'Wikidata reference'
            });
          }
        }
      }
    }
  }

  return sources.slice(0, 5);
}
