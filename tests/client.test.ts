import { describe, expect, test } from "bun:test";

import { Modaic, ModaicAPIError, ModaicTimeoutError } from "../src/index.js";
import type { Answer, BatchSelection, ClientOptions, Question } from "../src/index.js";

const MODEL_ID = "018f5f04-a793-7b21-a1f6-bc6b56789012";
const EXAMPLE_ID = "31fcc86c-7f49-4daa-a8b1-577db0c8fe76";
const JOB_ID = "9e3d5d17-a8db-4e61-b3c6-c8834f8faf12";

function modelJson() {
  return {
    id: MODEL_ID,
    workspace: {
      id: "workspace-1", kind: "user", slug: "farouk1", name: "Farouk",
      description: null, avatarUrl: null,
    },
    slug: "support-triage",
    description: "Support model",
    defaultBranch: "main",
    visibility: "private",
    createdAt: "2026-09-22T00:00:00Z",
    updatedAt: "2026-09-22T00:00:00Z",
  };
}

function exampleJson() {
  return {
    id: EXAMPLE_ID,
    state: { ticket: "charged twice" },
    source: "ingest",
    imageUrls: [],
    annotation: {
      groundTruth: { refund: true },
      groundReasoning: "duplicate charge",
      split: "train",
    },
    latestDecision: null,
    decisionCount: 0,
    createdAt: "2026-09-22T00:00:00Z",
    updatedAt: "2026-09-22T00:00:00Z",
  };
}

function batchJson(status = "completed") {
  return {
    id: JOB_ID,
    repositoryId: MODEL_ID,
    status,
    phase: status === "completed" ? "done" : "queued",
    branch: "main",
    sourceCommitSha: "abc1234",
    progress: { total: 1, completed: 1, failed: 0 },
    result: { completed: 1 },
    error: null,
    createdAt: "2026-09-22T00:00:00Z",
    updatedAt: "2026-09-22T00:00:00Z",
    startedAt: "2026-09-22T00:00:00Z",
    finishedAt: "2026-09-22T00:01:00Z",
  };
}

function alignmentJson(status = "completed") {
  return {
    id: JOB_ID,
    repositoryId: MODEL_ID,
    status,
    phase: status === "completed" ? "done" : "queued",
    branch: "main",
    sourceCommitSha: "abc1234",
    resultCommitSha: "def5678",
    result: { improved: true },
    progress: { stage: "done", metricCalls: 10, maxMetricCalls: 10 },
    error: null,
    createdAt: "2026-09-22T00:00:00Z",
    updatedAt: "2026-09-22T00:00:00Z",
    startedAt: "2026-09-22T00:00:00Z",
    finishedAt: "2026-09-22T00:01:00Z",
  };
}

function responseFor(request: Request): Response {
  const { pathname } = new URL(request.url);
  const method = request.method;
  if (pathname === "/api/v1/systemone") {
    return Response.json({
      model: "typesafe/jev-latest",
      answers: { refund: { type: "noul", noul: 0.9 } },
      usage: { input_tokens: 10, output_tokens: 2 },
      example_id: EXAMPLE_ID,
    });
  }
  if (pathname === "/api/v1/models" && method === "GET") {
    return Response.json({
      models: [
        {
          name: "farouk1/support-triage",
          description: "Support model",
          type: "repository",
          repository_id: MODEL_ID,
        },
      ],
    });
  }
  if (pathname === "/api/v1/models" && method === "POST") {
    return Response.json({ ...modelJson(), workspace: "farouk1" }, { status: 201 });
  }
  if (pathname === "/api/v1/entities/farouk1/models/support-triage") {
    return Response.json(modelJson());
  }
  if (pathname === `/api/v1/models/${MODEL_ID}` && method === "PATCH") {
    return Response.json(modelJson());
  }
  if (pathname === `/api/v1/models/${MODEL_ID}` && method === "DELETE") {
    return new Response(null, { status: 204 });
  }
  if (pathname === `/api/v1/models/${MODEL_ID}/examples` && method === "POST") {
    return Response.json({ examples: [exampleJson()] }, { status: 201 });
  }
  if (pathname === `/api/v1/models/${MODEL_ID}/examples` && method === "GET") {
    return Response.json({
      items: [exampleJson()],
      page: 1,
      pageSize: 30,
      total: 1,
      totalPages: 1,
    });
  }
  if (pathname === `/api/v1/models/${MODEL_ID}/examples/${EXAMPLE_ID}/decisions`) {
    return Response.json({ decisions: [] });
  }
  if (pathname === `/api/v1/models/${MODEL_ID}/examples/${EXAMPLE_ID}`) {
    return Response.json(exampleJson());
  }
  if (pathname === `/api/v1/models/${MODEL_ID}/examples/${EXAMPLE_ID}/annotation`) {
    return Response.json(exampleJson());
  }
  if (pathname === `/api/v1/models/${MODEL_ID}/batch-decisions`) {
    return method === "GET"
      ? Response.json({ batchDecisions: [batchJson()] })
      : Response.json(batchJson("queued"), { status: 202 });
  }
  if (pathname === `/api/v1/batch-decisions/${JOB_ID}` && method === "GET") {
    return Response.json(batchJson());
  }
  if (pathname === `/api/v1/batch-decisions/${JOB_ID}` && method === "DELETE") {
    return new Response(null, { status: 204 });
  }
  if (pathname === `/api/v1/models/${MODEL_ID}/alignments`) {
    return method === "GET"
      ? Response.json({ alignments: [alignmentJson()] })
      : Response.json(alignmentJson("queued"), { status: 202 });
  }
  if (pathname === `/api/v1/alignments/${JOB_ID}` && method === "GET") {
    return Response.json(alignmentJson());
  }
  if (pathname === `/api/v1/alignments/${JOB_ID}` && method === "DELETE") {
    return new Response(null, { status: 204 });
  }
  if (pathname === `/api/v1/alignments/${JOB_ID}/logs`) {
    return Response.json({ logs: ["done"], available: true, running: false });
  }
  return Response.json({ code: "not_found", detail: pathname }, { status: 404 });
}

function setup(handler: (request: Request) => Response = responseFor) {
  const requests: Request[] = [];
  const fetcher: NonNullable<ClientOptions["fetch"]> = async (input, init) => {
    const request = new Request(input, init);
    requests.push(request);
    return handler(request);
  };
  return {
    modaic: new Modaic({
      apiKey: "test-key",
      baseUrl: "https://example.test/api/v1",
      fetch: fetcher,
    }),
    requests,
  };
}

describe("regressions for model-bound resources", () => {
  const questions: Record<string, Question> = {
    refund: { type: "noul", instructions: "Refund eligibility", criteria: { true: "Eligible", false: "Not eligible" } },
    priority: { type: "choice", instructions: { goal: "Prioritize" }, criteria: { low: "Routine", high: "Urgent" } },
    quality: { type: "score", criteria: ["Poor", "Good", "Excellent"] },
  };

  test("create forwards all question types and options without mutating input", async () => {
    const { modaic, requests } = setup();
    const params = { workspace: "acme", slug: "support", defaultBranch: "review", description: "", model: "typesafe/jev-latest", questions };
    const before = structuredClone(params);
    await modaic.models.create(params);
    expect(await requests[0]!.json()).toEqual(before);
    expect(params).toEqual(before);
    expect(requests).toHaveLength(1);
  });

  test("update keeps branch in query, null in body, and preserves revision metadata", async () => {
    const configuration = { schemaVersion: 1, checkpoint: 0, questions, capture: { sampleRate: 0 } };
    const commit = { commitSha: "new-sha", previousSha: "old-sha", branch: "review/a & b" };
    const { modaic, requests } = setup(() => Response.json({ ...modelJson(), configuration, commit }));
    const model = await modaic.models.update(MODEL_ID, { branch: commit.branch, description: null, questions, message: "Revise" });
    expect(new URL(requests[0]!.url).searchParams.get("branch")).toBe(commit.branch);
    expect(await requests[0]!.json()).toEqual({ description: null, questions, message: "Revise" });
    expect(model.configuration).toEqual(configuration);
    expect(model.commit).toEqual(commit);
    await modaic.models.update(MODEL_ID, { message: "Only message" });
    expect(new URL(requests[1]!.url).search).toBe("");
    expect(await requests[1]!.json()).toEqual({ message: "Only message" });
  });

  test("update passes discardAlignment through and surfaces the guardrail", async () => {
    const { modaic, requests } = setup(() => Response.json(modelJson()));
    await modaic.models.update(MODEL_ID, { questions, discardAlignment: true });
    expect(await requests[0]!.json()).toEqual({ questions, discardAlignment: true });

    const refused = setup(() =>
      Response.json(
        {
          type: "https://modaic.dev/problems/alignment-would-be-discarded",
          title: "Conflict",
          status: 409,
          code: "alignment_would_be_discarded",
          detail: "The questions on main were written by alignment (checkpoint 1).",
          details: { branch: "main", commitSha: "abc", checkpoint: 1 },
        },
        { status: 409 },
      ),
    );
    await expect(refused.modaic.models.update(MODEL_ID, { questions })).rejects.toMatchObject({
      status: 409,
      code: "alignment_would_be_discarded",
    });
  });

  test("update reports a no-op when the configuration already matches", async () => {
    const configuration = { schemaVersion: 1, checkpoint: 3, questions };
    const commit = { commitSha: "head", previousSha: "head", branch: "main" };
    const { modaic, requests } = setup(() => Response.json({ ...modelJson(), configuration, commit, unchanged: true }));
    const model = await modaic.models.update(MODEL_ID, { questions });
    expect(requests).toHaveLength(1);
    expect(model.unchanged).toBe(true);
    expect(model.commit).toEqual(commit);
    expect(model.configuration).toEqual(configuration);
  });

  test("multiple handles retain their own model and client credentials", async () => {
    const requests: Request[] = [];
    const makeClient = (key: string) => new Modaic({ apiKey: key, baseUrl: "https://example.test/api/v1", fetch: async (input, init) => {
      const request = new Request(input, init);
      requests.push(request);
      if (request.method === "POST" && new URL(request.url).pathname.endsWith("/models")) {
        const body = await request.clone().json();
        return Response.json({ ...modelJson(), id: body.slug, workspace: body.workspace, slug: body.slug });
      }
      if (new URL(request.url).pathname.endsWith("/systemone")) return responseFor(request);
      return Response.json({ items: [], alignments: [], batchDecisions: [] });
    } });
    const first = await makeClient("key-a").models.create({ workspace: "team-a", slug: "first" });
    const second = await makeClient("key-b").models.create({ workspace: "team-b", slug: "second" });
    requests.length = 0;
    await Promise.all([first, second].map(async (model) => {
      await model.decisions.create({ state: {} });
      await model.examples.list();
      await model.jobs.alignments.list();
      await model.jobs.batchDecisions.list();
    }));
    for (const [key, workspace, id] of [["key-a", "team-a", "first"], ["key-b", "team-b", "second"]]) {
      const owned = requests.filter(r => r.headers.get("authorization") === `Bearer ${key}`);
      expect(owned).toHaveLength(4);
      expect(await owned[0]!.json()).toEqual({ state: {}, model: `${workspace}/${id}` });
      expect(owned.slice(1).every(r => new URL(r.url).pathname.startsWith(`/api/v1/models/${id}/`))).toBe(true);
    }
    expect(JSON.stringify(first)).not.toContain("key-a");
    expect(JSON.stringify(second)).not.toContain("key-b");
  });

  test("ingest preserves unlabeled inputs and false, zero, null, and rationale", async () => {
    const { modaic, requests } = setup();
    const model = await modaic.models.get("farouk1", "support-triage");
    const inputs = [
      { id: EXAMPLE_ID, state: { nested: [false, 0, null, ""] }, annotation: { groundTruth: { refund: false, score: 0 }, groundReasoning: "" } },
      { state: null },
    ];
    const before = structuredClone(inputs);
    await model.examples.ingest(inputs);
    expect(await requests[1]!.json()).toEqual({ examples: before });
    expect(inputs).toEqual(before);
    await model.examples.annotate(EXAMPLE_ID, { groundTruth: { refund: false }, groundReasoning: "" });
    expect(await requests[2]!.json()).toEqual({ groundTruth: { refund: false }, groundReasoning: "" });
  });

  const selections: BatchSelection[] = [{ exampleIds: [EXAMPLE_ID] }, { examples: [{ id: EXAMPLE_ID, state: null }] }, { scope: "all" }];
  test.each(selections)("forwards batch selection %j and keeps idempotency in headers", async (selection) => {
    const { modaic, requests } = setup();
    const model = await modaic.models.get("farouk1", "support-triage");
    const params = { ...selection, idempotencyKey: "selection-123", branch: "review", sourceCommitSha: "pinned" };
    const before = structuredClone(params);
    await model.jobs.batchDecisions.create(params);
    expect(await requests[1]!.json()).toEqual({ ...selection, branch: "review", sourceCommitSha: "pinned" });
    expect(requests[1]!.headers.get("idempotency-key")).toBe("selection-123");
    expect(params).toEqual(before);
  });

  test.each([undefined, { seed: 0 }, { model: "reflection-model", minibatchSize: 2, seed: 12 }])("alignment reflection defaults and overrides %j", async (reflection) => {
    const { modaic, requests } = setup();
    const model = await modaic.models.get("farouk1", "support-triage");
    await model.jobs.alignments.create({ branch: "main", sourceCommitSha: "pinned", maxMetricCalls: 10, idempotencyKey: "alignment-123", ...(reflection === undefined ? {} : { reflection }) });
    expect(await requests[1]!.json()).toEqual({ branch: "main", sourceCommitSha: "pinned", budget: { maxMetricCalls: 10 }, reflection: { seed: 0, ...reflection } });
    expect(requests[1]!.headers.get("idempotency-key")).toBe("alignment-123");
  });

  for (const resource of ["alignments", "batchDecisions"] as const) {
    const jobJson = resource === "alignments" ? alignmentJson : batchJson;
    test.each(["completed", "failed", "cancelled"])(`${resource}.wait polls until %s and returns job details`, async status => {
      const states = ["queued", "running", status];
      const { modaic, requests } = setup(() => Response.json({ ...jobJson(states.shift()), error: status === "failed" ? { code: "job_failed", message: "Could not complete" } : null }));
      const result = await modaic[resource].wait(JOB_ID, { pollIntervalMs: 0 });
      expect(result.status).toBe(status);
      expect(result.error).toEqual(status === "failed" ? { code: "job_failed", message: "Could not complete" } : null);
      expect(requests).toHaveLength(3);
      expect(requests.every(r => r.method === "GET")).toBe(true);
    });
    test(`${resource}.wait times out without cancelling the job`, async () => {
      const { modaic, requests } = setup(() => Response.json(jobJson("running")));
      await expect(modaic[resource].wait(JOB_ID, { timeoutMs: 0, pollIntervalMs: 0 })).rejects.toBeInstanceOf(ModaicTimeoutError);
      expect(requests).toHaveLength(1);
      expect(requests[0]!.method).toBe("GET");
    });
  }

  test.each([401, 403, 404, 409, 422, 429, 500])("bound examples and jobs preserve HTTP %i errors without retrying", async status => {
    const { modaic, requests } = setup(request => new URL(request.url).pathname.includes("/entities/") ? responseFor(request) : Response.json({ code: "problem", detail: "Request rejected", details: { reason: "test" } }, { status, headers: { "x-request-id": "req-123" } }));
    const model = await modaic.models.get("farouk1", "support-triage");
    for (const call of [() => model.examples.list(), () => model.jobs.alignments.list(), () => model.jobs.batchDecisions.create({ scope: "all", idempotencyKey: "error-123" })]) {
      await expect(call()).rejects.toMatchObject({ status, code: "problem", requestId: "req-123", details: { reason: "test" } });
    }
    expect(requests).toHaveLength(4);
  });

  test("maps every decision answer type and falsy metadata", async () => {
    const answers: Record<string, Answer> = {
      refund: { type: "noul", noul: 0 },
      priority: { type: "choice", choice: "low", probabilities: { low: 1, high: 0 }, confidence: 1 },
      quality: { type: "score", score: 0, legend: { "0": "Poor" }, probabilities: { "0": 1 }, confidence: 1 },
    };
    const { modaic, requests } = setup(() => Response.json({ model: "typesafe/jev-latest", answers, usage: { input_tokens: 0, output_tokens: 0 }, checkpoint: 0, captured: false, revision: "sha", example_id: EXAMPLE_ID, decision_id: JOB_ID }));
    const result = await modaic.decisions.create({ state: null, model: "typesafe/jev-latest", capture: false, questions });
    expect(result).toEqual({ model: "typesafe/jev-latest", answers, usage: { inputTokens: 0, outputTokens: 0 }, checkpoint: 0, captured: false, revision: "sha", exampleId: EXAMPLE_ID, decisionId: JOB_ID });
    expect(await requests[0]!.json()).toEqual({ state: null, model: "typesafe/jev-latest", capture: false, questions });
    expect(requests[0]!.headers.has("idempotency-key")).toBe(false);
  });

  test("encodes model and example path segments rather than treating them as URLs", async () => {
    const { modaic, requests } = setup(() => Response.json(modelJson()));
    await modaic.models.get("team /?", "model #/%");
    await modaic.examples.get("model/a?", "example# /%");
    expect(new URL(requests[0]!.url).pathname).toBe("/api/v1/entities/team%20%2F%3F/models/model%20%23%2F%25");
    expect(new URL(requests[1]!.url).pathname).toBe("/api/v1/models/model%2Fa%3F/examples/example%23%20%2F%25");
  });
});

describe("Modaic", () => {
  test.each(["create", "get", "update"] as const)("binds examples and jobs on models.%s", async (method) => {
    const { modaic, requests } = setup();
    const model = method === "create"
      ? await modaic.models.create({ workspace: "farouk1", slug: "support-triage" })
      : method === "get"
        ? await modaic.models.get("farouk1", "support-triage")
        : await modaic.models.update(MODEL_ID, { description: "Updated" });
    expect(requests).toHaveLength(1);
    expect(Object.keys(model)).not.toContain("examples");
    expect(Object.keys(model)).not.toContain("jobs");
    expect(JSON.parse(JSON.stringify(model))).not.toHaveProperty("examples");
    expect(JSON.parse(JSON.stringify(model))).not.toHaveProperty("jobs");
    const examples = [{ state: { ticket: "charged twice" }, annotation: { groundTruth: { refund: true } } }];
    const annotation = { groundReasoning: "Duplicate charge confirmed" };
    const batch = { exampleIds: [EXAMPLE_ID], branch: "review", sourceCommitSha: "abc1234", idempotencyKey: "bound-batch-123" };
    const alignment = { branch: "review", sourceCommitSha: "abc1234", maxMetricCalls: 10, idempotencyKey: "bound-align-123", reflection: { minibatchSize: 2, seed: 42 } };
    expect((await model.examples.ingest(examples)).examples[0]?.id).toBe(EXAMPLE_ID);
    expect((await model.examples.list({ page: 2, pageSize: 5 })).items[0]?.id).toBe(EXAMPLE_ID);
    expect((await model.examples.get(EXAMPLE_ID)).id).toBe(EXAMPLE_ID);
    expect((await model.examples.annotate(EXAMPLE_ID, annotation)).id).toBe(EXAMPLE_ID);
    expect((await model.examples.listDecisions(EXAMPLE_ID)).decisions).toEqual([]);
    expect((await model.jobs.batchDecisions.create(batch)).id).toBe(JOB_ID);
    await model.jobs.batchDecisions.list({ limit: 7 });
    expect((await model.jobs.alignments.create(alignment)).id).toBe(JOB_ID);
    await model.jobs.alignments.list({ limit: 8 });
    expect(requests).toHaveLength(10);

    await modaic.examples.ingest(MODEL_ID, examples);
    await modaic.examples.list(MODEL_ID, { page: 2, pageSize: 5 });
    await modaic.examples.get(MODEL_ID, EXAMPLE_ID);
    await modaic.examples.annotate(MODEL_ID, EXAMPLE_ID, annotation);
    await modaic.examples.listDecisions(MODEL_ID, EXAMPLE_ID);
    await modaic.batchDecisions.create(MODEL_ID, batch);
    await modaic.batchDecisions.list(MODEL_ID, { limit: 7 });
    await modaic.alignments.create(MODEL_ID, alignment);
    await modaic.alignments.list(MODEL_ID, { limit: 8 });
    for (let index = 1; index <= 9; index++) {
      const bound = requests[index]!;
      const direct = requests[index + 9]!;
      expect(bound.url).toBe(direct.url);
      expect(bound.method).toBe(direct.method);
      expect([...bound.headers]).toEqual([...direct.headers]);
      expect(await bound.text()).toBe(await direct.text());
    }
    await model.examples.list();
    await model.jobs.alignments.list();
    await model.jobs.batchDecisions.list();
    expect(new URL(requests.at(-3)!.url).search).toBe("?page=1&pageSize=30");
    expect(new URL(requests.at(-2)!.url).search).toBe("?limit=20");
    expect(new URL(requests.at(-1)!.url).search).toBe("?limit=20");
  });

  test.each(["create", "get", "update"] as const)("binds decisions on models.%s without serializing client state", async (method) => {
    const { modaic, requests } = setup();
    const model = method === "create"
      ? await modaic.models.create({ workspace: "farouk1", slug: "support-triage" })
      : method === "get"
        ? await modaic.models.get("farouk1", "support-triage")
        : await modaic.models.update(MODEL_ID, { description: "Updated" });
    expect(requests).toHaveLength(1);
    expect(JSON.parse(JSON.stringify(model))).toEqual({
      ...modelJson(),
      ...(method === "create" ? { workspace: "farouk1" } : {}),
    });
    expect(Object.keys(model)).not.toContain("decisions");

    const options = {
      state: { ticket: "charged twice" },
      questions: { refund: { type: "noul" as const, instructions: { goal: "refund eligibility" } } },
      revision: "review",
      exampleId: EXAMPLE_ID,
      capture: false,
      idempotencyKey: "bound-decision-123",
    };
    const result = await model.decisions.create(options);
    expect(result.exampleId).toBe(EXAMPLE_ID);
    expect(requests).toHaveLength(2);
    expect(requests[1]!.url).toBe("https://example.test/api/v1/systemone");
    expect(requests[1]!.headers.get("authorization")).toBe("Bearer test-key");
    expect(requests[1]!.headers.get("idempotency-key")).toBe(options.idempotencyKey);
    const boundBody = await requests[1]!.json();
    expect(boundBody).toEqual({
      state: options.state, model: "farouk1/support-triage", questions: options.questions,
      revision: "review", example_id: EXAMPLE_ID, capture: false,
    });
    await modaic.decisions.create({ ...options, model: "farouk1/support-triage" });
    expect(await requests[2]!.json()).toEqual(boundBody);
    // Extra properties from JavaScript callers cannot redirect a bound handle.
    const override = { state: {}, model: "typesafe/jev-latest" };
    await model.decisions.create(override);
    expect(await requests[3]!.json()).toEqual({ state: {}, model: "farouk1/support-triage" });
  });

  test("bound decisions preserve API errors", async () => {
    const { modaic } = setup((request) => new URL(request.url).pathname.endsWith("/systemone")
      ? Response.json({ code: "rate_limited", detail: "Slow down" }, { status: 429 })
      : responseFor(request));
    const model = await modaic.models.get("farouk1", "support-triage");
    await expect(model.decisions.create({ state: {} })).rejects.toMatchObject({
      status: 429, code: "rate_limited", message: "Slow down",
    });
  });

  test("creates a model with questions in one API call", async () => {
    const { modaic, requests } = setup();
    const questions = {
      priority: {
        type: "choice" as const,
        instructions: { goal: "Route support tickets" },
        criteria: { normal: "Routine issue", high: "Urgent blocker" },
      },
    };
    for (const model of [undefined, "typesafe/jev-latest"]) {
      const params = { workspace: "acme", slug: "support-priority", questions, ...(model && { model }) };
      const modelResponse = await modaic.models.create(params);
      expect(modelResponse.id).toBe(MODEL_ID);
      expect(modelResponse.workspace).toBe("farouk1");
      expect(modelResponse).not.toHaveProperty("owner");
      const request = requests.at(-1)!;
      expect(request.method).toBe("POST");
      expect(new URL(request.url).pathname).toBe("/api/v1/models");
      expect(await request.json()).toEqual(params);
    }
    expect(requests).toHaveLength(2);
  });

  test("covers the documented API surface", async () => {
    const { modaic, requests } = setup();

    const result = await modaic.decisions.create({
      state: { ticket: "charged twice" },
      model: "typesafe/jev-latest",
      questions: { refund: { type: "noul" } },
      exampleId: EXAMPLE_ID,
      idempotencyKey: "decision-1",
    });
    expect(result.exampleId).toBe(EXAMPLE_ID);
    expect(result.usage.inputTokens).toBe(10);
    expect((await modaic.models.list()).models[0]?.repositoryId).toBe(MODEL_ID);
    await modaic.models.create({ workspace: "farouk1", slug: "support-triage" });
    await modaic.models.get("farouk1", "support-triage");
    await modaic.models.update(MODEL_ID, { description: null, model: "typesafe/jev-latest" });
    await modaic.models.delete(MODEL_ID);

    await modaic.examples.ingest(MODEL_ID, [
      {
        state: { ticket: "charged twice" },
        annotation: { groundTruth: { refund: true }, groundReasoning: "duplicate" },
      },
    ]);
    await modaic.examples.list(MODEL_ID);
    await modaic.examples.get(MODEL_ID, EXAMPLE_ID);
    await modaic.examples.annotate(MODEL_ID, EXAMPLE_ID, {
      groundTruth: { refund: true },
    });
    await modaic.examples.listDecisions(MODEL_ID, EXAMPLE_ID);

    await modaic.batchDecisions.create(MODEL_ID, {
      exampleIds: [EXAMPLE_ID],
      idempotencyKey: "batch-123",
    });
    await modaic.batchDecisions.list(MODEL_ID);
    await modaic.batchDecisions.get(JOB_ID);
    await modaic.batchDecisions.cancel(JOB_ID);
    expect((await modaic.batchDecisions.wait(JOB_ID, { pollIntervalMs: 0 })).status).toBe(
      "completed",
    );

    await modaic.alignments.create(MODEL_ID, {
      branch: "main",
      sourceCommitSha: "abc1234",
      maxMetricCalls: 100,
      idempotencyKey: "alignment-123",
    });
    await modaic.alignments.list(MODEL_ID);
    await modaic.alignments.get(JOB_ID);
    await modaic.alignments.logs(JOB_ID);
    await modaic.alignments.cancel(JOB_ID);
    expect((await modaic.alignments.wait(JOB_ID, { pollIntervalMs: 0 })).status).toBe(
      "completed",
    );

    expect(requests.every((request) => request.headers.get("authorization") === "Bearer test-key")).toBe(
      true,
    );
    expect(new Set(requests.map((request) => new URL(request.url).pathname))).toContain(
      "/api/v1/systemone",
    );
    expect(await requests[0]?.clone().json()).toMatchObject({ example_id: EXAMPLE_ID });
  });

  test("preserves problem details on API errors", async () => {
    const { modaic } = setup(() =>
      Response.json(
        { code: "validation_error", detail: "Bad question.", details: [{ path: ["questions"] }] },
        { status: 422, headers: { "x-request-id": "request-1" } },
      ),
    );

    try {
      await modaic.models.list();
      throw new Error("expected request to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(ModaicAPIError);
      const apiError = error as ModaicAPIError;
      expect(apiError.status).toBe(422);
      expect(apiError.code).toBe("validation_error");
      expect(apiError.requestId).toBe("request-1");
      expect(apiError.message).toBe("Bad question.");
    }
  });
});
