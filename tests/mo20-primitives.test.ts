import { expect, test } from "bun:test";
import { Box, Datetime, Modaic, Number, Span, Text } from "../src/index.js";

test("span sends and returns character offsets plus its content", async () => {
  const client = new Modaic({ apiKey: "test", fetch: async (_url, init) => {
    const body = JSON.parse(init?.body as string);
    expect(body.questions.owner).toEqual({ type: "span", instructions: "Who?" });
    return Response.json({ model: "mo-2.0", usage: { input_tokens: 5, output_tokens: 0 }, answers: {
      owner: { type: "span", start: 3, end: 8, span: "Alice", confidence: 0.9 },
    }});
  }});
  const result = await client.decisions.create({ model: "mo-2.0", state: "😀 Alice", questions: { owner: new Span({ instructions: "Who?" }) } });
  const answer = result.answers.owner;
  expect(answer?.type).toBe("span");
  if (answer?.type === "span") expect(answer).toMatchObject({ start: 3, end: 8, span: "Alice" });
});

test("Mo 2.0 primitives preserve question shape and reject criteria", () => {
  expect(new Span({ instructions: "Who?" })).toEqual({ type: "span", instructions: "Who?" });
  expect(new Box({ instructions: "Locate photo." })).toEqual({ type: "box", instructions: "Locate photo." });
  expect(() => new Span({ instructions: " " })).toThrow();
  // @ts-expect-error criteria are not allowed on span
  expect(() => new Span({ instructions: "Who?", criteria: {} })).toThrow();
});

test("inline assets retain IDs and map only the asset byte field to wire casing", async () => {
  const client = new Modaic({ apiKey: "test", fetch: async (_url, init) => {
    const body = JSON.parse(init?.body as string);
    expect(body.assets["photo-ref"]).toEqual({type: "image", format: "png", data_base64: "aGVsbG8="});
    expect(body.questions.region).toEqual({type: "box", instructions: "Locate photo-ref."});
    return Response.json({model: "mo-2.0", usage: {input_tokens: 1, output_tokens: 0}, answers: {
      region: {type: "box", box: {top: 0, bottom: 1, left: 0, right: 1}, confidence: .9},
    }});
  }});
  const result = await client.decisions.create({model: "mo-2.0", state: {photo: "photo-ref"},
    assets: {"photo-ref": {type: "image", format: "png", dataBase64: "aGVsbG8="}},
    questions: {region: new Box({instructions: "Locate photo-ref."})}});
  expect(result.answers.region?.type).toBe("box");
});

test("number, datetime, and text preserve their public contract", async () => {
  const client = new Modaic({ apiKey: "test", fetch: async (_url, init) => {
    const body = JSON.parse(init?.body as string);
    expect(body.questions).toEqual({
      weight: { type: "number", instructions: "Weight?", criteria: { min: "0", step: "0.1" } },
      inspected: { type: "datetime", instructions: "When?", criteria: { format: "YYYY-MM-DD" } },
      summary: { type: "text", instructions: "Summarize." },
    });
    return Response.json({ model: "mo-2.0", usage: { input_tokens: 5, output_tokens: 2 }, answers: {
      weight: { type: "number", number: 12.4, probabilities: { "12.4": 1 }, variance: 0.16,
        confidence: 0.91 },
      inspected: { type: "datetime", datetime: "2024-02-29",
        probabilities: { "2024-02-29": 0.75, "2024-03-01": 0.25 }, confidence: 0.82 },
      summary: { type: "text", text: "Inspection complete",
        probabilities: { "Inspection complete": 0.75, "Inspection finished": 0.25 }, confidence: 0.94 },
    }});
  }});
  const result = await client.decisions.create({ model: "mo-2.0", state: "12.4 kg on leap day", questions: {
    weight: new Number({ instructions: "Weight?", criteria: { min: "0", step: "0.1" } }),
    inspected: new Datetime({ instructions: "When?", criteria: { format: "YYYY-MM-DD" } }),
    summary: new Text({ instructions: "Summarize." }),
  }});
  const weight = result.answers.weight;
  const inspected = result.answers.inspected;
  const summary = result.answers.summary;
  if (weight?.type === "number") {
    expect(weight.number).toBe(12.4);
    expect(weight.confidence).toBe(0.91);
  }
  if (inspected?.type === "datetime") expect(inspected.datetime).toBe("2024-02-29");
  if (summary?.type === "text") {
    expect(summary.text).toBe("Inspection complete");
    expect(summary.probabilities["Inspection complete"]).toBe(0.75);
  }
});

test("structured primitive constructors reject empty instructions and unsupported formats", () => {
  expect(() => new Number({ instructions: " " })).toThrow();
  expect(() => new Text({ instructions: " " })).toThrow();
  // @ts-expect-error unsupported format
  expect(() => new Datetime({ instructions: "When?", criteria: { format: "MM-DD-YYYY" } })).toThrow();
});
