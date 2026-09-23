import { expect, test } from "bun:test";
import { Modaic, type DecisionRecord, type Example, type ExampleDecision } from "../src/index.js";

// The nested API shape intentionally has no exampleId, jobId, or error.
const latest: ExampleDecision = {
  id: "decision-1", commitSha: "abc1234", model: "typesafe/jev-latest",
  answers: { refund: { type: "noul", noul: 0.9 } },
  request: { state: {}, model: "typesafe/jev-latest", questions: {} },
  response: { model: "typesafe/jev-latest", answers: {}, usage: { input_tokens: 10, output_tokens: 0 } },
  confidence: null, version: 0, checkpoint: 0, revision: "main", source: "live",
  imageUrls: [], createdAt: "2026-09-23T00:00:00Z",
};
const example: Example = {
  id: "example-1", state: {}, source: "live", imageUrls: [], annotation: null,
  latestDecision: latest, decisionCount: 1,
  createdAt: "2026-09-23T00:00:00Z", updatedAt: "2026-09-23T00:00:00Z",
};

test.each(["get", "list", "annotate", "ingest"] as const)("%s preserves the nested decision shape", async (method) => {
  const bodies = {
    get: example, annotate: example, ingest: { examples: [example] },
    list: { items: [example], page: 1, pageSize: 30, total: 1, totalPages: 1 },
  };
  const client = new Modaic({ apiKey: "test", fetch: async () => Response.json(bodies[method]) });
  let result: Example;
  switch (method) {
    case "get": result = await client.examples.get("model", "example-1"); break;
    case "annotate": result = await client.examples.annotate("model", "example-1", { groundTruth: { refund: true } }); break;
    case "ingest": result = (await client.examples.ingest("model", [{ state: {} }])).examples[0]!; break;
    case "list": result = (await client.examples.list("model")).items[0]!; break;
  }
  expect(result.latestDecision).toEqual(latest);
  expect(result.latestDecision).not.toHaveProperty("exampleId");
  expect(result.latestDecision).not.toHaveProperty("jobId");
  expect(result.latestDecision).not.toHaveProperty("error");
});

test.each([null, "Provider request failed"])("history keeps its distinct shape (error=%s)", async (error) => {
  const record: DecisionRecord = { ...latest, exampleId: example.id, jobId: null, error,
    response: error ? null : latest.response, answers: error ? {} : latest.answers };
  const client = new Modaic({ apiKey: "test", fetch: async () => Response.json({ decisions: [record] }) });
  expect((await client.examples.listDecisions("model", example.id)).decisions).toEqual([record]);
});
