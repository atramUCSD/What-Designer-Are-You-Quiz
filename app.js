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
const questionProgress = byId("question-progress");
const progressBar = byId("progress-bar");
const answerScale = byId("answer-scale");
const audienceContextOptions = byId("audience-context-options");
const startButton = byId("start-button");
const backButton = byId("back-button");
const nextButton = byId("next-button");
const restartButton = byId("restart-button");
const changeContextButton = byId("change-context-button");
const savePdfButton = byId("save-pdf-button");
const saveImageButton = byId("save-image-button");
const printResultButton = byId("print-result-button");
const saveStatus = byId("save-status");
const resultEyebrow = byId("result-eyebrow");
const resultContext = byId("result-context");
const resultAnnouncement = byId("result-announcement");
const resultTitle = byId("result-title");
const resultSummary = byId("result-summary");
const responseWarning = byId("response-warning");
const secondaryResult = byId("secondary-result");
const resultRadar = byId("result-radar");
const badgePanel = byId("badge-panel");
const dimensionSummary = byId("dimension-summary");
const nextSteps = byId("next-steps");
const badgeGlossaryGrid = document.getElementById("badge-glossary-grid");
const badgeGlossaryLevels = document.getElementById("badge-glossary-levels");
const typePreviewToggle = byId("type-preview-toggle");
const typePreviewContent = byId("type-preview-content");
const badgeGlossaryToggle = byId("badge-glossary-toggle");
const badgeGlossaryContent = byId("badge-glossary-content");
const themeToggle = byId("theme-toggle");

const STORAGE_KEY = "what-designer-are-you-progress";
const THEME_STORAGE_KEY = "what-designer-are-you-theme";

function getSavedTheme() {
  try {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return savedTheme === "dark" || savedTheme === "light" ? savedTheme : null;
  } catch {
    return null;
  }
}

function applyTheme(theme) {
  const nextTheme = theme === "dark" ? "dark" : "light";
  const nextLabel = nextTheme === "dark" ? "Use light theme" : "Use dark theme";

  document.documentElement.dataset.theme = nextTheme;
  document.documentElement.style.colorScheme = nextTheme;
  themeToggle.setAttribute("aria-label", nextLabel);
  themeToggle.title = nextLabel;
}

function saveTheme(theme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // The selected theme still applies for the current page when storage is unavailable.
  }
}

function isAudienceContextId(value) {
  return (config.audienceContexts ?? []).some((context) => context.id === value);
}

function loadSavedProgress() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY));

    if (saved?.questionSetVersion !== config.questionSetVersion || !isAudienceContextId(saved.audienceContext)) {
      return null;
    }

    if (!Array.isArray(saved.answers) || saved.answers.length !== config.questions.length) {
      return null;
    }

    return {
      audienceContext: saved.audienceContext,
      index: clamp(Number.isInteger(saved.index) ? saved.index : 0, 0, config.questions.length - 1),
      answers: saved.answers.map((answer) => (Number.isInteger(answer) && answer >= 1 && answer <= 5 ? answer : null)),
    };
  } catch {
    return null;
  }
}

const savedProgress = loadSavedProgress();
const state = {
  index: savedProgress?.index ?? 0,
  answers: savedProgress?.answers ?? Array(config.questions.length).fill(null),
  audienceContext: savedProgress?.audienceContext ?? null,
  resultFileBase: "designer-type-result",
};

function persistProgress() {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        questionSetVersion: config.questionSetVersion,
        audienceContext: state.audienceContext,
        index: state.index,
        answers: state.answers,
      }),
    );
  } catch {
    // Storage may be unavailable in private browsing; the quiz still works in memory.
  }
}

function clearSavedProgress() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // No action is needed when storage is unavailable.
  }
}

function show(element) {
  element.hidden = false;
}

function hide(element) {
  element.hidden = true;
}

function canUseMotion() {
  return Boolean(window.Motion?.animate) && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function animateQuestionEntry() {
  if (!canUseMotion()) {
    return;
  }

  window.Motion.animate(
    [questionText, answerScale],
    { opacity: [0, 1], y: [8, 0] },
    { duration: 0.22, delay: window.Motion.stagger(0.045), ease: [0.22, 1, 0.36, 1] },
  );
}

function animateResultEntry() {
  if (!canUseMotion()) {
    return;
  }

  const resultSections = [
    resultCard.querySelector(".result-copy"),
    resultCard.querySelector(".result-visual-card"),
    badgePanel,
    dimensionSummary,
    nextSteps,
    resultCard.querySelector(".score-panel"),
    resultCard.querySelector(".result-actions"),
  ].filter(Boolean);

  window.Motion.animate(
    resultSections,
    { opacity: [0, 1], y: [12, 0] },
    { duration: 0.32, delay: window.Motion.stagger(0.055), ease: [0.22, 1, 0.36, 1] },
  );

  const radarShape = resultRadar.querySelector(".result-radar-chart__shape");
  const badgeMeters = badgePanel.querySelectorAll(".designer-badge__meter span");

  if (radarShape) {
    window.Motion.animate(
      radarShape,
      { opacity: [0, 1], scale: [0.86, 1] },
      { duration: 0.48, delay: 0.08, ease: [0.22, 1, 0.36, 1] },
    );
  }

  window.Motion.animate(
    badgeMeters,
    { scaleX: [0, 1] },
    { duration: 0.42, delay: window.Motion.stagger(0.04, { startDelay: 0.14 }), ease: "easeOut" },
  );
}

function initializeInViewMotion() {
  if (!canUseMotion() || !window.Motion.inView) {
    return;
  }

  window.Motion.inView(".type-card, .badge-glossary-row", (element) => {
    window.Motion.animate(
      element,
      { opacity: [0, 1], y: [14, 0] },
      { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
    );
  }, { margin: "0px 0px -8% 0px" });
}

function setCollapsibleSection(toggle, content, collapsed) {
  const action = collapsed ? "Expand" : "Minimize";
  const sectionName = toggle.dataset.sectionName ?? "section";

  content.hidden = collapsed;
  toggle.setAttribute("aria-expanded", String(!collapsed));
  toggle.setAttribute("aria-label", `${action} ${sectionName}`);
  toggle.querySelector("span").textContent = action;

  if (!collapsed && canUseMotion()) {
    window.Motion.animate(content, { opacity: [0, 1], y: [-6, 0] }, { duration: 0.2, ease: "easeOut" });
  }
}

function toggleCollapsibleSection(toggle, content) {
  setCollapsibleSection(toggle, content, !content.hidden);
}

function minimizeReferenceSections() {
  setCollapsibleSection(typePreviewToggle, typePreviewContent, true);
  setCollapsibleSection(badgeGlossaryToggle, badgeGlossaryContent, true);
}

function focusQuestionViewport() {
  window.requestAnimationFrame(() => {
    quizCard.scrollIntoView({ behavior: "smooth", block: "start" });
  });
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

function slugify(value) {
  const slug = String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "designer-type-result";
}

function setSaveStatus(message, isError = false) {
  saveStatus.textContent = message;
  saveStatus.classList.toggle("save-status--error", isError);
}

function setButtonBusy(button, isBusy) {
  button.disabled = isBusy;
  button.setAttribute("aria-busy", String(isBusy));
}

function getDimension(id) {
  return config.dimensions.find((dimension) => dimension.id === id);
}

function getRoleLabel(roleId) {
  return (config.types ?? []).find((type) => type.id === roleId)?.name ?? roleId ?? "unknown";
}

function getDimensionLabel(dimensionId) {
  return (config.dimensions ?? []).find((dimension) => dimension.id === dimensionId)?.name ?? dimensionId ?? "unknown";
}

function getQuestionLabel(questionId) {
  const question = (config.questions ?? []).find((item) => item.id === questionId);

  if (!question) {
    return questionId ?? "unknown";
  }

  return `${question.id}: ${question.prompt}`;
}

function getAudienceContext() {
  return (config.audienceContexts ?? []).find((context) => context.id === state.audienceContext) ?? null;
}

function renderAudienceContexts() {
  audienceContextOptions.innerHTML = (config.audienceContexts ?? [])
    .map(
      (context) => `
        <label class="audience-context__option">
          <input
            type="radio"
            name="audience-context"
            value="${escapeHtml(context.id)}"
            ${state.audienceContext === context.id ? "checked" : ""}
          >
          <span>
            <strong>${escapeHtml(context.name)}</strong>
            <small>${escapeHtml(context.description)}</small>
          </span>
        </label>
      `,
    )
    .join("");

  startButton.disabled = !getAudienceContext();
}

function renderExternalLinkIcon() {
  return `
    <svg class="external-link-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M14 5h5v5M19 5l-8 8M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"></path>
    </svg>
  `;
}

function normalizeAlignment(rawScore, maxAbsScore) {
  if (!maxAbsScore) {
    return 50;
  }

  // 50 means no clear signal; below 50 indicates disagreement with role-defining items.
  return Math.round(clamp(50 + 50 * (rawScore / maxAbsScore), 0, 100));
}

function getResponseVariance(answers) {
  const answered = answers.filter((answer) => answer !== null && answer !== undefined);

  if (!answered.length) {
    return 0;
  }

  // Flat answer patterns make tradeoff-weighted results less differentiated.
  const average = answered.reduce((sum, answer) => sum + answer, 0) / answered.length;
  return answered.reduce((sum, answer) => sum + (answer - average) ** 2, 0) / answered.length;
}

const RADAR_AXIS_META = {
  strategy: { label: "Strategy", summary: "Scope, tradeoffs, product direction" },
  experienceDesign: { label: "UX Flow", summary: "Flows, IA, usability, clarity" },
  research: { label: "Research", summary: "Evidence, synthesis, user learning" },
  systems: { label: "Systems", summary: "Patterns, standards, consistency" },
  build: { label: "Build", summary: "Code, feasibility, implementation" },
  humanFactors: { label: "Human Factors", summary: "Safety, errors, real-world context" },
  content: { label: "Content", summary: "Words, labels, tone, microcopy" },
};

const DEFAULT_BADGE_LEVELS = [
  { id: "bronze", name: "Bronze", minScore: 60, color: "#b97845" },
  { id: "silver", name: "Silver", minScore: 72, color: "#9ca3af" },
  { id: "gold", name: "Gold", minScore: 84, color: "#d29b2f" },
];

const MAX_VISIBLE_BADGES = 6;
const LEVEL_RANK = { gold: 3, silver: 2, bronze: 1 };

function polarPoint(centerX, centerY, radius, angleDegrees) {
  const radians = ((angleDegrees - 90) * Math.PI) / 180;

  return {
    x: centerX + Math.cos(radians) * radius,
    y: centerY + Math.sin(radians) * radius,
  };
}

function pointString(point) {
  return `${point.x.toFixed(1)},${point.y.toFixed(1)}`;
}

function labelAnchor(point, centerX) {
  if (Math.abs(point.x - centerX) < 24) {
    return "middle";
  }

  // Keep long labels inside the SVG bounds for screenshots and PDF exports.
  return point.x > centerX ? "end" : "start";
}

function labelDy(point, centerY) {
  if (Math.abs(point.y - centerY) < 24) {
    return "0.35em";
  }

  return point.y > centerY ? "1.15em" : "-0.55em";
}

function hexToRgba(hexColor, alpha) {
  const normalized = String(hexColor).replace("#", "");

  if (!/^[\da-f]{6}$/i.test(normalized)) {
    return `rgba(47, 156, 149, ${alpha})`;
  }

  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function renderRadarChart({ dimensions, color = "#2f9c95", title = "Your Designer Skill Shape" }) {
  const size = 760;
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = 250;
  const maxValue = 100;
  const ringValues = [20, 40, 60, 80, 100];
  const dimensionById = new Map(dimensions.map((dimension) => [dimension.id, dimension]));
  const axes = config.dimensions.map((dimension, index) => {
    const score = dimensionById.get(dimension.id)?.alignment ?? 50;
    const meta = RADAR_AXIS_META[dimension.id] ?? {};
    const angle = (360 / config.dimensions.length) * index;
    const outerPoint = polarPoint(centerX, centerY, radius, angle);
    const labelPoint = polarPoint(centerX, centerY, radius + 68, angle);

    return {
      id: dimension.id,
      label: meta.label ?? dimension.name,
      summary: meta.summary ?? dimension.summary,
      angle,
      score: clamp(score, 0, maxValue),
      outerPoint,
      labelPoint,
    };
  });

  const gridMarkup = ringValues
    .map((value) => {
      const points = axes
        .map((axis) => polarPoint(centerX, centerY, (radius * value) / maxValue, axis.angle))
        .map(pointString)
        .join(" ");

      return `<polygon class="result-radar-chart__ring" points="${points}"></polygon>`;
    })
    .join("");

  const axisMarkup = axes
    .map(
      (axis) => `
        <line class="result-radar-chart__axis" x1="${centerX}" y1="${centerY}" x2="${axis.outerPoint.x.toFixed(1)}" y2="${axis.outerPoint.y.toFixed(1)}"></line>
        <text
          class="result-radar-chart__label"
          x="${axis.labelPoint.x.toFixed(1)}"
          y="${axis.labelPoint.y.toFixed(1)}"
          text-anchor="${labelAnchor(axis.labelPoint, centerX)}"
          dy="${labelDy(axis.labelPoint, centerY)}"
        >${escapeHtml(axis.label)}</text>
      `,
    )
    .join("");

  const scaleMarkup = ringValues
    .map((value) => {
      const labelPoint = polarPoint(centerX, centerY, (radius * value) / maxValue, 0);
      return `<text class="result-radar-chart__scale-label" x="${centerX + 10}" y="${labelPoint.y.toFixed(1)}">${value}</text>`;
    })
    .join("");

  const valuePoints = axes
    .map((axis) => polarPoint(centerX, centerY, (radius * axis.score) / maxValue, axis.angle))
    .map(pointString)
    .join(" ");

  const pointMarkup = axes
    .map((axis) => {
      const point = polarPoint(centerX, centerY, (radius * axis.score) / maxValue, axis.angle);
      return `
        <circle class="result-radar-chart__point" cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="7">
          <title>${escapeHtml(axis.label)}: ${axis.score}/100</title>
        </circle>
      `;
    })
    .join("");

  return `
    <svg
      class="result-radar-chart"
      viewBox="0 0 ${size} ${size}"
      role="img"
      aria-label="${escapeHtml(title)} radar chart across strategy, UX flow, research, systems, build, human factors, and content"
      style="--result-color: ${escapeHtml(color)}; --result-fill: ${hexToRgba(color, 0.16)};"
    >
      <g class="result-radar-chart__grid">${gridMarkup}</g>
      <g>${axisMarkup}</g>
      <g>${scaleMarkup}</g>
      <polygon class="result-radar-chart__shape" points="${valuePoints}"></polygon>
      <g>${pointMarkup}</g>
    </svg>
  `;
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
          title="Explore career opportunities at ${escapeHtml(company.name)}"
          aria-label="Explore career opportunities at ${escapeHtml(company.name)} (opens in a new tab)"
        >
          <span class="company-logo-frame" aria-hidden="true">
            <img
              class="company-chip__logo"
              src="${escapeHtml(company.logo)}"
              alt=""
              loading="lazy"
              onerror="this.hidden = true; this.nextElementSibling.hidden = false"
            >
            <span class="company-logo-fallback" hidden>${escapeHtml(company.name.slice(0, 1))}</span>
          </span>
          <span>${escapeHtml(company.name)}</span>
          ${renderExternalLinkIcon()}
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
      <p class="type-card__meta-label">Career opportunities</p>
      <div class="company-chip-row">${companyChips}</div>
      ${additionalText}
    </div>
  `;
}

function collectRecruitingCompanies(types, limit = 8) {
  const seen = new Set();
  const companies = [];

  types.forEach((type) => {
    (type?.recruitingCompanies ?? []).forEach((company) => {
      if (seen.has(company.name)) {
        return;
      }

      seen.add(company.name);
      companies.push(company);
    });
  });

  return companies.slice(0, limit);
}

function renderResultCompanySection(types) {
  const companies = collectRecruitingCompanies(types);

  if (!companies.length) {
    return "";
  }

  return `
    <section class="result-company-section">
      <h3>Career opportunities</h3>
      <p>Explore how these organizations describe design roles, teams, skills, and career paths.</p>
      <div class="result-company-grid">
        ${companies
          .map(
            (company) => `
              <a
                class="result-company-card"
                href="${escapeHtml(company.url)}"
                target="_blank"
                rel="noreferrer noopener"
                title="Explore career opportunities at ${escapeHtml(company.name)}"
                aria-label="Explore career opportunities at ${escapeHtml(company.name)} (opens in a new tab)"
              >
                <span class="company-logo-frame" aria-hidden="true">
                  <img
                    class="result-company-card__logo"
                    src="${escapeHtml(company.logo)}"
                    alt=""
                    loading="lazy"
                    onerror="this.hidden = true; this.nextElementSibling.hidden = false"
                  >
                  <span class="company-logo-fallback" hidden>${escapeHtml(company.name.slice(0, 1))}</span>
                </span>
                <span>${escapeHtml(company.name)}</span>
                ${renderExternalLinkIcon()}
              </a>
            `,
          )
          .join("")}
      </div>
      <p class="career-opportunities-disclaimer">Organizations are examples for exploration. Links do not guarantee current openings.</p>
    </section>
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
  const currentQuestion = state.index + 1;

  questionNumber.textContent = String(currentQuestion);
  questionTotal.textContent = String(config.questions.length);
  questionText.textContent = question.prompt;
  progressBar.style.width = `${(currentQuestion / config.questions.length) * 100}%`;
  questionProgress.setAttribute("aria-valuemax", String(config.questions.length));
  questionProgress.setAttribute("aria-valuenow", String(currentQuestion));
  questionProgress.setAttribute("aria-valuetext", `Question ${currentQuestion} of ${config.questions.length}`);

  backButton.disabled = state.index === 0;
  nextButton.disabled = state.answers[state.index] === null;
  nextButton.textContent = state.index === config.questions.length - 1 ? "See result" : "Next";

  renderScale();
  animateQuestionEntry();
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

const DEFAULT_DIMENSION_ROLE_MAP = {
  strategy: ["product"],
  experienceDesign: ["ux", "interaction"],
  research: ["research"],
  systems: ["technology", "interaction", "ux", "content", "humanFactors", "product"],
  build: ["technology"],
  humanFactors: ["humanFactors"],
  content: ["content"],
};

function getDimensionFocusRoleIds(dimensionId) {
  return config.dimensionRoleMap?.[dimensionId] ?? DEFAULT_DIMENSION_ROLE_MAP[dimensionId] ?? [];
}

function getQuestionKind(question) {
  return question.kind === "anchor" ? "anchor" : "tradeoff";
}

function getScoreBlendWeights() {
  const anchorWeight = clamp(config.scoringModel?.anchorScoreWeight ?? 0.6, 0, 1);
  const tradeoffWeight = clamp(config.scoringModel?.tradeoffScoreWeight ?? 1 - anchorWeight, 0, 1);
  const total = anchorWeight + tradeoffWeight || 1;

  return {
    anchor: anchorWeight / total,
    tradeoff: tradeoffWeight / total,
  };
}

function getRoundedProfile(ranked) {
  const alignments = ranked.map((type) => type.alignment);
  const max = Math.max(...alignments);
  const min = Math.min(...alignments);
  const mean = alignments.reduce((sum, score) => sum + score, 0) / alignments.length;
  const highRoleCount = alignments.filter((score) => score >= 68).length;

  return {
    isRounded: mean >= 74 && min >= 68 && max - min <= 20 && highRoleCount >= 7,
    mean: Math.round(mean),
    spread: max - min,
    highRoleCount,
  };
}

function calculateScores() {
  const rawScores = {
    anchor: Object.fromEntries(config.types.map((type) => [type.id, 0])),
    tradeoff: Object.fromEntries(config.types.map((type) => [type.id, 0])),
  };
  const maxAbsScores = {
    anchor: Object.fromEntries(config.types.map((type) => [type.id, 0])),
    tradeoff: Object.fromEntries(config.types.map((type) => [type.id, 0])),
  };
  const extremeCounts = Object.fromEntries(config.types.map((type) => [type.id, 0]));
  const dimensionRaw = Object.fromEntries(config.dimensions.map((dimension) => [dimension.id, 0]));
  const dimensionMaxAbs = Object.fromEntries(config.dimensions.map((dimension) => [dimension.id, 0]));
  const scoreBlend = getScoreBlendWeights();

  config.questions.forEach((question, index) => {
    const answer = state.answers[index];

    // The UI requires an answer before continuing. This keeps scoring safe if skipping is added later.
    if (answer === null || answer === undefined) {
      return;
    }

    const keyedAnswer = question.reverse ? 6 - answer : answer;
    const centeredAnswer = keyedAnswer - 3; // Maps 1..5 to -2..2 so Neutral adds no directional signal.
    const questionKind = getQuestionKind(question);
    const scoringWeight = Number.isFinite(question.scoringWeight) ? question.scoringWeight : 1;

    if (Object.hasOwn(dimensionRaw, question.dimension)) {
      const focusRoleIds = getDimensionFocusRoleIds(question.dimension);
      const dimensionWeight = focusRoleIds.reduce((sum, typeId) => sum + (question.weights[typeId] ?? 0), 0);

      if (dimensionWeight) {
        dimensionRaw[question.dimension] += centeredAnswer * dimensionWeight * scoringWeight;
        dimensionMaxAbs[question.dimension] += 2 * Math.abs(dimensionWeight) * scoringWeight;
      }
    }

    Object.entries(question.weights).forEach(([typeId, weight]) => {
      if (!weight || !Object.hasOwn(rawScores[questionKind], typeId)) {
        return;
      }

      rawScores[questionKind][typeId] += centeredAnswer * weight * scoringWeight;
      maxAbsScores[questionKind][typeId] += 2 * Math.abs(weight) * scoringWeight;

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
    .map((type, order) => {
      const anchorAlignment = normalizeAlignment(rawScores.anchor[type.id], maxAbsScores.anchor[type.id]);
      const tradeoffAlignment = normalizeAlignment(rawScores.tradeoff[type.id], maxAbsScores.tradeoff[type.id]);
      const alignment = Math.round(anchorAlignment * scoreBlend.anchor + tradeoffAlignment * scoreBlend.tradeoff);

      return {
        ...type,
        order,
        rawScore: rawScores.anchor[type.id] + rawScores.tradeoff[type.id],
        extremeCount: extremeCounts[type.id],
        anchorAlignment,
        tradeoffAlignment,
        alignment,
      };
    })
    .sort(
      (a, b) =>
        b.alignment - a.alignment ||
        comparePriorityDimensions(a, b, dimensionById) ||
        b.extremeCount - a.extremeCount ||
        b.rawScore - a.rawScore ||
        a.order - b.order,
    );

  const [primaryType, secondaryType] = ranked;
  const resultLabel = getResultLabel(primaryType, secondaryType);
  const roundedProfile = getRoundedProfile(ranked);
  const isLowDifferentiation = getResponseVariance(state.answers) < 0.35;
  const badges = calculateBadges({
    ranked,
    dimensions,
    answers: state.answers,
    isRoundedProfile: roundedProfile.isRounded,
  });

  return {
    ranked,
    dimensions,
    badges,
    primaryType,
    secondaryType,
    resultLabel,
    resultMode: resultLabel.mode,
    isRoundedProfile: roundedProfile.isRounded,
    roundedProfile,
    isLowDifferentiation,
  };
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

function renderSystemsSignal(systemsDimension, isActive) {
  if (!isActive || !systemsDimension) {
    return "";
  }

  return `
    <div class="systems-signal">
      <h3>Systems Thinking Signal</h3>
      <p>
        You showed a strong preference for reusable patterns, consistency, documentation, accessibility, or shared product language.
        This strengthens several paths: UX Design, Interaction Design, Content Design, Human Factors, Product Design, and Design Technology.
      </p>
      <p class="systems-signal__note">Keep this as a secondary signal, not a top-level result.</p>
    </div>
  `;
}

function getBadgeLevels() {
  return [...(config.badgeLevels?.length ? config.badgeLevels : DEFAULT_BADGE_LEVELS)].sort(
    (levelA, levelB) => levelB.minScore - levelA.minScore,
  );
}

function getBadgeDefinitions() {
  return config.badges ?? (typeof DEFAULT_BADGES !== "undefined" ? DEFAULT_BADGES : []);
}

function getBadgeLevel(score, levels = getBadgeLevels()) {
  return levels.find((level) => score >= level.minScore) ?? null;
}

function getComputedBadgeSignal(signal, dimensions, isRoundedProfile) {
  if (signal.id !== "roundedProfile") {
    return null;
  }

  if (isRoundedProfile) {
    return 88;
  }

  const topDimensions = dimensions.slice(0, 4);

  if (!topDimensions.length) {
    return null;
  }

  return Math.round(topDimensions.reduce((sum, dimension) => sum + dimension.alignment, 0) / topDimensions.length);
}

function getQuestionBadgeSignal(signal, answers) {
  const questionIndex = config.questions.findIndex((question) => question.id === signal.id);

  if (questionIndex < 0) {
    return null;
  }

  const answer = answers[questionIndex];

  if (!Number.isFinite(answer)) {
    return null;
  }

  const question = config.questions[questionIndex];
  const keyedAnswer = question.reverse ? 6 - answer : answer;
  const direction = signal.direction === "disagree" ? "disagree" : "agree";

  // Maps the requested answer direction to a 0-100 badge signal, with Neutral at 50.
  return direction === "disagree" ? Math.round(((5 - keyedAnswer) / 4) * 100) : Math.round(((keyedAnswer - 1) / 4) * 100);
}

function calculateBadges({ ranked, dimensions, answers = [], isRoundedProfile }) {
  const roleById = new Map(ranked.map((type) => [type.id, type]));
  const dimensionById = new Map(dimensions.map((dimension) => [dimension.id, dimension]));
  const levels = getBadgeLevels();

  return getBadgeDefinitions()
    .map((badge, order) => {
      let total = 0;
      let totalWeight = 0;

      (badge.signals ?? []).forEach((signal) => {
        let value = null;

        if (signal.source === "dimension") {
          value = dimensionById.get(signal.id)?.alignment;
        } else if (signal.source === "role") {
          value = roleById.get(signal.id)?.alignment;
        } else if (signal.source === "computed") {
          value = getComputedBadgeSignal(signal, dimensions, isRoundedProfile);
        } else if (signal.source === "question") {
          value = getQuestionBadgeSignal(signal, answers);
        }

        if (!Number.isFinite(value) || !Number.isFinite(signal.weight)) {
          return;
        }

        total += value * signal.weight;
        totalWeight += signal.weight;
      });

      const score = totalWeight ? Math.round(total / totalWeight) : 0;
      const level = getBadgeLevel(score, levels);

      return {
        ...badge,
        order,
        score,
        level,
        color: level?.color ?? "#d8d1c5",
        sourceSummary: `${(badge.signals ?? []).length} configured signals`,
      };
    })
    .filter((badge) => badge.level)
    .sort(
      (badgeA, badgeB) =>
        (LEVEL_RANK[badgeB.level.id] ?? 0) - (LEVEL_RANK[badgeA.level.id] ?? 0) ||
        badgeB.score - badgeA.score ||
        badgeA.order - badgeB.order,
    );
}

function renderBadgePanel(badges) {
  const visibleBadges = badges.slice(0, MAX_VISIBLE_BADGES);
  const badgeMarkup = visibleBadges.length
    ? visibleBadges
        .map(
          (badge) => `
            <article class="designer-badge designer-badge--${escapeHtml(badge.level.id)}" style="--badge-color: ${escapeHtml(badge.color)}">
              <div class="designer-badge__icon" aria-hidden="true">${escapeHtml(badge.icon)}</div>
              <div class="designer-badge__copy">
                <div class="designer-badge__top">
                  <h4>${escapeHtml(badge.name)}</h4>
                  <span>${escapeHtml(badge.level.name)}</span>
                </div>
                <p>${escapeHtml(badge.description)}</p>
                <div
                  class="designer-badge__meter"
                  role="progressbar"
                  aria-label="${escapeHtml(badge.name)} score"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-valuenow="${badge.score}"
                >
                  <span style="--badge-score: ${badge.score}%"></span>
                </div>
              </div>
            </article>
          `,
        )
        .join("")
    : `
      <p class="badge-panel__empty">
        No badges unlocked yet - your profile is still emerging. Stronger tradeoffs will make this clearer.
      </p>
    `;

  return `
    <div class="badge-panel__header">
      <p class="eyebrow">Designer badges</p>
      <h3>Your strongest sub-signals</h3>
      <p>Badges summarize skill signals from your answers. They are directional, not credentials.</p>
    </div>
    <div class="badge-grid">${badgeMarkup}</div>
  `;
}

function formatWeightPercent(weight) {
  if (!Number.isFinite(weight)) {
    return "";
  }

  return `${Math.round(weight * 100)}%`;
}

function formatBadgeSignal(signal = {}, includeWeight = true) {
  const percent = formatWeightPercent(signal.weight);
  const suffix = includeWeight && percent ? ` (${percent})` : "";

  switch (signal.source) {
    case "dimension":
      return `${getDimensionLabel(signal.id)}${suffix}`;
    case "role":
      return `${getRoleLabel(signal.id)} alignment${suffix}`;
    case "question":
      return `${signal.direction === "disagree" ? "Disagree with" : "Agree with"} ${getQuestionLabel(signal.id)}${suffix}`;
    case "computed":
      if (signal.id === "roundedProfile") {
        return `Rounded profile / balanced high scores${suffix}`;
      }

      return `Computed signal: ${signal.id ?? "unknown"}${suffix}`;
    default:
      return `${signal.source ?? "Signal"}: ${signal.id ?? "unknown"}${suffix}`;
  }
}

function formatBadgeFormula(badge = {}) {
  if (!badge.signals?.length) {
    return "Configured manually.";
  }

  return badge.signals.map(formatBadgeSignal).join(" + ");
}

function formatBadgeLevels() {
  const levels = getBadgeLevels().sort((levelA, levelB) => levelA.minScore - levelB.minScore);

  if (!levels.length) {
    return "Badge levels are calculated from each badge score.";
  }

  return levels
    .map((level) => {
      const name = level.name ?? level.id ?? "Level";
      const threshold = Number.isFinite(level.minScore) ? `${level.minScore}+` : "threshold";

      return `${name} ${threshold}`;
    })
    .join(" / ");
}

function renderBadgeGlossaryRow(badge = {}) {
  const signals = badge.signals?.length
    ? badge.signals
        .map((signal) => `<span class="badge-signal-chip">${escapeHtml(formatBadgeSignal(signal, false))}</span>`)
        .join("")
    : `<span class="badge-signal-chip">Configured manually</span>`;

  return `
    <tr class="badge-glossary-row">
      <td class="badge-glossary-cell badge-glossary-cell--badge" data-label="Badge">
        <span class="badge-glossary-icon" aria-hidden="true">${escapeHtml(badge.icon ?? "*")}</span>
        <div>
          <h3>${escapeHtml(badge.name ?? "Unnamed badge")}</h3>
          <p>${escapeHtml(badge.id ?? "badge")}</p>
        </div>
      </td>

      <td class="badge-glossary-cell" data-label="Description">
        <p>${escapeHtml(badge.description ?? "No description provided.")}</p>
      </td>

      <td class="badge-glossary-cell badge-glossary-cell--signals" data-label="How it is calculated">
        <div class="badge-signal-list">${signals}</div>
        <details class="badge-formula-details">
          <summary>View weighting</summary>
          <p>${escapeHtml(formatBadgeFormula(badge))}</p>
        </details>
      </td>
    </tr>
  `;
}

function renderBadgeGlossary() {
  if (!badgeGlossaryGrid) {
    return;
  }

  const badges = getBadgeDefinitions();

  if (badgeGlossaryLevels) {
    badgeGlossaryLevels.textContent = `${formatBadgeLevels()} / Directional signals, not credentials.`;
  }

  if (!badges.length) {
    badgeGlossaryGrid.innerHTML = `
      <tr><td class="badge-glossary__empty" colspan="3">Badge definitions have not been configured yet.</td></tr>
    `;
    return;
  }

  badgeGlossaryGrid.innerHTML = badges.map(renderBadgeGlossaryRow).join("");
}

function downloadUrl(url, filename) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
}

function copyComputedStyles(source, target) {
  const computedStyle = window.getComputedStyle(source);

  for (const property of computedStyle) {
    target.style.setProperty(property, computedStyle.getPropertyValue(property), computedStyle.getPropertyPriority(property));
  }

  Array.from(source.children).forEach((sourceChild, index) => {
    const targetChild = target.children[index];

    if (targetChild) {
      copyComputedStyles(sourceChild, targetChild);
    }
  });
}

function buildResultExportClone() {
  const exportWidth = Math.min(1180, Math.max(760, resultCard.scrollWidth));
  const wrapper = document.createElement("div");
  const clone = resultCard.cloneNode(true);

  wrapper.style.position = "fixed";
  wrapper.style.left = "-10000px";
  wrapper.style.top = "0";
  wrapper.style.width = `${exportWidth}px`;
  wrapper.style.background = "#f4f7f8";
  wrapper.style.pointerEvents = "none";

  clone.hidden = false;
  clone.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
  clone.querySelectorAll("[id]").forEach((element) => element.removeAttribute("id"));
  wrapper.append(clone);
  document.body.append(wrapper);

  copyComputedStyles(resultCard, clone);

  clone.querySelector(".result-actions")?.remove();
  clone.querySelector(".save-status")?.remove();
  clone.style.width = "100%";
  clone.style.margin = "0";
  clone.style.boxShadow = "none";

  const rect = clone.getBoundingClientRect();
  return {
    clone,
    wrapper,
    width: Math.ceil(rect.width),
    height: Math.ceil(clone.scrollHeight),
  };
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to prepare the result image."));
    image.src = url;
  });
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error("Unable to create image file."));
    }, "image/png");
  });
}

function downloadSvgFallback(svgText) {
  const fallbackUrl = URL.createObjectURL(new Blob([svgText], { type: "image/svg+xml;charset=utf-8" }));
  downloadUrl(fallbackUrl, `${state.resultFileBase}.svg`);
  window.setTimeout(() => URL.revokeObjectURL(fallbackUrl), 1000);
}

function saveResultPdf() {
  if (resultCard.hidden) {
    return;
  }

  setButtonBusy(savePdfButton, true);
  setSaveStatus("Opening the print dialog. Choose Save as PDF to export your result.");
  window.print();
  window.setTimeout(() => setButtonBusy(savePdfButton, false), 500);
}

async function saveResultImage() {
  if (resultCard.hidden) {
    return;
  }

  let wrapper;
  let svgUrl;
  let svgText = "";

  try {
    setButtonBusy(saveImageButton, true);
    setSaveStatus("Preparing image export...");

    const exportClone = buildResultExportClone();
    wrapper = exportClone.wrapper;

    const serializedClone = new XMLSerializer().serializeToString(exportClone.clone);
    svgText = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${exportClone.width}" height="${exportClone.height}" viewBox="0 0 ${exportClone.width} ${exportClone.height}">
        <foreignObject width="100%" height="100%">${serializedClone}</foreignObject>
      </svg>
    `;
    svgUrl = URL.createObjectURL(new Blob([svgText], { type: "image/svg+xml;charset=utf-8" }));

    const image = await loadImage(svgUrl);
    const scale = 2;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas export is not available in this browser.");
    }

    canvas.width = exportClone.width * scale;
    canvas.height = exportClone.height * scale;
    context.scale(scale, scale);
    context.drawImage(image, 0, 0, exportClone.width, exportClone.height);
    const pngUrl = URL.createObjectURL(await canvasToBlob(canvas));
    downloadUrl(pngUrl, `${state.resultFileBase}.png`);
    window.setTimeout(() => URL.revokeObjectURL(pngUrl), 1000);
    setSaveStatus("Saved result image.");
  } catch (error) {
    console.error(error);

    if (svgText) {
      downloadSvgFallback(svgText);
      setSaveStatus("PNG export was blocked, so an SVG image was saved instead.", true);
    } else {
      setSaveStatus("Image export failed. Use Save PDF as a fallback.", true);
    }
  } finally {
    if (svgUrl) {
      URL.revokeObjectURL(svgUrl);
    }

    wrapper?.remove();
    setButtonBusy(saveImageButton, false);
  }
}

function renderResult() {
  const audienceContext = getAudienceContext();

  if (!audienceContext) {
    hide(quizCard);
    hide(resultCard);
    show(introPanel);
    renderAudienceContexts();
    return;
  }

  const {
    ranked,
    dimensions,
    badges,
    primaryType: topType,
    secondaryType: secondType,
    resultLabel,
    roundedProfile,
    isLowDifferentiation,
  } = calculateScores();
  const topDimensions = dimensions.slice(0, 3);
  const topDimensionIds = topDimensions.map((dimension) => dimension.id);
  const systemsDimension = dimensions.find((dimension) => dimension.id === "systems");
  const hasSystemsSignal = systemsDimension && (systemsDimension.alignment >= 70 || topDimensionIds.includes("systems"));
  const visualCard = resultRadar.closest(".result-visual-card");

  resultContext.textContent = `Guidance for ${audienceContext.name.toLowerCase()}. ${audienceContext.resultIntroduction}`;

  visualCard?.style.setProperty("--result-color", topType.color);
  visualCard?.style.setProperty("--result-fill", hexToRgba(topType.color, 0.16));
  resultRadar.innerHTML = renderRadarChart({
    dimensions,
    color: topType.color,
    title: "Your Designer Skill Shape",
  });
  badgePanel.innerHTML = renderBadgePanel(badges);

  if (roundedProfile.isRounded) {
    resultEyebrow.textContent = "Rounded profile";
    resultTitle.textContent = "Multidisciplinary Designer";
    resultSummary.textContent =
      "Your answers show broad coverage across several design-adjacent paths. Use this as breadth, then use your strongest lanes as portfolio positioning.";

    secondaryResult.hidden = false;
    secondaryResult.innerHTML = `
      <h3>Closest emphasis: ${escapeHtml(topType.name)}${secondType ? ` + ${escapeHtml(secondType.name)}` : ""}</h3>
      <p>Your highest role signals still matter. The rounded profile means you can credibly frame yourself as T-shaped instead of narrowly specialized.</p>
    `;
  } else {
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
  }

  state.resultFileBase = `designer-type-${slugify(resultTitle.textContent)}`;
  setSaveStatus("");

  responseWarning.hidden = !isLowDifferentiation;
  responseWarning.textContent = isLowDifferentiation
    ? "Your responses were very similar across questions, so this result may be less differentiated. Try retaking the quiz and forcing tradeoffs."
    : "";

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
    ${renderSystemsSignal(systemsDimension, hasSystemsSignal)}
  `;

  const companyReferenceTypes = roundedProfile.isRounded ? ranked.slice(0, 4) : [topType, secondType].filter(Boolean);
  const guidanceHeadings = audienceContext.headings ?? {};
  const nextStepSections = roundedProfile.isRounded
    ? [
        renderList("How to use this result", [
          "Position yourself around the top two lanes instead of claiming every lane equally.",
          "Build one portfolio project that shows breadth: research, interaction, content, systems, and implementation judgment.",
          "Use the ranked scores to choose which job descriptions and portfolios to study first.",
        ]),
        renderList(guidanceHeadings.skills ?? `Strongest lane: ${topType.name}`, topType.skillsToBuild),
        renderList(
          guidanceHeadings.roles ?? "Roles to explore",
          Array.from(new Set(ranked.slice(0, 3).flatMap((type) => type.rolesToExplore ?? []))).slice(0, 6),
        ),
        renderResultCompanySection(companyReferenceTypes),
      ]
    : [
        renderList("Strengths", topType.strengths),
        renderList(guidanceHeadings.projects ?? "Project ideas", topType.projectIdeas),
        renderList(guidanceHeadings.skills ?? "Skills to build next", topType.skillsToBuild),
        renderList(guidanceHeadings.roles ?? "Roles to explore", topType.rolesToExplore),
        renderResultCompanySection(companyReferenceTypes),
      ];

  nextSteps.innerHTML = nextStepSections.join("");

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
  animateResultEntry();
  resultAnnouncement.textContent = `Your result is ${resultTitle.textContent}.`;
  persistProgress();
  resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
}

startButton.addEventListener("click", () => {
  if (!getAudienceContext()) {
    return;
  }

  hide(introPanel);
  hide(resultCard);
  show(quizCard);
  minimizeReferenceSections();
  renderQuestion();
  persistProgress();
  quizCard.scrollIntoView({ behavior: "smooth", block: "start" });
});

audienceContextOptions.addEventListener("change", (event) => {
  if (!(event.target instanceof HTMLInputElement) || !isAudienceContextId(event.target.value)) {
    return;
  }

  state.audienceContext = event.target.value;
  startButton.disabled = false;
  persistProgress();
});

answerScale.addEventListener("change", (event) => {
  if (event.target instanceof HTMLInputElement) {
    state.answers[state.index] = Number.parseInt(event.target.value, 10);
    nextButton.disabled = false;
    persistProgress();
  }
});

backButton.addEventListener("click", () => {
  state.index = Math.max(0, state.index - 1);
  renderQuestion();
  persistProgress();
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
  persistProgress();
  focusQuestionViewport();
});

restartButton.addEventListener("click", () => {
  state.index = 0;
  state.answers = Array(config.questions.length).fill(null);
  setSaveStatus("");
  hide(resultCard);
  show(introPanel);
  renderAudienceContexts();
  persistProgress();
  introPanel.scrollIntoView({ behavior: "smooth", block: "start" });
});

changeContextButton.addEventListener("click", () => {
  state.index = 0;
  state.answers = Array(config.questions.length).fill(null);
  state.audienceContext = null;
  clearSavedProgress();
  setSaveStatus("");
  hide(resultCard);
  hide(quizCard);
  show(introPanel);
  renderAudienceContexts();
  introPanel.scrollIntoView({ behavior: "smooth", block: "start" });
});

typePreviewToggle.addEventListener("click", () => {
  toggleCollapsibleSection(typePreviewToggle, typePreviewContent);
});

badgeGlossaryToggle.addEventListener("click", () => {
  toggleCollapsibleSection(badgeGlossaryToggle, badgeGlossaryContent);
});

themeToggle.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  saveTheme(nextTheme);
});

const systemThemePreference = window.matchMedia("(prefers-color-scheme: dark)");
systemThemePreference.addEventListener("change", (event) => {
  if (!getSavedTheme()) {
    applyTheme(event.matches ? "dark" : "light");
  }
});

document.addEventListener("keydown", (event) => {
  if (quizCard.hidden || event.altKey || event.ctrlKey || event.metaKey) {
    return;
  }

  if (/^[1-5]$/.test(event.key)) {
    const input = answerScale.querySelector(`input[value="${event.key}"]`);

    if (input instanceof HTMLInputElement) {
      input.checked = true;
      input.dispatchEvent(new Event("change", { bubbles: true }));
      input.focus();
      event.preventDefault();
    }

    return;
  }

  const activeElement = document.activeElement;
  const isNativeAction = activeElement instanceof HTMLButtonElement || activeElement instanceof HTMLAnchorElement;

  if (event.key === "Enter" && !nextButton.disabled && !isNativeAction) {
    nextButton.click();
    event.preventDefault();
  }
});

savePdfButton.addEventListener("click", saveResultPdf);
saveImageButton.addEventListener("click", saveResultImage);
printResultButton.addEventListener("click", () => window.print());
window.addEventListener("afterprint", () => setButtonBusy(savePdfButton, false));

applyTheme(document.documentElement.dataset.theme);
renderAudienceContexts();
renderTypePreview();
renderBadgeGlossary();
initializeInViewMotion();
