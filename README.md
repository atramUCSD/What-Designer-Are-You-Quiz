# What Designer Are You Quiz

Static GitHub Pages design-career reflection tool for people exploring design, building their practice, or working across design specialties.

## Local development

```bash
npm install
npm start
```

Then open `http://localhost:4300/`. You can also run the server directly with `node serve-local.mjs`.

The application has no compile step. GitHub Pages serves `index.html`, `styles.css`, `questions.js`, `app.js`, and the local files under `assets/` directly.

## Validate before pushing

```bash
npm run check
```

This checks JavaScript syntax and runs the deterministic scoring-model audit. Run the audit directly with `npm run audit:scoring`.

## Current quiz model

- Uses seven primary outcomes: Product Designer, UX Designer, Interaction Designer, UX Researcher, Design Engineer / UI Engineer, Human Factors Engineer, and UX Writer / Content Designer.
- Retains systems thinking as a cross-cutting dimension instead of a standalone result.
- Uses 13 balanced bipolar tradeoffs and seven narrow behavioral anchors.
- Keeps seven explicit role vectors and seven explicit dimension vectors in `questions.js`.
- Uses centered, linear relative-fit scoring so every displayed shift can be traced to a visible choice.
- Supports primary, blended, rounded, and strong-secondary result handling.
- Includes configurable badges, a static SVG radar, career links, print, PDF, and image export.
- Saves progress locally and discards it when `questionSetVersion` changes.

## Scoring model

Tradeoff questions use two equally credible alternatives:

```text
1 = Strongly A
2 = Leaning A
3 = Equal pull
4 = Leaning B
5 = Strongly B
```

Anchors use the same five positions from `Not characteristic` to `Highly characteristic`. Answers are transformed as:

```text
1 = -1
2 = -0.5
3 = 0
4 = 0.5
5 = 1
```

The clearest, most diagnostic tradeoffs contribute `-4` to role A and `+4` to role B. Five more context-dependent comparisons use `-3` and `+3`. The answer direction makes the selected role's evidence positive and the alternative role's evidence negative. Anchors contribute `+3` only to their target role and use a `0.75` multiplier. Per-role normalization accounts for different question counts and weights.

Scores are normalized linearly around 50. Below 50 means the answers favored other paths, not that the respondent lacks the skill. An all-middle run returns "No clear designer lean."

## Methodology and evidence

The question format and role constructs were informed by:

- [Pew Research Center: Writing Survey Questions](https://www.pewresearch.org/writing-survey-questions/) on acquiescence and alternative-statement formats
- [Digital.gov: Plain Language Guide Series](https://www.plainlanguage.gov/guidelines/) on audience-specific, understandable public content
- [Brown and Maydeu-Olivares: Item Response Modeling of Forced-Choice Questionnaires](https://doi.org/10.1177/0013164410375112) on forced-choice benefits and ipsative limitations
- [O*NET Web and Digital Interface Designers](https://www.onetonline.org/link/summary/15-1255.00)
- [O*NET Human Factors Engineers and Ergonomists](https://www.onetonline.org/link/summary/17-2112.01)
- [UK Government Digital and Data Profession Capability Framework](https://ddat-capability-framework.service.gov.uk/)
- [GitLab Product Designer job family](https://handbook.gitlab.com/job-description-library/product/product-designer/)
- [Vercel Design Engineering](https://vercel.com/blog/design-engineering-at-vercel)

The 20-question set uses familiar action language first and specialized terms only where they clarify a real practice. Each role has one behavioral anchor and appears in three or four tradeoffs. These sources support the constructs and relative-choice format; they do not validate the quiz's numerical weights. Results compare preferences within one response profile and must not be compared as ability scores between people.

## Result visualization

The result uses a static SVG radar based on relative dimension signals. It intentionally avoids a charting dependency so the app remains GitHub Pages-friendly and print/PDF compatible.

## Designer badges

Badges are configurable sub-signals derived from role, dimension, question, and computed scores. A badge must clear both an evidence floor and a meaningful relative lift. Bronze, Silver, Gold, and Rainbow begin at 60, 70, 80, and 87 respectively. Results show at most four badges.

The home page includes a config-driven badge glossary showing each badge's description and contributing signals without exposing internal weights.

## Community comparison

After completing the quiz, a respondent can optionally publish an alias, result type, normalized role and dimension scores, and up to four earned badges. Individual question answers are not submitted. Comparisons include only responses with the current `questionSetVersion` and show aggregate distributions rather than a ranked leaderboard.

The SheetDB endpoint is configured under `communityResults` in `questions.js`. The client verifies the expected spreadsheet columns before writing. The current integration requires only these SheetDB permissions:

- Read (GET): enabled
- Create (POST): enabled
- Search, Update, and Delete: disabled
- Authentication: none while requests are sent directly from the static browser client
- IP whitelist: disabled because respondents use varying public IP addresses

Restrict CORS to active browser origins. Development uses `http://localhost:4300` and optionally `http://127.0.0.1:4300`. The GitHub Pages origin is `https://atramucsd.github.io`; repository paths are not part of a CORS origin. Add that production origin before enabling public submissions from GitHub Pages.

The spreadsheet contract is 31 columns in this exact order:

```text
schema_version submission_id submitted_at_utc question_set_version
public_alias consent_public result_mode primary_type secondary_type
role_product role_ux role_interaction role_research role_technology
role_human_factors role_content dimension_strategy
dimension_experience_design dimension_research dimension_systems
dimension_build dimension_human_factors dimension_content
badge_1_id badge_1_tier badge_2_id badge_2_tier badge_3_id
badge_3_tier badge_4_id badge_4_tier
```

Google Sheets may normalize the submitted string `true` to `TRUE`. Treat consent values case-insensitively when auditing. Because the endpoint and POST capability are visible to every visitor, CORS and reduced permissions limit accidental browser access but do not prevent scripted spam. Use a validating, rate-limited serverless proxy before treating the dataset as abuse-resistant.

## Visual assets, themes, and contrast

The site self-hosts Manrope Variable, Lucide SVG paths, Motion, and company logos under `assets/`. It remains plain HTML, CSS, and JavaScript without a build step or runtime CDN.

The interface follows the operating-system color preference and provides a persistent light/dark toggle. Both themes target WCAG 2.0 AA text contrast and visible control boundaries. Print and export output remains light.

The hero's interactive designer-space map uses the seven configured outcomes. Pointer, touch, keyboard focus, and reduced-motion behavior are supported.

## Career opportunities

Outcome previews and result guidance link to organization career pages so people can explore roles and career paths. Organizations are examples for exploration; links do not guarantee current openings.

## Deployment

The source branch is `main`; the public GitHub Pages branch is `gh-pages`. Validate and commit source changes first:

```bash
npm run check
git add <changed-files>
git commit -m "Describe the change"
git push origin main
```

Then mirror the committed site files to `gh-pages`, validate, and push that branch. Do not copy local-only notes, temporary audits, archives, or `node_modules` into the deployment branch. The expected public URL is:

```text
https://atramucsd.github.io/What-Designer-Are-You-Quiz/
```

The tracked `.nojekyll` file keeps GitHub Pages from applying Jekyll processing.

## Repository map

- `questions.js`: versioned quiz configuration, outcomes, questions, scoring metadata, badges, organizations, and SheetDB settings
- `app.js`: state, scoring, rendering, persistence, exports, community submission, and interactions
- `index.html`: semantic application structure and result/community containers
- `styles.css`: responsive themes, layout, components, print output, and reduced-motion behavior
- `scripts/audit-scoring.mjs`: deterministic structural, archetype, balance, and Monte Carlo scoring checks
- `serve-local.mjs`: dependency-free local static server on port 4300
- `assets/`: self-hosted fonts, vendor runtime, licenses, and company logos
- `CLAUDE.md`: implementation and handoff contract for AI-assisted development

## Caveat

This is a source-grounded, directional career reflection tool for people at any experience level. It is not a credential, diagnosis, hiring assessment, psychometrically validated instrument, or fixed identity label.
