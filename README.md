# @modaic/modaic-ts

TypeScript client for [Modaic](https://modaic.dev) Arbiters (LLM judges).

`Arbiter` is a thin wrapper over the Modaic REST API and git — it never runs an
LLM locally. `predict()` calls the API; `create()` / `update()` write the judge's
`config.json` (signature schema) and `program.json` (stored prompt) and push them
to Modaic Hub via git. These files are produced the same way as the Python SDK so
the two interoperate.

## Quickstart

```ts
import { Arbiter, Signature } from "@modaic/modaic-ts";
import { z } from "zod";

const signature = new Signature({
  instructions: "Decide whether the answer correctly addresses the question.",
  input: z.object({
    question: z.string().describe("The user's question"),
    answer: z.string().describe("The answer to judge"),
  }),
  output: z.object({
    verdict: z.string().describe("correct | incorrect"),
  }),
});

// Create + push a new judge (private by default). Uses MODAIC_TOKEN.
const arbiter = await Arbiter.create({
  repo: "modaic/quality-judge",
  signature,
  commit_message: "initial judge",
});

// Run it (the server runs the LLM).
const result = await arbiter.predict({ question: "...", answer: "..." });
console.log(result.output, result.reasoning);

// Update later (optional new signature / metadata / extra files).
await arbiter.update({ signature, commit_message: "tweak prompt" });

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
  const result = await modaicClient
    .createChatCompletionApiV1ChatCompletionsPost();

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
  const result = await modaicClient
    .createChatCompletionApiV1ChatCompletionsPost();

  console.log(result);
}

run();

```
<!-- End Authentication [security] -->

<!-- Start Available Resources and Operations [operations] -->
## Available Resources and Operations

<details open>
<summary>Available methods</summary>

### [ModaicClient SDK](docs/sdks/modaicclient/README.md)

* [createChatCompletionApiV1ChatCompletionsPost](docs/sdks/modaicclient/README.md#createchatcompletionapiv1chatcompletionspost) - Create Chat Completion
* [startConfidenceScoreJobApiV1JobsConfidenceScoresPost](docs/sdks/modaicclient/README.md#startconfidencescorejobapiv1jobsconfidencescorespost) - Start Confidence Score Job
* [getConfidenceScoreJobStatusApiV1JobsConfidenceScoresJobIdGet](docs/sdks/modaicclient/README.md#getconfidencescorejobstatusapiv1jobsconfidencescoresjobidget) - Get Confidence Score Job Status
* [cancelConfidenceScoreJobApiV1JobsConfidenceScoresJobIdDelete](docs/sdks/modaicclient/README.md#cancelconfidencescorejobapiv1jobsconfidencescoresjobiddelete) - Cancel Confidence Score Job
* [startOptimizationJobApiV1JobsGepaPost](docs/sdks/modaicclient/README.md#startoptimizationjobapiv1jobsgepapost) - Start Optimization Job
* [cancelOptimizationJobApiV1JobsGepaJobIdDelete](docs/sdks/modaicclient/README.md#canceloptimizationjobapiv1jobsgepajobiddelete) - Cancel Optimization Job
* [getOptimizationJobStatusApiV1JobsGepaJobIdGet](docs/sdks/modaicclient/README.md#getoptimizationjobstatusapiv1jobsgepajobidget) - Get Optimization Job Status
* [getOptimizationJobLogsApiV1JobsGepaJobIdLogsGet](docs/sdks/modaicclient/README.md#getoptimizationjoblogsapiv1jobsgepajobidlogsget) - Get Optimization Job Logs
* [startBatchPredictionsJobApiV1JobsBatchPredictionsPost](docs/sdks/modaicclient/README.md#startbatchpredictionsjobapiv1jobsbatchpredictionspost) - Start Batch Predictions Job
* [getBatchPredictionsJobStatusApiV1JobsBatchPredictionsJobIdGet](docs/sdks/modaicclient/README.md#getbatchpredictionsjobstatusapiv1jobsbatchpredictionsjobidget) - Get Batch Predictions Job Status
* [cancelBatchPredictionsJobApiV1JobsBatchPredictionsJobIdDelete](docs/sdks/modaicclient/README.md#cancelbatchpredictionsjobapiv1jobsbatchpredictionsjobiddelete) - Cancel Batch Predictions Job
* [streamBatchPredictionsEventsApiV1JobsBatchPredictionsJobIdEventsGet](docs/sdks/modaicclient/README.md#streambatchpredictionseventsapiv1jobsbatchpredictionsjobideventsget) - Stream Batch Predictions Events
* [streamBatchPredictionsResultsApiV1JobsBatchPredictionsJobIdResultsGet](docs/sdks/modaicclient/README.md#streambatchpredictionsresultsapiv1jobsbatchpredictionsjobidresultsget) - Stream Batch Predictions Results
* [getArbiterApiV1ArbitersGet](docs/sdks/modaicclient/README.md#getarbiterapiv1arbitersget) - Get Arbiter
* [getArbiterSchemaOutputApiV1ArbitersSchemaGet](docs/sdks/modaicclient/README.md#getarbiterschemaoutputapiv1arbitersschemaget) - Get Arbiter Schema Output
* [createPredictionApiV1ArbitersPredictionsPost](docs/sdks/modaicclient/README.md#createpredictionapiv1arbiterspredictionspost) - Create Prediction
* [getPredictionConfidenceApiV1ArbitersPredictionsConfidencePost](docs/sdks/modaicclient/README.md#getpredictionconfidenceapiv1arbiterspredictionsconfidencepost) - Get Prediction Confidence
* [enqueuePredictionConfidenceApiV1ArbitersPredictionsPredictionIdConfidencePost](docs/sdks/modaicclient/README.md#enqueuepredictionconfidenceapiv1arbiterspredictionspredictionidconfidencepost) - Enqueue Prediction Confidence
* [getPredictionConfidenceStatusApiV1ArbitersPredictionsPredictionIdConfidenceGet](docs/sdks/modaicclient/README.md#getpredictionconfidencestatusapiv1arbiterspredictionspredictionidconfidenceget) - Get Prediction Confidence Status
* [streamPredictionConfidenceApiV1ArbitersPredictionsPredictionIdConfidenceStreamGet](docs/sdks/modaicclient/README.md#streampredictionconfidenceapiv1arbiterspredictionspredictionidconfidencestreamget) - Stream Prediction Confidence
* [dispatchPredictionApiV1ArbitersPredictionsDispatchPost](docs/sdks/modaicclient/README.md#dispatchpredictionapiv1arbiterspredictionsdispatchpost) - Dispatch Prediction
* [createChatCompletionApiV1ArbitersChatCompletionsPost](docs/sdks/modaicclient/README.md#createchatcompletionapiv1arbiterschatcompletionspost) - Create Chat Completion
* [getSupportedModelsApiV1ArbitersSupportedModelsGet](docs/sdks/modaicclient/README.md#getsupportedmodelsapiv1arbiterssupportedmodelsget) - Get Supported Models
* [initArbiterApiV1ArbitersPost](docs/sdks/modaicclient/README.md#initarbiterapiv1arbiterspost) - Init Arbiter
* [updateArbiterMetadataApiV1ArbitersMetadataPatch](docs/sdks/modaicclient/README.md#updatearbitermetadataapiv1arbitersmetadatapatch) - Update Arbiter Metadata
* [ingestExamplesApiV1ExamplesPost](docs/sdks/modaicclient/README.md#ingestexamplesapiv1examplespost) - Ingest Examples
* [listExamplesApiV1ExamplesGet](docs/sdks/modaicclient/README.md#listexamplesapiv1examplesget) - List Examples
* [deleteExamplesApiV1ExamplesDelete](docs/sdks/modaicclient/README.md#deleteexamplesapiv1examplesdelete) - Delete Examples
* [exportExamplesApiV1ExamplesExportPost](docs/sdks/modaicclient/README.md#exportexamplesapiv1examplesexportpost) - Export Examples
* [downloadExportApiV1ExamplesExportDownloadGet](docs/sdks/modaicclient/README.md#downloadexportapiv1examplesexportdownloadget) - Download Export
* [getDistinctHashesApiV1ExamplesDistinctHashesGet](docs/sdks/modaicclient/README.md#getdistincthashesapiv1examplesdistincthashesget) - Get Distinct Hashes
* [hasUncalibratedPredictionsApiV1ExamplesHasUncalibratedGet](docs/sdks/modaicclient/README.md#hasuncalibratedpredictionsapiv1exampleshasuncalibratedget) - Has Uncalibrated Predictions
* [getGradedCountApiV1ExamplesGradedCountGet](docs/sdks/modaicclient/README.md#getgradedcountapiv1examplesgradedcountget) - Get Graded Count
* [patchExampleApiV1ExamplesExampleIdAnnotationPatch](docs/sdks/modaicclient/README.md#patchexampleapiv1examplesexampleidannotationpatch) - Patch Example
* [getExampleByIdApiV1ExamplesExampleIdGet](docs/sdks/modaicclient/README.md#getexamplebyidapiv1examplesexampleidget) - Get Example By Id
* [createPredictionApiV2ArbitersPredictionsPost](docs/sdks/modaicclient/README.md#createpredictionapiv2arbiterspredictionspost) - Create Prediction

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

- [`cancelBatchPredictionsJobApiV1JobsBatchPredictionsJobIdDelete`](docs/sdks/modaicclient/README.md#cancelbatchpredictionsjobapiv1jobsbatchpredictionsjobiddelete) - Cancel Batch Predictions Job
- [`cancelConfidenceScoreJobApiV1JobsConfidenceScoresJobIdDelete`](docs/sdks/modaicclient/README.md#cancelconfidencescorejobapiv1jobsconfidencescoresjobiddelete) - Cancel Confidence Score Job
- [`cancelOptimizationJobApiV1JobsGepaJobIdDelete`](docs/sdks/modaicclient/README.md#canceloptimizationjobapiv1jobsgepajobiddelete) - Cancel Optimization Job
- [`createChatCompletionApiV1ArbitersChatCompletionsPost`](docs/sdks/modaicclient/README.md#createchatcompletionapiv1arbiterschatcompletionspost) - Create Chat Completion
- [`createChatCompletionApiV1ChatCompletionsPost`](docs/sdks/modaicclient/README.md#createchatcompletionapiv1chatcompletionspost) - Create Chat Completion
- [`createPredictionApiV1ArbitersPredictionsPost`](docs/sdks/modaicclient/README.md#createpredictionapiv1arbiterspredictionspost) - Create Prediction
- [`createPredictionApiV2ArbitersPredictionsPost`](docs/sdks/modaicclient/README.md#createpredictionapiv2arbiterspredictionspost) - Create Prediction
- [`deleteExamplesApiV1ExamplesDelete`](docs/sdks/modaicclient/README.md#deleteexamplesapiv1examplesdelete) - Delete Examples
- [`dispatchPredictionApiV1ArbitersPredictionsDispatchPost`](docs/sdks/modaicclient/README.md#dispatchpredictionapiv1arbiterspredictionsdispatchpost) - Dispatch Prediction
- [`downloadExportApiV1ExamplesExportDownloadGet`](docs/sdks/modaicclient/README.md#downloadexportapiv1examplesexportdownloadget) - Download Export
- [`enqueuePredictionConfidenceApiV1ArbitersPredictionsPredictionIdConfidencePost`](docs/sdks/modaicclient/README.md#enqueuepredictionconfidenceapiv1arbiterspredictionspredictionidconfidencepost) - Enqueue Prediction Confidence
- [`exportExamplesApiV1ExamplesExportPost`](docs/sdks/modaicclient/README.md#exportexamplesapiv1examplesexportpost) - Export Examples
- [`getArbiterApiV1ArbitersGet`](docs/sdks/modaicclient/README.md#getarbiterapiv1arbitersget) - Get Arbiter
- [`getArbiterSchemaOutputApiV1ArbitersSchemaGet`](docs/sdks/modaicclient/README.md#getarbiterschemaoutputapiv1arbitersschemaget) - Get Arbiter Schema Output
- [`getBatchPredictionsJobStatusApiV1JobsBatchPredictionsJobIdGet`](docs/sdks/modaicclient/README.md#getbatchpredictionsjobstatusapiv1jobsbatchpredictionsjobidget) - Get Batch Predictions Job Status
- [`getConfidenceScoreJobStatusApiV1JobsConfidenceScoresJobIdGet`](docs/sdks/modaicclient/README.md#getconfidencescorejobstatusapiv1jobsconfidencescoresjobidget) - Get Confidence Score Job Status
- [`getDistinctHashesApiV1ExamplesDistinctHashesGet`](docs/sdks/modaicclient/README.md#getdistincthashesapiv1examplesdistincthashesget) - Get Distinct Hashes
- [`getExampleByIdApiV1ExamplesExampleIdGet`](docs/sdks/modaicclient/README.md#getexamplebyidapiv1examplesexampleidget) - Get Example By Id
- [`getGradedCountApiV1ExamplesGradedCountGet`](docs/sdks/modaicclient/README.md#getgradedcountapiv1examplesgradedcountget) - Get Graded Count
- [`getOptimizationJobLogsApiV1JobsGepaJobIdLogsGet`](docs/sdks/modaicclient/README.md#getoptimizationjoblogsapiv1jobsgepajobidlogsget) - Get Optimization Job Logs
- [`getOptimizationJobStatusApiV1JobsGepaJobIdGet`](docs/sdks/modaicclient/README.md#getoptimizationjobstatusapiv1jobsgepajobidget) - Get Optimization Job Status
- [`getPredictionConfidenceApiV1ArbitersPredictionsConfidencePost`](docs/sdks/modaicclient/README.md#getpredictionconfidenceapiv1arbiterspredictionsconfidencepost) - Get Prediction Confidence
- [`getPredictionConfidenceStatusApiV1ArbitersPredictionsPredictionIdConfidenceGet`](docs/sdks/modaicclient/README.md#getpredictionconfidencestatusapiv1arbiterspredictionspredictionidconfidenceget) - Get Prediction Confidence Status
- [`getSupportedModelsApiV1ArbitersSupportedModelsGet`](docs/sdks/modaicclient/README.md#getsupportedmodelsapiv1arbiterssupportedmodelsget) - Get Supported Models
- [`hasUncalibratedPredictionsApiV1ExamplesHasUncalibratedGet`](docs/sdks/modaicclient/README.md#hasuncalibratedpredictionsapiv1exampleshasuncalibratedget) - Has Uncalibrated Predictions
- [`ingestExamplesApiV1ExamplesPost`](docs/sdks/modaicclient/README.md#ingestexamplesapiv1examplespost) - Ingest Examples
- [`initArbiterApiV1ArbitersPost`](docs/sdks/modaicclient/README.md#initarbiterapiv1arbiterspost) - Init Arbiter
- [`listExamplesApiV1ExamplesGet`](docs/sdks/modaicclient/README.md#listexamplesapiv1examplesget) - List Examples
- [`patchExampleApiV1ExamplesExampleIdAnnotationPatch`](docs/sdks/modaicclient/README.md#patchexampleapiv1examplesexampleidannotationpatch) - Patch Example
- [`startBatchPredictionsJobApiV1JobsBatchPredictionsPost`](docs/sdks/modaicclient/README.md#startbatchpredictionsjobapiv1jobsbatchpredictionspost) - Start Batch Predictions Job
- [`startConfidenceScoreJobApiV1JobsConfidenceScoresPost`](docs/sdks/modaicclient/README.md#startconfidencescorejobapiv1jobsconfidencescorespost) - Start Confidence Score Job
- [`startOptimizationJobApiV1JobsGepaPost`](docs/sdks/modaicclient/README.md#startoptimizationjobapiv1jobsgepapost) - Start Optimization Job
- [`streamBatchPredictionsEventsApiV1JobsBatchPredictionsJobIdEventsGet`](docs/sdks/modaicclient/README.md#streambatchpredictionseventsapiv1jobsbatchpredictionsjobideventsget) - Stream Batch Predictions Events
- [`streamBatchPredictionsResultsApiV1JobsBatchPredictionsJobIdResultsGet`](docs/sdks/modaicclient/README.md#streambatchpredictionsresultsapiv1jobsbatchpredictionsjobidresultsget) - Stream Batch Predictions Results
- [`streamPredictionConfidenceApiV1ArbitersPredictionsPredictionIdConfidenceStreamGet`](docs/sdks/modaicclient/README.md#streampredictionconfidenceapiv1arbiterspredictionspredictionidconfidencestreamget) - Stream Prediction Confidence
- [`updateArbiterMetadataApiV1ArbitersMetadataPatch`](docs/sdks/modaicclient/README.md#updatearbitermetadataapiv1arbitersmetadatapatch) - Update Arbiter Metadata

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
  const result = await modaicClient
    .createChatCompletionApiV1ChatCompletionsPost({
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
  const result = await modaicClient
    .createChatCompletionApiV1ChatCompletionsPost();

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
    const result = await modaicClient
      .createChatCompletionApiV1ChatCompletionsPost();

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
  const result = await modaicClient
    .createChatCompletionApiV1ChatCompletionsPost();

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
