# Spec Delta

## MODIFIED Requirements

### Requirement: Answering reveals item details
After a question is answered, the system SHALL show whether the answer was correct and reveal the item's identity, a short description, its source link, and — when the item has an image — the image with its credit line. Once answered, the answer options SHALL compact from full choices into a single-row strip of tiles that marks the correct option, the picked-wrong option if any, and the remaining options, and the question's ingredient list SHALL collapse to its prompt row, expandable on demand.

#### Scenario: Feedback after answering
- **WHEN** the player submits an answer
- **THEN** correct/incorrect state is shown along with the item's name, description, learn-more link, and, if the item has one, its credited image

#### Scenario: Options compact into a feedback strip
- **WHEN** the player submits an answer
- **THEN** the options collapse into one row of tiles marking the correct option and the picked-wrong option, and the reveal is reachable without scrolling past a full option list

#### Scenario: Screen readers still hear every option
- **WHEN** the compacted strip is rendered
- **THEN** each tile carries the option's name and its state (correct, wrong pick, or unused) as its accessibility label

#### Scenario: Ingredient list collapses but stays reachable
- **WHEN** the player submits an answer
- **THEN** the ingredient list collapses to its prompt row, and activating that row expands the list again

#### Scenario: Each question starts collapsed
- **WHEN** a new question is presented and answered
- **THEN** its ingredient list defaults to collapsed, regardless of toggles on earlier questions
