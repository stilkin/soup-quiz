# Spec Delta

## ADDED Requirements

### Requirement: Daily streaks count consecutive solved dailies
A UTC day SHALL count toward the daily streak when that day's daily challenge was solved. The system SHALL report the current and best daily streak derived from recorded daily rounds, alongside and independently of the any-round streak.

#### Scenario: Solved dailies on consecutive days extend the streak
- **WHEN** the daily is solved on consecutive UTC days
- **THEN** the daily streak counts each day once

#### Scenario: A missed or failed day breaks the streak
- **WHEN** a UTC day passes without a solved daily, or the day's daily is failed
- **THEN** the current daily streak restarts from the next solved day

#### Scenario: Free rounds do not extend the daily streak
- **WHEN** a player finishes free-play rounds but not the daily
- **THEN** the daily streak is unaffected while the any-round streak may grow
