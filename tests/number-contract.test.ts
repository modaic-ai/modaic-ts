import { expect, test } from "bun:test";
import { Modaic, Number } from "../src/index.js";

test("Number preserves the API number, confidence, variance and alternatives", async () => {
  const payload = { model: "mo-2.0", usage: { input_tokens: 10, output_tokens: 2 }, answers: {
    amount: { type: "number", number: 12.4, confidence: 0.91, probabilities: { "12.4": 1 }, variance: 0.16 },
  } };
  const client = new Modaic({ apiKey: "test", fetch: async (_url, init) => {
    expect(JSON.parse(String(init?.body)).questions.amount).toEqual({
      type: "number", instructions: "How much?", criteria: { min: "0" },
    });
    return Response.json(payload);
  } });
  const result = await client.decisions.create({ model: "mo-2.0", state: "A parcel costs 12.4",
    questions: { amount: new Number({ instructions: "How much?", criteria: { min: "0" } }) },
  });
  const amount: number = result.answers.amount.number;
  const confidence: number = result.answers.amount.confidence;
  expect(amount).toBe(12.4);
  expect(confidence).toBe(0.91);
  expect(result.answers.amount.variance).toBe(0.16);
  expect(result.answers.amount).toBeInstanceOf(Number);
  expect(JSON.parse(JSON.stringify(result.answers.amount))).toEqual(payload.answers.amount);
  expect(result.answers.amount.toQuestion()).not.toHaveProperty("confidence");
});
