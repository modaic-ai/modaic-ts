// Compiled by typecheck, never executed. These errors must remain type errors.
import type { CreatedModel, DecisionRecord, ExampleDecision, Model, Modaic } from "../src/index.js";

export async function publicContract(client: Modaic, created: CreatedModel, fetched: Model) {
  const workspace: string = created.workspace;
  const slug: string = fetched.workspace.slug;
  await created.decisions.create({ state: {}, capture: false });
  await fetched.examples.annotate("example", { groundTruth: { refund: false } });
  await created.jobs.batchDecisions.create({ scope: "all", idempotencyKey: "key" });
  await fetched.jobs.alignments.create({ branch: "main", sourceCommitSha: "sha", maxMetricCalls: 10, idempotencyKey: "key" });
  // @ts-expect-error A bound model supplies its own model path.
  created.decisions.create({ state: {}, model: "other/model" });
  // @ts-expect-error Batch selection is required.
  created.jobs.batchDecisions.create({ idempotencyKey: "key" });
  // @ts-expect-error Batch modes cannot be combined.
  created.jobs.batchDecisions.create({ scope: "all", exampleIds: ["example"], idempotencyKey: "key" });
  // @ts-expect-error Job-ID actions remain top-level.
  created.jobs.alignments.wait("job");
  // @ts-expect-error The legacy owner field is not accepted.
  client.models.create({ owner: "acme", slug: "support" });
  // @ts-expect-error The systemone HTTP endpoint is exposed as decisions.create.
  client.systemone.create({ state: {} });
  return { workspace, slug };
}

export function storedDecisionContract(latest: ExampleDecision, history: DecisionRecord) {
  const version: number = latest.version;
  const exampleId: string = history.exampleId;
  const error: string | null = history.error;
  // @ts-expect-error Nested decisions have no exampleId.
  const invalidId: string = latest.exampleId;
  // @ts-expect-error Nested decisions have no jobId.
  const invalidJob: string = latest.jobId;
  // @ts-expect-error Nested decisions have no error.
  const invalidError: string = latest.error;
  return { version, exampleId, error, invalidId, invalidJob, invalidError };
}
