# Spec Delta

## ADDED Requirements

### Requirement: The stats screen shows summary and per-country progress
The stats screen SHALL show a summary (rounds played, answers, overall accuracy,
countries discovered out of the dataset's country total, current and best streak) and a
per-country breakdown: flag, country name, accuracy, and answer count. The breakdown
SHALL rank and render only countries with at least three recorded answers, sorted
weakest-first (accuracy ascending); countries below the threshold SHALL NOT render as
placeholder rows. A country counts as discovered when it has at least one recorded
answer.

#### Scenario: Weakest countries surface first
- **WHEN** countries with at least three answers have different accuracies
- **THEN** the breakdown orders them weakest-first

#### Scenario: Small samples stay off the list
- **WHEN** a country has fewer than three recorded answers
- **THEN** no row renders for it, while the discovery count still includes it once it
  has any answer

#### Scenario: Discovery counts countries, not soups
- **WHEN** answers cover 12 distinct countries out of 63 in the dataset
- **THEN** the summary shows a discovery meter of 12 out of 63

## MODIFIED Requirements

### Requirement: Progress is derived, not stored
Aggregates SHALL be computed from the recorded events: per-item seen/correct/last-seen,
per-country seen/correct (an answer counts toward every country listed on its item),
overall accuracy, and counts. The definitions SHALL live in one tested implementation
shared by every view.

#### Scenario: Aggregates reflect the event log
- **WHEN** an item has been answered three times with one miss
- **THEN** its derived row shows seen=3, correct=2, and the accuracy matches

#### Scenario: A multi-country item feeds every listed country
- **WHEN** an item listing two countries is answered once, correctly
- **THEN** both countries' derived rows count one answer, one correct

#### Scenario: Empty state is a valid state
- **WHEN** nothing has been recorded yet
- **THEN** the stats view renders an inviting empty state rather than zeros-as-progress

## REMOVED Requirements

### Requirement: The stats screen shows summary and per-soup progress
**Reason**: the 347-row per-soup list is small-sample noise early in play (nearly every
row reads 0% or 100%) and names the wrong grain — the game trains country recognition,
so progress is shown per country. Mastery indication moves off the screen; per-item
mastery stays derived for the planned SRS scheduling.
**Migration**: none — display-only change. Recorded data, per-item aggregation, and the
summary's accuracy/streak figures are unchanged.
