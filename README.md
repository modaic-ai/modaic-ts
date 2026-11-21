# Modaic TypeScript SDK

The official, HTTP-only TypeScript client for the public Modaic API. It uses
the platform `fetch` implementation, has no runtime dependencies, and never
invokes Git or reads or writes repository files.

Modaic provides managed training and inference primitives to adapt and calibrate
System One models for your task. Run predictions, manage custom models and
datasets, and start instruction optimization or fine-tuning jobs.

Mo Lite is coming soon. Its aliases return HTTP `400` with code
`model_not_supported`; use `mo-latest` or `mo-2.0` for inference.

## Question objects

Use `new Noul({ instructions: "Is this about billing?" })`,
`new Choice({ criteria: { billing: "Payments", other: "Other requests" } })`,
or `new Score({ criteria: ["Routine", "Urgent"] })` to define questions.
Import these constructors from `modaic` and pass them in the `questions` map
to `predictions.create`, `models.create`, or `models.update`. Plain question
objects still work and can be mixed with these constructors.

`Choice` requires at least one option; `Score` requires at least one rubric
level. Empty choice criteria sent as a plain object are rejected by the API with
`422` and code `validation_error`.

## Install

```bash
npm install modaic
```

Set an API key from <https://modaic.dev/settings/keys>:

```bash
export MODAIC_API_KEY="mdc_..."
```

The client reads `MODAIC_API_KEY` automatically. You can also pass the key
explicitly as `new Modaic({ apiKey })`.

## Quickstart

```typescript
import { Modaic } from "modaic";

const modaic = new Modaic();

const result = await modaic.predictions.create({
  state: {
    ticket: "I was charged twice for order 4832. Please refund one charge.",
  },
  model: "mo-latest",
  questions: {
    needs_refund: {
      type: "noul",
      instructions: "Should this customer receive a refund?",
      criteria: {
        true: "A duplicate or invalid charge should be refunded.",
        false: "The charge is valid or more information is required.",
      },
    },
    priority: {
      type: "choice",
      instructions: "Choose the support priority.",
      criteria: {
        low: "No financial or time-sensitive impact.",
        normal: "Routine customer issue.",
        high: "Financial impact or an urgent blocker.",
      },
    },
  },
  idempotencyKey: "ticket-4832-v1",
});

console.log(result.answers.priority);
```

The API URL defaults to `https://modaic.dev/api/v1`.

## Typed responses

`answers` is a record of a union, so reading one answer normally means a key
lookup and a narrowing check. Pass a `schema` to validate the response and get
the exact shape back instead:

```typescript
import { z } from "zod";

const ListingReview = z.object({
  answers: z.object({
    photo_matches: z.object({ type: z.literal("noul"), noul: z.number() }),
    condition: z.object({ type: z.literal("score"), score: z.number() }),
  }),
});

const result = await modaic.predictions.create({
  model: "mo-latest",
  state: { listing: "Vintage leather jacket, size M" },
  questions: { /* ... */ },
  schema: ListingReview,
});

result.answers.photo_matches.noul; // number, no narrowing needed
```

The schema validates the response the SDK returns, in camelCase, so a `usage`
field is `{ inputTokens, outputTokens }`. Fields the schema omits are dropped
by Zod as usual, and `schema` is never sent to the API.

Zod is not a dependency of this package. `schema` accepts any object with a
`parse(value: unknown) => T` method, so Valibot, ArkType, and hand-written
validators work the same way; the exported `ResponseSchema<T>` type describes
the contract. A response that fails validation raises `ModaicConnectionError`,
with the validator's own error kept as `cause`.

`schema` works on `model.predictions.create` as well.

## Workspace uploads and fine-tuning

Large training datasets and artifacts use resumable upload sessions. On Node.js,
the high-level helper streams the file twice: once to compute its whole-file
SHA-256 and once to upload server-sized parts. It never materializes the whole
file in memory, and it waits for validation by default:

```typescript
const upload = await modaic.uploads.uploadFile("training.jsonl", {
  workspace: "acme",
  kind: "dataset",
  name: "support-hard-labels",
  repos: ["support-priority"],
  onProgress: ({ uploadedBytes, totalBytes }) => {
    console.log(`${uploadedBytes}/${totalBytes}`);
  },
});
```

Set `waitForValidation: false` to return as soon as completion starts, or use
the lower-level `create`, `preparePart`, `uploadPart`, `confirmPart`, `complete`,
and `wait` methods to resume an existing session. Resources are available
through `datasets.list`, `get`, `update`, and `download`.
Listing accepts a `glob` using `*` and `?`; held-out sets use
`kind: "eval-only-dataset"`.

Start head-only or LoRA tuning with the uploaded dataset name. The JSONL
dataset defines each question and answer on the row; a base model requires a
destination, while an existing repository publishes back to itself:

```jsonl
{"state":"Duplicate charge","questions":{"route":{"instructions":"Route?","type":"choice","criteria":{"support":"Support","payments":"Payments"},"answer":{"support":0.1,"payments":0.9}},"severity":{"instructions":"Severity?","type":"score","criteria":["low","high"],"answer":1}}}
```

Keyed criteria use string hard labels or probability objects with exactly the
same keys. Positional criteria use zero-based integer labels or probability
arrays of the same length. Soft-label probabilities must sum to 1.
Rows do not contain split labels. Use `validationFile` and `evalOnlyDataset`
for separate uploaded validation and held-out files; omitted partitions are
selected deterministically from the training file.

```typescript
const job = await modaic.fineTunes.create({
  model: "mo-1.3.1",
  destination: "acme/support-priority",
  trainingFile: "support-hard-labels",
  trainingType: "lora",
  loraR: 8,
  loraAlpha: 16,
});
const finished = await modaic.fineTunes.wait(job.id);
```

Once `finished.status === "done"`, call `acme/support-priority` normally. Pin an
immutable published checkpoint with `acme/support-priority@<full-commit-sha>`.
Fine-tuning supports `mo-1.3.1` (head-only or LoRA) and `mo-2.0` (LoRA only). For `mo-2.0`, use rank 16, alpha 32, and dropout 0 with Noul, Choice, or Score inputs up to 32,768 tokens.

## Model-bound resources

Models returned by `models.create`, `models.get`, and `models.update` can run
predictions directly:

```typescript
const model = await modaic.models.get("acme", "support-priority");
const result = await model.predictions.create({
  state: { ticket: "Please refund my duplicate charge." },
});
const examples = await model.examples.list({ pageSize: 10 });
const batches = await model.jobs.batchPredictions.list();
const optimizations = await model.jobs.instructionOptimizations.list();
```

`models.get` includes `configuration` with the model and questions saved on
the default branch (absent until the model has a manifest), so you can diff
before updating. `models.update` with questions that already match is a
no-op: it resolves with `unchanged: true`, a `commit` whose `commitSha`
equals `previousSha`, and the stored configuration. Nothing is committed and
the checkpoint is not reset.

Instruction optimization writes its optimized instructions into the same `questions`, so a
setup script that re-pushes the schema as authored would revert an optimized
model. Once a model has a checkpoint, `models.update` with questions that
differ from the stored ones rejects with `409 alignment_would_be_discarded`.
Omit `questions` to keep the optimized instructions, or pass
`discardAlignment: true` to replace them and reset the checkpoint to 0.

`VERSION` is the SDK version, for logging alongside results. `models.get`
also returns `commit`, the head of the default branch. Pass
`commit.commitSha` back as `expectedHeadSha` on `models.update` and a stale
client rejects with `409 expected_head_mismatch` instead of overwriting
newer commits.

### Branches, tags, and rollback

Every model is a Git repository, and `models` exposes its history:

```typescript
const model = await modaic.models.get("acme", "support-priority");

// Name the optimized commit so production can pin to it.
await modaic.models.createTag(model.id, { name: "v1", commitSha: model.commit!.commitSha });
await modaic.predictions.create({ model: "acme/support-priority", revision: "v1", state: { /* ... */ } });

// Undo a bad update: move main back to the optimized commit.
const { commits } = await modaic.models.listCommits(model.id, { branch: "main" });
await modaic.models.rollback(model.id, {
  branch: "main",
  targetCommitSha: commits[1]!.sha,
  expectedHeadSha: commits[0]!.sha,
});
```

Rollback commits the target's files back onto the branch, so `model.json`
returns with its checkpoint and metrics intact. `listBranches`,
`createBranch({ name, sourceRef })`, `deleteBranch`, `listTags`, and
`deleteTag` round out the surface.

The bound method accepts every prediction option except `model` and uses the same
client. Pass `revision` to pin a version. `JSON.stringify(model)` contains only
response data. The top-level `modaic.predictions.create` remains available.

`model.examples` exposes `ingest`, `list`, `get`, `annotate`, and `listPredictions`
without a model ID argument. `model.jobs.instructionOptimizations` and
`model.jobs.batchPredictions` expose model-bound `create` and `list`. Use the
top-level job resources to retrieve, wait for, or cancel a job by its ID.

## Job progress

Pass `progress: true` to either job resource's `wait()` method:

```typescript
const finishedBatch = await modaic.batchPredictions.wait(job.id, { progress: true });
const finishedOptimization = await modaic.instructionOptimizations.wait(optimization.id, { progress: true });
```

Progress is off by default. When enabled, the SDK renders a bar on stderr in a
terminal or prints changed snapshots when output is redirected. Browsers without
stderr stay silent. Batch jobs show processed examples and failures; instruction optimization
shows its stage and metric-call budget usage, not overall completion percentage.
Updates use the existing polling interval. Timing out stops waiting without
cancelling the job. No additional package is needed.

## Resources

| Resource | Methods |
| --- | --- |
| `predictions` | `create` |
| `models` | `list`, `create`, `get`, `update`, `delete` |
| `examples` | `ingest`, `list`, `get`, `annotate`, `listPredictions` |
| `batchPredictions` | `create`, `list`, `get`, `cancel`, `wait` |
| `instructionOptimizations` | `create`, `list`, `get`, `logs`, `cancel`, `wait` |
| `fineTunes` | `create`, `list`, `get`, `logs`, `pause`, `resume`, `listCheckpoints`, `deleteCheckpoint`, `cancel`, `wait` |
| `uploads` | `create`, `get`, `preparePart`, `confirmPart`, `uploadPart`, `complete`, `cancel` |
| `datasets` | `list`, `get`, `update`, `download`, `delete` |

Every method returns a Promise. SDK properties use `camelCase`, including the
few prediction response fields that use `snake_case` on the wire.

## Errors

Non-2xx responses throw `ModaicAPIError`, which exposes `status`, `code`,
`requestId`, `details`, and the decoded response `body`. Network failures throw
`ModaicConnectionError`; request and polling deadlines throw
`ModaicTimeoutError`.

See the complete API documentation at <https://docs.modaic.dev>.

## Nullable questions and inferred answers

Questions infer the answer fields automatically, including Choice literal keys;
Zod or another response schema is optional. The same inference works for
model-bound predictions.

```typescript
import { Modaic, Choice, Noul } from "modaic";

const result = await new Modaic().predictions.create({
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
result.answers.country; // ChoiceAnswer with choice "fr" | "us", or null.
result.answers.relevant.noul; // number, without union narrowing.
```

Noul, Choice, Score, Text, Span, and Datetime support `.nullable(threshold = 0.5)`.
`new Nullable(question, threshold)` also wraps constructor instances or plain
question objects. Thresholds must be finite numbers in [0, 1]. A helper Noul
checks whether the supplied state is sufficient to answer the full question.
Both questions run in one HTTP request; below the threshold the entire answer
becomes `null`, and equality accepts it. Helper answers are removed before an
optional response schema parses the result, so use `.nullable()` in Zod for
those answer fields. Missing or malformed helper answers throw
`ModaicConnectionError`; explicit helper-ID collisions fail before HTTP.

Nullable wrappers are request-local to `predictions.create`, not saved-model
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
const result = await client.predictions.create({
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
## Mo 2.0 extraction and boxes

Select `mo-2.0` explicitly. `Span` extracts an exact
substring from a string state; `Box` (`type: "box"`) localizes an image region.
Both require nonempty string instructions and reject criteria.
Span answers expose `.span`, up to ten confidence-ordered disjoint candidates
in `.spans`, and top-level `.confidence`; each candidate has `text`, `start`,
`end`, and `confidence`, and `.span` is always `.spans[0]`. Offsets count UTF-16
code units and end is exclusive. Box answers contain
`box: {top, bottom, left, right}` normalized to [0, 1], and confidence.
Pass inline `assets` to predictions.create, mapping an asset ID to
`{type: "image", format: "png", dataBase64: "..."}`. Reference IDs in
state, instructions or supported criteria; no separate upload is required.
`mo-latest` selects `mo-2.0`.

The API and SDK use the same `type: "span"` contract.

### Number answers

Number answers expose `.number`, `.confidence`, and `.variance`, matching the
API. Confidence is separate from variance.

## Instruction optimization datasets

Upload a dataset in the same JSONL format as fine-tuning, then start a run:

```typescript
const upload = await modaic.uploads.uploadFile("train.jsonl", {
  workspace: "acme", kind: "dataset", name: "triage-labels",
});
if (upload.status !== "completed" || !upload.result) throw new Error(upload.error?.message);
const job = await modaic.instructionOptimizations.create({
  model: "mo-latest",
  destination: "acme/support-priority",
  trainingFile: upload.result.name,
  idempotencyKey: "support-optimize-v1",
});
const finished = await modaic.instructionOptimizations.wait(job.id);
```

For an existing saved model, use its path as `model` and omit `destination`,
or use `model.jobs.instructionOptimizations.create({ trainingFile, idempotencyKey })`.
Optional `validationFile` and `evalOnlyDataset` replace the validation and
held-out evaluation partitions. Branch defaults to main and the API resolves
its head unless `sourceCommitSha` is supplied. Every row shares one question
set with nonempty text instructions and hard labels (Noul 0/1, keyed Choice
option, ordered Score index). All three partitions must be nonempty with
disjoint inputs/groups; files total at most 64 MiB. Stored model examples are
not consumed and completion does not start batch predictions.


Dataset deletion is permanent. It is blocked while queued, running, or paused
jobs use the dataset. The delete call returns a deletion request; wait until its
status is `completed` before treating cleanup as finished. New API downloads are
revoked immediately; existing upload grants drain before physical cleanup.


Synchronous inference uses Zero Data Retention by default for direct base-model
and custom-model calls on every workspace. Capture defaults off; explicitly
enable capture on a custom-model request to save its example and prediction.
Default ZDR calls do not save responses for idempotent replay, so retries are
new, potentially billable calls. Saved instructions in a custom model, saved adapters, uploaded
datasets, explicit captures/annotations, batch jobs, and training/optimization
are outside ZDR. Uploaded datasets remain until you explicitly delete them.

## Training controls and checkpoints

Use `client.fineTunes.pause(jobId)` to request a fresh checkpoint and release compute. Poll `get(jobId)` until `status === "paused"` before calling `resume(jobId)`. Use `listCheckpoints(jobId)` and `deleteCheckpoint(jobId, checkpointId)` to manage retained checkpoints.

Individual checkpoint deletion requires a paused or finished job. Deleting the pause checkpoint prevents resuming. Cancelling an active or paused job deletes its optimizer checkpoints; cancelling a completed job leaves its checkpoints unchanged. Retained checkpoints count toward workspace storage.
