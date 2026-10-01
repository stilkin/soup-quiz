# @soup-quiz/schema

Single source of truth for the quiz-item data contract. Exports:

- `soupItemSchema` / `SoupItem` — the zod schema and inferred type (see `src/item.ts`)
- `SOUP_TYPES`, `COUNTRIES`, `countryName()`, `flagEmoji()`, `soupTypeLabel()` — shared registries
- `validateDataset(items)` — per-item field errors + dataset-level id uniqueness, each issue
  reporting `{ itemId, field, message }`
- `soupItemJsonSchema` — JSON Schema (draft 2020-12) for the Python pipeline

## Rules NOT expressible in the exported JSON Schema

The Python pipeline must compensate for these app-side rules (task 2.4):

1. **Dataset-level id uniqueness** — per-item schemas cannot see the whole dataset.
   Enforced by `validateDataset`, which the app/test suite runs over every dataset.
2. **Ingredient canonical-id uniqueness within an item** — implemented as a zod
   refinement (`.check()`), which does not convert to JSON Schema.
3. **URL format enforcement** — the JSON Schema emits `format: 'uri'`; Python
   `jsonschema` only asserts formats when a format checker is enabled.

Known non-divergence: the strict object (no extra keys) does convert
(`additionalProperties: false`); parity is pinned by the roundtrip tests in
`tests/validate.test.ts`.

## Regenerating COUNTRIES

`src/registries.ts` embeds the ISO-3166-1 alpha-2 table (249 entries, common short
names). Regenerate after ISO updates rather than hand-editing:

```sh
python3 -m venv /tmp/pyc-venv && /tmp/pyc-venv/bin/pip install pycountry
/tmp/pyc-venv/bin/python3 <regeneration script>  # see git history for the exact invocation
```

## Consumers

- TS packages import this package directly (internal-package pattern: raw TS source).
- The Python pipeline (dataset change) consumes a JSON document serialized from
  `soupItemJsonSchema`; that file gets written by the pipeline change's export step.
