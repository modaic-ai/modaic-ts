import { expect, test } from "bun:test";
import { z } from "zod";
import { Modaic, ModaicConnectionError, type ResponseSchema } from "../src/index.js";

const BODY = {
  model: "modaic/mo-fast",
  answers: {
    photo_matches: { type: "noul", noul: 0.94 },
    condition: {
      type: "score",
      score: 2.13,
      legend: { "0": "Worn", "1": "Good", "2": "Like new" },
      probabilities: { "0": 0.01, "1": 0.12, "2": 0.87 },
      confidence: 0.83,
    },
  },
  usage: { input_tokens: 1186, output_tokens: 4 },
};

const ListingReview = z.object({
  model: z.string(),
  answers: z.object({
    photo_matches: z.object({ type: z.literal("noul"), noul: z.number() }),
    condition: z.object({ type: z.literal("score"), score: z.number() }),
  }),
  usage: z.object({ inputTokens: z.number(), outputTokens: z.number() }),
});

function client(body: unknown = BODY) {
  return new Modaic({ apiKey: "test", fetch: async () => Response.json(body) });
}

test("a zod schema narrows the result and validates the mapped response", async () => {
  const result = await client().decisions.create({
    model: "modaic/mo-fast",
    state: { listing: "Vintage leather jacket" },
    schema: ListingReview,
  });

  // Typed all the way down: no casts, no `answers[key]` indexing.
  expect(result.answers.photo_matches.noul).toBe(0.94);
  expect(result.answers.condition.score).toBe(2.13);
  // The schema sees the camelCase response the SDK returns, not the wire body.
  expect(result.usage.inputTokens).toBe(1186);
});

test("the schema validates on bound model decisions too", async () => {
  // The model create and the decision hit different paths, so route by URL
  // rather than answering every request with a decision body.
  const modaic = new Modaic({
    apiKey: "test",
    fetch: async (url) =>
      Response.json(
        String(url).endsWith("/systemone")
          ? BODY
          : {
              id: "model-1",
              workspace: "acme",
              slug: "listings",
              description: null,
              defaultBranch: "main",
              visibility: "private",
              createdAt: "2026-09-25T00:00:00Z",
              updatedAt: "2026-09-25T00:00:00Z",
            },
      ),
  });
  const model = await modaic.models.create({ workspace: "acme", slug: "listings" });
  const result = await model.decisions.create({ state: {}, schema: ListingReview });
  expect(result.answers.photo_matches.noul).toBe(0.94);
});

test("schema is never sent to the API", async () => {
  let sent = "";
  const modaic = new Modaic({
    apiKey: "test",
    fetch: async (_url, init) => {
      sent = String((init as RequestInit).body);
      return Response.json(BODY);
    },
  });
  await modaic.decisions.create({ model: "modaic/mo-fast", state: {}, schema: ListingReview });
  expect(JSON.parse(sent)).not.toHaveProperty("schema");
});

test("a response that does not match the schema raises ModaicConnectionError", async () => {
  const missing = { ...BODY, answers: { condition: BODY.answers.condition } };
  const call = client(missing).decisions.create({
    model: "modaic/mo-fast",
    state: {},
    schema: ListingReview,
  });
  await expect(call).rejects.toThrow(ModaicConnectionError);
  // The underlying ZodError stays reachable for callers who want the issues.
  const error = await call.catch((reason: unknown) => reason);
  expect((error as Error).cause).toBeInstanceOf(z.ZodError);
});

test("omitting the schema returns the untouched DecisionResponse", async () => {
  const result = await client().decisions.create({ model: "modaic/mo-fast", state: {} });
  expect(result.usage.inputTokens).toBe(1186);
  expect(result.answers.photo_matches).toEqual({ type: "noul", noul: 0.94 });
});

test("any parse-shaped validator works, not just zod", async () => {
  const schema: ResponseSchema<{ tag: string }> = {
    parse: (value) => ({ tag: (value as { model: string }).model.toUpperCase() }),
  };
  const result = await client().decisions.create({
    model: "modaic/mo-fast",
    state: {},
    schema,
  });
  expect(result.tag).toBe("MODAIC/MO-FAST");
});
