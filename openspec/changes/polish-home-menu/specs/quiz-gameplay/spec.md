# Spec Delta

## ADDED Requirements

### Requirement: The menu presents destinations as equal cards

The home screen SHALL present its destinations — the daily challenge, the free-play
mode, and the stats page — as equally sized cards stacked vertically, sharing one card
style. Each card SHALL carry a title in the same type style, a one-line hint, and an
action pill, and the whole card SHALL be tappable.

#### Scenario: Three equal cards

- **WHEN** the home screen is shown
- **THEN** the daily, the free-play mode, and stats each occupy an equal share of the
  menu area with identical card styling, titles, and action pills

#### Scenario: Whole card navigates

- **WHEN** the player taps anywhere on a destination card
- **THEN** the app navigates to that destination

#### Scenario: Daily card reflects the day's state

- **WHEN** today's daily is unplayed, solved, or failed
- **THEN** the daily card's hint and action pill wording reflect that state without
  changing the card's size or styling

### Requirement: Standard free-play rounds contain five questions

A standard free-play round SHALL present five questions (bounded by dataset size),
ending with the round score after the fifth answer.

#### Scenario: Five bowls a round

- **WHEN** the player starts a free-play round
- **THEN** exactly five questions are served and the score summary follows the fifth

#### Scenario: Menu copy matches the round

- **WHEN** the free-play card is shown
- **THEN** its hint states the round length as five
