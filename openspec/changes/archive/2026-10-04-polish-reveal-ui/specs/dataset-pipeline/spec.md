# Spec Delta

## ADDED Requirements

### Requirement: Bundled images carry a uniform color treatment
The pipeline SHALL apply one committed color treatment — a light warm, faded profile — to every bundled image at re-encode time, so all shipped photos share a consistent look regardless of the original photographer's white balance. Treatment parameters SHALL live in the pipeline as versioned constants, and the unfiltered cached originals SHALL be retained so a changed treatment re-applies without re-fetching.

#### Scenario: Every bundled image is treated identically
- **WHEN** the images stage runs
- **THEN** every written asset receives the same treatment before its target-size re-encode, and re-running the stage reproduces the same outputs

#### Scenario: Treatment changes do not refetch
- **WHEN** the treatment parameters change and the stage re-runs
- **THEN** all assets are regenerated from the cached originals without network access
