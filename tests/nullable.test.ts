import { expect, test } from "bun:test";
import { z } from "zod";
import { Choice, Noul, Score, Nullable, Modaic, ModaicConnectionError } from "../src/index.js";

function body(probability: unknown = 0.4) {
  return {
    model: "mo-latest", answers: {
      country: { type: "choice", choice: "fr", probabilities: { fr: 1 }, confidence: 1 },
      __modaic_answerable_country: { type: "noul", noul: probability },
      relevant: { type: "noul", noul: 0 },
    }, usage: { input_tokens: 10, output_tokens: 1 },
  };
}

const questions = {
  country: new Choice({ criteria: { fr: "France", us: "United States" } }).nullable(),
  relevant: new Noul(),
};

test("nullable questions expand in one request and infer exact answer types", async () => {
  let count = 0;
  const client = new Modaic({ apiKey: "test", fetch: async (_url, init) => {
    count++;
    const wire = JSON.parse(String(init?.body));
    expect(wire.questions.country.type).toBe("choice");
    expect(wire.questions.__modaic_answerable_country.instructions.question.criteria.fr).toBe("France");
    expect(wire.questions.country.threshold).toBeUndefined();
    return Response.json(body());
  }});
  const result = await client.decisions.create({ model: "mo-latest", state: false, questions });
  const country: "fr" | "us" | undefined = result.answers.country?.choice;
  const probability: number = result.answers.relevant.noul;
  expect(country).toBeUndefined();
  expect(probability).toBe(0);
  expect(result.answers.country).toBeNull();
  expect(Object.keys(result.answers)).toEqual(["country", "relevant"]);
  expect(count).toBe(1);
});

test("threshold equality accepts the answer and custom thresholds gate it", async () => {
  const client = new Modaic({ apiKey: "test", fetch: async () => Response.json(body(0.5)) });
  const result = await client.decisions.create({ model: "mo-latest", state: {}, questions });
  expect(result.answers.country?.choice).toBe("fr");
  const higher = await client.decisions.create({ model: "mo-latest", state: {}, questions: {
    ...questions, country: questions.country.nullable(0.8),
  }});
  expect(higher.answers.country).toBeNull();
});

test("Zod validates the nullable result after composition", async () => {
  const schema = z.object({ answers: z.object({ country: z.null() }) });
  const client = new Modaic({ apiKey: "test", fetch: async () => Response.json(body()) });
  const result = await client.decisions.create({ model: "mo-latest", state: {}, questions, schema });
  expect(result.answers.country).toBeNull();
});

for (const probability of [true, null, "0.5", -1, 2]) {
  test(`rejects malformed gate probability ${probability}`, async () => {
    const client = new Modaic({ apiKey: "test", fetch: async () => Response.json(body(probability)) });
    await expect(client.decisions.create({ model: "mo-latest", state: {}, questions })).rejects.toBeInstanceOf(ModaicConnectionError);
  });
}

test("all primitives support nullable and invalid thresholds are rejected", () => {
  expect(new Score({ criteria: ["Low", "High"] }).nullable()).toBeInstanceOf(Nullable);
  for (const threshold of [-1, 2, NaN, Infinity]) {
    expect(() => new Noul().nullable(threshold)).toThrow();
  }
});

test("gate collisions fail before making a request", async () => {
  let called = false;
  const client = new Modaic({ apiKey: "test", fetch: async () => { called = true; return Response.json(body()); } });
  await expect(client.decisions.create({ model: "mo-latest", state: {}, questions: {
    a: new Noul().nullable(), __modaic_answerable_a: new Noul(),
  }})).rejects.toThrow("conflicts");
  expect(called).toBe(false);
});


test("bound decisions preserve inference and nullable behavior", async () => {
  const client = new Modaic({ apiKey: "test", fetch: async (url) => Response.json(
    String(url).endsWith("/systemone") ? body() : {
      id: "model-1", workspace: "acme", slug: "review", description: null,
      defaultBranch: "main", visibility: "private", createdAt: "2026-11-07", updatedAt: "2026-11-07",
    },
  ) });
  const model = await client.models.create({ workspace: "acme", slug: "review" });
  const result = await model.decisions.create({ state: {}, questions });
  const probability: number = result.answers.relevant.noul;
  const country: "fr" | "us" | undefined = result.answers.country?.choice;
  expect(probability).toBe(0);
  expect(country).toBeUndefined();
});

test("missing gate and missing original answer fail closed", async () => {
  for (const missing of ["country", "__modaic_answerable_country"] as const) {
    const payload = body();
    Reflect.deleteProperty(payload.answers, missing);
    const client = new Modaic({ apiKey: "test", fetch: async () => Response.json(payload) });
    await expect(client.decisions.create({ model: "mo-latest", state: {}, questions })).rejects.toBeInstanceOf(ModaicConnectionError);
  }
});
