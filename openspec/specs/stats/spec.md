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
Aggregates SHALL be computed from the recorded events: per-item seen/correct/last-seen, overall accuracy, and counts. The definitions SHALL live in one tested implementation shared by every view.

#### Scenario: Aggregates reflect the event log
- **WHEN** an item has been answered three times with one miss
- **THEN** its derived row shows seen=3, correct=2, and the accuracy matches

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

### Requirement: The stats screen shows summary and per-soup progress
The stats screen SHALL show a summary (rounds played, answers, overall accuracy, soups seen out of total, current and best streak) and a per-soup list sorted weakest-first (accuracy ascending), with an indication of mastery.

#### Scenario: Weakest soups surface first
- **WHEN** soups have different accuracies
- **THEN** the list orders them weakest-first

#### Scenario: Mastery is indicated per soup
- **WHEN** a soup's most recent consecutive correct encounters reach the mastery threshold
- **THEN** the soup is marked as mastered in the list

### Requirement: The player can clear recorded stats
The stats screen SHALL offer a confirmed action that deletes all recorded rounds and answers. Confirmation SHALL be explicit; the action SHALL result in the empty state.

#### Scenario: Clearing empties everything
- **WHEN** the player confirms the clear action
- **THEN** no rounds or answers remain and the stats screen shows the empty state
