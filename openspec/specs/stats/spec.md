# stats Specification

## Purpose

Local recording of play activity and the derived progress views: what gets stored when a round finishes, how progress and streaks are defined, and what the player can see.

## Requirements

### Requirement: Finished rounds are recorded on-device
When a round finishes, the system SHALL store the round (mode, seed, length, correct count, UTC finish timestamp, kind) and its answers (item, correctness, UTC timestamp) in local storage. Recording SHALL NOT block or interrupt the play flow; a failed recording SHALL NOT affect gameplay.

#### Scenario: A finished round appears in storage
- **WHEN** a round is completed
- **THEN** one round row and one row per answered question exist with UTC timestamps

#### Scenario: Recording failure does not break play
- **WHEN** storing a finished round fails
- **THEN** the round result screen still shows and no error surfaces to the player

### Requirement: Progress is derived, not stored
Aggregates SHALL be computed from the recorded events: per-item seen/correct/last-seen, per-country seen/correct (an answer counts toward every country listed on its item), overall accuracy, and counts. The definitions SHALL live in one tested implementation shared by every view.

#### Scenario: Aggregates reflect the event log
- **WHEN** an item has been answered three times with one miss
- **THEN** its derived row shows seen=3, correct=2, and the accuracy matches

#### Scenario: A multi-country item feeds every listed country
- **WHEN** an item listing two countries is answered once, correctly
- **THEN** both countries' derived rows count one answer, one correct

#### Scenario: Empty state is a valid state
- **WHEN** nothing has been recorded yet
- **THEN** the stats view renders an inviting empty state rather than zeros-as-progress

### Requirement: Day streaks are computed in UTC
A day counts toward a streak when at least one round finished on that UTC calendar day. The system SHALL report the current streak and the best streak.

#### Scenario: Consecutive UTC days extend the streak
- **WHEN** rounds finish on consecutive UTC days
- **THEN** the current streak counts each day once

#### Scenario: A missed UTC day breaks the streak
- **WHEN** a UTC day passes with no finished round between two active days
- **THEN** the current streak restarts from the later activity

#### Scenario: Streaks cross midnight boundaries correctly
- **WHEN** a round finishes at 23:59 UTC and another at 00:01 UTC the next day
- **THEN** both days count and the streak is two days

### Requirement: The stats screen shows summary and per-country progress
The stats screen SHALL show a summary (rounds played, answers, overall accuracy, countries discovered out of the dataset's country total, current and best streak) and a per-country breakdown: flag, country name, accuracy, and answer count. The breakdown SHALL rank and render only countries with at least three recorded answers, sorted weakest-first (accuracy ascending); countries below the threshold SHALL NOT render as placeholder rows. A country counts as discovered when it has at least one recorded answer.

#### Scenario: Weakest countries surface first
- **WHEN** countries with at least three answers have different accuracies
- **THEN** the breakdown orders them weakest-first

#### Scenario: Small samples stay off the list
- **WHEN** a country has fewer than three recorded answers
- **THEN** no row renders for it, while the discovery count still includes it once it has any answer

#### Scenario: Discovery counts countries, not soups
- **WHEN** answers cover 12 distinct countries out of 63 in the dataset
- **THEN** the summary shows a discovery meter of 12 out of 63

### Requirement: The player can clear recorded stats
The stats screen SHALL offer a confirmed action that deletes all recorded rounds and answers. Confirmation SHALL be explicit; the action SHALL result in the empty state.

#### Scenario: Clearing empties everything
- **WHEN** the player confirms the clear action
- **THEN** no rounds or answers remain and the stats screen shows the empty state
