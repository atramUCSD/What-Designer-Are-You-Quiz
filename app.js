const config = window.DESIGNER_TYPE_TEST;

if (!config) {
  throw new Error("DESIGNER_TYPE_TEST config was not loaded. Check that questions.js loads before app.js.");
}

function byId(id) {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`Missing required DOM node: #${id}`);
  }

  return element;
}

const introPanel = byId("intro-panel");
const quizCard = byId("quiz-card");
const resultCard = byId("result-card");
const typeGrid = byId("type-grid");
const scoreStack = byId("score-stack");
const questionNumber = byId("question-number");
const questionTotal = byId("question-total");
const questionText = byId("question-text");
const questionDimension = byId("question-dimension");
const progressBar = byId("progress-bar");
const answerScale = byId("answer-scale");
const startButton = byId("start-button");
const backButton = byId("back-button");
const nextButton = byId("next-button");
const restartButton = byId("restart-button");
const resultEyebrow = byId("result-eyebrow");
const resultTitle = byId("result-title");
const resultSummary = byId("result-summary");
const secondaryResult = byId("secondary-result");
const dimensionSummary = byId("dimension-summary");
const nextSteps = byId("next-steps");

const state = {
  index: 0,
  answers: Array(config.questions.length).fill(null),
};

function show(element) {
  element.hidden = false;
}

function hide(element) {
  element.hidden = true;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getDimension(id) {
  return config.dimensions.find((dimension) => dimension.id === id);
}

function normalizeAlignment(rawScore, maxAbsScore) {
  if (!maxAbsScore) {
    return 50;
  }

  // 50 means no clear signal; below 50 indicates disagreement with role-defining items.
  return Math.round(clamp(50 + 50 * (rawScore / maxAbsScore), 0, 100));
}

function renderList(title, items = []) {
  if (!items.length) {
    return "";
  }

  return `
    <section class="mini-section">
      <h3>${escapeHtml(title)}</h3>
      <ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </section>
  `;
}

function renderCompanySection(type) {
  const recruitingCompanies = type.recruitingCompanies ?? [];
  const additionalCompanies = type.additionalCompanies ?? [];

  if (!recruitingCompanies.length && !additionalCompanies.length) {
    return "";
  }

  const companyChips = recruitingCompanies
    .map(
      (company) => `
        <a
          class="company-chip"
          href="${escapeHtml(company.url)}"
          target="_blank"
          rel="noreferrer noopener"
          title="${escapeHtml(company.name)} careers"
          aria-label="${escapeHtml(company.name)} careers"
        >
          <img
            class="company-chip__logo"
            src="${escapeHtml(company.logo)}"
            alt=""
            aria-hidden="true"
            loading="lazy"
            onerror="this.hidden = true"
          >
          <span>${escapeHtml(company.name)}</span>
        </a>
      `,
    )
    .join("");

  const additionalText = additionalCompanies.length
    ? `
      <p class="type-card__extras">
        <strong>Also worth exploring:</strong>
        ${additionalCompanies.map((company) => escapeHtml(company)).join(", ")}
      </p>
    `
    : "";

  return `
    <div class="type-card__companies">
      <p class="type-card__meta-label">Well-known recruiters</p>
      <div class="company-chip-row">${companyChips}</div>
      ${additionalText}
    </div>
  `;
}

function renderTypePreview() {
  typeGrid.innerHTML = config.types
    .map(
      (type) => `
        <article class="type-card" style="--type-color: ${type.color}">
          <span>${escapeHtml(type.id)}</span>
          <h3>${escapeHtml(type.name)}</h3>
          <p>${escapeHtml(type.summary)}</p>
          ${renderCompanySection(type)}
        </article>
      `,
    )
    .join("");
}

function renderScale() {
  const selected = state.answers[state.index];

  answerScale.innerHTML = `
    <legend>Choose the answer that feels most true.</legend>
    ${config.scale
      .map(
        (item) => `
          <label>
            <input type="radio" name="answer" value="${item.value}" ${selected === item.value ? "checked" : ""}>
            ${escapeHtml(item.label)}
          </label>
        `,
      )
      .join("")}
  `;
}

function renderQuestion() {
  const question = config.questions[state.index];
  const dimension = getDimension(question.dimension);

  questionNumber.textContent = String(state.index + 1);
  questionTotal.textContent = String(config.questions.length);
  questionText.textContent = question.prompt;
  questionDimension.textContent = dimension ? dimension.name : question.dimension;
  progressBar.style.width = `${((state.index + 1) / config.questions.length) * 100}%`;

  backButton.disabled = state.index === 0;
  nextButton.disabled = state.answers[state.index] === null;
  nextButton.textContent = state.index === config.questions.length - 1 ? "See result" : "Next";

  renderScale();
}

function isBlendPair(typeA, typeB) {
  return (config.tieBreakerLogic?.blendPairs ?? []).some(
    ([first, second]) =>
      (first === typeA.id && second === typeB.id) || (first === typeB.id && second === typeA.id),
  );
}

function comparePriorityDimensions(typeA, typeB, dimensionById) {
  const priorityCount = Math.max(typeA.priorityDimensions?.length ?? 0, typeB.priorityDimensions?.length ?? 0);

  for (let index = 0; index < priorityCount; index += 1) {
    const dimensionA = dimensionById.get(typeA.priorityDimensions?.[index])?.alignment ?? 50;
    const dimensionB = dimensionById.get(typeB.priorityDimensions?.[index])?.alignment ?? 50;

    if (dimensionA !== dimensionB) {
      return dimensionB - dimensionA;
    }
  }

  return 0;
}

function calculateScores() {
  const rawScores = Object.fromEntries(config.types.map((type) => [type.id, 0]));
  const maxAbsScores = Object.fromEntries(config.types.map((type) => [type.id, 0]));
  const extremeCounts = Object.fromEntries(config.types.map((type) => [type.id, 0]));
  const dimensionRaw = Object.fromEntries(config.dimensions.map((dimension) => [dimension.id, 0]));
  const dimensionMaxAbs = Object.fromEntries(config.dimensions.map((dimension) => [dimension.id, 0]));

  config.questions.forEach((question, index) => {
    const answer = state.answers[index];

    // The UI requires an answer before continuing. This keeps scoring safe if skipping is added later.
    if (answer === null || answer === undefined) {
      return;
    }

    const keyedAnswer = question.reverse ? 6 - answer : answer;
    const centeredAnswer = keyedAnswer - 3; // Maps 1..5 to -2..2 so Neutral adds no directional signal.

    if (Object.hasOwn(dimensionRaw, question.dimension)) {
      dimensionRaw[question.dimension] += centeredAnswer;
      dimensionMaxAbs[question.dimension] += 2;
    }

    Object.entries(question.weights).forEach(([typeId, weight]) => {
      if (!weight || !Object.hasOwn(rawScores, typeId)) {
        return;
      }

      rawScores[typeId] += centeredAnswer * weight;
      maxAbsScores[typeId] += 2 * Math.abs(weight);

      // Used only as a late tie-breaker for strong answers on role-defining items.
      if (Math.abs(centeredAnswer) === 2 && Math.abs(weight) >= 3) {
        extremeCounts[typeId] += 1;
      }
    });
  });

  const dimensions = config.dimensions
    .map((dimension) => ({
      ...dimension,
      alignment: normalizeAlignment(dimensionRaw[dimension.id], dimensionMaxAbs[dimension.id]),
    }))
    .sort((a, b) => b.alignment - a.alignment || a.name.localeCompare(b.name));

  const dimensionById = new Map(dimensions.map((dimension) => [dimension.id, dimension]));

  const ranked = config.types
    .map((type, order) => ({
      ...type,
      order,
      rawScore: rawScores[type.id],
      extremeCount: extremeCounts[type.id],
      alignment: normalizeAlignment(rawScores[type.id], maxAbsScores[type.id]),
    }))
    .sort(
      (a, b) =>
        b.alignment - a.alignment ||
        comparePriorityDimensions(a, b, dimensionById) ||
        b.extremeCount - a.extremeCount ||
        b.rawScore - a.rawScore ||
        a.order - b.order,
    );

  return { ranked, dimensions };
}

function getResultLabel(topType, secondType) {
  if (!secondType) {
    return { label: "Primary lean", mode: "primary", showSecondary: false };
  }

  const gap = topType.alignment - secondType.alignment;
  const blendThreshold = config.tieBreakerLogic?.showBlendedIfWithin ?? 3;
  const secondaryThreshold = config.tieBreakerLogic?.showSecondaryIfWithin ?? 5;

  if (gap <= blendThreshold && isBlendPair(topType, secondType)) {
    return { label: "Blended lean", mode: "blend", showSecondary: true };
  }

  return { label: "Primary lean", mode: "primary", showSecondary: gap <= secondaryThreshold };
}

function renderSecondaryResult(secondType, mode) {
  secondaryResult.hidden = false;
  secondaryResult.innerHTML = `
    <h3>${mode === "blend" ? "Also strongly indicated" : "Strong secondary lean"}: ${escapeHtml(secondType.name)}</h3>
    <p>${escapeHtml(secondType.summary)}</p>
  `;
}

function renderResult() {
  const { ranked, dimensions } = calculateScores();
  const [topType, secondType] = ranked;
  const resultLabel = getResultLabel(topType, secondType);
  const topDimensions = dimensions.slice(0, 3);

  resultEyebrow.textContent = resultLabel.label;
  resultTitle.textContent = resultLabel.mode === "blend" && secondType ? `${topType.name} + ${secondType.name}` : topType.name;
  resultSummary.textContent =
    resultLabel.mode === "blend" && secondType
      ? `Your answers point to a blended path. ${topType.summary} ${secondType.summary}`
      : topType.summary;

  if (resultLabel.showSecondary && secondType) {
    renderSecondaryResult(secondType, resultLabel.mode);
  } else {
    secondaryResult.hidden = true;
    secondaryResult.innerHTML = "";
  }

  dimensionSummary.innerHTML = `
    <h3>Why this result surfaced</h3>
    <div class="dimension-list">
      ${topDimensions
        .map(
          (dimension) => `
            <div class="dimension-row">
              <span>${escapeHtml(dimension.name)}</span>
              <strong>${dimension.alignment}/100</strong>
              <p>${escapeHtml(dimension.summary)}</p>
            </div>
          `,
        )
        .join("")}
    </div>
  `;

  nextSteps.innerHTML = [
    renderList("Strengths", topType.strengths),
    renderList("Project ideas", topType.projectIdeas),
    renderList("Skills to build next", topType.skillsToBuild),
    renderList("Roles to explore", topType.rolesToExplore),
  ].join("");

  scoreStack.innerHTML = ranked
    .map(
      (type) => `
        <div class="score-row">
          <div class="score-row__top">
            <span>${escapeHtml(type.name)}</span>
            <span>${type.alignment}/100</span>
          </div>
          <div class="score-row__bar" aria-hidden="true">
            <span style="--score-width: ${type.alignment}%; --score-color: ${type.color}"></span>
          </div>
        </div>
      `,
    )
    .join("");

  hide(quizCard);
  show(resultCard);
  resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
}

startButton.addEventListener("click", () => {
  hide(introPanel);
  hide(resultCard);
  show(quizCard);
  renderQuestion();
  quizCard.scrollIntoView({ behavior: "smooth", block: "start" });
});

answerScale.addEventListener("change", (event) => {
  if (event.target instanceof HTMLInputElement) {
    state.answers[state.index] = Number.parseInt(event.target.value, 10);
    nextButton.disabled = false;
  }
});

backButton.addEventListener("click", () => {
  state.index = Math.max(0, state.index - 1);
  renderQuestion();
});

nextButton.addEventListener("click", () => {
  if (state.answers[state.index] === null) {
    return;
  }

  if (state.index === config.questions.length - 1) {
    renderResult();
    return;
  }

  state.index += 1;
  renderQuestion();
});

restartButton.addEventListener("click", () => {
  state.index = 0;
  state.answers = Array(config.questions.length).fill(null);
  hide(resultCard);
  show(introPanel);
  introPanel.scrollIntoView({ behavior: "smooth", block: "start" });
});

renderTypePreview();
