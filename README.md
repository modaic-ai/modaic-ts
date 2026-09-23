# Modaic TypeScript SDK

The official, HTTP-only TypeScript client for the public Modaic API. It uses
the platform `fetch` implementation, has no runtime dependencies, and never
invokes Git or reads or writes repository files.

## Question objects

Use `new Noul({ instructions: "Is this about billing?" })`,
`new Choice({ criteria: { billing: "Payments", other: "Other requests" } })`,
or `new Score({ criteria: ["Routine", "Urgent"] })` to define questions.
Import these constructors from `modaic` and pass them in the `questions` map
to `decisions.create`, `models.create`, or `models.update`. Plain question
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

## Quickstart

```typescript
import { Modaic } from "modaic";

const modaic = new Modaic();

const result = await modaic.decisions.create({
  state: {
    ticket: "I was charged twice for order 4832. Please refund one charge.",
  },
  model: "typesafe/jev-latest",
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

The API URL defaults to `https://modaic.dev/api/v1`. Set `MODAIC_API_URL` to
override it, or pass `baseUrl` to the client. The client option takes precedence
over the environment variable. In browsers, pass `baseUrl` explicitly.

For a local server, pass the versioned API URL explicitly:

```typescript
const modaic = new Modaic({
  apiKey: "mdc_...",
  baseUrl: "http://localhost:3001/v1",
});
```

## Model-bound resources

Models returned by `models.create`, `models.get`, and `models.update` can run
decisions directly:

```typescript
const model = await modaic.models.get("acme", "support-priority");
const result = await model.decisions.create({
  state: { ticket: "Please refund my duplicate charge." },
});
const examples = await model.examples.list({ pageSize: 10 });
const batches = await model.jobs.batchDecisions.list();
const alignments = await model.jobs.alignments.list();
```

The bound method accepts every decision option except `model` and uses the same
client. Pass `revision` to pin a version. `JSON.stringify(model)` contains only
response data. The top-level `modaic.decisions.create` remains available.

`model.examples` exposes `ingest`, `list`, `get`, `annotate`, and `listDecisions`
without a model ID argument. `model.jobs.alignments` and
`model.jobs.batchDecisions` expose model-bound `create` and `list`. Use the
top-level job resources to retrieve, wait for, or cancel a job by its ID.

## Job progress

Pass `progress: true` to either job resource's `wait()` method:

```typescript
const finishedBatch = await modaic.batchDecisions.wait(job.id, { progress: true });
const finishedAlignment = await modaic.alignments.wait(alignment.id, { progress: true });
```

Progress is off by default. When enabled, the SDK renders a bar on stderr in a
terminal or prints changed snapshots when output is redirected. Browsers without
stderr stay silent. Batch jobs show processed examples and failures; alignment
shows its stage and metric-call budget usage, not overall completion percentage.
Updates use the existing polling interval. Timing out stops waiting without
cancelling the job. No additional package is needed.

## Resources

| Resource | Methods |
| --- | --- |
| `decisions` | `create` |
| `models` | `list`, `create`, `get`, `update`, `delete` |
| `examples` | `ingest`, `list`, `get`, `annotate`, `listDecisions` |
| `batchDecisions` | `create`, `list`, `get`, `cancel`, `wait` |
| `alignments` | `create`, `list`, `get`, `logs`, `cancel`, `wait` |

Every method returns a Promise. SDK properties use `camelCase`, including the
few decision response fields that use `snake_case` on the wire.

## Errors

Non-2xx responses throw `ModaicAPIError`, which exposes `status`, `code`,
`requestId`, `details`, and the decoded response `body`. Network failures throw
`ModaicConnectionError`; request and polling deadlines throw
`ModaicTimeoutError`.

See the complete API documentation at <https://docs.modaic.dev>.
