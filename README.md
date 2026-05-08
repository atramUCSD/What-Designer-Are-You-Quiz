# Designer Type Test

Static GitHub Pages-ready workshop app for the UCSD CSSA presentation.

## Intended Public URL

```text
https://atramucsd.github.io/What-Designer-Are-You-Quiz/
```

## Local URL

From the presentation workspace, use the existing local server:

```text
http://localhost:4300/What-Designer-Are-You-Quiz/index.html
```

## Editing Questions

Replace the draft questions, outcome types, and score weights in `questions.js`.

Each question uses a 1-5 answer scale and can add weighted points to any type:

```js
{
  prompt: "I enjoy turning ambiguous product problems into a clear direction for a team.",
  weights: { product: 3, interaction: 1, research: 1 }
}
```

## GitHub Pages

Current setup:

1. The static app is committed on `main`.
2. The same static app is published to the `gh-pages` branch.
3. GitHub Pages serves the project site from that branch.

If hosted from the repository root, the entry point is:

```text
index.html
```
