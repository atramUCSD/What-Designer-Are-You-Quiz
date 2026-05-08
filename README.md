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

Recommended setup:

1. Push this repository to GitHub.
2. In GitHub, go to `Settings -> Pages`.
3. Set the source to `GitHub Actions`.
4. The included workflow will deploy the static app from the repository root.

If hosted from the repository root, the entry point is:

```text
index.html
```
