# What Designer Are You Quiz

Static GitHub Pages design-career reflection tool for people exploring design, building their practice, or working across design specialties.

## Local development

```bash
npm start
```

Then open `http://localhost:4300/`. You can also run the server directly with `node serve-local.mjs`.

## Validate before pushing

```bash
npm run check
```

This checks JavaScript syntax and runs the deterministic scoring-model audit. Run the audit directly with `npm run audit:scoring`.

## Current quiz model

- Uses seven primary outcomes: Product Designer, UX Designer, Interaction Designer, UX Researcher, Design Engineer / UI Engineer, Human Factors Engineer, and UX Writer / Content Designer.
- Retains systems thinking as a cross-cutting dimension instead of a standalone result.
- Uses 23 balanced bipolar tradeoffs and seven narrow behavioral anchors.
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

For each tradeoff, A contributes `-3` to its signed role vector and B contributes `+3`. The answer direction makes the selected role's evidence positive and the alternative role's evidence negative. Anchors contribute `+3` only to their target role and use a `0.75` multiplier.

Scores are normalized linearly around 50. Below 50 means the answers favored other paths, not that the respondent lacks the skill. An all-middle run returns "No clear designer lean."

## Methodology and evidence

The question format and role constructs were informed by:

- [Pew Research Center: Writing Survey Questions](https://www.pewresearch.org/writing-survey-questions/) on acquiescence and alternative-statement formats
- [Brown and Maydeu-Olivares: Item Response Modeling of Forced-Choice Questionnaires](https://doi.org/10.1177/0013164410375112) on forced-choice benefits and ipsative limitations
- [O*NET Web and Digital Interface Designers](https://www.onetonline.org/link/summary/15-1255.00)
- [O*NET Human Factors Engineers and Ergonomists](https://www.onetonline.org/link/summary/17-2112.01)
- [UK Government Digital and Data Profession Capability Framework](https://ddat-capability-framework.service.gov.uk/)
- [GitLab Product Designer job family](https://handbook.gitlab.com/job-description-library/product/product-designer/)
- [Vercel Design Engineering](https://vercel.com/blog/design-engineering-at-vercel)

These sources support the constructs and relative-choice format; they do not validate the quiz's numerical weights. Results compare preferences within one response profile and must not be compared as ability scores between people.

## Result visualization

The result uses a static SVG radar based on relative dimension signals. It intentionally avoids a charting dependency so the app remains GitHub Pages-friendly and print/PDF compatible.

## Designer badges

Badges are configurable sub-signals derived from role, dimension, question, and computed scores. A badge must clear both an evidence floor and a meaningful relative lift. Bronze, Silver, Gold, and Rainbow begin at 60, 70, 80, and 87 respectively. Results show at most four badges.

The home page includes a config-driven badge glossary showing each badge's description and contributing signals without exposing internal weights.

## Visual assets, themes, and contrast

The site self-hosts Manrope Variable, Lucide SVG paths, Motion, and company logos under `assets/`. It remains plain HTML, CSS, and JavaScript without a build step or runtime CDN.

The interface follows the operating-system color preference and provides a persistent light/dark toggle. Both themes target WCAG 2.0 AA text contrast and visible control boundaries. Print and export output remains light.

The hero's interactive designer-space map uses the seven configured outcomes. Pointer, touch, keyboard focus, and reduced-motion behavior are supported.

## Career opportunities

Outcome previews and result guidance link to organization career pages so people can explore roles and career paths. Organizations are examples for exploration; links do not guarantee current openings.

## Deployment

For a root deployment from `main`:

```bash
git add app.js index.html questions.js styles.css README.md package.json scripts/audit-scoring.mjs
git commit -m "Redesign quiz around relative career fit"
git push origin main
```

If GitHub Pages publishes from `gh-pages`, mirror the same files there after committing `main`.

## Caveat

This is a source-grounded, directional career reflection tool for people at any experience level. It is not a credential, diagnosis, hiring assessment, psychometrically validated instrument, or fixed identity label.
