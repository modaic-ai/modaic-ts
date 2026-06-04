# @modaic/modaic-ts

TypeScript client for [Modaic](https://modaic.dev) Arbiters (LLM judges).

`Arbiter` is a thin wrapper over the Modaic REST API and git — it never runs an
LLM locally. `predict()` calls the API; `create()` / `update()` write the judge's
`config.json` (signature schema) and `program.json` (stored prompt) and push them
to Modaic Hub via git. These files are produced the same way as the Python SDK so
the two interoperate.

## Quickstart

```ts
import { Arbiter, Signature, Enum } from "@modaic/modaic-ts";
import { z } from "zod";

const signature = new Signature({
  instructions: "Decide whether the answer correctly addresses the question.",
  input: z.object({
    question: z.string().describe("The user's question"),
    answer: z.string().describe("The answer to judge"),
  }),
  output: z.object({
    // Arbiter outputs must be discrete — use Enum (or a Zod enum), not a plain string.
    verdict: Enum("correct", "incorrect").describe("Whether the answer is correct"),
  }),
});

// Create + push a new judge (private by default). Uses MODAIC_TOKEN.
const arbiter = await Arbiter.create({
  repo: "modaic/quality-judge",
  signature,
  model: "together_ai/openai/gpt-oss-120b",
});

// Run it (the server runs the LLM).
const result = await arbiter.predict({ question: "...", answer: "..." });
console.log(result.output, result.reasoning);

// Update later (optional new signature / metadata / extra files).
await arbiter.update({ signature, model: "together_ai/openai/gpt-oss-120b" });

// Open an existing judge at a specific revision.
const existing = new Arbiter("modaic/quality-judge", { rev: "v1" });
```

## Configuration

| Env var          | Default                   | Purpose                              |
| ---------------- | ------------------------- | ------------------------------------ |
| `MODAIC_TOKEN`   | —                         | Access token (or pass `access_token`)|
| `MODAIC_API_URL` | `https://api.modaic.dev`  | Modaic REST API base URL             |
| `MODAIC_GIT_URL` | `https://git.modaic.dev`  | Modaic git host                      |
| `MODAIC_CACHE`   | `~/.cache/modaic`         | Staging dir for git working trees    |

## Develop

```bash
bun install
bun test
bun run build
```

> Note: `serializeSignatureToConfig` (signature → `config.json`) is provided
> separately and currently throws. `create()`/`update()` with a signature will
> not push until that lands; `predict()` and `program.json` generation work today.

<!-- Start Summary [summary] -->
## Summary

Modaic API: A FastAPI application for Modaic
<!-- End Summary [summary] -->

<!-- Start Table of Contents [toc] -->
## Table of Contents
<!-- $toc-max-depth=2 -->
* [@modaic/modaic-ts](#modaicmodaic-ts)
  * [Quickstart](#quickstart)
  * [Configuration](#configuration)
  * [Develop](#develop)
  * [SDK Installation](#sdk-installation)
  * [Requirements](#requirements)
  * [SDK Example Usage](#sdk-example-usage)
  * [Authentication](#authentication)
  * [Available Resources and Operations](#available-resources-and-operations)
  * [Standalone functions](#standalone-functions)
  * [Retries](#retries)
  * [Error Handling](#error-handling)
  * [Server Selection](#server-selection)
  * [Custom HTTP Client](#custom-http-client)
  * [Debugging](#debugging)

<!-- End Table of Contents [toc] -->

<!-- Start SDK Installation [installation] -->
## SDK Installation

> [!TIP]
> To finish publishing your SDK to npm and others you must [run your first generation action](https://www.speakeasy.com/docs/github-setup#step-by-step-guide).


The SDK can be installed with either [npm](https://www.npmjs.com/), [pnpm](https://pnpm.io/), [bun](https://bun.sh/) or [yarn](https://classic.yarnpkg.com/en/) package managers.

### NPM

```bash
npm add https://github.com/modaic-ai/modaic-ts
```

### PNPM

```bash
pnpm add https://github.com/modaic-ai/modaic-ts
```

### Bun

```bash
bun add https://github.com/modaic-ai/modaic-ts
```

### Yarn

```bash
yarn add https://github.com/modaic-ai/modaic-ts
```

> [!NOTE]
> This package is published as an ES Module (ESM) only. For applications using
> CommonJS, use `await import()` to import and use this package.
<!-- End SDK Installation [installation] -->

<!-- Start Requirements [requirements] -->
## Requirements

For supported JavaScript runtimes, please consult [RUNTIMES.md](RUNTIMES.md).
<!-- End Requirements [requirements] -->

<!-- Start SDK Example Usage [usage] -->
## SDK Example Usage

### Example

```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.chat.createCompletion();

  console.log(result);
}

run();

```
<!-- End SDK Example Usage [usage] -->

<!-- Start Authentication [security] -->
## Authentication

### Per-Client Security Schemes

This SDK supports the following security scheme globally:

| Name    | Type | Scheme      | Environment Variable |
| ------- | ---- | ----------- | -------------------- |
| `token` | http | HTTP Bearer | `MODAIC_TOKEN`       |

To authenticate with the API the `token` parameter must be set when initializing the SDK client instance. For example:
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.chat.createCompletion();

  console.log(result);
}

run();

```
<!-- End Authentication [security] -->

<!-- Start Available Resources and Operations [operations] -->
## Available Resources and Operations

<details open>
<summary>Available methods</summary>

### [Arbiters](docs/sdks/arbiters/README.md)

* [get](docs/sdks/arbiters/README.md#get) - Get Arbiter
* [getSchema](docs/sdks/arbiters/README.md#getschema) - Get Arbiter Schema Output
* [createChatCompletion](docs/sdks/arbiters/README.md#createchatcompletion) - Create Chat Completion
* [getSupportedModels](docs/sdks/arbiters/README.md#getsupportedmodels) - Get Supported Models
* [init](docs/sdks/arbiters/README.md#init) - Init Arbiter
* [updateMetadata](docs/sdks/arbiters/README.md#updatemetadata) - Update Arbiter Metadata

### [Chat](docs/sdks/chat/README.md)

* [createCompletion](docs/sdks/chat/README.md#createcompletion) - Create Chat Completion

### [Examples](docs/sdks/examples/README.md)

* [ingest](docs/sdks/examples/README.md#ingest) - Ingest Examples
* [list](docs/sdks/examples/README.md#list) - List Examples
* [delete](docs/sdks/examples/README.md#delete) - Delete Examples
* [export](docs/sdks/examples/README.md#export) - Export Examples
* [downloadExport](docs/sdks/examples/README.md#downloadexport) - Download Export
* [getDistinctHashes](docs/sdks/examples/README.md#getdistincthashes) - Get Distinct Hashes
* [hasUncalibrated](docs/sdks/examples/README.md#hasuncalibrated) - Has Uncalibrated Predictions
* [getGradedCount](docs/sdks/examples/README.md#getgradedcount) - Get Graded Count
* [patchAnnotation](docs/sdks/examples/README.md#patchannotation) - Patch Example
* [get](docs/sdks/examples/README.md#get) - Get Example By Id

### [Jobs](docs/sdks/jobs/README.md)

* [startConfidenceScore](docs/sdks/jobs/README.md#startconfidencescore) - Start Confidence Score Job
* [getConfidenceScoreStatus](docs/sdks/jobs/README.md#getconfidencescorestatus) - Get Confidence Score Job Status
* [cancelConfidenceScore](docs/sdks/jobs/README.md#cancelconfidencescore) - Cancel Confidence Score Job
* [startOptimization](docs/sdks/jobs/README.md#startoptimization) - Start Optimization Job
* [cancelOptimization](docs/sdks/jobs/README.md#canceloptimization) - Cancel Optimization Job
* [getOptimizationStatus](docs/sdks/jobs/README.md#getoptimizationstatus) - Get Optimization Job Status
* [getOptimizationLogs](docs/sdks/jobs/README.md#getoptimizationlogs) - Get Optimization Job Logs
* [startBatchPredictions](docs/sdks/jobs/README.md#startbatchpredictions) - Start Batch Predictions Job
* [getBatchPredictionStatus](docs/sdks/jobs/README.md#getbatchpredictionstatus) - Get Batch Predictions Job Status
* [cancelBatchPrediction](docs/sdks/jobs/README.md#cancelbatchprediction) - Cancel Batch Predictions Job
* [streamBatchEvents](docs/sdks/jobs/README.md#streambatchevents) - Stream Batch Predictions Events
* [streamBatchResults](docs/sdks/jobs/README.md#streambatchresults) - Stream Batch Predictions Results

### [Predictions](docs/sdks/predictions/README.md)

* [createV1](docs/sdks/predictions/README.md#createv1) - Create Prediction
* [getConfidence](docs/sdks/predictions/README.md#getconfidence) - Get Prediction Confidence
* [enqueueConfidence](docs/sdks/predictions/README.md#enqueueconfidence) - Enqueue Prediction Confidence
* [getConfidenceStatus](docs/sdks/predictions/README.md#getconfidencestatus) - Get Prediction Confidence Status
* [streamConfidence](docs/sdks/predictions/README.md#streamconfidence) - Stream Prediction Confidence
* [dispatch](docs/sdks/predictions/README.md#dispatch) - Dispatch Prediction
* [create](docs/sdks/predictions/README.md#create) - Create Prediction

</details>
<!-- End Available Resources and Operations [operations] -->

<!-- Start Standalone functions [standalone-funcs] -->
## Standalone functions

All the methods listed above are available as standalone functions. These
functions are ideal for use in applications running in the browser, serverless
runtimes or other environments where application bundle size is a primary
concern. When using a bundler to build your application, all unused
functionality will be either excluded from the final bundle or tree-shaken away.

To read more about standalone functions, check [FUNCTIONS.md](./FUNCTIONS.md).

<details>

<summary>Available standalone functions</summary>

- [`arbitersCreateChatCompletion`](docs/sdks/arbiters/README.md#createchatcompletion) - Create Chat Completion
- [`arbitersGet`](docs/sdks/arbiters/README.md#get) - Get Arbiter
- [`arbitersGetSchema`](docs/sdks/arbiters/README.md#getschema) - Get Arbiter Schema Output
- [`arbitersGetSupportedModels`](docs/sdks/arbiters/README.md#getsupportedmodels) - Get Supported Models
- [`arbitersInit`](docs/sdks/arbiters/README.md#init) - Init Arbiter
- [`arbitersUpdateMetadata`](docs/sdks/arbiters/README.md#updatemetadata) - Update Arbiter Metadata
- [`chatCreateCompletion`](docs/sdks/chat/README.md#createcompletion) - Create Chat Completion
- [`examplesDelete`](docs/sdks/examples/README.md#delete) - Delete Examples
- [`examplesDownloadExport`](docs/sdks/examples/README.md#downloadexport) - Download Export
- [`examplesExport`](docs/sdks/examples/README.md#export) - Export Examples
- [`examplesGet`](docs/sdks/examples/README.md#get) - Get Example By Id
- [`examplesGetDistinctHashes`](docs/sdks/examples/README.md#getdistincthashes) - Get Distinct Hashes
- [`examplesGetGradedCount`](docs/sdks/examples/README.md#getgradedcount) - Get Graded Count
- [`examplesHasUncalibrated`](docs/sdks/examples/README.md#hasuncalibrated) - Has Uncalibrated Predictions
- [`examplesIngest`](docs/sdks/examples/README.md#ingest) - Ingest Examples
- [`examplesList`](docs/sdks/examples/README.md#list) - List Examples
- [`examplesPatchAnnotation`](docs/sdks/examples/README.md#patchannotation) - Patch Example
- [`jobsCancelBatchPrediction`](docs/sdks/jobs/README.md#cancelbatchprediction) - Cancel Batch Predictions Job
- [`jobsCancelConfidenceScore`](docs/sdks/jobs/README.md#cancelconfidencescore) - Cancel Confidence Score Job
- [`jobsCancelOptimization`](docs/sdks/jobs/README.md#canceloptimization) - Cancel Optimization Job
- [`jobsGetBatchPredictionStatus`](docs/sdks/jobs/README.md#getbatchpredictionstatus) - Get Batch Predictions Job Status
- [`jobsGetConfidenceScoreStatus`](docs/sdks/jobs/README.md#getconfidencescorestatus) - Get Confidence Score Job Status
- [`jobsGetOptimizationLogs`](docs/sdks/jobs/README.md#getoptimizationlogs) - Get Optimization Job Logs
- [`jobsGetOptimizationStatus`](docs/sdks/jobs/README.md#getoptimizationstatus) - Get Optimization Job Status
- [`jobsStartBatchPredictions`](docs/sdks/jobs/README.md#startbatchpredictions) - Start Batch Predictions Job
- [`jobsStartConfidenceScore`](docs/sdks/jobs/README.md#startconfidencescore) - Start Confidence Score Job
- [`jobsStartOptimization`](docs/sdks/jobs/README.md#startoptimization) - Start Optimization Job
- [`jobsStreamBatchEvents`](docs/sdks/jobs/README.md#streambatchevents) - Stream Batch Predictions Events
- [`jobsStreamBatchResults`](docs/sdks/jobs/README.md#streambatchresults) - Stream Batch Predictions Results
- [`predictionsCreate`](docs/sdks/predictions/README.md#create) - Create Prediction
- [`predictionsCreateV1`](docs/sdks/predictions/README.md#createv1) - Create Prediction
- [`predictionsDispatch`](docs/sdks/predictions/README.md#dispatch) - Dispatch Prediction
- [`predictionsEnqueueConfidence`](docs/sdks/predictions/README.md#enqueueconfidence) - Enqueue Prediction Confidence
- [`predictionsGetConfidence`](docs/sdks/predictions/README.md#getconfidence) - Get Prediction Confidence
- [`predictionsGetConfidenceStatus`](docs/sdks/predictions/README.md#getconfidencestatus) - Get Prediction Confidence Status
- [`predictionsStreamConfidence`](docs/sdks/predictions/README.md#streamconfidence) - Stream Prediction Confidence

</details>
<!-- End Standalone functions [standalone-funcs] -->

<!-- Start Retries [retries] -->
## Retries

Some of the endpoints in this SDK support retries.  If you use the SDK without any configuration, it will fall back to the default retry strategy provided by the API.  However, the default retry strategy can be overridden on a per-operation basis, or across the entire SDK.

To change the default retry strategy for a single API call, simply provide a retryConfig object to the call:
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.chat.createCompletion({
    retries: {
      strategy: "backoff",
      backoff: {
        initialInterval: 1,
        maxInterval: 50,
        exponent: 1.1,
        maxElapsedTime: 100,
      },
      retryConnectionErrors: false,
    },
  });

  console.log(result);
}

run();

```

If you'd like to override the default retry strategy for all operations that support retries, you can provide a retryConfig at SDK initialization:
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  retryConfig: {
    strategy: "backoff",
    backoff: {
      initialInterval: 1,
      maxInterval: 50,
      exponent: 1.1,
      maxElapsedTime: 100,
    },
    retryConnectionErrors: false,
  },
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.chat.createCompletion();

  console.log(result);
}

run();

```
<!-- End Retries [retries] -->

<!-- Start Error Handling [errors] -->
## Error Handling

[`ModaicClientError`](./src/models/errors/modaic-client-error.ts) is the base class for all HTTP error responses. It has the following properties:

| Property            | Type       | Description                                                                             |
| ------------------- | ---------- | --------------------------------------------------------------------------------------- |
| `error.message`     | `string`   | Error message                                                                           |
| `error.statusCode`  | `number`   | HTTP response status code eg `404`                                                      |
| `error.headers`     | `Headers`  | HTTP response headers                                                                   |
| `error.body`        | `string`   | HTTP body. Can be empty string if no body is returned.                                  |
| `error.rawResponse` | `Response` | Raw HTTP response                                                                       |
| `error.data$`       |            | Optional. Some errors may contain structured data. [See Error Classes](#error-classes). |

### Example
```typescript
import { ModaicClient } from "modaic";
import * as errors from "modaic/models/errors";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  try {
    const result = await modaicClient.chat.createCompletion();

    console.log(result);
  } catch (error) {
    // The base class for HTTP error responses
    if (error instanceof errors.ModaicClientError) {
      console.log(error.message);
      console.log(error.statusCode);
      console.log(error.body);
      console.log(error.headers);

      // Depending on the method different errors may be thrown
      if (error instanceof errors.HTTPValidationError) {
        console.log(error.data$.detail); // ValidationError[]
      }
    }
  }
}

run();

```

### Error Classes
**Primary errors:**
* [`ModaicClientError`](./src/models/errors/modaic-client-error.ts): The base class for HTTP error responses.
  * [`HTTPValidationError`](./src/models/errors/http-validation-error.ts): Validation Error. Status code `422`. *

<details><summary>Less common errors (6)</summary>

<br />

**Network errors:**
* [`ConnectionError`](./src/models/errors/http-client-errors.ts): HTTP client was unable to make a request to a server.
* [`RequestTimeoutError`](./src/models/errors/http-client-errors.ts): HTTP request timed out due to an AbortSignal signal.
* [`RequestAbortedError`](./src/models/errors/http-client-errors.ts): HTTP request was aborted by the client.
* [`InvalidRequestError`](./src/models/errors/http-client-errors.ts): Any input used to create a request is invalid.
* [`UnexpectedClientError`](./src/models/errors/http-client-errors.ts): Unrecognised or unexpected error.


**Inherit from [`ModaicClientError`](./src/models/errors/modaic-client-error.ts)**:
* [`ResponseValidationError`](./src/models/errors/response-validation-error.ts): Type mismatch between the data returned from the server and the structure expected by the SDK. See `error.rawValue` for the raw value and `error.pretty()` for a nicely formatted multi-line string.

</details>

\* Check [the method documentation](#available-resources-and-operations) to see if the error is applicable.
<!-- End Error Handling [errors] -->

<!-- Start Server Selection [server] -->
## Server Selection

### Override Server URL Per-Client

The default server can be overridden globally by passing a URL to the `serverURL: string` optional parameter when initializing the SDK client instance. For example:
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  serverURL: "https://api.modaic.dev",
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.chat.createCompletion();

  console.log(result);
}

run();

```
<!-- End Server Selection [server] -->

<!-- Start Custom HTTP Client [http-client] -->
## Custom HTTP Client

The TypeScript SDK makes API calls using an `HTTPClient` that wraps the native
[Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API). This
client is a thin wrapper around `fetch` and provides the ability to attach hooks
around the request lifecycle that can be used to modify the request or handle
errors and response.

The `HTTPClient` constructor takes an optional `fetcher` argument that can be
used to integrate a third-party HTTP client or when writing tests to mock out
the HTTP client and feed in fixtures.

The following example shows how to:
- route requests through a proxy server using [undici](https://www.npmjs.com/package/undici)'s ProxyAgent
- use the `"beforeRequest"` hook to add a custom header and a timeout to requests
- use the `"requestError"` hook to log errors

```typescript
import { ModaicClient } from "modaic";
import { ProxyAgent } from "undici";
import { HTTPClient } from "modaic/lib/http";

const dispatcher = new ProxyAgent("http://proxy.example.com:8080");

const httpClient = new HTTPClient({
  // 'fetcher' takes a function that has the same signature as native 'fetch'.
  fetcher: (input, init) =>
    // 'dispatcher' is specific to undici and not part of the standard Fetch API.
    fetch(input, { ...init, dispatcher } as RequestInit),
});

httpClient.addHook("beforeRequest", (request) => {
  const nextRequest = new Request(request, {
    signal: request.signal || AbortSignal.timeout(5000)
  });

  nextRequest.headers.set("x-custom-header", "custom value");

  return nextRequest;
});

httpClient.addHook("requestError", (error, request) => {
  console.group("Request Error");
  console.log("Reason:", `${error}`);
  console.log("Endpoint:", `${request.method} ${request.url}`);
  console.groupEnd();
});

const sdk = new ModaicClient({ httpClient: httpClient });
```
<!-- End Custom HTTP Client [http-client] -->

<!-- Start Debugging [debug] -->
## Debugging

You can setup your SDK to emit debug logs for SDK requests and responses.

You can pass a logger that matches `console`'s interface as an SDK option.

> [!WARNING]
> Beware that debug logging will reveal secrets, like API tokens in headers, in log messages printed to a console or files. It's recommended to use this feature only during local development and not in production.

```typescript
import { ModaicClient } from "modaic";

const sdk = new ModaicClient({ debugLogger: console });
```

You can also enable a default debug logger by setting an environment variable `MODAIC_DEBUG` to true.
<!-- End Debugging [debug] -->

<!-- Placeholder for Future Speakeasy SDK Sections -->
