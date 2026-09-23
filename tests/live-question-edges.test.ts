// Opt-in, billable inference tests. Requires MODAIC_E2E=1, MODAIC_API_KEY,
// and MODAIC_API_URL pointing at the local server. No repository capture.
import { expect, test } from "bun:test";
import { Choice, Modaic, ModaicAPIError, Noul, Score, type JsonValue, type Question } from "../src/index.js";

const cases: { name: string; state: JsonValue; noul: Noul; choice: Choice; score: Score }[] = [
  { name: "minimal_singletons", state: { ticket: "Duplicate payment" }, noul: new Noul({ instructions: "Was there a duplicate payment?" }),
    choice: new Choice({ criteria: { only: "Only option" } }), score: new Score({ criteria: ["Only level"] }) },
  { name: "null_instructions", state: { ticket: "Duplicate payment" }, noul: new Noul({ instructions: null, criteria: { true: "Duplicate payment", false: "No duplicate" } }),
    choice: new Choice({ instructions: null, criteria: { yes: null, no: null } }),
    score: new Score({ instructions: null, criteria: ["False", "True"] }) },
  { name: "structured", state: { ticket: "Duplicate payment", amount: 0, resolved: false },
    noul: new Noul({ instructions: { task: "Is a refund needed?" }, criteria: { true: { reason: "Duplicate" } } }),
    choice: new Choice({ instructions: ["Choose a category"],
      criteria: { billing: { examples: ["Duplicate payment"] }, other: ["Everything else"] } }),
    score: new Score({ instructions: { rubric: "Urgency" },
      criteria: [{ description: "Routine" }, ["Urgent", "Financial impact"]] }) },
  { name: "unicode_ids", state: "Paiement en double. 二重請求。💳", noul: new Noul({ criteria: { false: "No duplicate" } }),
    choice: new Choice({ criteria: { "0": "Routine", false: "Unknown", "needs review 🚨": "Duplicate charge" } }),
    score: new Score({ criteria: ["問題なし", "要確認", "緊急 🚨"] }) },
  { name: "many_levels", state: { value: 0 }, noul: new Noul({ instructions: "Is the value nonzero?" }),
    choice: new Choice({ criteria: Object.fromEntries(Array.from({ length: 12 }, (_, i) => [String(i), `Category ${i}`])) }),
    score: new Score({ criteria: Array.from({ length: 7 }, (_, i) => `Severity ${i}`) }) },
  { name: "empty_duplicate_descriptions", state: "", noul: new Noul({ criteria: { true: "", false: "" } }),
    choice: new Choice({ criteria: { a: "", b: "" } }), score: new Score({ criteria: ["Same", "Same"] }) },
  { name: "array_state", state: [], noul: new Noul({ instructions: "Does the input contain information?", criteria: {} }),
    choice: new Choice({ criteria: { empty: "No information", present: "Some information" } }),
    score: new Score({ criteria: ["Nothing", "Partial", "Complete"] }) },
];

for (const sample of cases) {
  test.skipIf(process.env.MODAIC_E2E !== "1")(`live question edges: ${sample.name}`, async () => {
    if (!process.env.MODAIC_API_URL) throw new Error("MODAIC_API_URL must explicitly target the local API");
    const client = new Modaic({ timeoutMs: 60_000 });
    const ids = sample.name === "unicode_ids" ? ["billing.check", "triage / priorité", "score.結果"] : ["n", "c", "s"];
    const questions: Record<string, Question> = Object.fromEntries(ids.map((id, i) =>
      [id, [sample.noul, sample.choice, sample.score][i]!],
    ));
    const result = await client.decisions.create({ model: "typesafe/jev-latest", state: sample.state, questions });
    expect(Object.keys(result.answers).sort()).toEqual([...ids].sort());
    const noul = result.answers[ids[0]!];
    const choice = result.answers[ids[1]!];
    const score = result.answers[ids[2]!];
    if (noul?.type !== "noul" || choice?.type !== "choice" || score?.type !== "score") {
      throw new Error("Missing or incorrect answer types");
    }
    expect(Number.isFinite(noul.noul)).toBe(true);
    expect(noul.noul).toBeGreaterThanOrEqual(0);
    expect(noul.noul).toBeLessThanOrEqual(1);
    expect(Object.keys(sample.choice.criteria)).toContain(choice.choice);
    expect(Object.keys(choice.probabilities).sort()).toEqual(Object.keys(sample.choice.criteria).sort());
    expect(Number.isFinite(score.score)).toBe(true);
    expect(score.score).toBeGreaterThanOrEqual(0);
    expect(score.score).toBeLessThanOrEqual(sample.score.criteria.length - 1);
    expect(score.legend).toEqual(Object.fromEntries(sample.score.criteria.map((value, i) => [String(i), value])));
    expect(Object.keys(score.probabilities).sort()).toEqual(Object.keys(score.legend).sort());
    for (const answer of [choice, score]) {
      expect(answer.confidence).toBeGreaterThanOrEqual(0);
      expect(answer.confidence).toBeLessThanOrEqual(1);
      for (const probability of Object.values(answer.probabilities)) {
        expect(Number.isFinite(probability)).toBe(true);
        expect(probability).toBeGreaterThanOrEqual(0);
        expect(probability).toBeLessThanOrEqual(1);
      }
      expect(Math.abs(Object.values(answer.probabilities).reduce((a, b) => a + b, 0) - 1)).toBeLessThanOrEqual(0.01);
    }
    expect(result.usage.inputTokens).toBeGreaterThanOrEqual(0);
    expect(result.usage.outputTokens).toBeGreaterThanOrEqual(0);
  }, 65_000);
}

const invalidCases: [string, unknown][] = [
  ["choice_without_options", { q: { type: "choice", criteria: {} } }],
  ["empty_questions", {}],
  ["empty_score", { q: { type: "score", criteria: [] } }],
  ["null_score_level", { q: { type: "score", criteria: [null] } }],
  ["numeric_choice_description", { q: { type: "choice", criteria: { a: 0 } } }],
  ["empty_choice_label", { q: { type: "choice", criteria: { "": "Empty" } } }],
  ["invalid_noul_criteria", { q: { type: "noul", criteria: "yes" } }],
  ["unknown_question_type", { q: { type: "unknown" } }],
];

for (const [name, questions] of invalidCases) {
  test.skipIf(process.env.MODAIC_E2E !== "1")(`live validation: ${name}`, async () => {
    if (!process.env.MODAIC_API_URL) throw new Error("MODAIC_API_URL is required");
    const client = new Modaic({ timeoutMs: 60_000 });
    try {
      await client.decisions.create({ model: "typesafe/jev-latest", state: null,
        questions: questions as Record<string, Question> });
      throw new Error("Invalid questions unexpectedly succeeded");
    } catch (error) {
      expect(error).toBeInstanceOf(ModaicAPIError);
      if (!(error instanceof ModaicAPIError)) throw error;
      expect(error.status).toBe(422);
      expect(error.requestId).toBeTruthy();
      expect(error.code).toBe("validation_error");
    }
  }, 65_000);
}

// Public-schema edge cases must remain supported by live inference.
const contractEdges: [string, JsonValue, Record<string, Question>][] = [
  ["null_state", null, { q: new Noul({ instructions: "Has content?" }) }],
  ["false_state", false, { q: new Noul({ instructions: "Has content?" }) }],
  ["zero_state", 0, { q: new Noul({ instructions: "Has content?" }) }],
  ["number_instructions", { value: 0 }, { q: new Noul({ instructions: 0 }) }],
  ["false_instructions", { value: 0 }, { q: new Choice({ instructions: false, criteria: { a: "A", b: "B" } }) }],
  ["true_instructions", { value: 0 }, { q: new Score({ instructions: true, criteria: ["Low", "High"] }) }],
  ["noul_without_context", { ticket: "Duplicate payment" }, { q: new Noul() }],
  ["empty_question_id", { ticket: "Duplicate payment" }, { "": new Noul({ instructions: "Duplicate payment?" }) }],
];

for (const [name, state, questions] of contractEdges) {
  test.skipIf(process.env.MODAIC_E2E !== "1")(`live schema contract: ${name}`, async () => {
    if (!process.env.MODAIC_API_URL) throw new Error("MODAIC_API_URL is required");
    const result = await new Modaic({ timeoutMs: 60_000 }).decisions.create({
      model: "typesafe/jev-latest", state, questions,
    });
    expect(Object.keys(result.answers).sort()).toEqual(Object.keys(questions).sort());
  }, 65_000);
}
