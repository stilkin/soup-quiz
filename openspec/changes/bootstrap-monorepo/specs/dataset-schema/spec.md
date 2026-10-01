# Spec Delta

## Purpose

Defines the validated data contract for quiz items: the single shape every dataset — stub or pipeline-produced — must conform to before it can ship inside an app.

## ADDED Requirements

### Requirement: Item identity is stable and linkable
Each item SHALL have a unique stable identifier and a source URL (per-item attribution / "learn more" link). Identifiers SHALL be immutable across dataset versions.

#### Scenario: Duplicate identifiers rejected
- **WHEN** a dataset contains two items with the same identifier
- **THEN** validation fails and names the duplicated identifier

#### Scenario: Every item carries a learn-more destination
- **WHEN** an item is validated
- **THEN** it has a well-formed source URL that can be opened externally

### Requirement: Origin is a normalized 1..n list
Each item SHALL carry one or more normalized origins (country or region codes). An item MAY have several origins; a single free-text origin field SHALL NOT be used.

#### Scenario: Multi-country item is valid
- **WHEN** an item lists two countries of origin
- **THEN** validation passes and both origins are available to quiz modes

#### Scenario: Zero origins rejected
- **WHEN** an item has an empty origin list
- **THEN** validation fails

### Requirement: Soup type is a normalized 1..n list
Each item SHALL carry one or more type values from a controlled vocabulary owned by the schema (e.g. broth, potage, stew, cold soup). Values outside the vocabulary SHALL be rejected.

#### Scenario: Multiple types are valid
- **WHEN** an item is tagged as both a stew and a noodle soup
- **THEN** validation passes

#### Scenario: Unknown type rejected
- **WHEN** an item uses a type value not in the controlled vocabulary
- **THEN** validation fails and names the offending value

### Requirement: Ingredients are a non-empty canonical list
Each item SHALL list one or more ingredients, each with a canonical identifier used for matching across items, and a human-readable display name. Canonical identifiers SHALL be unique within an item.

#### Scenario: Ingredient canonicalization enables matching
- **WHEN** two items both reference chicken under different display spellings
- **THEN** they share the same canonical ingredient identifier

#### Scenario: Empty or duplicated ingredient list rejected
- **WHEN** an item has no ingredients, or repeats a canonical identifier
- **THEN** validation fails

### Requirement: Images are optional but always credited
An item MAY carry one image. When present, it SHALL include the Commons source file name and a self-contained credit (author, license name, license URL). Images are bundled app assets — the dataset SHALL NOT reference external image hosting — so attribution and display work fully offline.

#### Scenario: Image without credit rejected
- **WHEN** an item has an image lacking author, license, or license URL
- **THEN** validation fails and names the item

#### Scenario: Attribution works offline
- **WHEN** an item with an image is displayed with no network access
- **THEN** the image loads from the app bundle and the full credit (author, license, deed link target) comes from the dataset itself

### Requirement: Datasets validate before use
Every dataset shipped to an app SHALL pass validation against the item schema; validation failures SHALL fail the build or test run, not surface at runtime.

#### Scenario: Invalid item fails with a usable error
- **WHEN** a dataset contains an item violating any field requirement
- **THEN** validation reports the item identifier and the failing field

### Requirement: JSON Schema contract is exported
The schema SHALL be exported as a JSON Schema document equivalent to the app-side validation, so external pipelines (Python) validate against the same contract.

#### Scenario: Pipeline and app accept the same items
- **WHEN** a dataset is validated against the exported JSON Schema and against the app-side schema
- **THEN** both accept and reject the same items
