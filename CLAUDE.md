# AI Development Handoff

## Project

`What Designer Are You?` is a static, institution-neutral design-career reflection quiz. It is deployed to GitHub Pages without a build step or backend. Preserve direct-browser compatibility and keep all runtime assets local.

Repository: `https://github.com/atramUCSD/What-Designer-Are-You-Quiz`

Local URL: `http://localhost:4300/`

Expected Pages URL: `https://atramucsd.github.io/What-Designer-Are-You-Quiz/`

## First Steps

1. Run `git status --short --branch` before editing.
2. Read `README.md`, `questions.js`, and the relevant rendering code in `app.js`.
3. Run `npm install` only when dependencies are absent or changed.
4. Run `npm start` for local development.
5. Run `npm run check` before committing or deploying.

`SCORING_NOTE.md` is unrelated local work. Do not read, edit, delete, stage, commit, or deploy it unless the owner explicitly changes that instruction.

## Architecture

- `index.html` contains the application shell, quiz/result containers, glossary, and community comparison form.
- `questions.js` assigns `window.DESIGNER_TYPE_TEST` and is the source of truth for content and scoring configuration.
- `app.js` owns state, scoring, persistence, rendering, exports, interactions, and SheetDB requests.
- `styles.css` owns light/dark themes, responsive behavior, print/export styles, focus states, and motion preferences.
- `scripts/audit-scoring.mjs` validates the instrument and statistical balance.
- `serve-local.mjs` serves the repository directly on port 4300.
- `assets/` contains all production fonts, logos, vendor code, and third-party license files.

There is no transpiler, bundler, framework router, database, or secret-management layer.

## Scoring Invariants

Do not modify scoring casually. Any scoring or question change requires an explicit `questionSetVersion` bump and a passing scoring audit.

- Exactly 20 active questions: 13 bipolar tradeoffs and seven behavioral anchors.
- Seven result IDs: `product`, `ux`, `interaction`, `research`, `technology`, `humanFactors`, and `content`.
- Seven dimension IDs: `strategy`, `experienceDesign`, `research`, `systems`, `build`, `humanFactors`, and `content`.
- `systems` is a dimension, never a primary result type.
- Every question carries all seven role keys and all seven dimension keys.
- Tradeoffs use signed role evidence and visible A/B alternatives.
- Anchors target one role and use the configured anchor multiplier.
- Scores are relative-fit signals centered at 50, not ability measurements.
- Badges use configured thresholds and relative lift, with a maximum of four awards.
- Raw question answers are never submitted to SheetDB.

Run `npm run audit:scoring` after any change to questions, weights, role IDs, dimensions, badge signals, normalization, tie handling, or rounded-profile logic.

## Community Data Contract

The SheetDB endpoint and schema version live in `questions.js` under `communityResults`. The browser:

1. Reads `/keys` and requires the expected spreadsheet columns.
2. Posts one 31-field record using `{ data: [record] }`.
3. Reads up to 1,000 rows for aggregate comparisons.

Required SheetDB permissions are Read and Create only. Search, Update, and Delete must remain disabled. Direct browser authentication must remain off because a Basic or token credential in static JavaScript is public.

Allowed development origins are `http://localhost:4300` and, when needed, `http://127.0.0.1:4300`. Add `https://atramucsd.github.io` before enabling community submission on GitHub Pages. CORS is not an anti-abuse boundary; a validating, rate-limited serverless proxy is the appropriate future hardening step.

Never collect email addresses, raw answers, or other unnecessary personal information. Aliases are public and must retain formula-injection validation. Google Sheets can return consent as `TRUE` even though the client sends `true`.

## UI Constraints

- Preserve WCAG-oriented contrast, visible boundaries, focus states, and responsive text containment.
- Support light and dark themes and `prefers-reduced-motion`.
- Keep the first screen as the quiz experience, not a marketing landing page.
- Keep the seven configured designer outcomes in the interactive map, previews, results, and career guidance.
- Keep icons and Motion self-hosted; do not add a runtime CDN.
- Verify layouts at 320, 390, 768, 900, 1280, and 1440 pixels after meaningful UI changes.
- Preserve print, PDF, and image export behavior when changing result markup.

## Validation

Minimum automated check:

```bash
npm run check
```

For UI or workflow changes, also verify:

- Start, Back, Next, keyboard `1`-`5`, and Enter behavior
- all 20 questions and result rendering
- radar, badges, glossary, outcomes, and career links
- light/dark mode and reduced motion
- no horizontal overflow at mobile widths
- print, PDF, and image exports
- optional community submission and aggregate readback
- no console errors, `undefined`, or `NaN`

## Git And Deployment

Work on `main`. Stage explicit files so unrelated local work cannot enter a commit. Push `main`, then mirror the same committed production files to `gh-pages` and push it. Keep `.nojekyll` on the deployment branch.

Do not commit `node_modules`, temporary scripts, screenshots, downloaded archives, extraction directories, backup files, credentials, or local-only notes. Do not rewrite or discard pre-existing user changes.

Before handoff, report:

- files changed
- checks run and their outcomes
- localhost URL and process state
- commit and push status for `main` and `gh-pages`
- unresolved production risks or required external configuration
