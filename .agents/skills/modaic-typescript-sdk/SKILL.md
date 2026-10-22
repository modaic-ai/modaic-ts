---
name: modaic-typescript-sdk
description: Use the Modaic TypeScript or JavaScript HTTP SDK for decisions, question objects, model and example management, and alignment or batch-decision jobs. Covers Promise-based APIs, configuration, progress, and errors.
---

# Modaic TypeScript SDK

Install `modaic` from npm. ESM, Node.js 18+, or a runtime with fetch.
The SDK has no runtime dependencies and performs API requests without
invoking Git or reading/writing model files. Every network method returns a
Promise; use await. Read [quickstart.ts](quickstart.ts) for direct inference.

## Configuration and questions

```typescript
import { Modaic, Noul, Choice, Score } from "modaic";

const client = new Modaic();
const result = await client.decisions.create({
  model: "mo-fast",
  state: { description: "Waterproof hiking boots, size 42" },
  questions: {
    outdoor: new Noul({ instructions: "Is this product intended for outdoor use?" }),
    department: new Choice({ criteria: {
      apparel: "Clothes and footwear", electronics: "Electronic devices", other: "Other products",
    } }),
    specificity: new Score({ criteria: [
      "No identifiable product", "Product category only", "Specific product with useful details",
    ] }),
  },
  idempotencyKey: "catalog-item-42-v1",
});
const answer = result.answers.department;
if (answer?.type === "choice") console.log(answer.choice);
```

Use `MODAIC_API_KEY` or `new Modaic({ apiKey })`.
`timeoutMs` uses milliseconds. Never ship private API keys to browser code.
Use `mo` or `mo-fast` for production inference.

Typesafe System One HTTP requests can migrate with the same state/questions:
use a Modaic key and endpoint, create a saved model, and set `model` to its
`workspace/slug`. Core answers/usage remain compatible. See `modaic-api`
for URL-joining details when retaining a Typesafe client. This SDK uses `decisions.create`.

Questions may be constructor instances or plain objects and may be mixed.
`Choice` needs at least one option; option keys cannot be empty.
`Score` needs at least one ordered level, with zero-based, possibly
fractional outputs. Instructions are optional JSON and may be null.
Preserve false, zero, null, arrays, and Unicode in inputs and annotations.

Answers are a discriminated union: narrow `answer.type` before accessing
`noul`, `choice`, or `score`. Choice/score answers contain probabilities
and confidence; score also contains a legend. Responses retain `usage`
and optional `captured`, `exampleId`, `decisionId`, `revision`,
and `checkpoint`. Public TypeScript properties use camelCase.

To skip the narrowing, pass `schema` to `decisions.create` and the result is
that schema's type. It validates the camelCase response the SDK returns, not
the wire body, and is never sent to the API. Zod is not a dependency: any
`{ parse(value: unknown): T }` object works, typed as `ResponseSchema<T>`.
A failed validation throws `ModaicConnectionError` with the validator's
error as `cause`.
Do not invent a response-model parameter or named-answer properties.

## Models and examples

```typescript
const model = await client.models.create({
  workspace: "acme", slug: "support-priority", model: "mo-fast",
  questions: { urgent: new Noul({ instructions: "Does this require urgent action?" }) },
});
const decision = await model.decisions.create({
  state: "The production checkout is unavailable.",
});
const page = await model.examples.list({ page: 1, pageSize: 20 });
```

Creation requires a base `model` and takes optional questions directly; omit
questions to create a general model. No file assembly is necessary.
Its response has `workspace` as a slug string; `models.get("acme",
"support-priority")` returns an entity object for workspace and a
`configuration` with the saved `model` and `questions` (undefined only when
the model has no manifest yet). `models.update` with identical questions is
a no-op that resolves normally: `commit.commitSha === commit.previousSha`
and the checkpoint is unchanged. Diff `configuration.questions` first to
skip the call; never catch a 500 as "already up to date".

If `configuration.checkpoint > 0`, alignment has rewritten the questions.
`models.update` with different `questions` rejects with a 409 whose `code`
is `alignment_would_be_discarded` rather than reverting the model. Keep
aligned instructions by omitting `questions`; pass `discardAlignment: true`
only when the user explicitly wants to replace them and reset the checkpoint.

`(await models.get(...)).commit?.commitSha` is the default branch head. Pass
it as `expectedHeadSha` to `models.update`; a stale value rejects with a 409
whose `code` is `expected_head_mismatch`. Version control on `models`:
`listBranches`, `createBranch(repo, { name, sourceRef })`, `deleteBranch`,
`listCommits(repo, { branch })`, `listTags`, `createTag(repo, { name, commitSha })`,
`deleteTag`, and `rollback(repo, { branch, targetCommitSha, expectedHeadSha,
message? })`. Tag an alignment's result commit and use the tag as
`revision`; restore an overwritten version with `rollback`, not by
re-committing prompt text.
Create/get/update results bind `model.decisions`, `model.examples`,
`model.jobs.alignments`, and `model.jobs.batchDecisions`.
Bound methods omit model paths. Collection methods on top-level examples,
alignments, and batch decisions take `workspace/model`; example item methods
take only the globally unique example ID. Pass `revision` on decisions to pin
a version.

`model.examples` provides `ingest([...])`, `list`, `get`,
`annotate`, and `listDecisions`. Each ingested example has `state`,
an optional UUID `id`, and optional
`annotation: { groundTruth: {...}, groundReasoning: "..." }`.
An ingested label does not run inference. The returned annotation
carries a `split` the service assigns and preserves; it is not an input,
so do not curate train/test membership yourself. `latestDecision` may be null;
it does not contain the history record's `exampleId`, `jobId`, or `error`.

## Jobs and progress

`model.jobs.batchDecisions.create` requires `idempotencyKey` and exactly
one of `exampleIds`, `examples`, or `scope: "all"`. Explicit selections
have 1–1,000 examples. Branch defaults to main.

`model.jobs.alignments.create` requires `branch`, `sourceCommitSha`, and
`idempotencyKey`; use a real source commit. `maxMetricCalls` is optional
(modaic >= 0.9.0): when omitted the API sizes the budget to the validation
split at launch, which is the recommended default. Optional `reflection`
contains `model`, `minibatchSize`, and `seed`.

Use `client.batchDecisions` or `client.alignments` for
`get(id)`, `wait(id, options)`, and `cancel(id)`.
Alignment also provides `logs(id)`. `wait(id, { progress: true })`
renders terminal progress without another package. Defaults to silent;
browsers without stderr remain silent. Poll interval/timeout options are
`pollIntervalMs`/`timeoutMs`. Check terminal status and error:
failed/cancelled jobs are returned, not treated as successful completion.
A timeout stops waiting, not the job itself.

## Replay and failures

With `modaic@^0.10.0`, for `mo-fast`, pass `reasoningEffort: "low"` (also `medium`, `high`, or
`xhigh`) to `decisions.create` or `model.decisions.create`. Omit it for no
reasoning; other models reject it. `result.usage.reasoningTokens` and
`result.thinking?.[questionId]` expose optional usage and per-question
diagnostics, not raw reasoning text; reasoning tokens are included in
`outputTokens`. Put images in JSON `state` using
`{ type: "image_url", image_url: { url: "https://..." } }` or a
`data:image/...;base64,` URL. `mo` and `mo-fast` accept up to four images
(PNG, JPEG, GIF, or WebP, 20 MB each). No separate image parameter is needed.

`decisions.create` calls `POST /systemone`. Direct inference needs no
saved model. A task-specific model has stored questions and must be called
without request questions; supplying them returns
`task_specific_model_questions_forbidden`. A general model has no stored
questions and must be called with questions; omitting them returns
`questions_required` (422). Reuse idempotency keys only for an
identical request. Keyed decisions returning `409 decision_in_progress`
are retried at most five times with bounded backoff; other conflicts are
not automatically retried.
Approved ZDR workspaces making covered direct base-model calls ignore the key:
each retry is a new, potentially billable inference, not a replay. ZDR requires
a separate signed agreement, approval, and technical activation; saved-model
calls, batch jobs, and training are not covered. `capture: false` does not make
a saved-model call ZDR. See
[Zero Data Retention](https://docs.modaic.dev/docs/api/zero-data-retention).

Capture visibility can lag the inference response. Do not add a history
wait to the inference path. HTTP errors throw `ModaicAPIError` with
`status`, `code`, `requestId`, `details`, and `body`.
Network/body-read errors throw `ModaicConnectionError`; timeouts throw
`ModaicTimeoutError`. Request timeouts cover receiving the response body.

## Knowledge base and fine-tuning


Use `client.knowledgeBase.uploads` for resumable datasets, eval-only datasets,
and artifacts. On Node.js, prefer `uploadFile(path, { workspace, name, kind })`
for a new local file: it computes
the whole-file SHA-256, creates the session, streams server-sized parts,
confirms receipts, completes, and waits for validation. Set
`waitForValidation: false` for an asynchronous return and use `onProgress` for
byte progress. It makes a best-effort cancellation if transfer fails before
completion. Browser callers use the lower-level part methods.
`create(workspace, { kind, sha256, sizeBytes, name, repos? })` creates a session;
`uploadPart(workspace, id, partNumber, data)` hashes one `Uint8Array` chunk, uploads it
with the file-scoped grant, and confirms its receipt. Then call `complete` and
poll `get` or call `wait` until validation is terminal. `knowledgeBase.resources` provides
`list`, `get`, `update`, and `download`; listing accepts `glob`, and update can
replace repository links and/or the description. Resource names are unique
across all kinds, so get/download do not take a kind.

Use `client.protege.create({ prompt, repo: "workspace/model", evalOnlyDataset })`
to start optimization, then `get`, `cancel`, or `wait` by job ID.

Use `client.fineTunes.create` with `trainingFile` and
`trainingType: "head_only" | "lora"`. Base model `mo-1.3.1` also requires
`destination`. The JSONL dataset supplies complete question, primitive,
criteria, and answer contracts; training does not change saved questions in
`model.json`. This works for head-only and LoRA. Training controls are camelCase fields on the create request.
LoRA also accepts `loraR` (maximum 64), `loraAlpha` (maximum 128), and
`loraDropout`; trainable modules are not configurable. Use `list`, `get`,
`logs`, `cancel`, and `wait` for jobs. Successful training publishes a normal
model commit. Invoke `workspace/model` for main or
`workspace/model@<full-commit-sha>` to pin it. Mo Fast is inference-only.


See https://docs.modaic.dev/docs/sdks/jobs/fine-tuning for dataset requirements.
