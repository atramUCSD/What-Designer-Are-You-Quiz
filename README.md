# What Designer Are You Quiz

Static GitHub Pages quiz for the UCSD CSSA presentation.

## Live URL

```text
https://atramucsd.github.io/What-Designer-Are-You-Quiz/
```

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

## What changed in the expanded version

- Replaced the original five-role quiz with an eight-role framework.
- Added Human Factors Engineer, Interaction Designer, and UX Writer / Content Designer.
- Kept Product Designer, UX Designer, UX Researcher, Design Systems Designer, and Design Technologist / UI Engineer.
- Added seven scoring dimensions in `questions.js`.
- Replaced raw `answer * weight` scoring with centered Likert alignment scoring.
- Added reverse-scored item support.
- Added primary, blended, and strong secondary result handling.
- Added richer result copy: strengths, project ideas, skills to build, roles to explore, and top dimensions.

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

## Deployment

If GitHub Pages is configured to publish from `main` and the repository root:

```bash
git add .
git commit -m "Expand quiz to eight designer paths"
git push origin main
```

If GitHub Pages is configured to publish from `gh-pages`, mirror the same static files there:

```bash
git checkout gh-pages
git checkout main -- .nojekyll README.md app.js index.html questions.js styles.css serve-local.mjs package.json
git add .
git commit -m "Deploy expanded eight-role quiz"
git push origin gh-pages
```

## Caveat

This is a directional career reflection tool for students. It is not a validated career diagnosis, hiring screen, or fixed identity label.

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
