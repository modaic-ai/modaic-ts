import { expect, test } from "bun:test";
import { Box, Modaic, Extraction } from "../src/index.js";

test("extraction sends and returns only the public extraction contract", async () => {
  const client = new Modaic({ apiKey: "test", fetch: async (_url, init) => {
    const body = JSON.parse(init?.body as string);
    expect(body.questions.owner).toEqual({ type: "extraction", instructions: "Who?" });
    return Response.json({ model: "mo-2.0", usage: { input_tokens: 5, output_tokens: 0 }, answers: {
      owner: { type: "extraction", extraction: { start: 3, end: 8, text: "Alice" }, confidence: 0.9 },
    }});
  }});
  const result = await client.decisions.create({ model: "mo-2.0", state: "😀 Alice", questions: { owner: new Extraction({ instructions: "Who?" }) } });
  const answer = result.answers.owner;
  expect(answer?.type).toBe("extraction");
  if (answer?.type === "extraction") expect(answer.extraction).toEqual({ start: 3, end: 8, text: "Alice" });
});

test("Mo 2.0 primitives preserve question shape and reject criteria", () => {
  expect(new Extraction({ instructions: "Who?" })).toEqual({ type: "extraction", instructions: "Who?" });
  expect(new Box({ instructions: "Locate photo." })).toEqual({ type: "box", instructions: "Locate photo." });
  expect(() => new Extraction({ instructions: " " })).toThrow();
  // @ts-expect-error criteria are not allowed on extraction
  expect(() => new Extraction({ instructions: "Who?", criteria: {} })).toThrow();
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
