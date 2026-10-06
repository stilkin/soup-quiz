# Spec Delta

## Purpose

A single, quiet way for players to support development: one external link, placed where it never interrupts gameplay.

## ADDED Requirements

### Requirement: The app offers a quiet support link
The stats screen footer SHALL carry one tertiary-styled support link that opens the
project's support page (Ko-fi) externally. The link SHALL NOT appear in the home menu,
the play flow, or the daily screen, and SHALL NOT interrupt or delay any interaction.

#### Scenario: The link lives in the stats footer
- **WHEN** the stats screen is viewed
- **THEN** a quiet support link is offered alongside the other footer actions

#### Scenario: The link opens externally
- **WHEN** the support link is activated
- **THEN** the support page opens outside the app, with no in-app navigation away from
  the stats screen
