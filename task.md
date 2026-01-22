= Task: Title Entry and Topic Matching (Design Spec) =

== Overview ==
Step 1 of the Article Creation Guidance flow. Mobile-first and responsive.
Related: T414409.

== Entry point ==
User taps "Create article" and lands on Title Entry.

== Design goals ==
* Help users confirm what they want to write about.
* Make it easy to pick the right topic and avoid duplicates.
* Move users forward with confidence.

== Core flow ==
# User types a title.
# System shows a short list of topics (best match + alternatives).
# User selects a topic and moves forward.
# If the topic already has an article, show a warning with choices.

== Screens to design ==
Design these screens/states (mobile-first, plus responsive):
* Initial / empty state.
* Loading state (search in progress).
* Results list (best match + alternatives).
* No results state.
* Error state.
* Selected state (brief highlight + transition).
* Existing article warning (modal or sheet).
* RTL variant for the main screen and warning.

== Figma build (Codex) ==
Use Wikimedia Codex components and tokens. Keep everything on a 1-column layout.

=== Figma setup ===
* Use the Codex Figma library (Wikimedia Codex).
* Create pages: Screens, Components, Notes.
* Frames:
** Mobile: 360x800 (primary).
** Tablet: 768x1024.
** Desktop: 1280x800.
* Layout grid:
** Mobile: 16px margins, 12px gutter.
** Tablet/Desktop: centered column, 600-720px width.

=== Component mapping ===
* Header: CdxIcon (`cdxIconArrowPrevious`) + title text.
* Input + suggestions: CdxLookup (predictive input with menu).
* Results list: CdxMenu + CdxMenuItem.
* Result thumbnail: CdxThumbnail (40px).
* Result title: CdxSearchResultTitle (highlight query).
* Result description: body small text.
* Badges: CdxInfoChip.
  * Best match = status `notice`.
  * Article exists = status `warning`.
  * Disambiguation = status `notice` (or no badge if space is tight).
* "My topic isn't listed": CdxButton (quiet).
* Error inline: CdxMessage (type `error`, inline).
* Existing article warning: CdxDialog + CdxButton (primary + quiet).

=== Icons (Codex) ===
* Back: `cdxIconArrowPrevious`
* Search (input start icon): `cdxIconSearch`
* Clear (input): `cdxIconClear`
* Warning: `cdxIconAlert`
* Article exists (optional): `cdxIconArticleCheck`
* Disambiguation (optional): `cdxIconArticleDisambiguation`

=== Tokens to use (from codex-design-tokens) ===
Spacing:
* `--spacing-100` = 16px (page padding)
* `--spacing-75` = 12px (row vertical padding)
* `--spacing-50` = 8px (gap between thumbnail and text)
* `--spacing-150` = 24px (space between sections)

Typography:
* Prompt: `--font-size-x-large` (1.25rem), `--font-weight-bold`
* Input/body: `--font-size-medium` (1rem), `--line-height-medium`
* Description: `--font-size-small` (0.875rem), `--color-subtle`

Color + borders:
* Page: `--background-color-base`
* Text: `--color-base`
* Placeholder: `--color-placeholder`
* Dividers: `--border-color-subtle`, `--border-width-base`
* Hover row: `--background-color-interactive-subtle--hover`
* Warning surface (modal): `--background-color-warning-subtle`

Sizes:
* Touch targets: `--min-size-interactive-touch` = 44px
* Thumbnail: `--min-size-search-figure` = 40px
* Radius: `--border-radius-base` = 2px

=== Build steps in Figma ===
# Create a base mobile frame (360x800). Add a vertical Auto Layout container
  with 16px padding (`--spacing-100`) and 24px gaps (`--spacing-150`).
# Add the header row: back icon + title text. Add a 1px divider below.
# Add the prompt block: title + helper text with 8px gap (`--spacing-50`).
# Add the input: CdxLookup with search icon and clear icon. Width = 100%.
# Add the results list container (Auto Layout, vertical).
# Build a result row component:
## Horizontal Auto Layout: thumbnail + text stack + optional badge.
## Thumbnail = 40px (`--min-size-search-figure`).
## Text stack: title (bold) + description (small).
## Row padding: 12px vertical (`--spacing-75`), 16px horizontal (`--spacing-100`).
# Add "My topic isn't listed" as a quiet button at the end of the list.
# Duplicate the base frame into states:
## Empty: no results list, helper text visible.
## Loading: spinner in input + skeleton rows.
## Results: show 3-7 rows (best match + alternatives).
## No results: message + "Create article for '{title}'".
## Error: inline error message + "Try again".
## Selected: row highlight + short loading indicator.
## Existing article warning: CdxDialog overlay.
# Create RTL variants of the main screen and warning:
## Mirror layout, swap icon positions, right-align text.
# Create tablet/desktop frames:
## Set width to 768/1280.
## Center the content column (600-720px).
## Increase side padding to 32px (`--spacing-200`).

== Layout ==
=== Mobile ===
* Full screen page.
* Header: back arrow + title ("New article").
* Large prompt: "What are you writing about?"
* Input field with placeholder.
* Results list under the input.
* "My topic isn't listed" action at the end of the list or sticky footer.

=== Tablet/desktop ===
* Single centered column (600-720px wide).
* Keep results below the input (no side-by-side panels).

== Components ==
=== Header ===
* Back arrow + title.

=== Prompt + input ===
* Placeholder: "Enter article title".
* Clear icon appears when there is text.
* Loading indicator appears while searching.
* Uses search keyboard on mobile.

=== Results list ===
* Show 3-7 items.
* Each row includes:
** Thumbnail (40x40) or fallback icon.
** Title (bold).
** Short description (lighter text).
** Optional badges: Best match, Article exists, Disambiguation.

=== "My topic isn't listed" ===
* Secondary action at list end or sticky footer.

== Interaction details ==
* Debounce typing (300ms).
* Wait for IME composition to finish before searching.
* Selecting a result advances to the next step.

== States ==
* Empty:
** No helper text shown.
* Loading:
** Spinner in input or skeleton rows.
* Results:
** Best match + alternatives.
* No results:
** "No matches found." + "Create article for '{title}'".
* Error:
** "Could not search topics. Check your connection." + "Try again".
* Selected:
** Row highlight, then transition to next step.

== Existing article warning ==
If the selected topic already exists on the target wiki:
* Title: "This article already exists".
* Body: "You can edit the existing article or continue to create a new one."
* Actions:
** Primary: "Edit existing article"
** Secondary: "Continue anyway"

== Copy (placeholders) ==
* Title prompt: "What are you writing about?"
* Placeholder: "Enter article title"
* Helper text: (none)
* Best match: "Best match"
* Article exists: "Article exists"
* Disambiguation: "Disambiguation"
* No results: "No matches found."
* Create new: "Create article for '{title}'"
* Existing article title: "This article already exists"
* Existing article body: "You can edit the existing article or continue to create a new one."
* Edit action: "Edit existing article"
* Continue action: "Continue anyway"

== Accessibility ==
* Input supports list autocomplete for screen readers.
* Results are announced to screen readers.
* Rows are keyboard selectable on desktop.
* Touch targets are at least 44x44px.
* Text contrast meets WCAG AA.

== i18n considerations ==
* Use the target wiki content language for all copy.
* Support RTL with auto direction and mirrored layout.
* Avoid capitalization styles that break IME input.
* Use plural-safe strings (CLDR).
* Support script-aware truncation.

== Open questions ==
* How many results on mobile: 3, 5, or 7?
* Minimum query length for non-space languages?
* Should "My topic isn't listed" show before any results or only after?







