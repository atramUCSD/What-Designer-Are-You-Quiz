import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../questions.js", import.meta.url), "utf8");
const sandbox = { window: {} };

vm.runInNewContext(source, sandbox);

const config = sandbox.window.DESIGNER_TYPE_TEST;
const roleIds = ["product", "ux", "interaction", "research", "technology", "humanFactors", "content"];
const dimensionIds = ["strategy", "experienceDesign", "research", "systems", "build", "humanFactors", "content"];
const sorted = (items) => [...items].sort().join(",");

assert(config, "Missing DESIGNER_TYPE_TEST config.");
assert.equal(sorted(config.types.map((type) => type.id)), sorted(roleIds), "Unexpected result role IDs.");
assert(!config.types.some((type) => type.id === "systems"), "Systems must remain dimension-only.");
assert.equal(config.types.find((type) => type.id === "technology")?.name, "Design Engineer / UI Engineer");
assert.equal(sorted(config.dimensions.map((dimension) => dimension.id)), sorted(dimensionIds), "Unexpected dimensions.");
assert.equal(config.questions.length, 20, "Expected exactly 20 questions.");

for (const kind of ["tradeoff", "anchor"]) {
  assert.equal(config.scales?.[kind]?.length, 5, `Expected a five-point ${kind} scale.`);
  assert.deepEqual(
    Array.from(config.scales[kind], (item) => item.value),
    [1, 2, 3, 4, 5],
    `${kind} scale values must run from 1 to 5.`,
  );
}

const kinds = config.questions.reduce((counts, question) => {
  counts[question.kind] = (counts[question.kind] ?? 0) + 1;
  return counts;
}, {});

assert.deepEqual({ ...kinds }, { anchor: 7, tradeoff: 13 });

const anchorCounts = Object.fromEntries(roleIds.map((roleId) => [roleId, 0]));
const sideCounts = Object.fromEntries(roleIds.map((roleId) => [roleId, { left: 0, right: 0 }]));
const tradeoffCounts = Object.fromEntries(roleIds.map((roleId) => [roleId, 0]));
let authoritativeCount = 0;
let supportingCount = 0;

for (const question of config.questions) {
  assert(question.id && question.prompt, "Every question needs an ID and prompt.");
  assert.equal(sorted(Object.keys(question.weights ?? {})), sorted(roleIds), `${question.id} has invalid role keys.`);
  assert.equal(
    sorted(Object.keys(question.dimensionWeights ?? {})),
    sorted(dimensionIds),
    `${question.id} has invalid dimension keys.`,
  );
  assert(Object.values(question.weights).every(Number.isFinite), `${question.id} has a non-numeric role weight.`);
  assert(Object.values(question.dimensionWeights).every(Number.isFinite), `${question.id} has a non-numeric dimension weight.`);

  if (question.kind === "anchor") {
    assert(roleIds.includes(question.anchorRole), `${question.id} has an invalid anchor role.`);
    anchorCounts[question.anchorRole] += 1;

    for (const roleId of roleIds) {
      assert.equal(question.weights[roleId], roleId === question.anchorRole ? 3 : 0, `${question.id} is not a narrow anchor.`);
    }

    continue;
  }

  assert.equal(question.kind, "tradeoff", `${question.id} has an invalid kind.`);
  assert(question.leftLabel && question.rightLabel, `${question.id} is missing a tradeoff pole.`);
  assert.notEqual(question.leftRole, question.rightRole, `${question.id} compares a role with itself.`);
  assert(roleIds.includes(question.leftRole) && roleIds.includes(question.rightRole), `${question.id} has an invalid role pole.`);

  const weightMagnitude = Math.abs(question.weights[question.rightRole]);
  assert([3, 4].includes(weightMagnitude), `${question.id} must use a supporting (3) or authoritative (4) weight.`);
  assert.equal(question.weights[question.leftRole], -weightMagnitude, `${question.id} role contrast is not symmetric.`);
  authoritativeCount += weightMagnitude === 4 ? 1 : 0;
  supportingCount += weightMagnitude === 3 ? 1 : 0;

  for (const roleId of roleIds) {
    const expected = roleId === question.leftRole ? -weightMagnitude : roleId === question.rightRole ? weightMagnitude : 0;
    assert.equal(question.weights[roleId], expected, `${question.id} role contrast is not balanced.`);
  }

  sideCounts[question.leftRole].left += 1;
  sideCounts[question.rightRole].right += 1;
  tradeoffCounts[question.leftRole] += 1;
  tradeoffCounts[question.rightRole] += 1;
}

assert.equal(authoritativeCount, 8, "Expected eight authoritative tradeoffs.");
assert.equal(supportingCount, 5, "Expected five supporting tradeoffs.");

for (const roleId of roleIds) {
  assert.equal(anchorCounts[roleId], 1, `${roleId} must have exactly one anchor.`);
  assert(
    tradeoffCounts[roleId] >= 3 && tradeoffCounts[roleId] <= 4,
    `${roleId} must appear in three or four direct tradeoffs.`,
  );
  assert(
    Math.abs(sideCounts[roleId].left - sideCounts[roleId].right) <= 1,
    `${roleId} has unbalanced left/right placement.`,
  );
}

const expectedSystemsWeights = { q03: -1, q04: 1, q06: 1, q09: 1, q12: 1, q15: 1 };
for (const question of config.questions) {
  assert.equal(
    question.dimensionWeights.systems,
    expectedSystemsWeights[question.id] ?? 0,
    `${question.id} has an unexpected Systems weight.`,
  );
}

const questionById = new Map(config.questions.map((question) => [question.id, question]));
for (const badge of config.badges ?? []) {
  for (const signal of badge.signals ?? []) {
    if (signal.source !== "question") continue;

    const question = questionById.get(signal.id);
    assert(question, `${badge.id} references missing question ${signal.id}.`);
    assert(["left", "right", "high"].includes(signal.target), `${badge.id} has an invalid question target.`);
    assert(signal.target !== "high" || question.kind === "anchor", `${badge.id} uses high on a tradeoff.`);
    assert(signal.target === "high" || question.kind === "tradeoff", `${badge.id} uses a pole on an anchor.`);
  }
}

function answerSignal(answer) {
  if (answer === 1) return -1;
  if (answer === 2) return -0.5;
  if (answer === 4) return 0.5;
  if (answer === 5) return 1;
  return 0;
}

function normalize(raw, maximum) {
  return maximum ? Math.round(50 + 50 * Math.max(-1, Math.min(1, raw / maximum))) : 50;
}

function scoreAnswers(answers) {
  const roleRaw = Object.fromEntries(roleIds.map((roleId) => [roleId, 0]));
  const roleMax = Object.fromEntries(roleIds.map((roleId) => [roleId, 0]));
  const dimensionRaw = Object.fromEntries(dimensionIds.map((dimensionId) => [dimensionId, 0]));
  const dimensionMax = Object.fromEntries(dimensionIds.map((dimensionId) => [dimensionId, 0]));

  config.questions.forEach((question, index) => {
    const multiplier = question.kind === "anchor" ? 0.75 : 1;
    const signal = answerSignal(answers[index]);

    for (const roleId of roleIds) {
      const weight = question.weights[roleId] * multiplier;
      roleRaw[roleId] += signal * weight;
      roleMax[roleId] += Math.abs(weight);
    }

    for (const dimensionId of dimensionIds) {
      const weight = question.dimensionWeights[dimensionId] * multiplier;
      dimensionRaw[dimensionId] += signal * weight;
      dimensionMax[dimensionId] += Math.abs(weight);
    }
  });

  return {
    roles: Object.fromEntries(roleIds.map((roleId) => [roleId, normalize(roleRaw[roleId], roleMax[roleId])])),
    dimensions: Object.fromEntries(
      dimensionIds.map((dimensionId) => [dimensionId, normalize(dimensionRaw[dimensionId], dimensionMax[dimensionId])]),
    ),
  };
}

function archetypeAnswers(targetRole) {
  return config.questions.map((question) => {
    if (question.kind === "anchor") return question.anchorRole === targetRole ? 5 : 3;
    if (question.leftRole === targetRole) return 1;
    if (question.rightRole === targetRole) return 5;
    return 3;
  });
}

function blendAnswers(firstRole, secondRole) {
  return config.questions.map((question) => {
    if (question.kind === "anchor") return [firstRole, secondRole].includes(question.anchorRole) ? 5 : 3;

    const leftMatches = question.leftRole === firstRole || question.leftRole === secondRole;
    const rightMatches = question.rightRole === firstRole || question.rightRole === secondRole;
    if (leftMatches && rightMatches) return 3;
    if (leftMatches) return 1;
    if (rightMatches) return 5;
    return 3;
  });
}

const neutral = scoreAnswers(Array(config.questions.length).fill(3));
assert(Object.values(neutral.roles).every((score) => score === 50), "All-middle role scores must equal 50.");
assert(Object.values(neutral.dimensions).every((score) => score === 50), "All-middle dimensions must equal 50.");

for (const roleId of roleIds) {
  const scores = scoreAnswers(archetypeAnswers(roleId)).roles;
  assert(scores[roleId] >= 85, `${roleId} archetype did not strongly surface its target.`);
  assert(Math.min(...roleIds.filter((id) => id !== roleId).map((id) => scores[id])) < 45, `${roleId} lacks an opposing dip.`);
}

for (const pair of [["ux", "research"], ["interaction", "technology"]]) {
  const scores = scoreAnswers(blendAnswers(...pair)).roles;
  const ranked = roleIds.toSorted((first, second) => scores[second] - scores[first]);
  assert(pair.every((roleId) => ranked.slice(0, 2).includes(roleId)), `${pair.join("/")} blend did not surface both roles.`);
  assert(Math.abs(scores[pair[0]] - scores[pair[1]]) <= 4, `${pair.join("/")} blend is not balanced.`);
}

let randomState = 19_173;
const random = () => ((randomState = (randomState * 1_664_525 + 1_013_904_223) >>> 0) / 4_294_967_296);
const simulationRuns = 20_000;
const winShares = Object.fromEntries(roleIds.map((roleId) => [roleId, 0]));
const spreads = [];
let allAboveMidpoint = 0;

for (let run = 0; run < simulationRuns; run += 1) {
  const answers = Array.from({ length: config.questions.length }, () => 1 + Math.floor(random() * 5));
  const scores = scoreAnswers(answers).roles;
  const values = roleIds.map((roleId) => scores[roleId]);
  const maximum = Math.max(...values);
  const winners = roleIds.filter((roleId) => scores[roleId] === maximum);

  winners.forEach((roleId) => {
    winShares[roleId] += 1 / winners.length;
  });
  if (Math.min(...values) >= 50) allAboveMidpoint += 1;
  spreads.push(maximum - Math.min(...values));
}

spreads.sort((first, second) => first - second);
const winnerPercentages = Object.fromEntries(
  roleIds.map((roleId) => [roleId, Number(((winShares[roleId] / simulationRuns) * 100).toFixed(1))]),
);
const allAbovePercentage = (allAboveMidpoint / simulationRuns) * 100;
const medianSpread = spreads[Math.floor(spreads.length / 2)];

assert(Object.values(winnerPercentages).every((share) => share >= 8 && share <= 20), "Monte Carlo winner shares are imbalanced.");
assert(allAbovePercentage < 3, "Too many decisive runs keep every role above 50.");
assert(medianSpread >= 25, "Simulated role spread is too compressed.");

const allLeft = scoreAnswers(config.questions.map((question) => (question.kind === "anchor" ? 3 : 1))).roles;
const allRight = scoreAnswers(config.questions.map((question) => (question.kind === "anchor" ? 3 : 5))).roles;
for (const roleId of roleIds) {
  assert.equal(allLeft[roleId] + allRight[roleId], 100, `${roleId} has asymmetric side scoring.`);
  assert(Math.abs(allLeft[roleId] - 50) <= 10, `${roleId} has excessive side-position bias.`);
}

const honoraryBadge = config.badges.find((badge) => badge.id === "honorary-software-engineer");
const technologyAnswers = archetypeAnswers("technology");
const roundedAnswers = config.questions.map((question) => (question.kind === "anchor" ? 5 : 3));
const questionTargetValue = (signal, answers) => {
  const questionIndex = config.questions.findIndex((question) => question.id === signal.id);
  const answer = answers[questionIndex];
  return signal.target === "left" ? ((5 - answer) / 4) * 100 : ((answer - 1) / 4) * 100;
};
const honoraryScore = Math.round(
  honoraryBadge.signals.reduce((total, signal) => total + questionTargetValue(signal, technologyAnswers) * signal.weight, 0),
);
assert(honoraryScore >= 87, "The technology archetype should earn a Rainbow Honorary Software Engineer signal.");
assert.equal(
  honoraryBadge.signals.filter((signal) => questionTargetValue(signal, roundedAnswers) >= 75).length,
  1,
  "A rounded profile should have only one strong direct coding signal.",
);
assert.equal(honoraryBadge.minimumStrongSignals, 3, "Honorary Software Engineer must require three strong direct signals.");

console.log("Relative-fit scoring audit passed:", {
  questions: config.questions.length,
  kinds,
  weights: { authoritative: authoritativeCount, supporting: supportingCount },
  winnerPercentages,
  allAbovePercentage: Number(allAbovePercentage.toFixed(1)),
  medianSpread,
  honoraryScore,
});
