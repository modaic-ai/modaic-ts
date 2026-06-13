import { expect, test, describe, beforeEach, afterEach } from "bun:test";
import {
  Arbiter,
  BatchJob,
  BatchJobFailedError,
  ModaicClient,
} from "../../src/index";

/* -------------------------------------------------------------------------- */
/*  fetch mock                                                                  */
/* -------------------------------------------------------------------------- */

type Handler = (
  url: string,
  method: string,
  body: string | null,
) => Response | Promise<Response>;

const originalFetch = globalThis.fetch;

/** Route every fetch (generated SDK + BatchJob raw streams) through `handler`. */
function installFetch(handler: Handler): void {
  (globalThis as any).fetch = async (input: any, init?: any) => {
    let url: string;
    let method: string;
    let body: string | null;
    if (typeof input === "string" || input instanceof URL) {
      url = String(input);
      method = init?.method ?? "GET";
      body = init?.body != null ? String(init.body) : null;
    } else {
      url = input.url;
      method = input.method ?? "GET";
      body = await input
        .clone()
        .text()
        .then((t: string) => t || null)
        .catch(() => null);
    }
    return handler(url, method, body);
  };
}

const json = (obj: unknown, status = 200): Response =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });

const ndjson = (rows: unknown[]): Response =>
  new Response(rows.map((r) => JSON.stringify(r)).join("\n") + "\n", {
    status: 200,
    headers: { "content-type": "application/x-ndjson" },
  });

const sse = (blocks: string[]): Response =>
  new Response(blocks.join("\n\n") + "\n\n", {
    status: 200,
    headers: { "content-type": "text/event-stream" },
  });

beforeEach(() => {
  process.env["MODAIC_TOKEN"] = "test-token";
  // Fail loudly if a test hits the network without setting up a route.
  installFetch(() => {
    throw new Error("unexpected fetch — no route installed for this test");
  });
});

afterEach(() => {
  (globalThis as any).fetch = originalFetch;
});

/* -------------------------------------------------------------------------- */
/*  validation (no network)                                                     */
/* -------------------------------------------------------------------------- */

describe("Arbiter.predict_all validation", () => {
  const arbiter = () => new Arbiter("modaic/judge");

  test("rejects when both examples and example_ids are given", async () => {
    await expect(
      arbiter().predict_all([{ input: { q: "a" } }], { example_ids: ["e1"] }),
    ).rejects.toThrow(/exactly one/);
  });

  test("rejects when neither examples nor example_ids are given", async () => {
    await expect(arbiter().predict_all(null, {})).rejects.toThrow(/exactly one/);
  });

  test("rejects wait_for='scores' without compute_confidence", async () => {
    await expect(
      arbiter().predict_all([{ input: { q: "a" } }], { wait_for: "scores" }),
    ).rejects.toThrow(/compute_confidence/);
  });

  test("rejects more than 1000 examples", async () => {
    const many = Array.from({ length: 1001 }, () => ({ input: { q: "a" } }));
    await expect(arbiter().predict_all(many, { wait_for: null })).rejects.toThrow(
      /at most 1000 examples/,
    );
  });

  test("rejects an example missing the required `input` key", async () => {
    await expect(
      arbiter().predict_all([{} as any], { wait_for: null }),
    ).rejects.toThrow(/missing required 'input'/);
  });

  test("rejects more than 1000 example_ids", async () => {
    const ids = Array.from({ length: 1001 }, (_, i) => `e${i}`);
    await expect(
      arbiter().predict_all(null, { example_ids: ids, wait_for: null }),
    ).rejects.toThrow(/at most 1000 example_ids/);
  });
});

/* -------------------------------------------------------------------------- */
/*  start request                                                               */
/* -------------------------------------------------------------------------- */

describe("Arbiter.predict_all start request", () => {
  test("builds a single-arbiter request and returns a BatchJob with wait_for=null", async () => {
    let startBody: any = null;
    installFetch((url, method) => {
      if (method === "POST" && url.endsWith("/batch/predictions")) {
        return json({ job_id: "job-1", total: 2 });
      }
      throw new Error(`unexpected ${method} ${url}`);
    });
    // Capture the outbound body by wrapping fetch once more.
    const inner = globalThis.fetch;
    (globalThis as any).fetch = async (input: any, init?: any) => {
      const req = typeof input === "string" ? null : input;
      const text = req
        ? await req.clone().text()
        : init?.body != null
          ? String(init.body)
          : null;
      if (text) startBody = JSON.parse(text);
      return inner(input, init);
    };

    const arbiter = new Arbiter("modaic/judge", { rev: "v1" });
    const job = await arbiter.predict_all(
      [{ input: { q: "a" }, groundTruth: { v: "x" } }],
      { wait_for: null, compute_confidence: true },
    );

    expect(job).toBeInstanceOf(BatchJob);
    expect((job as BatchJob).jobId).toBe("job-1");
    expect((job as BatchJob).total).toBe(2);

    expect(startBody.arbiters).toEqual([
      { arbiter_repo: "modaic/judge", arbiter_revision: "v1" },
    ]);
    expect(startBody.compute_confidence).toBe(true);
    expect(startBody.example_ids).toBeUndefined();
    expect(startBody.examples).toHaveLength(1);
    expect(startBody.examples[0].input).toEqual({ q: "a" });
    expect(startBody.examples[0].ground_truth).toEqual({ v: "x" });
    expect(startBody.examples[0].ground_reasoning).toBe("");
  });

  test("falls back job total to the example count when the server omits it", async () => {
    installFetch((url, method) =>
      method === "POST" && url.endsWith("/batch/predictions")
        ? json({ job_id: "job-x" })
        : (() => {
            throw new Error(`unexpected ${method} ${url}`);
          })(),
    );
    const arbiter = new Arbiter("modaic/judge");
    const job = (await arbiter.predict_all(
      [{ input: { q: "a" } }, { input: { q: "b" } }, { input: { q: "c" } }],
      { wait_for: null },
    )) as BatchJob;
    expect(job.total).toBe(3);
  });
});

/* -------------------------------------------------------------------------- */
/*  BatchJob.results — NDJSON parsing + arbiter-index mapping                    */
/* -------------------------------------------------------------------------- */

describe("BatchJob.results", () => {
  const makeJob = (arbiters: string[]) =>
    new BatchJob({
      client: new ModaicClient({ token: "t", serverURL: "https://api.test" }),
      token: "t",
      baseURL: "https://api.test",
      jobId: "job-1",
      total: 2,
      arbiters,
    });

  test("parses rows and maps predictions[i] -> arbiters[i]", async () => {
    installFetch((url, method) => {
      if (method === "GET" && url.endsWith("/job-1/results")) {
        return ndjson([
          {
            example_id: "e1",
            input: { q: "a" },
            predictions: [
              {
                output: { verdict: "yes" },
                reasoning: "r0",
                messages: [{ role: "user" }],
                prediction_id: "p0",
                confidence: 0.9,
              },
              {
                output: { verdict: "no" },
                reasoning: "r1",
                messages: [],
                prediction_id: "p1",
              },
            ],
          },
          { example_id: "e2", predictions: [] },
        ]);
      }
      throw new Error(`unexpected ${method} ${url}`);
    });

    const rows = await makeJob(["a/x", "b/y"]).results();
    expect(rows).toHaveLength(2);

    const [row0, row1] = rows;
    expect(row0!.exampleId).toBe("e1");
    expect(row0!.input).toEqual({ q: "a" });
    expect(row0!.predictions[0]!.arbiterRepo).toBe("a/x");
    expect(row0!.predictions[0]!.output).toEqual({ verdict: "yes" });
    expect(row0!.predictions[0]!.reasoning).toBe("r0");
    expect(row0!.predictions[0]!.predictionId).toBe("p0");
    expect(row0!.predictions[0]!.confidence).toBe(0.9);
    expect(row0!.predictions[1]!.arbiterRepo).toBe("b/y");
    expect(row0!.predictions[1]!.confidence).toBeUndefined();

    expect(row1!.exampleId).toBe("e2");
    expect(row1!.predictions).toHaveLength(0);
  });
});

/* -------------------------------------------------------------------------- */
/*  BatchJob.events — SSE parsing                                                */
/* -------------------------------------------------------------------------- */

describe("BatchJob.events", () => {
  const makeJob = () =>
    new BatchJob({
      client: new ModaicClient({ token: "t", serverURL: "https://api.test" }),
      token: "t",
      baseURL: "https://api.test",
      jobId: "job-1",
      total: 2,
      arbiters: ["modaic/judge"],
    });

  test("yields each snapshot and terminates on event=finish", async () => {
    installFetch((url, method) => {
      if (method === "GET" && url.endsWith("/job-1/events")) {
        return sse([
          'event: prediction\ndata: {"event":"prediction","status":"predicting","predictions_progress":{"current":1,"total":2,"completed":1,"failed":0}}',
          ': heartbeat',
          'event: finish\ndata: {"event":"finish","status":"done","results":{"total":2,"examples":2,"arbiters":1}}',
        ]);
      }
      throw new Error(`unexpected ${method} ${url}`);
    });

    const seen = [];
    for await (const evt of makeJob().events()) seen.push(evt);

    expect(seen).toHaveLength(2);
    expect(seen[0]!.event).toBe("prediction");
    expect(seen[0]!.status).toBe("predicting");
    expect(seen[0]!.predictionsProgress).toEqual({
      current: 1,
      total: 2,
      completed: 1,
      failed: 0,
    });
    expect(seen[1]!.event).toBe("finish");
    expect(seen[1]!.status).toBe("done");
    expect(seen[1]!.results).toEqual({ total: 2, examples: 2, arbiters: 1 });
  });
});

/* -------------------------------------------------------------------------- */
/*  predict_all wait() — SSE-unavailable polling fallback                        */
/* -------------------------------------------------------------------------- */

describe("Arbiter.predict_all wait (polling fallback)", () => {
  test("polls status to a milestone then returns results", async () => {
    let statusCalls = 0;
    installFetch((url, method) => {
      if (method === "POST" && url.endsWith("/batch/predictions")) {
        return json({ job_id: "job-2", total: 1 });
      }
      if (method === "GET" && url.endsWith("/job-2/events")) {
        return new Response("no stream", { status: 404 });
      }
      if (method === "GET" && url.endsWith("/job-2/results")) {
        return ndjson([
          {
            example_id: "e1",
            predictions: [{ output: { verdict: "yes" }, reasoning: "r" }],
          },
        ]);
      }
      if (method === "GET" && url.endsWith("/batch/predictions/job-2")) {
        statusCalls += 1;
        return json(
          statusCalls < 2
            ? { event: "prediction", status: "predicting" }
            : { event: "prediction", status: "scoring" },
        );
      }
      throw new Error(`unexpected ${method} ${url}`);
    });

    const arbiter = new Arbiter("modaic/judge");
    const events: string[] = [];
    const rows = await arbiter.predict_all([{ input: { q: "a" } }], {
      poll_interval: 0.01,
      on_event: (e) => events.push(e.status),
    });

    expect(Array.isArray(rows)).toBe(true);
    expect(rows).toHaveLength(1);
    expect((rows as any)[0].predictions[0].arbiterRepo).toBe("modaic/judge");
    expect((rows as any)[0].predictions[0].output).toEqual({ verdict: "yes" });
    expect(statusCalls).toBeGreaterThanOrEqual(2);
    expect(events).toContain("scoring");
  });

  test("throws BatchJobFailedError when the job fails", async () => {
    installFetch((url, method) => {
      if (method === "POST" && url.endsWith("/batch/predictions")) {
        return json({ job_id: "job-3", total: 1 });
      }
      if (method === "GET" && url.endsWith("/job-3/events")) {
        return new Response("no stream", { status: 404 });
      }
      if (method === "GET" && url.endsWith("/batch/predictions/job-3")) {
        return json({ event: "finish", status: "failed", error: "boom" });
      }
      throw new Error(`unexpected ${method} ${url}`);
    });

    const arbiter = new Arbiter("modaic/judge");
    await expect(
      arbiter.predict_all([{ input: { q: "a" } }], { poll_interval: 0.01 }),
    ).rejects.toThrow(BatchJobFailedError);
  });
});
