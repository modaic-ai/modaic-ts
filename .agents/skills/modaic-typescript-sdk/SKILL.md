---
name: modaic-typescript-sdk
description: Use the Modaic TypeScript or JavaScript HTTP SDK for decisions, question objects, model and example management, and alignment or batch-decision jobs. Covers Promise-based APIs, configuration, progress, and errors.
---

# Modaic TypeScript SDK

Install `modaic@^0.5.0`. ESM, Node.js 18+, or a runtime with fetch.
The SDK has no runtime dependencies and performs API requests without
invoking Git or reading/writing model files. Every network method returns a
Promise; use await. Read [quickstart.ts](quickstart.ts) for direct inference.

## Configuration and questions

```typescript
import { Modaic, Noul, Choice, Score } from "modaic";

const client = new Modaic();
const result = await client.decisions.create({
  model: "typesafe/jev-latest",
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
API URL precedence: explicit `baseUrl`, then `MODAIC_API_URL`, then
`https://modaic.dev/api/v1`. Local API: `http://localhost:3001/v1`.
`timeoutMs` uses milliseconds. Never ship private API keys to browser code.

Typesafe System One HTTP requests can migrate with the same state/questions:
use a Modaic key and endpoint, create a saved model, and set `model` to its
`workspace/slug`. Core answers/usage remain compatible. See `modaic-api`
for URL-joining details when retaining a Typesafe client. This SDK uses
`decisions.create` and the versioned base above.

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
  workspace: "acme", slug: "support-priority", model: "typesafe/jev-latest",
  questions: { urgent: new Noul({ instructions: "Does this require urgent action?" }) },
});
const decision = await model.decisions.create({
  state: "The production checkout is unavailable.",
});
const page = await model.examples.list({ page: 1, pageSize: 20 });
```

Creation takes questions directly; no file assembly is necessary.
Its response has `workspace` as a slug string; `models.get("acme",
"support-priority")` returns an entity object for workspace.
Create/get/update results bind `model.decisions`, `model.examples`,
`model.jobs.alignments`, and `model.jobs.batchDecisions`.
Bound methods omit model IDs. Pass `revision` on decisions to pin a version.

`model.examples` provides `ingest([...])`, `list`, `get`,
`annotate`, and `listDecisions`. Each ingested example has `state`,
an optional UUID `id`, and optional
`annotation: { groundTruth: {...}, groundReasoning: "..." }`.
An ingested label does not run inference. `latestDecision` may be null;
it does not contain the history record's `exampleId`, `jobId`, or `error`.

## Jobs and progress

`model.jobs.batchDecisions.create` requires `idempotencyKey` and exactly
one of `exampleIds`, `examples`, or `scope: "all"`. Explicit selections
have 1–1,000 examples. Branch defaults to main.

`model.jobs.alignments.create` requires `branch`, `sourceCommitSha`,
`maxMetricCalls`, and `idempotencyKey`; use a real source commit.
Optional `reflection` contains `model`, `minibatchSize`, and `seed`.

Use `client.batchDecisions` or `client.alignments` for
`get(id)`, `wait(id, options)`, and `cancel(id)`.
Alignment also provides `logs(id)`. `wait(id, { progress: true })`
renders terminal progress without another package. Defaults to silent;
browsers without stderr remain silent. Poll interval/timeout options are
`pollIntervalMs`/`timeoutMs`. Check terminal status and error:
failed/cancelled jobs are returned, not treated as successful completion.
A timeout stops waiting, not the job itself.

## Replay and failures

`decisions.create` calls `POST /systemone`. Direct inference needs no
saved model; a saved model uses `workspace/slug` and its stored questions.
Inline overrides merge by question ID. Reuse idempotency keys only for an
identical request. Keyed decisions returning `409 decision_in_progress`
are retried at most five times with bounded backoff; other conflicts are
not automatically retried.

Capture visibility can lag the inference response. Do not add a history
wait to the inference path. HTTP errors throw `ModaicAPIError` with
`status`, `code`, `requestId`, `details`, and `body`.
Network/body-read errors throw `ModaicConnectionError`; timeouts throw
`ModaicTimeoutError`. Request timeouts cover receiving the response body.
