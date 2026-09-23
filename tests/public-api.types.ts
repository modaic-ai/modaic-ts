// Compiled by typecheck, never executed. These errors must remain type errors.
import type { CreatedModel, Model, Modaic } from "../src/index.js";

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
  // @ts-expect-error The systemone alias is not part of the SDK.
  client.systemone.create({ state: {} });
  return { workspace, slug };
}
