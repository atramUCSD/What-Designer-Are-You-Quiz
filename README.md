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
- Replaced raw `answer * weight` scoring with centered Likert alignment scoring.
- Added reverse-scored item support.
- Added primary, blended, and strong secondary result handling.
- Added richer result copy: strengths, project ideas, skills to build, roles to explore, and top dimensions.
- Collects a required, unscored journey stage so guidance headings can match whether someone is exploring, learning, or practicing.
- Saves in-progress answers and journey stage locally, invalidating saved progress when the configured question-set version changes.

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

```js
const keyedAnswer = question.reverse ? 6 - answer : answer;
const centeredAnswer = keyedAnswer - 3; // 1..5 becomes -2..2
```

That means Neutral contributes no directional signal. Role scores are normalized to 0-100 and labeled as current alignment, not as a precise personality score.

## Result Visualization

The quiz result renders a static SVG radar chart based on dimension alignment scores. This is intentionally implemented without external charting libraries so it remains GitHub Pages-friendly and print/PDF compatible.

## Visual Assets

The static site self-hosts its visual runtime assets so GitHub Pages does not depend on third-party CDNs:

- Manrope Variable for interface typography
- Lucide SVG paths for command and external-link icons
- Motion for reduced-motion-aware question, result, and in-view animation

Runtime files and licenses are committed under `assets/fonts/` and `assets/vendor/`. The application still runs as plain HTML, CSS, and JavaScript without a build step.

## Designer Badges

Badges are configurable sub-signals derived from role and dimension scores. Badge levels are Bronze, Silver, and Gold. They are directional reflections, not credentials.

## Badge Glossary

The home page includes a badge glossary below the possible outcomes section. It renders from the configured badge definitions, showing the badge name, description, and the role/dimension/computed signals used to calculate it.

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
