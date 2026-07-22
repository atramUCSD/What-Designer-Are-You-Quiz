# What Designer Are You Quiz

Static GitHub Pages design-career reflection tool for people exploring design, building their practice, or working across design specialties.

## Local development

```bash
npm start
```

Then open:

```text
http://localhost:4300/
```

You can also run the server directly:

```bash
node serve-local.mjs
```

## Validate before pushing

```bash
npm run check
```

This checks the standalone JavaScript files for syntax errors.

## Current quiz model

- Uses seven primary outcomes: Product Designer, UX Designer, Interaction Designer, UX Researcher, Design Technologist / UI Engineer, Human Factors Engineer, and UX Writer / Content Designer.
- Retains systems thinking as a cross-cutting scoring dimension instead of a standalone result.
- Surfaces a secondary Systems Thinking Signal when reusable patterns, documentation, accessibility, or shared product language score strongly.
- Added seven scoring dimensions in `questions.js`.
- Replaced raw `answer * weight` scoring with nonlinear centered Likert alignment scoring.
- Added reverse-scored item support.
- Added primary, blended, and strong secondary result handling.
- Added richer result copy: strengths, project ideas, skills to build, roles to explore, and top dimensions.
- Saves in-progress answers locally and invalidates saved progress when the configured question-set version changes.

## Scoring model

The quiz uses a 5-point Likert scale:

```text
1 = Strongly disagree
2 = Disagree
3 = Neutral
4 = Agree
5 = Strongly agree
```

For scoring, answers are transformed like this:

```text
Strongly disagree = -1
Disagree = -0.45
Neutral = 0
Agree = 0.45
Strongly agree = 1
```

Neutral contributes no directional signal. An all-neutral run returns “No clear designer lean” instead of assigning the first configured outcome. Role-defining weights are amplified relative to weak adjacent-role weights, tradeoff questions receive a modest separation multiplier, and role scores are normalized around a visible 50 midpoint. Scores below 50 indicate a counter-signal; scores above 50 indicate alignment. They remain directional estimates rather than precise personality measurements.

## Result Visualization

The quiz result renders a static SVG radar chart based on dimension alignment scores. This is intentionally implemented without external charting libraries so it remains GitHub Pages-friendly and print/PDF compatible.

## Visual Assets

The static site self-hosts its visual runtime assets so GitHub Pages does not depend on third-party CDNs:

- Manrope Variable for interface typography
- Lucide SVG paths for command and external-link icons
- Motion for reduced-motion-aware question, result, and in-view animation

Runtime files and licenses are committed under `assets/fonts/` and `assets/vendor/`. The application still runs as plain HTML, CSS, and JavaScript without a build step.

The hero includes an interactive designer-space map organized into Research & Discovery, Product Strategy, Testing & Validation, and Prototyping & Code zones. Its nodes and idle keyframe path use the seven configured quiz outcomes; pointer, touch, and keyboard focus resolve the nearest result type at the current coordinates. Idle motion is disabled when reduced motion is requested.

## Themes and Contrast

The interface defaults to the operating-system color preference and provides a persistent light/dark theme toggle. Both themes use WCAG 2.0 AA text contrast and at least 3:1 contrast for essential control and card boundaries. Print and export output remains light for predictable document rendering.

## Designer Badges

Badges are configurable sub-signals derived from role, dimension, question, and computed scores. A badge must clear both an absolute evidence floor and a meaningful relative lift over the person's overall badge profile. Once unlocked, Bronze, Silver, Gold, and Rainbow are based on absolute evidence, with Rainbow beginning at 87. Results award at most the four strongest badges, so flat or broadly capable profiles do not unlock the entire index. They are directional reflections, not credentials.

## Badge Glossary

The home page includes a badge glossary below the possible outcomes section. It renders from the configured badge definitions, showing the badge name, description, and contributing signals without exposing internal weights.

## Career Opportunities

Outcome previews and result guidance link to organization career pages so people can explore how design teams describe roles, skills, and career paths. Organizations are examples for exploration; links do not guarantee current openings.

## Deployment

If GitHub Pages is configured to publish from `main` and the repository root:

```bash
git add .
git commit -m "Update quiz model"
git push origin main
```

If GitHub Pages is configured to publish from `gh-pages`, mirror the same static files there:

```bash
git checkout gh-pages
git checkout main -- .nojekyll README.md app.js index.html questions.js styles.css serve-local.mjs package.json
git add .
git commit -m "Deploy seven-outcome quiz model"
git push origin gh-pages
```

## Caveat

This is a directional career reflection tool for people at any experience level. It is not a credential, diagnosis, hiring assessment, or fixed identity label.

## Company Logos

The possible-outcomes cards read local logo files from:

```text
assets/company-logos/
```

Expected filenames:

```text
ABT.png
BAH.png
FIG.png
MSFT.png
AMZN.png
META.png
BDX.png
ILMN.png
SONY.png
google.png
ADBE.png
```

These logos are used as small linked company chips. The accompanying company names and links are examples for exploration, not a guarantee of current open roles.
