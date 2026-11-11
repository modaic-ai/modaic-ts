import { expect, test } from "bun:test";
import { Box, Modaic, Span } from "../src/index.js";

test("Span preserves the nested public answer", async () => {
  const client = new Modaic({ apiKey: "test", fetch: async (_url, init) => {
    const body = JSON.parse(init?.body as string);
    expect(body.questions.owner).toEqual({ type: "span", instructions: "Who?" });
    return Response.json({ model: "mo-2.0", usage: { input_tokens: 5, output_tokens: 0 }, answers: {
      owner: { type: "span", span: { start: 3, end: 8, text: "Alice", confidence: 0.9 }, spans: [{ start: 3, end: 8, text: "Alice", confidence: 0.9 }], confidence: 0.9 },
    }});
  }});
  const result = await client.decisions.create({ model: "mo-2.0", state: "😀 Alice", questions: { owner: new Span({ instructions: "Who?" }) } });
  const answer = result.answers.owner;
  const confidence: number = answer.spans[0]!.confidence;
  expect(confidence).toBe(0.9);
  expect(answer.spans[0]?.text).toBe("Alice");
  expect(answer?.type).toBe("span");
  if (answer?.type === "span") expect([answer.span.start, answer.span.end, answer.span.text]).toEqual([3, 8, "Alice"]);
});

test("Mo 2.0 primitives preserve question shape and reject criteria", () => {
  expect(new Span({ instructions: "Who?" }).toQuestion()).toEqual({ type: "span", instructions: "Who?" });
  expect(new Box({ instructions: "Locate photo." }).toQuestion()).toEqual({ type: "box", instructions: "Locate photo." });
  expect(() => new Span({ instructions: " " })).toThrow();
  // @ts-expect-error criteria are not allowed on extraction
  expect(() => new Span({ instructions: "Who?", criteria: {} })).toThrow();
  // @ts-expect-error criteria are not allowed on box
  expect(() => new Box({ instructions: "Locate photo.", criteria: {} })).toThrow();
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

test("Span preserves its nested value through nullable inference", async () => {
  for (const probability of [0.4, 0.5]) {
    const client = new Modaic({ apiKey: "test", fetch: async (_url, init) => {
      const body = JSON.parse(init?.body as string);
      expect(body.questions.owner).toEqual({ type: "span", instructions: "Who?" });
      expect(body.questions.__modaic_answerable_owner.instructions.question.type).toBe("span");
      return Response.json({ model: "mo-2.0", usage: { input_tokens: 5, output_tokens: 0 }, answers: {
        owner: { type: "span", span: { start: 3, end: 8, text: "Alice", confidence: 0.9 }, spans: [{ start: 3, end: 8, text: "Alice", confidence: 0.9 }], confidence: 0.9 },
        __modaic_answerable_owner: { type: "noul", noul: probability },
      }});
    }});
    const result = await client.decisions.create({ model: "mo-2.0", state: "😀 Alice",
      questions: { owner: new Span({ instructions: "Who?" }).nullable() } });
    const owner: Span | null = result.answers.owner;
    expect(Object.keys(result.answers)).toEqual(["owner"]);
    if (probability < 0.5) expect(owner).toBeNull();
    else {
      expect(owner).toBeInstanceOf(Span);
      expect(owner?.span.text).toBe("Alice");
      expect(owner?.name).toBe("owner");
      expect(owner?.toQuestion()).toEqual({ type: "span", instructions: "Who?" });
    }
  }
});

test("saved-model span stays nested before optional schema validation", async () => {
  const client = new Modaic({ apiKey: "test", fetch: async () => Response.json({
    model: "acme/review", usage: { input_tokens: 5, output_tokens: 0 }, answers: {
      owner: { type: "span", span: { start: 3, end: 8, text: "Alice", confidence: 0.9 }, spans: [{ start: 3, end: 8, text: "Alice", confidence: 0.9 }], confidence: 0.9 },
    },
  }) });
  const result = await client.decisions.create({ model: "acme/review", state: "😀 Alice", schema: {
    parse(value: unknown): Span {
      const answer = (value as { answers: { owner: Span } }).answers.owner;
      expect(answer).toBeInstanceOf(Span);
      expect(answer.span.text).toBe("Alice");
      expect("extraction" in answer).toBe(false);
      return answer;
    },
  } });
  expect(result.span.start).toBe(3);
});

test("experimental flags are headers and p_null maps to pNull", async () => {
  const client = new Modaic({ apiKey: "test", fetch: async (_url, init) => {
    const headers = new Headers(init?.headers);
    expect(headers.get("X-Modaic-Experimental-Nullability")).toBe("true");
    expect(headers.get("X-Modaic-Experimental-Sampling")).toBe("true");
    const body = JSON.parse(String(init?.body));
    expect(body.experimentalNullability).toBeUndefined();
    expect(body.experimentalSampling).toBeUndefined();
    return Response.json({ model: "mo-2.0", usage: { input_tokens: 1, output_tokens: 0 }, answers: {
      owner: { type: "span", span: { start: 3, end: 8, text: "Alice", confidence: 0.9 }, spans: [{ start: 3, end: 8, text: "Alice", confidence: 0.9 }], confidence: 0.9, p_null: 0.7 },
    }});
  }});
  const result = await client.decisions.create({ model: "mo-2.0", state: "Alice",
    questions: { owner: new Span({ instructions: "Who?" }) },
    experimentalNullability: true, experimentalSampling: true });
  expect(result.answers.owner.pNull).toBe(0.7);
  expect(result.answers.owner.span.text).toBe("Alice");
});
