/**
 * Integration tests for `Arbiter.predict_all` against a LIVE Modaic Hub.
 *
 * These create a real arbiter, then start a real async batch-predictions job and
 * run it to completion (predicting → done) server-side. They need:
 *   - MODAIC_TOKEN        a real access token (https://modaic.dev)
 *   - git installed       (the arbiter is pushed over git before predicting)
 *   - network access to api.modaic.dev + git.modaic.dev
 *
 * SKIPPED unless BOTH MODAIC_TOKEN and MODAIC_INTEGRATION are set. Run with:
 *
 *   MODAIC_INTEGRATION=1 MODAIC_TOKEN=... bun test tests/arbiter/predict_all.integration.test.ts
 *   # or: MODAIC_TOKEN=... npm run test:integration
 *
 * Optional: MODAIC_TEST_MODEL overrides the model (default modaic/openai/gpt-oss-120b).
 * Use the full LiteLLM routing string (provider prefix included) — a bare probe key
 * like `gpt-oss-120b` doesn't route server-side and yields an empty judge output.
 *
 * The arbiter created here is registered for best-effort deletion in afterAll.
 */
import { expect, test, describe, beforeAll, afterAll } from "bun:test";
import { z } from "zod";
import {
  Arbiter,
  BatchJob,
  Signature,
  Enum,
  getUserInfo,
  getApiUrl,
  type BatchExampleResult,
} from "../../src/modaic/index";

const TOKEN = process.env.MODAIC_TOKEN ?? "";
const MODEL = process.env.MODAIC_TEST_MODEL ?? "modaic/openai/gpt-oss-120b";
const RUN = Boolean(TOKEN) && Boolean(process.env.MODAIC_INTEGRATION);

// The hub needs a moment to index a freshly-pushed arbiter before inference can
// load it; predicting too soon yields an empty output. Tune with MODAIC_PROPAGATION_MS.
const PROPAGATION_MS = Number(process.env.MODAIC_PROPAGATION_MS ?? 30_000);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const suite = RUN ? describe : describe.skip;

suite("Arbiter.predict_all integration (live Modaic Hub)", () => {
  let owner = "";
  let repo = "";
  let arbiter: Arbiter;
  const createdRepos: string[] = [];

  beforeAll(async () => {
    owner = (await getUserInfo(TOKEN)).login;
    const rand = Math.floor(Math.random() * 1e6);
    repo = `${owner}/modaic-ts-it-predict-all-${Date.now()}-${rand}`;
    createdRepos.push(repo);

    const signature = new Signature({
      instructions:
        "Decide whether the answer correctly answers the question. " +
        "Output 'yes' or 'no'.",
      input: z.object({
        question: z.string().describe("The question"),
        answer: z.string().describe("The answer to judge"),
      }),
      // Arbiter output fields must be enumerable (a finite output space), not a
      // bare string — otherwise the hub's judge pipeline has nothing to extract.
      output: z.object({
        verdict: Enum("yes", "no").describe("yes or no"),
      }),
    });

    arbiter = await Arbiter.create({ repo, signature, model: MODEL });
    // Wait for the hub to index the freshly-pushed arbiter before running it.
    await sleep(PROPAGATION_MS);
  }, 120_000);

  afterAll(async () => {
    // Best-effort cleanup — don't fail the suite if a delete doesn't go through.
    for (const r of createdRepos) {
      try {
        await fetch(`${getApiUrl()}/api/v2/repos/${r}`, {
          method: "DELETE",
          headers: { Authorization: `token ${TOKEN}`, Accept: "application/json" },
        });
      } catch {
        /* ignore */
      }
    }
  });

  test(
    "predict_all (blocking) returns one result row per example",
    async () => {
      const examples = [
        { input: { question: "What is the capital of France?", answer: "Paris" } },
        { input: { question: "What is 2 + 2?", answer: "5" } },
        { input: { question: "Is the sky blue on a clear day?", answer: "Yes" } },
      ];

      const statuses: string[] = [];
      const out = await arbiter.predict_all(examples, {
        poll_interval: 3,
        on_event: (e) => statuses.push(e.status),
      });

      // Default wait_for="predictions" resolves to the result rows, not a handle.
      expect(Array.isArray(out)).toBe(true);
      const rows = out as BatchExampleResult[];
      expect(rows).toHaveLength(examples.length);

      for (const row of rows) {
        expect(typeof row.exampleId).toBe("string");
        expect(row.exampleId.length).toBeGreaterThan(0);
        expect(row.predictions.length).toBeGreaterThanOrEqual(1);

        const pred = row.predictions[0]!;
        expect(pred.arbiterRepo).toBe(repo);
        expect(pred.output).toBeTruthy();
        expect(pred.output).toHaveProperty("verdict");
        // Reasoning is always present on an arbiter prediction (string, may be empty).
        expect(typeof pred.reasoning).toBe("string");
      }

      // We saw at least one progress snapshot, ending in a terminal phase.
      expect(statuses.length).toBeGreaterThan(0);
      expect(statuses.some((s) => s === "done" || s === "scoring")).toBe(true);
    },
    240_000,
  );

  test(
    "predict_all with wait_for=null returns a BatchJob handle to await",
    async () => {
      const job = await arbiter.predict_all(
        [{ input: { question: "Capital of Japan?", answer: "Tokyo" } }],
        { wait_for: null },
      );

      expect(job).toBeInstanceOf(BatchJob);
      const handle = job as BatchJob;
      expect(typeof handle.jobId).toBe("string");
      expect(handle.jobId.length).toBeGreaterThan(0);
      expect(handle.total).toBeGreaterThanOrEqual(1);

      const rows = await handle.wait({ waitFor: "predictions", pollInterval: 3 });
      expect(rows).toHaveLength(1);
      expect(rows[0]!.predictions[0]!.arbiterRepo).toBe(repo);
      expect(rows[0]!.predictions[0]!.output).toHaveProperty("verdict");
    },
    240_000,
  );
});
