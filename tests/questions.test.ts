import { expect, test } from "bun:test";
import { Choice, Modaic, Noul, Score, type Question } from "../src/index.js";

test("question constructors serialize to the existing API contract", async () => {
  const questions: Record<string, Question> = {
    billing: new Noul({ instructions: "Is this about billing?" }),
    category: new Choice({ criteria: { billing: "Payments", other: null } }),
    severity: new Score({ criteria: ["Routine", "Urgent"] }),
    empty: new Noul(),
    explicitNull: new Noul({ instructions: null, criteria: null }),
    structured: new Noul({ instructions: { rules: ["one", "two"] } }),
    legacy: { type: "noul" },
  };
  const wire = {
    billing: { type: "noul", instructions: "Is this about billing?" },
    category: { type: "choice", criteria: { billing: "Payments", other: null } },
    severity: { type: "score", criteria: ["Routine", "Urgent"] },
    empty: { type: "noul" },
    explicitNull: { type: "noul", instructions: null, criteria: null },
    structured: { type: "noul", instructions: { rules: ["one", "two"] } },
    legacy: { type: "noul" },
  };
  const paths: string[] = [];
  const client = new Modaic({ apiKey: "test-key", fetch: async (input, init) => {
    const path = new URL(String(input)).pathname;
    paths.push(path);
    expect(JSON.parse(String(init?.body)).questions).toEqual(wire);
    return Response.json(path.endsWith("/systemone") ? {
      model: "typesafe/jev-latest", answers: { billing: { type: "noul", noul: 0.9 } },
      usage: { input_tokens: 10, output_tokens: 2 },
    } : {
      id: "test-model", slug: "support", workspace: init?.method === "POST" ? "acme" : { slug: "acme" },
    });
  } });
  await client.decisions.create({ model: "typesafe/jev-latest", state: "Charged twice", questions });
  const model = await client.models.create({ workspace: "acme", slug: "support", questions });
  await model.decisions.create({ state: "Charged twice", questions });
  await client.models.update(model.id, { questions });
  expect(paths.map((p) => p.split("/").at(-1))).toEqual(["systemone", "models", "systemone", "test-model"]);
});

test("score needs at least one criterion", () => {
  expect(() => new Score({ criteria: [] })).toThrow("at least one level");
});

test("choice needs at least one option", () => {
  expect(() => new Choice({ criteria: {} })).toThrow("at least one option");
});
