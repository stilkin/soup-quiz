# dataset-pipeline Specification

## Purpose

Turning cached Wikipedia snapshots into the shipped dataset: corpus identity, structured extraction with fallbacks, the review/override workflow for gaps, image mirroring with credit, and the run guarantees (idempotence, validation gating, pairing) the app relies on.

## Requirements

### Requirement: Corpus identity is deterministic and cached
The pipeline SHALL build the soup corpus from the list snapshots in `data/raw/wikipedia/`, resolving titles to pageids (following redirects) and recording each soup's source lists. Resolution results SHALL be cached so re-runs do not refetch. Entries that no longer resolve SHALL be reported, not silently dropped.

#### Scenario: Re-run resolves nothing new
- **WHEN** the pipeline runs twice with the same snapshots and a warm cache
- **THEN** the second run makes no resolution requests and yields the same corpus

#### Scenario: Unresolvable entries are visible
- **WHEN** a linked title no longer exists on Wikipedia
- **THEN** it appears in the run report as unresolved

### Requirement: Field extraction uses a fallback chain
For each soup, each field (countries, region, types, ingredients, image, description) SHALL be filled from the first source that provides it: detail-article food infobox (`{{Infobox food}}` or `{{Infobox prepared food}}`), then the source-list entry, then nothing (flagged for review). For the image field, a bare lead `[[File:…]]` photo SHALL be a last-resort fallback, and such soups SHALL be flagged for review. Extracted values SHALL be raw until normalization.

#### Scenario: Infobox wins when present
- **WHEN** a soup's article has a food infobox with main_ingredient
- **THEN** that value is used for ingredients and the fallback is not consulted

#### Scenario: Prepared-food infoboxes are parsed
- **WHEN** a soup's article uses `{{Infobox prepared food}}` with an image and main_ingredient
- **THEN** those fields are extracted exactly as from `{{Infobox food}}`

#### Scenario: Lead-photo fallback is reviewable
- **WHEN** a soup has no infobox image but its lead section shows a file
- **THEN** that photo becomes the image candidate and the soup is flagged as lead-photo sourced

#### Scenario: Missing infobox falls back to the list
- **WHEN** a soup has no food infobox but its source list describes it
- **THEN** list-derived candidates fill the field and the soup is flagged as list-sourced

### Requirement: Normalization maps human values to the contract
Country names SHALL be normalized to ISO alpha-2 via a lookup plus a committed alias table (e.g. Turkey, Russia, Scotland, England, Wales, Korea); values that stay unmapped SHALL flag the soup. Soup types SHALL be mapped through a committed mapping table to the schema vocabulary; unmapped values flag the soup. Ingredient candidates SHALL be canonicalized through a seed lexicon, with unknown candidates flagged rather than invented.

#### Scenario: Aliases resolve to ISO codes
- **WHEN** an infobox says the country is Turkey or Scotland
- **THEN** the item carries TR, or GB plus region Scotland, respectively

#### Scenario: Unmappable values surface in review
- **WHEN** a soup's origin is a people or diaspora term
- **THEN** the soup is flagged for review with the raw value preserved

### Requirement: Gaps are closed through a review/override workflow
Every gap or flag SHALL be emitted into a review file. Manual answers SHALL live in a committed overrides file that wins over all automatic sources at compile time. The compiled dataset SHALL contain no unresolved flags.

#### Scenario: Overrides win
- **WHEN** an override exists for a soup's country
- **THEN** the compiled item uses the override value regardless of automatic extraction

#### Scenario: Flags must be resolved before shipping
- **WHEN** the compile step finds a soup with unresolved flags
- **THEN** that soup is excluded from the dataset and reported, unless an override resolves it

### Requirement: Non-soup entries are filtered
List links that resolve to non-dish articles (species, places, techniques) SHALL be flagged by a relevance heuristic and excluded unless an override marks them as soups.

#### Scenario: A linked city is not a soup
- **WHEN** a list links an article that is a place or species
- **THEN** it is excluded from the dataset and listed in the run report

### Requirement: Images are mirrored, credited, and paired
For each soup with an image, the pipeline SHALL fetch the Commons file's credit metadata and a thumbnail, re-encode it to the target size/quality, and write it to the app's asset directory with a manifest entry. Commons file titles SHALL be canonicalized (underscores to spaces) before metadata lookup. The dataset, asset directory, and manifest SHALL agree exactly; a mismatch SHALL fail validation.

#### Scenario: Underscored filenames still resolve
- **WHEN** wikitext names an image as `Avgolemono_soup.jpg`
- **THEN** the Commons lookup uses the canonical title and the credit is found

#### Scenario: Pairing holds
- **WHEN** the dataset references an image
- **THEN** the asset file and manifest entry exist with the same id, and every asset has a dataset item

#### Scenario: Credit is mandatory
- **WHEN** Commons metadata lacks author or license
- **THEN** the image is not shipped and the soup is flagged

### Requirement: The compiled dataset gates on the schema contract
Compilation SHALL emit the dataset only after it passes the JSON-Schema contract and the app-side `validateDataset`; the run report SHALL state corpus size, shipped count, and per-field coverage.

#### Scenario: Invalid output never ships
- **WHEN** a compiled item violates the item schema
- **THEN** compilation fails with the item id and field, and no dataset is written

#### Scenario: The app consumes the pipeline output directly
- **WHEN** compilation succeeds
- **THEN** `packages/data` exports the new dataset and its tests pass unchanged
