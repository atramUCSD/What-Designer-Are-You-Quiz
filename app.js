const config = window.DESIGNER_TYPE_TEST;

const introPanel = document.getElementById("intro-panel");
const quizCard = document.getElementById("quiz-card");
const resultCard = document.getElementById("result-card");
const typeGrid = document.getElementById("type-grid");
const scoreStack = document.getElementById("score-stack");
const questionNumber = document.getElementById("question-number");
const questionTotal = document.getElementById("question-total");
const questionText = document.getElementById("question-text");
const progressBar = document.getElementById("progress-bar");
const answerScale = document.getElementById("answer-scale");
const startButton = document.getElementById("start-button");
const backButton = document.getElementById("back-button");
const nextButton = document.getElementById("next-button");
const restartButton = document.getElementById("restart-button");
const resultTitle = document.getElementById("result-title");
const resultSummary = document.getElementById("result-summary");

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

function renderTypePreview() {
  typeGrid.innerHTML = config.types
    .map(
      (type) => `
        <article class="type-card" style="--type-color: ${type.color}">
          <span>${type.id}</span>
          <h3>${type.name}</h3>
          <p>${type.summary}</p>
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
            ${item.label}
          </label>
        `,
      )
      .join("")}
  `;
}

function renderQuestion() {
  const question = config.questions[state.index];
  questionNumber.textContent = String(state.index + 1);
  questionTotal.textContent = String(config.questions.length);
  questionText.textContent = question.prompt;
  progressBar.style.width = `${((state.index + 1) / config.questions.length) * 100}%`;
  backButton.disabled = state.index === 0;
  nextButton.textContent = state.index === config.questions.length - 1 ? "See result" : "Next";
  renderScale();
}

function calculateScores() {
  const scores = Object.fromEntries(config.types.map((type) => [type.id, 0]));
  const maxScores = Object.fromEntries(config.types.map((type) => [type.id, 0]));

  config.questions.forEach((question, index) => {
    const answer = state.answers[index] ?? 3;

    Object.entries(question.weights).forEach(([typeId, weight]) => {
      scores[typeId] += answer * weight;
      maxScores[typeId] += 5 * weight;
    });
  });

  return config.types
    .map((type) => ({
      ...type,
      score: scores[type.id],
      percent: maxScores[type.id] ? Math.round((scores[type.id] / maxScores[type.id]) * 100) : 0,
    }))
    .sort((a, b) => b.percent - a.percent);
}

function renderResult() {
  const ranked = calculateScores();
  const topType = ranked[0];

  resultTitle.textContent = topType.name;
  resultSummary.textContent = topType.summary;
  scoreStack.innerHTML = ranked
    .map(
      (type) => `
        <div class="score-row">
          <div class="score-row__top">
            <span>${type.name}</span>
            <span>${type.percent}%</span>
          </div>
          <div class="score-row__bar" aria-hidden="true">
            <span style="--score-width: ${type.percent}%; --score-color: ${type.color}"></span>
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
  }
});

backButton.addEventListener("click", () => {
  state.index = Math.max(0, state.index - 1);
  renderQuestion();
});

nextButton.addEventListener("click", () => {
  if (!state.answers[state.index]) {
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
