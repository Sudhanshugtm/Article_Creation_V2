# Article Creation - Mobile Editing Interface

## Overview
Mobile-first Wikipedia article editor with guided templates for newcomer editors. Focus: animal articles (WikiProject Primates).

**Status:** Phase 1 complete - Basic placeholder insertion works ✅

## Tech Stack
- Vanilla HTML/CSS/JavaScript (no frameworks)
- Codex Design System v2.3.2 (Wikimedia)
- Dev server: `python3 -m http.server 8000`

## Key Files
- `index.html` - UI structure (3 screens)
- `script.js` - All logic (954 lines)
- `styles.css` - Mobile-first styling
- `tiger_templates.json` - Template definitions + data

## Current Features

### Working ✅
- Article title input with topic matching
- Category selection (nested drill-down)
- Section management (add/remove via outline)
- Template insertion (Short overview, Taxonomy, etc.)
- Auto-resize textareas, cursor positioning
- Verified facts from Wikidata

### User Flow
1. Enter title → Topic matches appear
2. Select category (Animal → Mammals)
3. Editor opens with lead section
4. Click "Get suggested contents"
5. Click ➕ on "Short overview" → Template inserts:
   ```
   The [animal name] is a [type of animal] native to [broad region] 📎 [Add source].
   It is known for [Key distinctive feature] 📎 [Add source].
   ```
6. Fill placeholders, add citations

## Templates (tiger_templates.json)

### Structure
```json
{
  "interactive_lead_templates": {
    "short_overview": {
      "structure": {
        "sentence_1": {
          "template": "The {field1} is a {field2}...",
          "fields": {
            "field1": {
              "type": "text",
              "required": true,
              "requires_source": true,
              "validation": "...",
              "help_text": "..."
            }
          }
        }
      }
    }
  }
}
```

### Available Templates
**Lead:** Short overview, Taxonomy in brief
**Characteristics:** Physical description, Size/weight, Coat/coloration
**Distribution:** Geographic range, Habitat, Population
**Behavior:** Diet/hunting, Social structure, Reproduction

## Gap: Current vs Vision

| Feature | Now (Phase 1) | Vision (Phase 4) |
|---------|---------------|------------------|
| Insertion | Static text | Interactive form |
| [Add source] | Plain text | Clickable button |
| Validation | None | Inline, real-time |
| Help | None | Per-field tooltips |
| Preview | None | Live assembly |
| Sources | None | Counter + enforcement |

## Vision: Interactive Templates

### Current (Phase 1)
Click "Short overview" → Static placeholder text inserted

### Vision (Phase 4)
Click "Short overview" → Expand to interactive form:
```
✏️ Short overview (Editing)

Sentence 1: Definition
───────────────────
The [input: Siberian tiger] ℹ️
is a [input: population of...] ℹ️
     📎 Source required ⚠️
     [+ Add citation] ← CLICKABLE
native to [input: Northeast China...]

Preview: "The Siberian tiger..."
Sources: 0/3 ⚠️
[Cancel] [Save]
```

## Implementation Phases

**Phase 1:** ✅ Basic placeholders (DONE)
**Phase 2:** Clickable [Add source] (1-2 days)
**Phase 3:** Citation dialog (2-3 days)
**Phase 4:** Interactive forms (1-2 weeks)
**Phase 5:** Advanced features (2-4 weeks)

**Total to vision:** ~6 weeks (1 developer)

## Key Functions (script.js)

```javascript
handleInsertSuggestion(title, section)  // Inserts template
getTemplateContent(title)                // Maps title → text
handleInsertFact(fact, section)          // Inserts verified facts
createSectionBlock(name, desc)           // Adds new sections
updateEditingPanelContent(section)       // Syncs panel
```

## Next Steps

### Quick Wins
1. Load templates from JSON (currently hardcoded)
2. Style [Add source] (gray bg, hover)
3. Click detection on [Add source]

### Major
1. Replace `<textarea>` with `contenteditable`
2. Citation dialog component
3. Interactive template form
4. Validation engine
5. Live preview

## Design System (Codex)

### Tokens Used
- Colors: `--color-*`, `--background-color-*`
- Typography: `--font-family-serif` (articles), `--font-family-system-sans` (UI)
- Spacing: `--size-*` (50, 100, 200, 300...)
- Icons: `/node_modules/@wikimedia/codex-icons/dist/images/*.svg`

### Breakpoints
- Mobile: 320px
- Tablet: 640px
- Desktop: 1120px

### Custom Colors
- Wikidata facts border: `#D1E9D2` (lime)

## Technical Notes

### Why Textareas Limit Us
- `<textarea>` = plain text only
- Can't style parts or embed clickable elements
- **Solution:** Use `contenteditable` div for Phase 2+

### Template Loading (TODO)
```javascript
// Current: Hardcoded in getTemplateContent()
// Future: Load from tiger_templates.json
const data = await fetch('tiger_templates.json').then(r => r.json());
```

### Citation Storage (TODO)
```javascript
citations = [
  { id: 1, title: '...', url: '...', year: 2022 }
];
// Insert as: "...native to China[1]..."
```

## Goals (Success Metrics)
- 70% completion rate (vs 40% baseline)
- 20min avg time (vs 30min)
- 80% proper citations (vs 30%)
- 50% less cleanup for experienced editors

## Browser Support
✅ Chrome, Safari, Firefox, Mobile Safari, Chrome Mobile

---

**Ready for:** Newcomer testing (Phase 1)
**Next milestone:** Clickable citations (Phase 2)
