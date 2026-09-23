// Opt-in live test. Creates and retains a test model and examples for inspection.
// Requires MODAIC_E2E=1, MODAIC_API_KEY, MODAIC_API_URL, MODAIC_E2E_WORKSPACE.
// Makes billable inference requests; skipped in ordinary CI.
import { expect, test } from "bun:test";
import { Choice, Modaic, ModaicAPIError, Noul, Score, type Question } from "../src/index.js";

async function eventually<T>(read: () => Promise<T>, ready: (value: T) => boolean): Promise<T> {
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      const value = await read();
      if (ready(value)) return value;
    } catch (error) {
      if (!(error instanceof ModaicAPIError) || error.status !== 404) throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("Expected persisted state was not visible within 30 seconds");
}

test.skipIf(process.env.MODAIC_E2E !== "1")("live model, examples, and captured decisions", async () => {
  const { MODAIC_API_KEY: apiKey, MODAIC_API_URL: baseUrl, MODAIC_E2E_WORKSPACE: workspace } = process.env;
  if (!apiKey || !baseUrl || !workspace) throw new Error("Explicit live test configuration is required");
  const paths: string[] = [];
  const client = new Modaic({ apiKey, baseUrl, timeoutMs: 60_000, fetch: async (input, init) => {
    paths.push(new URL(input instanceof Request ? input.url : input).pathname);
    return fetch(input, init);
  } });
  const slug = `e2e-systemone-ts-${crypto.randomUUID().slice(0, 10)}`;
  const questions: Record<string, Question> = {
    urgent: new Noul({ instructions: "Does the ticket need urgent attention?" }),
    category: new Choice({ instructions: "Choose the ticket category.",
      criteria: { billing: "Payment or refund issue", other: "Anything else" } }),
    severity: new Score({ instructions: "Rate the severity of the ticket.",
      criteria: ["Informational", "Routine issue", "Urgent financial impact"] }),
  };
  const created = await client.models.create({ workspace, slug, model: "typesafe/jev-latest", questions,
    description: "SDK end-to-end test; retained for inspection" });
  console.log(`Created ${workspace}/${slug} (${created.id})`);
  expect(created.workspace).toBe(workspace);
  const model = await client.models.get(workspace, slug);
  expect(model.id).toBe(created.id);
  expect(model.workspace.slug).toBe(workspace);
  expect((await client.models.list()).models.some((m) => m.repositoryId === model.id)).toBe(true);
  const ids = [crypto.randomUUID(), crypto.randomUUID()] as const;
  const state = { ticket: "I was charged twice. Please refund the extra payment urgently." };
  const initialTruth = { urgent: false, category: "other", severity: 0 };
  const ingested = await created.examples.ingest([
    { id: ids[0], state },
    { id: ids[1], state: { ticket: "Thanks for the information." },
      annotation: { groundTruth: initialTruth, groundReasoning: "No action requested." } },
  ]);
  expect(new Set(ingested.examples.map((e) => e.id))).toEqual(new Set(ids));
  const labeled = await eventually(() => model.examples.get(ids[1]), (e) => e.annotation !== null);
  expect(labeled.annotation?.groundTruth).toEqual(initialTruth);
  expect(labeled.annotation?.groundReasoning).toBe("No action requested.");
  const truth = { urgent: true, category: "billing", severity: 2 };
  const annotated = await model.examples.annotate(ids[0], { groundTruth: truth,
    groundReasoning: "Duplicate charge requires prompt help." });
  await model.examples.annotate(ids[0], { groundReasoning: "Confirmed duplicate charge." });
  const stored = await eventually(() => model.examples.get(ids[0]),
    (e) => e.annotation?.groundReasoning === "Confirmed duplicate charge.");
  expect(stored.annotation?.groundTruth).toEqual(truth);
  expect(stored.annotation?.split).toBe(annotated.annotation?.split);
  const request = { state, exampleId: ids[0], idempotencyKey: `e2e-ts-${crypto.randomUUID()}` };
  const result = await created.decisions.create(request);
  expect(result.captured).toBe(true);
  expect(result.exampleId).toBe(ids[0]);
  expect(result.decisionId).toBeTruthy();
  expect(result.checkpoint).toBeNumber();
  expect(result.revision).toBeTruthy();
  expect(Object.fromEntries(Object.entries(result.answers).map(([k, v]) => [k, v.type])))
    .toEqual({ urgent: "noul", category: "choice", severity: "score" });
  const history = await eventually(() => model.examples.listDecisions(ids[0]),
    (h) => h.decisions.some((d) => d.id === result.decisionId));
  expect(history.decisions).toHaveLength(1);
  expect(history.decisions[0]?.source).toBe("live");
  expect(history.decisions[0]?.request.questions).toEqual(questions);
  expect(history.decisions[0]?.answers).toEqual(result.answers);
  expect(await created.decisions.create(request)).toEqual(result);
  expect((await model.examples.listDecisions(ids[0])).decisions).toHaveLength(1);
  const automatic = await model.decisions.create({ state: { ticket: "Please explain my invoice." },
    idempotencyKey: `e2e-auto-${crypto.randomUUID()}` });
  expect(automatic.captured).toBe(true);
  expect(automatic.exampleId).toBeTruthy();
  await eventually(() => model.examples.get(automatic.exampleId!),
    (e) => e.source === "live" && e.decisionCount === 1);
  const page = await eventually(() => model.examples.list({ pageSize: 1 }), (p) => p.total === 3);
  expect(page.items).toHaveLength(1);
  expect(page.totalPages).toBe(3);
  const uncapturedId = crypto.randomUUID();
  const uncaptured = await model.decisions.create({ state: { ticket: "No storage test." },
    exampleId: uncapturedId, capture: false, idempotencyKey: `e2e-no-capture-${crypto.randomUUID()}` });
  expect(uncaptured.captured).toBe(false);
  await expect(model.examples.get(uncapturedId)).rejects.toMatchObject({ status: 404 });
  expect((await model.examples.list()).total).toBe(3);
  await client.models.update(model.id, { description: "Verified E2E model and examples" });
  expect((await client.models.get(workspace, slug)).description).toBe("Verified E2E model and examples");
  const edgeQuestions = {
    urgent: new Noul({ instructions: 0 }),
    category: new Choice({ instructions: false, criteria: { only: null } }),
    severity: new Score({ instructions: true, criteria: ["Only"] }),
    "": new Noul(),
  };
  const edge = await model.decisions.create({ state: false, questions: edgeQuestions });
  expect(edge.captured).toBe(true);
  expect(edge.exampleId).toBeTruthy();
  const edgeExample = await eventually(() => model.examples.get(edge.exampleId!),
    (e) => e.latestDecision !== null);
  expect(edgeExample.state).toBe(false);
  expect(edgeExample.latestDecision?.answers[""]).toBeDefined();
  const edgeHistory = await eventually(() => model.examples.listDecisions(edge.exampleId!),
    (h) => h.decisions.length === 1);
  expect(edgeHistory.decisions[0]?.request.state).toBe(false);
  expect(edgeHistory.decisions[0]?.request.questions).toEqual(edgeQuestions);
  expect(paths.filter((p) => p.endsWith("/systemone"))).toHaveLength(5);
  expect(paths.some((p) => p.endsWith("/decision"))).toBe(false);
  console.log(`PASS TypeScript: ${workspace}/${slug}; 4 stored examples, capture, annotations, history, replay, preserved edge inputs`);
}, 180_000);
