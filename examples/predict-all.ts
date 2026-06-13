/**
 * Example: run an Arbiter over a *batch* of inputs as one async job.
 *
 * `predict_all` is the batch sibling of `predict()` (see predict.ts). It starts
 * a batch-predictions job on Modaic Hub, then — by default — blocks until the
 * predictions are persisted and returns one result row per example. The Modaic
 * server runs the LLM for every (example) pair; this is pure HTTP authenticated
 * with `MODAIC_TOKEN`.
 *
 * Run it (after create-arbiter.ts, or against any judge you own):
 *   export MODAIC_TOKEN="your-access-token"   # from https://modaic.dev
 *   bun run examples/predict-all.ts
 *
 * Optionally override which judge to run:
 *   MODAIC_REPO="your-username/quality-judge" bun run examples/predict-all.ts
 */

import { Arbiter, type BatchExampleResult } from "../src/index";

const repo = process.env.MODAIC_REPO ?? "modaic/quality-judge";

async function main() {
  if (!process.env.MODAIC_TOKEN) {
    throw new Error(
      "MODAIC_TOKEN is not set. Get a token from https://modaic.dev and " +
        "run: export MODAIC_TOKEN=...",
    );
  }

  const arbiter = new Arbiter(repo);

  // A batch of inputs, each matching the judge's signature. `input` is the only
  // required key; `groundTruth` / `split` are optional (used for alignment).
  const examples = [
    { input: { question: "Capital of France?", answer: "Paris." } },
    { input: { question: "Capital of Japan?", answer: "Kyoto." } },
    { input: { question: "2 + 2?", answer: "4" } },
  ];

  // 1. Blocking path (default): start the job and wait for predictions.
  //    `show_progress` prints a progress line to stderr; `on_event` gets every
  //    snapshot (from the SSE stream, or polling if the stream is unavailable).
  console.log(`Running ${arbiter.repo} over ${examples.length} examples ...`);
  const results = (await arbiter.predict_all(examples, {
    show_progress: true,
    on_event: (e) => {
      if (e.predictionsProgress) {
        process.stderr.write(
          `\n[${e.status}] ${e.predictionsProgress.current}/${e.predictionsProgress.total}\n`,
        );
      }
    },
  })) as BatchExampleResult[];

  for (const row of results) {
    const pred = row.predictions[0];
    console.log(`- ${row.exampleId}: verdict=${pred?.output?.["verdict"]}`);
  }

  // 2. Non-blocking path: pass `wait_for: null` to get a BatchJob handle back
  //    immediately, then drive it yourself (status / wait / cancel).
  const job = await arbiter.predict_all(examples, { wait_for: null });
  if ("jobId" in job) {
    console.log(`\nStarted job ${job.jobId} (total=${job.total}); awaiting ...`);
    const rows = await job.wait({ waitFor: "predictions" });
    console.log(`Job ${job.jobId} produced ${rows.length} result rows.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
