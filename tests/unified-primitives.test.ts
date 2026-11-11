import { expect, test } from "bun:test";
import { Modaic, Choice, Score, Span, Text, Number, Noul, Datetime, ModaicConnectionError } from "../src/index.js";

const cases = [
  [new Noul({ name: "evidence", instructions: "Relevant?" }), { type: "noul", noul: 0.9 }, "noul", 0.9],
  [new Choice({ name: "evidence", instructions: "Country?", criteria: { fr: "France" } }), { type: "choice", choice: "fr", probabilities: { fr: 1 }, confidence: 1 }, "choice", "fr"],
  [new Score({ name: "evidence", instructions: "Severity?", criteria: ["Low", "High"] }), { type: "score", score: 0.7, legend: { "0": "Low", "1": "High" }, probabilities: { "0": 0.3, "1": 0.7 }, confidence: 0.7 }, "score", 0.7],
  [new Span({ name: "evidence", instructions: "Find" }), { type: "span", span: { text: "Paris", start: 0, end: 5, confidence: 1 }, spans: [{ text: "Paris", start: 0, end: 5, confidence: 1 }], confidence: 1 }, "span", "Paris"],
  [new Text({ name: "evidence", instructions: "Summarize" }), { type: "text", text: "", confidence: 1 }, "text", ""],
  [new Number({ name: "evidence", instructions: "Count?" }), { type: "number", number: 0, probabilities: { "0": 1 }, variance: 0, confidence: 0.91 }, "number", 0],
  [new Datetime({ name: "evidence", instructions: "When?", format: "YYYY-MM-DD" }), { type: "datetime", datetime: "2024-02-29", probabilities: { "2024-02-29": 1 }, confidence: 1 }, "datetime", "2024-02-29"],
] as const;

for (const [question, answer, attribute, expected] of cases) {
  test(`unified ${question.type} dictionary result preserves metadata and request shape`, async () => {
    const definition = question.toQuestion();
    const wire = definition;
    const client = new Modaic({ apiKey: "test", fetch: async (_url, init) => {
      expect(JSON.parse(String(init?.body)).questions).toEqual({ evidence: wire });
      return Response.json({ model: "mo-2.0", answers: { evidence: answer }, usage: { input_tokens: 1, output_tokens: 1 } });
    }});
    const result = await client.decisions.create({ model: "mo-2.0", state: "Paris", questions: { evidence: question } });
    const answerResult = result.answers.evidence;
    expect(answerResult).toBeInstanceOf(question.constructor);
    expect(attribute === "span" ? Reflect.get(answerResult, attribute).text : Reflect.get(answerResult, attribute)).toBe(expected);
    expect(answerResult.name).toBe("evidence");
    expect(answerResult.instructions).toBe(question.instructions);
    expect(answerResult.toJSON()).toEqual(answer);
    expect(JSON.parse(JSON.stringify(answerResult))).toEqual(answer);
    await client.decisions.create({ model: "mo-2.0", state: "Paris", questions: { evidence: answerResult } });
    expect(() => Reflect.get(question, attribute)).toThrow("only available");
  });
}

test("dictionary nullable Span returns Span or null", async () => {
  let probability = 0.1;
  const client = new Modaic({ apiKey: "test", fetch: async () => Response.json({ model: "mo-2.0", answers: {
    evidence: { type: "span", span: { text: "Paris", start: 0, end: 5, confidence: 1 }, spans: [{ text: "Paris", start: 0, end: 5, confidence: 1 }], confidence: 1 },
    __modaic_answerable_evidence: { type: "noul", noul: probability },
  }, usage: { input_tokens: 1, output_tokens: 1 } }) });
  const questions = { evidence: new Span({ instructions: "Find" }).nullable() };
  const rejected = await client.decisions.create({ model: "mo-2.0", state: "Paris", questions });
  expect(rejected.answers.evidence).toBeNull();
  probability = 0.9;
  const accepted = await client.decisions.create({ model: "mo-2.0", state: "Paris", questions });
  expect(accepted.answers.evidence).toBeInstanceOf(Span);
  expect(accepted.answers.evidence?.span.start).toBe(0);
});

test("dictionary and saved-model responses hydrate public classes", async () => {
  const client = new Modaic({ apiKey: "test", fetch: async () => Response.json({ model: "mo-2.0", answers: {
    evidence: { type: "span", span: { text: "Paris", start: 0, end: 5, confidence: 1 }, spans: [{ text: "Paris", start: 0, end: 5, confidence: 1 }], confidence: 1 },
  }, usage: { input_tokens: 1, output_tokens: 1 } }) });
  const result = await client.decisions.create({ model: "mo-2.0", state: "Paris", questions: { evidence: new Span({ instructions: "Find" }) } });
  expect(result.answers.evidence).toBeInstanceOf(Span);
  expect(result.answers.evidence.name).toBe("evidence");
  const saved = await client.decisions.create({ model: "acme/model", state: "Paris" });
  expect(saved.answers.evidence).toBeInstanceOf(Span);
  expect(Reflect.get(saved.answers.evidence!, "instructions")).toBeUndefined();
  expect(() => Reflect.get(saved.answers.evidence!, "toQuestion").call(saved.answers.evidence)).toThrow("unavailable");
});

test("wrong dictionary answer type fails validation", async () => {
  const client = new Modaic({ apiKey: "test", fetch: async () => Response.json({ model: "mo-2.0", answers: {
    answer: { type: "noul", noul: 0.9 },
  }, usage: { input_tokens: 1, output_tokens: 1 } }) });
  await expect(client.decisions.create({ model: "mo-2.0", state: "Paris", questions: { answer: new Span({ instructions: "Find" }) } })).rejects.toBeInstanceOf(ModaicConnectionError);
});


test("malformed dictionary answer fields are rejected", async () => {
  const client = new Modaic({ apiKey: "test", fetch: async () => Response.json({ model: "mo-2.0", answers: {
    answer: { type: "span", span: { text: "Paris", start: 5, end: 0, confidence: 1 }, spans: [{ text: "Paris", start: 5, end: 0, confidence: 1 }], confidence: 1 },
  }, usage: { input_tokens: 1, output_tokens: 1 } }) });
  await expect(client.decisions.create({ model: "mo-2.0", state: "Paris", questions: { answer: new Span({ instructions: "Find" }) } })).rejects.toBeInstanceOf(ModaicConnectionError);
});


test("direct instances and classes are rejected before HTTP", async () => {
  let called = false;
  const client = new Modaic({ apiKey: "test", fetch: async () => { called = true; return Response.json({}); } });
  // @ts-expect-error questions must be a dictionary.
  await expect(client.decisions.create({ model: "mo-2.0", state: "Paris", questions: new Span({ instructions: "Find" }) })).rejects.toThrow("dictionary");
  // @ts-expect-error Constructor classes are not question dictionaries.
  await expect(client.decisions.create({ model: "mo-2.0", state: "Paris", questions: Span })).rejects.toThrow("dictionary");
  expect(called).toBe(false);
});


test("dictionary key overrides an optional constructor name", async () => {
  const question = new Span({ name: "other", instructions: "Find" });
  const client = new Modaic({ apiKey: "test", fetch: async (_url, init) => {
    expect(JSON.parse(String(init?.body)).questions).toEqual({ evidence: { type: "span", instructions: "Find" } });
    return Response.json({ model: "mo-2.0", answers: { evidence: { type: "span", span: { text: "Paris", start: 0, end: 5, confidence: 1 }, spans: [{ text: "Paris", start: 0, end: 5, confidence: 1 }], confidence: 1 } }, usage: { input_tokens: 1, output_tokens: 1 } });
  } });
  const result = await client.decisions.create({ model: "mo-2.0", state: "Paris", questions: { evidence: question } });
  expect(result.answers.evidence.name).toBe("evidence");
  expect(question.name).toBe("other");
});
