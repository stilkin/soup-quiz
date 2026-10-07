# Tasks

## 1. Build identity + profile

- [x] 1.1 `apps/soup-quiz/app.json`: set `android.package` to `be.pocito.soupquiz`; run `eas init` from `apps/soup-quiz` and confirm it wrote `extra.eas.projectId`; `pnpm lint` stays green
- [x] 1.2 Add `apps/soup-quiz/eas.json` — single `preview` profile (`distribution: internal`, `android: { buildType: apk, autoIncrement: true }`) — and `apps/soup-quiz/.easignore` with the explicit exclusion list from design D4 (build noise + `data/`, `openspec/`, `.claude/`); verify `pnpm lint` parses both files

## 2. Anchor freeze

- [x] 2.1 Freeze `LAUNCH_ANCHOR_DAY` (drop the "provisional" comment; assert value equals the intended ship day before building) and pin the frozen value in `packages/engine/tests/daily.test.ts` so any later bump is deliberate; `pnpm test` green

## 3. Build, distribute, verify

- [x] 3.1 Trigger the cloud build (`eas build --profile preview --platform android` from `apps/soup-quiz`), accepting the EAS-generated keystore; once it finishes, confirm the APK artifact and check the build log's uploaded-archive size proves `data/` stayed out
- [ ] 3.2 Keystore backup: walk the user through exporting it (`eas credentials -p android`) to a location outside the repo — account-side storage alone must not be the only copy
- [ ] 3.3 Device gate: install via the build link, play the daily in the installed app, enable the reminder for the next full hour and confirm the notification arrives (this also closes `add-daily-challenge` 5.2) (user confirms)
- [x] 3.4 Docs: README tester-build + distribution section (present-vs-planned wording, roadmap note), CLAUDE.md build command; `pnpm typecheck`/`lint`/`test` all green
