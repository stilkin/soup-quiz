# daily-challenge Specification

## Purpose

The one-a-day ritual: a deterministic soup per UTC day for everyone, revealed as a four-tier clue ladder with search-select country guessing and distance-based heat feedback, scored, streaked, shareable without spoilers, and optionally announced by a local notification.

## Requirements

### Requirement: The daily soup is deterministic per UTC day
The system SHALL derive exactly one soup per UTC calendar day as a pure function of the day number and the dataset version: a stable candidate pool (items with an image and at least two ingredients) in a stable order, indexed by the day number, reshuffled once per full cycle. Derivation SHALL use no stored state and no network.

#### Scenario: Same day, same soup
- **WHEN** two players open the daily on the same UTC day with the same dataset version
- **THEN** both play the same soup with identical clues

#### Scenario: No repeat within a cycle
- **WHEN** the daily is derived over consecutive days of one cycle
- **THEN** no soup appears twice before the pool is exhausted

#### Scenario: A new cycle reshuffles
- **WHEN** the day number crosses a cycle boundary
- **THEN** the next cycle visits the pool in a different order

### Requirement: Clues reveal in four tiers
The daily SHALL reveal its clues in four fixed tiers: the image, then the first half of the ingredients, then the remaining ingredients, then the soup's name. A tier SHALL advance only on a committed wrong guess; no skip or free-reveal control SHALL exist. Ingredient halves SHALL be deterministic for the day.

#### Scenario: Tiers arrive in order
- **WHEN** the player commits wrong guesses
- **THEN** each one reveals exactly the next tier, in the fixed order

#### Scenario: Advancing costs a guess
- **WHEN** the player wants more clues but has not committed a guess
- **THEN** no control reveals the next tier

#### Scenario: Halves are identical for everyone
- **WHEN** the same daily is derived twice
- **THEN** the ingredient split into halves is the same

### Requirement: Guesses are country selections from the full registry
The player SHALL commit a guess by selecting a country from a searchable list over the full country registry. One selection SHALL commit exactly one guess at the current tier. A guess SHALL be correct if and only if it equals any of the item's countries.

#### Scenario: Search-select commits one guess
- **WHEN** the player selects a country from the filtered list
- **THEN** exactly one guess is committed at the current tier

#### Scenario: Browsing commits nothing
- **WHEN** the player types or scrolls the suggestion list without selecting
- **THEN** no guess is committed

#### Scenario: Any of a multi-country soup's countries counts
- **WHEN** the soup has several countries and the player commits any one of them
- **THEN** the guess is correct

### Requirement: Wrong guesses get distance-based heat feedback
A committed wrong guess SHALL be answered with one of five heat bands — hot, warm, lukewarm, cold, ice cold — derived from the great-circle distance between country centroids, taken as the minimum over the item's countries. The centroid table SHALL cover every registry country, and the band thresholds SHALL be versioned constants. Distances SHALL follow the great circle, remaining correct across the antimeridian.

#### Scenario: Heat reflects the nearest of the soup's countries
- **WHEN** a soup has countries A and B and the guess is nearer to B
- **THEN** the band reflects the distance to B

#### Scenario: The centroid table is complete
- **WHEN** the centroid registry is validated
- **THEN** every country in the country registry has a centroid

#### Scenario: Distance is correct across the date line
- **WHEN** a guess and the soup's country straddle the antimeridian
- **THEN** the distance is the short great-circle arc, not the long way around

### Requirement: The day ends solved or failed
A correct guess at tier N SHALL solve the day with score N (1–4). A wrong guess at tier 4 SHALL fail the day. The outcome SHALL be recorded as one finished round of kind `daily` with one answer row per committed guess; the round's correct count SHALL encode the solving tier, zero for a failed day.

#### Scenario: Solving at the photo tier scores one
- **WHEN** the first committed guess is correct
- **THEN** the day is solved with score 1

#### Scenario: Wrong at the name tier fails the day
- **WHEN** the fourth tier's committed guess is wrong
- **THEN** the day is failed with score 0 and the soup is revealed

#### Scenario: The daily plays once per day
- **WHEN** the day's daily is already finished and the player returns
- **THEN** the result is shown and no new guesses can be committed

### Requirement: Results are shareable without spoilers
After the day is solved or failed, the system SHALL offer a plain-text share result containing the day number, the score tier, and the daily streak — and nothing that reveals the soup or its country. The day number SHALL derive from a frozen launch anchor committed in the code.

#### Scenario: The share text leaks nothing
- **WHEN** the share result is composed
- **THEN** it contains score, streak, and day number only

#### Scenario: Day numbers are stable
- **WHEN** the app version changes after launch
- **THEN** the same UTC day still maps to the same day number

### Requirement: A local notification can announce the daily
The system SHALL offer an optional daily local notification at a user-chosen hour, toggleable on the daily screen, scheduled on-device without network. The notification SHALL reference the daily generically, not reveal the soup. Declining notification permission SHALL not affect any other behavior.

#### Scenario: The nudge respects the chosen hour
- **WHEN** notifications are enabled for a chosen hour
- **THEN** the reminder fires daily at that local hour

#### Scenario: Declining permission disables only the nudge
- **WHEN** the OS notification permission is denied
- **THEN** the daily remains fully playable and the toggle reflects the unavailable state

### Requirement: Today's state is visible until rollover
The daily screen SHALL show the day's state — unplayed, solved (with score, share, and streak), or failed — together with a countdown to UTC midnight. After rollover a new day SHALL begin automatically.

#### Scenario: A finished day shows its outcome
- **WHEN** the player returns after finishing the daily
- **THEN** the outcome, share action, and streak are shown with no input available

#### Scenario: Rollover starts a fresh day
- **WHEN** UTC midnight passes while the app is open or between sessions
- **THEN** the next visit presents the new day's soup
