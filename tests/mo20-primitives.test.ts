import { expect, test } from "bun:test";
import { Box, Modaic, Span } from "../src/index.js";

test("Mo 2.0 primitives preserve question shape and reject criteria", () => {
  expect(new Span({ instructions: "Who?" })).toEqual({ type: "span", instructions: "Who?" });
  expect(new Box({ instructions: "Locate photo." })).toEqual({ type: "box", instructions: "Locate photo." });
  expect(() => new Span({ instructions: " " })).toThrow();
  // @ts-expect-error criteria are not allowed on extraction
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
