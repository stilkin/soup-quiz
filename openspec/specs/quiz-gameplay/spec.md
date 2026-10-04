# quiz-gameplay Specification

## Purpose

Playable quiz rounds generated from a conforming dataset: question generation with plausible distractors, answer checking against 1..n fields, feedback, and scoring.

## Requirements

### Requirement: Multiple-choice questions are generated from dataset items
For a configured mode, the engine SHALL generate a question from a dataset item: a prompt built from the item's fields (e.g. its ingredient list) and a fixed number of answer options containing exactly one correct answer and distractors drawn from other items' answers.

#### Scenario: Correct answer always present
- **WHEN** a question is generated
- **THEN** the correct answer is among the options

#### Scenario: Distractors are distinct
- **WHEN** options are generated
- **THEN** no distractor equals the correct answer or another distractor

#### Scenario: Item skipped when distractors are insufficient
- **WHEN** an item's correct answer cannot be surrounded by enough distinct distractors from the dataset
- **THEN** that item is not used for that question

### Requirement: Rounds are deterministic for a seed
Given the same dataset and the same seed, the engine SHALL produce the same round: same items, same order, same option order. Different seeds SHOULD produce different rounds.

#### Scenario: Replaying a seed reproduces the round
- **WHEN** the same seed is used twice against the same dataset
- **THEN** both rounds are identical

### Requirement: Answer checking honors 1..n fields
An answer SHALL be judged correct if and only if it equals any of the item's values for the asked field (e.g. any of a multi-origin item's countries).

#### Scenario: Either origin of a multi-origin item counts
- **WHEN** an item has two countries of origin and the player picks either one
- **THEN** the answer is correct

### Requirement: A round presents questions sequentially with a final score
A round SHALL present its questions one at a time, accept exactly one answer per question, and end with a score summary of the round.

#### Scenario: One answer per question
- **WHEN** a question has been answered
- **THEN** further answer selections for that question are ignored

#### Scenario: Round ends with a score
- **WHEN** the last question is answered
- **THEN** the player sees the number of correct answers out of questions asked

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
