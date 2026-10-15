# Spec Delta

## MODIFIED Requirements

### Requirement: The stats screen shows summary and per-country progress
The stats screen SHALL show a summary (rounds played, answers, overall accuracy, countries discovered out of the dataset's country total, current and best streak) and a per-country breakdown: flag, country name, accuracy, and answer count. The breakdown SHALL rank and render only countries with at least three recorded answers, sorted weakest-first (accuracy ascending); countries below the threshold SHALL NOT render as placeholder rows. A country counts as discovered when it has at least one recorded answer. While the summary is populated and no country has reached the ranking threshold, the screen SHALL explain the threshold in place of the breakdown instead of rendering nothing.

#### Scenario: Weakest countries surface first
- **WHEN** countries with at least three answers have different accuracies
- **THEN** the breakdown orders them weakest-first

#### Scenario: Small samples stay off the list
- **WHEN** a country has fewer than three recorded answers
- **THEN** no row renders for it, while the discovery count still includes it once it has any answer

#### Scenario: Discovery counts countries, not soups
- **WHEN** answers cover 12 distinct countries out of 63 in the dataset
- **THEN** the summary shows a discovery meter of 12 out of 63

#### Scenario: The ranking threshold is explained before it is met
- **WHEN** at least one round is recorded and no country has reached the ranking threshold
- **THEN** the stats screen shows a hint naming the threshold in place of the breakdown
