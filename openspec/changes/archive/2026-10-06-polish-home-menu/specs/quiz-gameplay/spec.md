# Spec Delta

## ADDED Requirements

### Requirement: The menu presents destinations as equal tiles

The home screen SHALL present its destinations — the daily challenge, the free-play
mode, and the stats page — as three vertically stacked groups of equal visual weight:
a title in the same type style, a one-line hint, and an action pill, each group tappable
as a whole. The menu SHALL fit without scrolling on normal phone screens, and SHALL
scroll rather than clip or overlap when the content does not fit (small screens, large
accessibility fonts).

#### Scenario: Three equal groups

- **WHEN** the home screen is shown
- **THEN** the daily, the free-play mode, and stats each render with identical
  title/hint/pill treatment, evenly spaced, with no element escaping or overlapping
  another

#### Scenario: Whole group navigates

- **WHEN** the player taps anywhere on a destination group
- **THEN** the app navigates to that destination

#### Scenario: Daily group reflects the day's state

- **WHEN** today's daily is unplayed, solved, or failed
- **THEN** the daily group's hint and action pill wording reflect that state without
  changing the group's styling

#### Scenario: Cramped screens scroll instead of breaking

- **WHEN** the screen is too short for all content (small device or large
  accessibility fonts)
- **THEN** the menu scrolls rather than clipping, crowding, or overlapping

### Requirement: Standard free-play rounds contain five questions

A standard free-play round SHALL present five questions (bounded by dataset size),
ending with the round score after the fifth answer.

#### Scenario: Five bowls a round

- **WHEN** the player starts a free-play round
- **THEN** exactly five questions are served and the score summary follows the fifth

#### Scenario: Menu copy matches the round

- **WHEN** the free-play group is shown
- **THEN** its hint states the round length as five
