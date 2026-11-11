---
name: modaic-typescript-sdk
description: Use the Modaic TypeScript or JavaScript HTTP SDK for decisions, question objects, model and example management, and alignment or batch-decision jobs. Covers Promise-based APIs, configuration, progress, and errors.
---

# Modaic TypeScript SDK

Default to `mo-latest` for inference. Use `mo-2.0` when pinning a version. Use `mo-1.3.1` only for fine-tuning. Do not select a different base model unless the user explicitly requests it.

Install `modaic` from npm. ESM, Node.js 18+, or a runtime with fetch.
The SDK has no runtime dependencies and performs API requests without
invoking Git or reading/writing model files. Every network method returns a
Promise; use await. Read [quickstart.ts](quickstart.ts) for direct inference.

## Configuration and questions

```typescript
import { Modaic, Noul, Choice, Score } from "modaic";

const client = new Modaic();
const result = await client.decisions.create({
  model: "mo-latest",
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
Use `mo-latest` for production inference.

Typesafe System One HTTP requests can migrate with the same state/questions:
use a Modaic key and endpoint, create a saved model, and set `model` to its
`workspace/slug`. Core answers/usage remain compatible. See `modaic-api`
for URL-joining details when retaining a Typesafe client. This SDK uses `decisions.create`.

Questions may be constructor instances or plain objects and may be mixed.
`Choice` needs at least one option; option keys cannot be empty.
`Score` needs at least one ordered level, with zero-based, possibly
fractional outputs. Instructions are optional JSON and may be null.
Preserve false, zero, null, arrays, and Unicode in inputs and annotations.

Inline question dictionaries infer named primitive answer types automatically.
For saved-model calls without inline questions, answers are a discriminated union:
narrow `answer.type` before accessing `noul`, `choice`, or `score`. Choice/score answers contain probabilities
and confidence; score also contains a legend. Responses retain `usage`
and optional `captured`, `exampleId`, `decisionId`, `revision`,
and `checkpoint`. Public TypeScript properties use camelCase.

For custom response validation, pass `schema` to `decisions.create` and the result is
that schema's type. It validates the camelCase response the SDK returns, not
the wire body, and is never sent to the API. Zod is not a dependency: any
`{ parse(value: unknown): T }` object works, typed as `ResponseSchema<T>`.
A failed validation throws `ModaicConnectionError` with the validator's
error as `cause`.
Do not invent a response-model parameter or named-answer properties.

## Models and examples

```typescript
const model = await client.models.create({
  workspace: "acme", slug: "support-priority", model: "mo-latest",
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
`annotation: { groundTruth: {...} }`.
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

Put images in JSON `state` using
`{ type: "image_url", image_url: { url: "https://..." } }` or a
`data:image/...;base64,` URL. `mo-latest` accepts up to four images
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

## Workspace resources and fine-tuning


Use `client.uploads` for resumable datasets, eval-only datasets,
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
poll `get` or call `wait` until validation is terminal. `resources` provides
`list`, `get`, `update`, and `download`; listing accepts `glob`, and update can
replace repository links and/or the description. Resource names are unique
across all kinds, so get/download do not take a kind.

Use `client.protege.create({ prompt, repo: "workspace/model", evalOnlyDataset })`
to start optimization, then `get`, `cancel`, or `wait` by job ID.

Use `client.fineTunes.create` with `trainingFile` and
`trainingType: "head_only" | "lora"`. Base model `mo-1.3.1` also requires
`destination`. The JSONL dataset supplies `instructions`, `type`, `criteria`,
and `answer` on each inline question; rows do not contain partition labels.
Pass `validationFile` and `evalOnlyDataset` to use separate uploaded files.
When either is omitted, the API selects that partition deterministically from
the training file. Rows may also contain up to ten named PNG/JPEG/WebP assets as raw
base64 or public HTTPS URLs. Asset IDs are placeholders inside state,
instructions, and criteria strings; URL contents are snapshotted when training
starts. The `mo-1.3.1` training base is text-only and returns
`fine_tune_modality_unsupported` for referenced images instead of discarding
them. This works for head-only and LoRA. Training controls are camelCase fields on the create request.
LoRA also accepts `loraR` (maximum 64), `loraAlpha` (maximum 128), and
`loraDropout`; trainable modules are not configurable. Use `list`, `get`,
`logs`, `cancel`, and `wait` for jobs. Successful training publishes a normal
model commit. Invoke `workspace/model` for main or
`workspace/model@<full-commit-sha>` to pin it.


See https://docs.modaic.dev/docs/sdks/jobs/fine-tuning for dataset requirements.

## Nullable questions and inferred answers

Questions infer the answer fields automatically, including Choice literal keys;
Zod or another response schema is optional. The same inference works for
model-bound decisions.

```typescript
import { Modaic, Choice, Noul } from "modaic";

const result = await new Modaic().decisions.create({
  model: "mo-latest",
  state: { address: "Paris, France" },
  questions: {
    country: new Choice({
      instructions: "Which country is the address in?",
      criteria: { fr: "France", us: "United States" },
    }).nullable(),
    relevant: new Noul({ instructions: "Is this address relevant?" }),
  },
});
result.answers.country; // Choice<"fr" | "us">, or null.
result.answers.relevant.noul; // number, without union narrowing.
```

Noul, Choice, Score, Number, Text, Span, Datetime, Date, Time, and Box support `.nullable(threshold = 0.5)`.
`new Nullable(question, threshold)` also wraps constructor instances or plain
question objects. Thresholds must be finite numbers in [0, 1]. A helper Noul
checks whether the supplied state is sufficient to answer the full question.
Both questions run in one HTTP request; below the threshold the entire answer
becomes `null`, and equality accepts it. Helper answers are removed before an
optional response schema parses the result, so use `.nullable()` in Zod for
those answer fields. Missing or malformed helper answers throw
`ModaicConnectionError`; explicit helper-ID collisions fail before HTTP.

Nullable wrappers are request-local to `decisions.create`, not saved-model
configuration. `__modaic_answerable_<question-id>` identifies each helper.
Helpers count as additional questions. Captured API history retains the original
answers and helper Nouls; SDK projection changes only the returned response.
Calls without questions retain the standard `DecisionResponse` return type.


### Native text, span, and datetime

```typescript
import { Text, Span, Datetime } from "modaic";
const questions = {
  summary: new Text({ instructions: "Summarize the document" }),
  quote: new Span({ instructions: "Find the exact supporting passage" }).nullable(),
  published: new Datetime({ instructions: "Publication date?", format: "YYYY-MM-DD" }),
};
```

The inferred answers expose `.text`, `.span.text`/`.span.start`/`.span.end`, and `.datetime`
respectively. Datetime answers retain strings rather than converting local times
to JavaScript Date objects. The selected `format` is serialized as
`criteria.format`. Allowed formats: `YYYY`, `YYYY-MM`, `YYYY-MM-DD`, `HH`,
`HH:MM`, `HH:MM:SS`, `YYYY-MM-DDTHH`, `YYYY-MM-DDTHH:MM`,
`YYYY-MM-DDTHH:MM:SS`. Timezone suffixes and offsets are unsupported.


### Unified primitives

Answers are public primitive instances. Use `Choice.choice`, `Score.score`,
`Span.span.text`/`.span.start`/`.span.end`, `Text.text`, `Number.number`, `Noul.noul`, and
`Datetime.datetime`. Structural `*Answer` types remain available.

```typescript
const result = await client.decisions.create({
  model: "mo-2.0", state: "The event is in Paris.",
  questions: { evidence: new Span({ instructions: "Find the city name" }) },
});
result.answers.evidence.span.text;
result.answers.evidence.span.start;
result.answers.evidence.name; // "evidence", inferred from the key.
```

`questions` accepts a dictionary, or may be omitted for saved models as before.
Primitive instances and constructor classes are not accepted directly.
Constructor `name` remains optional; the dictionary key takes precedence.
Nullable dictionary entries return their primitive or `null`. Response envelopes
and optional schema validation remain supported. Metadata and answer fields do
not leak into request serialization. Answers without an available original
question definition cannot be reused as question definitions.

`Number` takes `instructions` and optional exact decimal string
`criteria: { min, max }`. Number does not accept `step`.


`Date` and `Time` extend `Datetime` and default to `YYYY-MM-DD` and `HH:MM`.
`Datetime` defaults to `YYYY-MM-DDTHH:MM`. Explicit format overrides are
supported. Their `.datetime` values remain formatted strings and returned
objects retain the subclass used to define the question.


`Box` supports native image localization and nullable composition. For
`questions: { region: new Box({ instructions: "Find the object" }) }`, the
inferred answer exposes `.box.top`, `.box.bottom`, `.box.left`, `.box.right`,
and `.confidence`. Coordinates are normalized to [0, 1]. Saved-model Box
responses are supported, including when a custom response schema is supplied.


Box `.confidence` is `number | null`, matching the shared TypeSafe response
contract. JavaScript object keys remain strings at runtime; Score maps support
numeric property indexing as normal JavaScript objects do.

Returned primitive answer fields are read-only. Do not assign to `.choice`,
`.noul`, or other answer properties. JavaScript objects are always truthy;
use `answer.noul > 0.5` for a boolean decision. Both
`result.answers.country` and `result.answers["country"]` work.
## Mo 2.0 extraction and boxes

Select `mo-2.0` explicitly. `Span` extracts an exact
substring from a string state; `Box` (`type: "box"`) localizes an image region.
Both require nonempty string instructions and reject criteria.
Span answers expose `.span`, up to ten confidence-ordered disjoint candidates
in `.spans`, and top-level `.confidence`; each candidate has `text`, `start`,
`end`, and `confidence`, and `.span` is always `.spans[0]`. Offsets count UTF-16
code units and end is exclusive. Box answers contain
`box: {top, bottom, left, right}` normalized to [0, 1], and confidence.
Pass inline `assets` to decisions.create, mapping an asset ID to
`{type: "image", format: "png", dataBase64: "..."}`. Reference IDs in
state, instructions or supported criteria; no separate upload is required.
`mo-latest` selects `mo-2.0`.

The API and SDK use the same `type: "span"` contract.

### Number answers

Number answers expose `.number`, `.confidence`, `.probabilities`, and `.variance`,
matching the API. Confidence is the greedy numeric sequence's confidence; it is
separate from the alternatives distribution and variance. Even a single-value
probability map may have nonzero variance.

Set `experimentalNullability: true` on `decisions.create` to send
`X-Modaic-Experimental-Nullability: true`. Span, Text, Number, and Datetime
answers then include `.pNull` in `[0, 1]`; their headline value remains the
model's best guess regardless of `.pNull`. Set `experimentalSampling: true` to
request sampled Number alternatives. Without it, Number `.probabilities`
contains only the selected value.
