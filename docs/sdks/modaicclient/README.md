# ModaicClient SDK

## Overview

Modaic API: A FastAPI application for Modaic

### Available Operations

* [createChatCompletionApiV1ChatCompletionsPost](#createchatcompletionapiv1chatcompletionspost) - Create Chat Completion
* [startConfidenceScoreJobApiV1JobsConfidenceScoresPost](#startconfidencescorejobapiv1jobsconfidencescorespost) - Start Confidence Score Job
* [getConfidenceScoreJobStatusApiV1JobsConfidenceScoresJobIdGet](#getconfidencescorejobstatusapiv1jobsconfidencescoresjobidget) - Get Confidence Score Job Status
* [cancelConfidenceScoreJobApiV1JobsConfidenceScoresJobIdDelete](#cancelconfidencescorejobapiv1jobsconfidencescoresjobiddelete) - Cancel Confidence Score Job
* [startOptimizationJobApiV1JobsGepaPost](#startoptimizationjobapiv1jobsgepapost) - Start Optimization Job
* [cancelOptimizationJobApiV1JobsGepaJobIdDelete](#canceloptimizationjobapiv1jobsgepajobiddelete) - Cancel Optimization Job
* [getOptimizationJobStatusApiV1JobsGepaJobIdGet](#getoptimizationjobstatusapiv1jobsgepajobidget) - Get Optimization Job Status
* [getOptimizationJobLogsApiV1JobsGepaJobIdLogsGet](#getoptimizationjoblogsapiv1jobsgepajobidlogsget) - Get Optimization Job Logs
* [startBatchPredictionsJobApiV1JobsBatchPredictionsPost](#startbatchpredictionsjobapiv1jobsbatchpredictionspost) - Start Batch Predictions Job
* [getBatchPredictionsJobStatusApiV1JobsBatchPredictionsJobIdGet](#getbatchpredictionsjobstatusapiv1jobsbatchpredictionsjobidget) - Get Batch Predictions Job Status
* [cancelBatchPredictionsJobApiV1JobsBatchPredictionsJobIdDelete](#cancelbatchpredictionsjobapiv1jobsbatchpredictionsjobiddelete) - Cancel Batch Predictions Job
* [streamBatchPredictionsEventsApiV1JobsBatchPredictionsJobIdEventsGet](#streambatchpredictionseventsapiv1jobsbatchpredictionsjobideventsget) - Stream Batch Predictions Events
* [streamBatchPredictionsResultsApiV1JobsBatchPredictionsJobIdResultsGet](#streambatchpredictionsresultsapiv1jobsbatchpredictionsjobidresultsget) - Stream Batch Predictions Results
* [getArbiterApiV1ArbitersGet](#getarbiterapiv1arbitersget) - Get Arbiter
* [getArbiterSchemaOutputApiV1ArbitersSchemaGet](#getarbiterschemaoutputapiv1arbitersschemaget) - Get Arbiter Schema Output
* [createPredictionApiV1ArbitersPredictionsPost](#createpredictionapiv1arbiterspredictionspost) - Create Prediction
* [getPredictionConfidenceApiV1ArbitersPredictionsConfidencePost](#getpredictionconfidenceapiv1arbiterspredictionsconfidencepost) - Get Prediction Confidence
* [enqueuePredictionConfidenceApiV1ArbitersPredictionsPredictionIdConfidencePost](#enqueuepredictionconfidenceapiv1arbiterspredictionspredictionidconfidencepost) - Enqueue Prediction Confidence
* [getPredictionConfidenceStatusApiV1ArbitersPredictionsPredictionIdConfidenceGet](#getpredictionconfidencestatusapiv1arbiterspredictionspredictionidconfidenceget) - Get Prediction Confidence Status
* [streamPredictionConfidenceApiV1ArbitersPredictionsPredictionIdConfidenceStreamGet](#streampredictionconfidenceapiv1arbiterspredictionspredictionidconfidencestreamget) - Stream Prediction Confidence
* [dispatchPredictionApiV1ArbitersPredictionsDispatchPost](#dispatchpredictionapiv1arbiterspredictionsdispatchpost) - Dispatch Prediction
* [createChatCompletionApiV1ArbitersChatCompletionsPost](#createchatcompletionapiv1arbiterschatcompletionspost) - Create Chat Completion
* [getSupportedModelsApiV1ArbitersSupportedModelsGet](#getsupportedmodelsapiv1arbiterssupportedmodelsget) - Get Supported Models
* [initArbiterApiV1ArbitersPost](#initarbiterapiv1arbiterspost) - Init Arbiter
* [updateArbiterMetadataApiV1ArbitersMetadataPatch](#updatearbitermetadataapiv1arbitersmetadatapatch) - Update Arbiter Metadata
* [ingestExamplesApiV1ExamplesPost](#ingestexamplesapiv1examplespost) - Ingest Examples
* [listExamplesApiV1ExamplesGet](#listexamplesapiv1examplesget) - List Examples
* [deleteExamplesApiV1ExamplesDelete](#deleteexamplesapiv1examplesdelete) - Delete Examples
* [exportExamplesApiV1ExamplesExportPost](#exportexamplesapiv1examplesexportpost) - Export Examples
* [downloadExportApiV1ExamplesExportDownloadGet](#downloadexportapiv1examplesexportdownloadget) - Download Export
* [getDistinctHashesApiV1ExamplesDistinctHashesGet](#getdistincthashesapiv1examplesdistincthashesget) - Get Distinct Hashes
* [hasUncalibratedPredictionsApiV1ExamplesHasUncalibratedGet](#hasuncalibratedpredictionsapiv1exampleshasuncalibratedget) - Has Uncalibrated Predictions
* [getGradedCountApiV1ExamplesGradedCountGet](#getgradedcountapiv1examplesgradedcountget) - Get Graded Count
* [patchExampleApiV1ExamplesExampleIdAnnotationPatch](#patchexampleapiv1examplesexampleidannotationpatch) - Patch Example
* [getExampleByIdApiV1ExamplesExampleIdGet](#getexamplebyidapiv1examplesexampleidget) - Get Example By Id
* [createPredictionApiV2ArbitersPredictionsPost](#createpredictionapiv2arbiterspredictionspost) - Create Prediction

## createChatCompletionApiV1ChatCompletionsPost

Create Chat Completion

### Example Usage

<!-- UsageSnippet language="typescript" operationID="create_chat_completion_api_v1_chat_completions_post" method="post" path="/api/v1/chat/completions" -->
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.createChatCompletionApiV1ChatCompletionsPost();

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ModaicClientCore } from "modaic/core.js";
import { createChatCompletionApiV1ChatCompletionsPost } from "modaic/funcs/create-chat-completion-api-v1-chat-completions-post.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await createChatCompletionApiV1ChatCompletionsPost(modaicClient);
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("createChatCompletionApiV1ChatCompletionsPost failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[any](../../models/.md)\>**

### Errors

| Error Type                      | Status Code                     | Content Type                    |
| ------------------------------- | ------------------------------- | ------------------------------- |
| errors.HTTPValidationError      | 422                             | application/json                |
| errors.ModaicClientDefaultError | 4XX, 5XX                        | \*/\*                           |

## startConfidenceScoreJobApiV1JobsConfidenceScoresPost

Start an async job to compute confidence scores for all predictions
with null confidence for the given repo.

### Example Usage

<!-- UsageSnippet language="typescript" operationID="start_confidence_score_job_api_v1_jobs_confidence_scores_post" method="post" path="/api/v1/jobs/confidence-scores" -->
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.startConfidenceScoreJobApiV1JobsConfidenceScoresPost({
    arbiterRepo: "<value>",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ModaicClientCore } from "modaic/core.js";
import { startConfidenceScoreJobApiV1JobsConfidenceScoresPost } from "modaic/funcs/start-confidence-score-job-api-v1-jobs-confidence-scores-post.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await startConfidenceScoreJobApiV1JobsConfidenceScoresPost(modaicClient, {
    arbiterRepo: "<value>",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("startConfidenceScoreJobApiV1JobsConfidenceScoresPost failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [models.ConfidenceScoreJobRequest](../../models/confidence-score-job-request.md)                                                                                               | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[any](../../models/.md)\>**

### Errors

| Error Type                      | Status Code                     | Content Type                    |
| ------------------------------- | ------------------------------- | ------------------------------- |
| errors.HTTPValidationError      | 422                             | application/json                |
| errors.ModaicClientDefaultError | 4XX, 5XX                        | \*/\*                           |

## getConfidenceScoreJobStatusApiV1JobsConfidenceScoresJobIdGet

Get the status of a confidence score computation job.

### Example Usage

<!-- UsageSnippet language="typescript" operationID="get_confidence_score_job_status_api_v1_jobs_confidence_scores__job_id__get" method="get" path="/api/v1/jobs/confidence-scores/{job_id}" -->
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.getConfidenceScoreJobStatusApiV1JobsConfidenceScoresJobIdGet({
    jobId: "<id>",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ModaicClientCore } from "modaic/core.js";
import { getConfidenceScoreJobStatusApiV1JobsConfidenceScoresJobIdGet } from "modaic/funcs/get-confidence-score-job-status-api-v1-jobs-confidence-scores-job-id-get.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await getConfidenceScoreJobStatusApiV1JobsConfidenceScoresJobIdGet(modaicClient, {
    jobId: "<id>",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("getConfidenceScoreJobStatusApiV1JobsConfidenceScoresJobIdGet failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                                     | Type                                                                                                                                                                                          | Required                                                                                                                                                                                      | Description                                                                                                                                                                                   |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `request`                                                                                                                                                                                     | [operations.GetConfidenceScoreJobStatusApiV1JobsConfidenceScoresJobIdGetRequest](../../models/operations/get-confidence-score-job-status-api-v1-jobs-confidence-scores-job-id-get-request.md) | :heavy_check_mark:                                                                                                                                                                            | The request object to use for the request.                                                                                                                                                    |
| `options`                                                                                                                                                                                     | RequestOptions                                                                                                                                                                                | :heavy_minus_sign:                                                                                                                                                                            | Used to set various options for making HTTP requests.                                                                                                                                         |
| `options.fetchOptions`                                                                                                                                                                        | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                                       | :heavy_minus_sign:                                                                                                                                                                            | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed.                |
| `options.retries`                                                                                                                                                                             | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                                            | Enables retrying HTTP requests under certain failure conditions.                                                                                                                              |

### Response

**Promise\<[any](../../models/.md)\>**

### Errors

| Error Type                      | Status Code                     | Content Type                    |
| ------------------------------- | ------------------------------- | ------------------------------- |
| errors.HTTPValidationError      | 422                             | application/json                |
| errors.ModaicClientDefaultError | 4XX, 5XX                        | \*/\*                           |

## cancelConfidenceScoreJobApiV1JobsConfidenceScoresJobIdDelete

Cancel a running confidence score computation job.

### Example Usage

<!-- UsageSnippet language="typescript" operationID="cancel_confidence_score_job_api_v1_jobs_confidence_scores__job_id__delete" method="delete" path="/api/v1/jobs/confidence-scores/{job_id}" -->
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.cancelConfidenceScoreJobApiV1JobsConfidenceScoresJobIdDelete({
    jobId: "<id>",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ModaicClientCore } from "modaic/core.js";
import { cancelConfidenceScoreJobApiV1JobsConfidenceScoresJobIdDelete } from "modaic/funcs/cancel-confidence-score-job-api-v1-jobs-confidence-scores-job-id-delete.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await cancelConfidenceScoreJobApiV1JobsConfidenceScoresJobIdDelete(modaicClient, {
    jobId: "<id>",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("cancelConfidenceScoreJobApiV1JobsConfidenceScoresJobIdDelete failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                                    | Type                                                                                                                                                                                         | Required                                                                                                                                                                                     | Description                                                                                                                                                                                  |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `request`                                                                                                                                                                                    | [operations.CancelConfidenceScoreJobApiV1JobsConfidenceScoresJobIdDeleteRequest](../../models/operations/cancel-confidence-score-job-api-v1-jobs-confidence-scores-job-id-delete-request.md) | :heavy_check_mark:                                                                                                                                                                           | The request object to use for the request.                                                                                                                                                   |
| `options`                                                                                                                                                                                    | RequestOptions                                                                                                                                                                               | :heavy_minus_sign:                                                                                                                                                                           | Used to set various options for making HTTP requests.                                                                                                                                        |
| `options.fetchOptions`                                                                                                                                                                       | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                                      | :heavy_minus_sign:                                                                                                                                                                           | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed.               |
| `options.retries`                                                                                                                                                                            | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                                | :heavy_minus_sign:                                                                                                                                                                           | Enables retrying HTTP requests under certain failure conditions.                                                                                                                             |

### Response

**Promise\<[any](../../models/.md)\>**

### Errors

| Error Type                      | Status Code                     | Content Type                    |
| ------------------------------- | ------------------------------- | ------------------------------- |
| errors.HTTPValidationError      | 422                             | application/json                |
| errors.ModaicClientDefaultError | 4XX, 5XX                        | \*/\*                           |

## startOptimizationJobApiV1JobsGepaPost

Start an async job to run GEPA optimization on an arbiter.
Uses annotated train/test predictions from ClickHouse to optimize the arbiter.
Runs in an isolated Modal Sandbox for clean cancellation support.

The hub_jobs row is created *before* the sandbox starts so that the
sandbox always has a row to update with logs and terminal state.

### Example Usage

<!-- UsageSnippet language="typescript" operationID="start_optimization_job_api_v1_jobs_gepa_post" method="post" path="/api/v1/jobs/gepa" -->
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.startOptimizationJobApiV1JobsGepaPost({
    arbiterRepo: "<value>",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ModaicClientCore } from "modaic/core.js";
import { startOptimizationJobApiV1JobsGepaPost } from "modaic/funcs/start-optimization-job-api-v1-jobs-gepa-post.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await startOptimizationJobApiV1JobsGepaPost(modaicClient, {
    arbiterRepo: "<value>",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("startOptimizationJobApiV1JobsGepaPost failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [models.GepaJobRequest](../../models/gepa-job-request.md)                                                                                                                      | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[any](../../models/.md)\>**

### Errors

| Error Type                      | Status Code                     | Content Type                    |
| ------------------------------- | ------------------------------- | ------------------------------- |
| errors.HTTPValidationError      | 422                             | application/json                |
| errors.ModaicClientDefaultError | 4XX, 5XX                        | \*/\*                           |

## cancelOptimizationJobApiV1JobsGepaJobIdDelete

Cancel a running GEPA optimization job.

Only cancels if the job is still in the ``optimizing`` phase.  If the
sandbox already reached a terminal state (``finalizing`` or ``done``),
the UPDATE is a no-op so we don't clobber a successful result or
interfere with the finalization pipeline.

### Example Usage

<!-- UsageSnippet language="typescript" operationID="cancel_optimization_job_api_v1_jobs_gepa__job_id__delete" method="delete" path="/api/v1/jobs/gepa/{job_id}" -->
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.cancelOptimizationJobApiV1JobsGepaJobIdDelete({
    jobId: "<id>",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ModaicClientCore } from "modaic/core.js";
import { cancelOptimizationJobApiV1JobsGepaJobIdDelete } from "modaic/funcs/cancel-optimization-job-api-v1-jobs-gepa-job-id-delete.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await cancelOptimizationJobApiV1JobsGepaJobIdDelete(modaicClient, {
    jobId: "<id>",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("cancelOptimizationJobApiV1JobsGepaJobIdDelete failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.CancelOptimizationJobApiV1JobsGepaJobIdDeleteRequest](../../models/operations/cancel-optimization-job-api-v1-jobs-gepa-job-id-delete-request.md)                   | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[any](../../models/.md)\>**

### Errors

| Error Type                      | Status Code                     | Content Type                    |
| ------------------------------- | ------------------------------- | ------------------------------- |
| errors.HTTPValidationError      | 422                             | application/json                |
| errors.ModaicClientDefaultError | 4XX, 5XX                        | \*/\*                           |

## getOptimizationJobStatusApiV1JobsGepaJobIdGet

Get the status of a GEPA optimization job.

This endpoint is a pure Postgres reader. The sandbox writes logs and
terminal state directly to the hub_jobs row; a background Celery task
handles finalization (env_var cleanup, Slack notification, re-predict
trigger). Subsequent re-predict/scoring phases are tracked via the
``phase`` column updated by the Celery pipeline.

### Example Usage

<!-- UsageSnippet language="typescript" operationID="get_optimization_job_status_api_v1_jobs_gepa__job_id__get" method="get" path="/api/v1/jobs/gepa/{job_id}" -->
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.getOptimizationJobStatusApiV1JobsGepaJobIdGet({
    jobId: "<id>",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ModaicClientCore } from "modaic/core.js";
import { getOptimizationJobStatusApiV1JobsGepaJobIdGet } from "modaic/funcs/get-optimization-job-status-api-v1-jobs-gepa-job-id-get.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await getOptimizationJobStatusApiV1JobsGepaJobIdGet(modaicClient, {
    jobId: "<id>",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("getOptimizationJobStatusApiV1JobsGepaJobIdGet failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.GetOptimizationJobStatusApiV1JobsGepaJobIdGetRequest](../../models/operations/get-optimization-job-status-api-v1-jobs-gepa-job-id-get-request.md)                  | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[models.GepaJobResponse](../../models/gepa-job-response.md)\>**

### Errors

| Error Type                      | Status Code                     | Content Type                    |
| ------------------------------- | ------------------------------- | ------------------------------- |
| errors.HTTPValidationError      | 422                             | application/json                |
| errors.ModaicClientDefaultError | 4XX, 5XX                        | \*/\*                           |

## getOptimizationJobLogsApiV1JobsGepaJobIdLogsGet

Get logs from a GEPA optimization job.

Logs are written directly to Postgres by the sandbox — this endpoint
is a pure reader.

### Example Usage

<!-- UsageSnippet language="typescript" operationID="get_optimization_job_logs_api_v1_jobs_gepa__job_id__logs_get" method="get" path="/api/v1/jobs/gepa/{job_id}/logs" -->
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.getOptimizationJobLogsApiV1JobsGepaJobIdLogsGet({
    jobId: "<id>",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ModaicClientCore } from "modaic/core.js";
import { getOptimizationJobLogsApiV1JobsGepaJobIdLogsGet } from "modaic/funcs/get-optimization-job-logs-api-v1-jobs-gepa-job-id-logs-get.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await getOptimizationJobLogsApiV1JobsGepaJobIdLogsGet(modaicClient, {
    jobId: "<id>",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("getOptimizationJobLogsApiV1JobsGepaJobIdLogsGet failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.GetOptimizationJobLogsApiV1JobsGepaJobIdLogsGetRequest](../../models/operations/get-optimization-job-logs-api-v1-jobs-gepa-job-id-logs-get-request.md)             | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[any](../../models/.md)\>**

### Errors

| Error Type                      | Status Code                     | Content Type                    |
| ------------------------------- | ------------------------------- | ------------------------------- |
| errors.HTTPValidationError      | 422                             | application/json                |
| errors.ModaicClientDefaultError | 4XX, 5XX                        | \*/\*                           |

## startBatchPredictionsJobApiV1JobsBatchPredictionsPost

Start an async batch prediction job.

Two input modes (mutually exclusive):

* ``examples`` — ingest brand-new examples and run predictions on them.
* ``example_ids`` — re-predict existing examples (referenced by their
  ClickHouse ids). Predictions are inserted as new versions on the
  existing example rows; no new examples rows are written.

When ``compute_confidence=True`` the worker pre-warms a probe scorer
container per arbiter and, after predictions persist, kicks off Modal
batch confidence scoring filtered to the prediction_ids produced by
this job (so we don't accidentally re-score unrelated NULL-confidence
rows). Predictions are visible to clients during the scoring phase via
``GET /results`` — confidence populates as Modal streams.

Phases visible via ``GET /{job_id}`` and SSE: ``predicting → scoring →
done`` (or ``failed``).

### Example Usage

<!-- UsageSnippet language="typescript" operationID="start_batch_predictions_job_api_v1_jobs_batch_predictions_post" method="post" path="/api/v1/jobs/batch/predictions" -->
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.startBatchPredictionsJobApiV1JobsBatchPredictionsPost({
    arbiters: [
      {
        arbiterRepo: "<value>",
      },
    ],
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ModaicClientCore } from "modaic/core.js";
import { startBatchPredictionsJobApiV1JobsBatchPredictionsPost } from "modaic/funcs/start-batch-predictions-job-api-v1-jobs-batch-predictions-post.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await startBatchPredictionsJobApiV1JobsBatchPredictionsPost(modaicClient, {
    arbiters: [
      {
        arbiterRepo: "<value>",
      },
    ],
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("startBatchPredictionsJobApiV1JobsBatchPredictionsPost failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [models.BatchPredictionsJobRequest](../../models/batch-predictions-job-request.md)                                                                                             | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[any](../../models/.md)\>**

### Errors

| Error Type                      | Status Code                     | Content Type                    |
| ------------------------------- | ------------------------------- | ------------------------------- |
| errors.HTTPValidationError      | 422                             | application/json                |
| errors.ModaicClientDefaultError | 4XX, 5XX                        | \*/\*                           |

## getBatchPredictionsJobStatusApiV1JobsBatchPredictionsJobIdGet

Get the latest snapshot for a batch predictions job.

Returns the same `BatchPredictionsEvent` shape SSE forwards (minus the
per-prediction payload). For the per-prediction list, use `GET /results`.

Mapping:
  * Celery PROGRESS  → return the latest snapshot stored in `meta`.
  * Celery PENDING   → synthesize a zeroed `event="start"` snapshot.
  * Celery SUCCESS   → return the terminal `event="finish"` snapshot.
  * Celery FAILURE   → synthesize an `event="finish", status="failed"` dict.
  * Celery REVOKED   → synthesize an `event="finish", status="failed",
    error="cancelled"` dict.

### Example Usage

<!-- UsageSnippet language="typescript" operationID="get_batch_predictions_job_status_api_v1_jobs_batch_predictions__job_id__get" method="get" path="/api/v1/jobs/batch/predictions/{job_id}" -->
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.getBatchPredictionsJobStatusApiV1JobsBatchPredictionsJobIdGet({
    jobId: "<id>",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ModaicClientCore } from "modaic/core.js";
import { getBatchPredictionsJobStatusApiV1JobsBatchPredictionsJobIdGet } from "modaic/funcs/get-batch-predictions-job-status-api-v1-jobs-batch-predictions-job-id-get.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await getBatchPredictionsJobStatusApiV1JobsBatchPredictionsJobIdGet(modaicClient, {
    jobId: "<id>",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("getBatchPredictionsJobStatusApiV1JobsBatchPredictionsJobIdGet failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                                       | Type                                                                                                                                                                                            | Required                                                                                                                                                                                        | Description                                                                                                                                                                                     |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `request`                                                                                                                                                                                       | [operations.GetBatchPredictionsJobStatusApiV1JobsBatchPredictionsJobIdGetRequest](../../models/operations/get-batch-predictions-job-status-api-v1-jobs-batch-predictions-job-id-get-request.md) | :heavy_check_mark:                                                                                                                                                                              | The request object to use for the request.                                                                                                                                                      |
| `options`                                                                                                                                                                                       | RequestOptions                                                                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                                              | Used to set various options for making HTTP requests.                                                                                                                                           |
| `options.fetchOptions`                                                                                                                                                                          | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                                         | :heavy_minus_sign:                                                                                                                                                                              | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed.                  |
| `options.retries`                                                                                                                                                                               | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                                   | :heavy_minus_sign:                                                                                                                                                                              | Enables retrying HTTP requests under certain failure conditions.                                                                                                                                |

### Response

**Promise\<[any](../../models/.md)\>**

### Errors

| Error Type                      | Status Code                     | Content Type                    |
| ------------------------------- | ------------------------------- | ------------------------------- |
| errors.HTTPValidationError      | 422                             | application/json                |
| errors.ModaicClientDefaultError | 4XX, 5XX                        | \*/\*                           |

## cancelBatchPredictionsJobApiV1JobsBatchPredictionsJobIdDelete

Cancel a running batch predictions job. Because all inserts happen in a
single transaction at the end of the task, cancelling mid-execution leaves
no partial state in ClickHouse.

### Example Usage

<!-- UsageSnippet language="typescript" operationID="cancel_batch_predictions_job_api_v1_jobs_batch_predictions__job_id__delete" method="delete" path="/api/v1/jobs/batch/predictions/{job_id}" -->
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.cancelBatchPredictionsJobApiV1JobsBatchPredictionsJobIdDelete({
    jobId: "<id>",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ModaicClientCore } from "modaic/core.js";
import { cancelBatchPredictionsJobApiV1JobsBatchPredictionsJobIdDelete } from "modaic/funcs/cancel-batch-predictions-job-api-v1-jobs-batch-predictions-job-id-delete.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await cancelBatchPredictionsJobApiV1JobsBatchPredictionsJobIdDelete(modaicClient, {
    jobId: "<id>",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("cancelBatchPredictionsJobApiV1JobsBatchPredictionsJobIdDelete failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                                      | Type                                                                                                                                                                                           | Required                                                                                                                                                                                       | Description                                                                                                                                                                                    |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `request`                                                                                                                                                                                      | [operations.CancelBatchPredictionsJobApiV1JobsBatchPredictionsJobIdDeleteRequest](../../models/operations/cancel-batch-predictions-job-api-v1-jobs-batch-predictions-job-id-delete-request.md) | :heavy_check_mark:                                                                                                                                                                             | The request object to use for the request.                                                                                                                                                     |
| `options`                                                                                                                                                                                      | RequestOptions                                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                                        | :heavy_minus_sign:                                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed.                 |
| `options.retries`                                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                                               |

### Response

**Promise\<[any](../../models/.md)\>**

### Errors

| Error Type                      | Status Code                     | Content Type                    |
| ------------------------------- | ------------------------------- | ------------------------------- |
| errors.HTTPValidationError      | 422                             | application/json                |
| errors.ModaicClientDefaultError | 4XX, 5XX                        | \*/\*                           |

## streamBatchPredictionsEventsApiV1JobsBatchPredictionsJobIdEventsGet

Stream batch-job progress snapshots as SSE.

Each frame is a `BatchPredictionsEvent`-shaped JSON payload (with the
per-prediction field stripped server-side; clients fetch the canonical
list via `GET /results`). Frames carry both the SSE `id:` (Redis stream
msg id) and `event:` (the snapshot's `event` field — `start`,
`prediction`, `score`, `finish`).

Resumption: clients automatically send `Last-Event-ID` on reconnect;
we use it as the `XREAD` start id so no events are missed (provided
the stream hasn't been trimmed past it).

Heartbeats every ~15s keep proxies from idling the connection out.
Synthetic terminal: if Celery reaches a terminal state without a
`finish` snapshot reaching Redis, emit one so clients don't hang.

### Example Usage

<!-- UsageSnippet language="typescript" operationID="stream_batch_predictions_events_api_v1_jobs_batch_predictions__job_id__events_get" method="get" path="/api/v1/jobs/batch/predictions/{job_id}/events" -->
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.streamBatchPredictionsEventsApiV1JobsBatchPredictionsJobIdEventsGet({
    jobId: "<id>",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ModaicClientCore } from "modaic/core.js";
import { streamBatchPredictionsEventsApiV1JobsBatchPredictionsJobIdEventsGet } from "modaic/funcs/stream-batch-predictions-events-api-v1-jobs-batch-predictions-job-id-events-get.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await streamBatchPredictionsEventsApiV1JobsBatchPredictionsJobIdEventsGet(modaicClient, {
    jobId: "<id>",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("streamBatchPredictionsEventsApiV1JobsBatchPredictionsJobIdEventsGet failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                                                   | Type                                                                                                                                                                                                        | Required                                                                                                                                                                                                    | Description                                                                                                                                                                                                 |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `request`                                                                                                                                                                                                   | [operations.StreamBatchPredictionsEventsApiV1JobsBatchPredictionsJobIdEventsGetRequest](../../models/operations/stream-batch-predictions-events-api-v1-jobs-batch-predictions-job-id-events-get-request.md) | :heavy_check_mark:                                                                                                                                                                                          | The request object to use for the request.                                                                                                                                                                  |
| `options`                                                                                                                                                                                                   | RequestOptions                                                                                                                                                                                              | :heavy_minus_sign:                                                                                                                                                                                          | Used to set various options for making HTTP requests.                                                                                                                                                       |
| `options.fetchOptions`                                                                                                                                                                                      | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                                                     | :heavy_minus_sign:                                                                                                                                                                                          | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed.                              |
| `options.retries`                                                                                                                                                                                           | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                                               | :heavy_minus_sign:                                                                                                                                                                                          | Enables retrying HTTP requests under certain failure conditions.                                                                                                                                            |

### Response

**Promise\<[any](../../models/.md)\>**

### Errors

| Error Type                      | Status Code                     | Content Type                    |
| ------------------------------- | ------------------------------- | ------------------------------- |
| errors.HTTPValidationError      | 422                             | application/json                |
| errors.ModaicClientDefaultError | 4XX, 5XX                        | \*/\*                           |

## streamBatchPredictionsResultsApiV1JobsBatchPredictionsJobIdResultsGet

Stream results for a batch predictions job as application/x-ndjson.

### Example Usage

<!-- UsageSnippet language="typescript" operationID="stream_batch_predictions_results_api_v1_jobs_batch_predictions__job_id__results_get" method="get" path="/api/v1/jobs/batch/predictions/{job_id}/results" -->
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.streamBatchPredictionsResultsApiV1JobsBatchPredictionsJobIdResultsGet({
    jobId: "<id>",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ModaicClientCore } from "modaic/core.js";
import { streamBatchPredictionsResultsApiV1JobsBatchPredictionsJobIdResultsGet } from "modaic/funcs/stream-batch-predictions-results-api-v1-jobs-batch-predictions-job-id-results-get.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await streamBatchPredictionsResultsApiV1JobsBatchPredictionsJobIdResultsGet(modaicClient, {
    jobId: "<id>",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("streamBatchPredictionsResultsApiV1JobsBatchPredictionsJobIdResultsGet failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                                                       | Type                                                                                                                                                                                                            | Required                                                                                                                                                                                                        | Description                                                                                                                                                                                                     |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `request`                                                                                                                                                                                                       | [operations.StreamBatchPredictionsResultsApiV1JobsBatchPredictionsJobIdResultsGetRequest](../../models/operations/stream-batch-predictions-results-api-v1-jobs-batch-predictions-job-id-results-get-request.md) | :heavy_check_mark:                                                                                                                                                                                              | The request object to use for the request.                                                                                                                                                                      |
| `options`                                                                                                                                                                                                       | RequestOptions                                                                                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                                                              | Used to set various options for making HTTP requests.                                                                                                                                                           |
| `options.fetchOptions`                                                                                                                                                                                          | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                                                         | :heavy_minus_sign:                                                                                                                                                                                              | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed.                                  |
| `options.retries`                                                                                                                                                                                               | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                                                   | :heavy_minus_sign:                                                                                                                                                                                              | Enables retrying HTTP requests under certain failure conditions.                                                                                                                                                |

### Response

**Promise\<[any](../../models/.md)\>**

### Errors

| Error Type                      | Status Code                     | Content Type                    |
| ------------------------------- | ------------------------------- | ------------------------------- |
| errors.HTTPValidationError      | 422                             | application/json                |
| errors.ModaicClientDefaultError | 4XX, 5XX                        | \*/\*                           |

## getArbiterApiV1ArbitersGet

Get Arbiter

### Example Usage

<!-- UsageSnippet language="typescript" operationID="get_arbiter_api_v1_arbiters__get" method="get" path="/api/v1/arbiters/" -->
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.getArbiterApiV1ArbitersGet({
    repo: "<value>",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ModaicClientCore } from "modaic/core.js";
import { getArbiterApiV1ArbitersGet } from "modaic/funcs/get-arbiter-api-v1-arbiters-get.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await getArbiterApiV1ArbitersGet(modaicClient, {
    repo: "<value>",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("getArbiterApiV1ArbitersGet failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.GetArbiterApiV1ArbitersGetRequest](../../models/operations/get-arbiter-api-v1-arbiters-get-request.md)                                                             | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[any](../../models/.md)\>**

### Errors

| Error Type                      | Status Code                     | Content Type                    |
| ------------------------------- | ------------------------------- | ------------------------------- |
| errors.HTTPValidationError      | 422                             | application/json                |
| errors.ModaicClientDefaultError | 4XX, 5XX                        | \*/\*                           |

## getArbiterSchemaOutputApiV1ArbitersSchemaGet

Get Arbiter Schema Output

### Example Usage

<!-- UsageSnippet language="typescript" operationID="get_arbiter_schema_output_api_v1_arbiters_schema_get" method="get" path="/api/v1/arbiters/schema" -->
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.getArbiterSchemaOutputApiV1ArbitersSchemaGet({
    repo: "<value>",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ModaicClientCore } from "modaic/core.js";
import { getArbiterSchemaOutputApiV1ArbitersSchemaGet } from "modaic/funcs/get-arbiter-schema-output-api-v1-arbiters-schema-get.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await getArbiterSchemaOutputApiV1ArbitersSchemaGet(modaicClient, {
    repo: "<value>",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("getArbiterSchemaOutputApiV1ArbitersSchemaGet failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.GetArbiterSchemaOutputApiV1ArbitersSchemaGetRequest](../../models/operations/get-arbiter-schema-output-api-v1-arbiters-schema-get-request.md)                      | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[any](../../models/.md)\>**

### Errors

| Error Type                      | Status Code                     | Content Type                    |
| ------------------------------- | ------------------------------- | ------------------------------- |
| errors.HTTPValidationError      | 422                             | application/json                |
| errors.ModaicClientDefaultError | 4XX, 5XX                        | \*/\*                           |

## createPredictionApiV1ArbitersPredictionsPost

Create Prediction

### Example Usage

<!-- UsageSnippet language="typescript" operationID="create_prediction_api_v1_arbiters_predictions_post" method="post" path="/api/v1/arbiters/predictions" -->
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.createPredictionApiV1ArbitersPredictionsPost({
    input: {
      "key": "<value>",
      "key1": "<value>",
    },
    arbiters: [],
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ModaicClientCore } from "modaic/core.js";
import { createPredictionApiV1ArbitersPredictionsPost } from "modaic/funcs/create-prediction-api-v1-arbiters-predictions-post.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await createPredictionApiV1ArbitersPredictionsPost(modaicClient, {
    input: {
      "key": "<value>",
      "key1": "<value>",
    },
    arbiters: [],
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("createPredictionApiV1ArbitersPredictionsPost failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [models.SrcApiV1ArbitersSchemasPredictExampleRequest](../../models/src-api-v1-arbiters-schemas-predict-example-request.md)                                                     | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[any](../../models/.md)\>**

### Errors

| Error Type                      | Status Code                     | Content Type                    |
| ------------------------------- | ------------------------------- | ------------------------------- |
| errors.HTTPValidationError      | 422                             | application/json                |
| errors.ModaicClientDefaultError | 4XX, 5XX                        | \*/\*                           |

## getPredictionConfidenceApiV1ArbitersPredictionsConfidencePost

Synchronous online confidence scoring keyed by request body.

Lets a caller score a fresh ``messages`` payload against an arbiter
without first persisting a prediction. If ``prediction_id`` is provided,
the server also writes a versioned ``predictions`` row in-process with
the new embedding + confidence (Modal returns the embedding; head +
calibrator + CH insert happen server-side). Returns the score as a float.

### Example Usage

<!-- UsageSnippet language="typescript" operationID="get_prediction_confidence_api_v1_arbiters_predictions_confidence_post" method="post" path="/api/v1/arbiters/predictions/confidence" -->
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.getPredictionConfidenceApiV1ArbitersPredictionsConfidencePost({
    arbiterRepo: "<value>",
    messages: [
      {
        "key": "<value>",
        "key1": "<value>",
        "key2": "<value>",
      },
      {
        "key": "<value>",
        "key1": "<value>",
        "key2": "<value>",
      },
      {
        "key": "<value>",
        "key1": "<value>",
      },
    ],
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ModaicClientCore } from "modaic/core.js";
import { getPredictionConfidenceApiV1ArbitersPredictionsConfidencePost } from "modaic/funcs/get-prediction-confidence-api-v1-arbiters-predictions-confidence-post.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await getPredictionConfidenceApiV1ArbitersPredictionsConfidencePost(modaicClient, {
    arbiterRepo: "<value>",
    messages: [
      {
        "key": "<value>",
        "key1": "<value>",
        "key2": "<value>",
      },
      {
        "key": "<value>",
        "key1": "<value>",
        "key2": "<value>",
      },
      {
        "key": "<value>",
        "key1": "<value>",
      },
    ],
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("getPredictionConfidenceApiV1ArbitersPredictionsConfidencePost failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [models.GetConfidenceRequest](../../models/get-confidence-request.md)                                                                                                          | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[any](../../models/.md)\>**

### Errors

| Error Type                      | Status Code                     | Content Type                    |
| ------------------------------- | ------------------------------- | ------------------------------- |
| errors.HTTPValidationError      | 422                             | application/json                |
| errors.ModaicClientDefaultError | 4XX, 5XX                        | \*/\*                           |

## enqueuePredictionConfidenceApiV1ArbitersPredictionsPredictionIdConfidencePost

Idempotent: ensure a confidence score exists for ``prediction_id``.

- 404 if the prediction is unknown to both Redis and ClickHouse.
- 200 ``completed`` if ClickHouse already has a confidence value.
- 202 ``queued`` otherwise (newly enqueued or already in flight).

### Example Usage

<!-- UsageSnippet language="typescript" operationID="enqueue_prediction_confidence_api_v1_arbiters_predictions__prediction_id__confidence_post" method="post" path="/api/v1/arbiters/predictions/{prediction_id}/confidence" -->
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.enqueuePredictionConfidenceApiV1ArbitersPredictionsPredictionIdConfidencePost({
    predictionId: "<id>",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ModaicClientCore } from "modaic/core.js";
import { enqueuePredictionConfidenceApiV1ArbitersPredictionsPredictionIdConfidencePost } from "modaic/funcs/enqueue-prediction-confidence-api-v1-arbiters-predictions-prediction-id-confidence-post.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await enqueuePredictionConfidenceApiV1ArbitersPredictionsPredictionIdConfidencePost(modaicClient, {
    predictionId: "<id>",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("enqueuePredictionConfidenceApiV1ArbitersPredictionsPredictionIdConfidencePost failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                                                                     | Type                                                                                                                                                                                                                          | Required                                                                                                                                                                                                                      | Description                                                                                                                                                                                                                   |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `request`                                                                                                                                                                                                                     | [operations.EnqueuePredictionConfidenceApiV1ArbitersPredictionsPredictionIdConfidencePostRequest](../../models/operations/enqueue-prediction-confidence-api-v1-arbiters-predictions-prediction-id-confidence-post-request.md) | :heavy_check_mark:                                                                                                                                                                                                            | The request object to use for the request.                                                                                                                                                                                    |
| `options`                                                                                                                                                                                                                     | RequestOptions                                                                                                                                                                                                                | :heavy_minus_sign:                                                                                                                                                                                                            | Used to set various options for making HTTP requests.                                                                                                                                                                         |
| `options.fetchOptions`                                                                                                                                                                                                        | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                                                                       | :heavy_minus_sign:                                                                                                                                                                                                            | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed.                                                |
| `options.retries`                                                                                                                                                                                                             | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                                                                            | Enables retrying HTTP requests under certain failure conditions.                                                                                                                                                              |

### Response

**Promise\<[models.ConfidenceStatusResponse](../../models/confidence-status-response.md)\>**

### Errors

| Error Type                      | Status Code                     | Content Type                    |
| ------------------------------- | ------------------------------- | ------------------------------- |
| errors.HTTPValidationError      | 422                             | application/json                |
| errors.ModaicClientDefaultError | 4XX, 5XX                        | \*/\*                           |

## getPredictionConfidenceStatusApiV1ArbitersPredictionsPredictionIdConfidenceGet

Read current state of the confidence resource for ``prediction_id``.

Returns 404 when no one has POSTed and no row exists. Otherwise returns
200 with status ``completed`` / ``queued`` / ``failed``.

### Example Usage

<!-- UsageSnippet language="typescript" operationID="get_prediction_confidence_status_api_v1_arbiters_predictions__prediction_id__confidence_get" method="get" path="/api/v1/arbiters/predictions/{prediction_id}/confidence" -->
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.getPredictionConfidenceStatusApiV1ArbitersPredictionsPredictionIdConfidenceGet({
    predictionId: "<id>",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ModaicClientCore } from "modaic/core.js";
import { getPredictionConfidenceStatusApiV1ArbitersPredictionsPredictionIdConfidenceGet } from "modaic/funcs/get-prediction-confidence-status-api-v1-arbiters-predictions-prediction-id-confidence-get.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await getPredictionConfidenceStatusApiV1ArbitersPredictionsPredictionIdConfidenceGet(modaicClient, {
    predictionId: "<id>",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("getPredictionConfidenceStatusApiV1ArbitersPredictionsPredictionIdConfidenceGet failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                                                                        | Type                                                                                                                                                                                                                             | Required                                                                                                                                                                                                                         | Description                                                                                                                                                                                                                      |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `request`                                                                                                                                                                                                                        | [operations.GetPredictionConfidenceStatusApiV1ArbitersPredictionsPredictionIdConfidenceGetRequest](../../models/operations/get-prediction-confidence-status-api-v1-arbiters-predictions-prediction-id-confidence-get-request.md) | :heavy_check_mark:                                                                                                                                                                                                               | The request object to use for the request.                                                                                                                                                                                       |
| `options`                                                                                                                                                                                                                        | RequestOptions                                                                                                                                                                                                                   | :heavy_minus_sign:                                                                                                                                                                                                               | Used to set various options for making HTTP requests.                                                                                                                                                                            |
| `options.fetchOptions`                                                                                                                                                                                                           | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                                                                          | :heavy_minus_sign:                                                                                                                                                                                                               | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed.                                                   |
| `options.retries`                                                                                                                                                                                                                | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                                                                    | :heavy_minus_sign:                                                                                                                                                                                                               | Enables retrying HTTP requests under certain failure conditions.                                                                                                                                                                 |

### Response

**Promise\<[models.ConfidenceStatusResponse](../../models/confidence-status-response.md)\>**

### Errors

| Error Type                      | Status Code                     | Content Type                    |
| ------------------------------- | ------------------------------- | ------------------------------- |
| errors.HTTPValidationError      | 422                             | application/json                |
| errors.ModaicClientDefaultError | 4XX, 5XX                        | \*/\*                           |

## streamPredictionConfidenceApiV1ArbitersPredictionsPredictionIdConfidenceStreamGet

Stream the confidence result for ``prediction_id`` over SSE.

Emits a ``status`` event on subscribe (``queued`` or ``completed``) and a
terminal ``completed`` / ``failed`` event when the worker finishes. Sends
a comment line every ``STREAM_KEEPALIVE_INTERVAL_S`` seconds so idle
proxies don't drop the connection. Closes after ``STREAM_WALL_CAP_S``
seconds with a final ``status: queued`` event so the client reconnects
instead of holding open forever.

Returns 404 if neither a CH row, a pending Redis prediction, nor a
Celery task exists for ``prediction_id``. Returns 403 if the caller
lacks read access on the arbiter repo.

### Example Usage

<!-- UsageSnippet language="typescript" operationID="stream_prediction_confidence_api_v1_arbiters_predictions__prediction_id__confidence_stream_get" method="get" path="/api/v1/arbiters/predictions/{prediction_id}/confidence/stream" -->
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.streamPredictionConfidenceApiV1ArbitersPredictionsPredictionIdConfidenceStreamGet({
    predictionId: "<id>",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ModaicClientCore } from "modaic/core.js";
import {
  streamPredictionConfidenceApiV1ArbitersPredictionsPredictionIdConfidenceStreamGet,
} from "modaic/funcs/stream-prediction-confidence-api-v1-arbiters-predictions-prediction-id-confidence-stream-get.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await streamPredictionConfidenceApiV1ArbitersPredictionsPredictionIdConfidenceStreamGet(modaicClient, {
    predictionId: "<id>",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("streamPredictionConfidenceApiV1ArbitersPredictionsPredictionIdConfidenceStreamGet failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                                                                              | Type                                                                                                                                                                                                                                   | Required                                                                                                                                                                                                                               | Description                                                                                                                                                                                                                            |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `request`                                                                                                                                                                                                                              | [operations.StreamPredictionConfidenceApiV1ArbitersPredictionsPredictionIdConfidenceStreamGetRequest](../../models/operations/stream-prediction-confidence-api-v1-arbiters-predictions-prediction-id-confidence-stream-get-request.md) | :heavy_check_mark:                                                                                                                                                                                                                     | The request object to use for the request.                                                                                                                                                                                             |
| `options`                                                                                                                                                                                                                              | RequestOptions                                                                                                                                                                                                                         | :heavy_minus_sign:                                                                                                                                                                                                                     | Used to set various options for making HTTP requests.                                                                                                                                                                                  |
| `options.fetchOptions`                                                                                                                                                                                                                 | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                                                                                | :heavy_minus_sign:                                                                                                                                                                                                                     | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed.                                                         |
| `options.retries`                                                                                                                                                                                                                      | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                                                                          | :heavy_minus_sign:                                                                                                                                                                                                                     | Enables retrying HTTP requests under certain failure conditions.                                                                                                                                                                       |

### Response

**Promise\<[any](../../models/.md)\>**

### Errors

| Error Type                      | Status Code                     | Content Type                    |
| ------------------------------- | ------------------------------- | ------------------------------- |
| errors.HTTPValidationError      | 422                             | application/json                |
| errors.ModaicClientDefaultError | 4XX, 5XX                        | \*/\*                           |

## dispatchPredictionApiV1ArbitersPredictionsDispatchPost

Dispatch Prediction

### Example Usage

<!-- UsageSnippet language="typescript" operationID="dispatch_prediction_api_v1_arbiters_predictions_dispatch_post" method="post" path="/api/v1/arbiters/predictions/dispatch" -->
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.dispatchPredictionApiV1ArbitersPredictionsDispatchPost({
    input: {
      "key": "<value>",
      "key1": "<value>",
    },
    arbitersMap: {

    },
    altId: "<id>",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ModaicClientCore } from "modaic/core.js";
import { dispatchPredictionApiV1ArbitersPredictionsDispatchPost } from "modaic/funcs/dispatch-prediction-api-v1-arbiters-predictions-dispatch-post.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await dispatchPredictionApiV1ArbitersPredictionsDispatchPost(modaicClient, {
    input: {
      "key": "<value>",
      "key1": "<value>",
    },
    arbitersMap: {
  
    },
    altId: "<id>",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("dispatchPredictionApiV1ArbitersPredictionsDispatchPost failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [models.DispatchPredictionRequest](../../models/dispatch-prediction-request.md)                                                                                                | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[any](../../models/.md)\>**

### Errors

| Error Type                      | Status Code                     | Content Type                    |
| ------------------------------- | ------------------------------- | ------------------------------- |
| errors.HTTPValidationError      | 422                             | application/json                |
| errors.ModaicClientDefaultError | 4XX, 5XX                        | \*/\*                           |

## createChatCompletionApiV1ArbitersChatCompletionsPost

Create Chat Completion

### Example Usage

<!-- UsageSnippet language="typescript" operationID="create_chat_completion_api_v1_arbiters_chat_completions_post" method="post" path="/api/v1/arbiters/chat/completions" -->
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.createChatCompletionApiV1ArbitersChatCompletionsPost({
    model: "Fiesta",
    messages: [
      {
        role: "<value>",
        content: "<value>",
      },
    ],
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ModaicClientCore } from "modaic/core.js";
import { createChatCompletionApiV1ArbitersChatCompletionsPost } from "modaic/funcs/create-chat-completion-api-v1-arbiters-chat-completions-post.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await createChatCompletionApiV1ArbitersChatCompletionsPost(modaicClient, {
    model: "Fiesta",
    messages: [
      {
        role: "<value>",
        content: "<value>",
      },
    ],
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("createChatCompletionApiV1ArbitersChatCompletionsPost failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [models.ChatCompletionRequest](../../models/chat-completion-request.md)                                                                                                        | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[models.ChatCompletionResponse](../../models/chat-completion-response.md)\>**

### Errors

| Error Type                      | Status Code                     | Content Type                    |
| ------------------------------- | ------------------------------- | ------------------------------- |
| errors.HTTPValidationError      | 422                             | application/json                |
| errors.ModaicClientDefaultError | 4XX, 5XX                        | \*/\*                           |

## getSupportedModelsApiV1ArbitersSupportedModelsGet

Get Supported Models

### Example Usage

<!-- UsageSnippet language="typescript" operationID="get_supported_models_api_v1_arbiters_supported_models_get" method="get" path="/api/v1/arbiters/supported-models" -->
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.getSupportedModelsApiV1ArbitersSupportedModelsGet();

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ModaicClientCore } from "modaic/core.js";
import { getSupportedModelsApiV1ArbitersSupportedModelsGet } from "modaic/funcs/get-supported-models-api-v1-arbiters-supported-models-get.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await getSupportedModelsApiV1ArbitersSupportedModelsGet(modaicClient);
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("getSupportedModelsApiV1ArbitersSupportedModelsGet failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[any](../../models/.md)\>**

### Errors

| Error Type                      | Status Code                     | Content Type                    |
| ------------------------------- | ------------------------------- | ------------------------------- |
| errors.ModaicClientDefaultError | 4XX, 5XX                        | \*/\*                           |

## initArbiterApiV1ArbitersPost

Init Arbiter

### Example Usage

<!-- UsageSnippet language="typescript" operationID="init_arbiter_api_v1_arbiters_post" method="post" path="/api/v1/arbiters" -->
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.initArbiterApiV1ArbitersPost({
    repo: "<value>",
    inputs: [
      {
        name: "<value>",
        type: "<value>",
      },
    ],
    outputs: [],
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ModaicClientCore } from "modaic/core.js";
import { initArbiterApiV1ArbitersPost } from "modaic/funcs/init-arbiter-api-v1-arbiters-post.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await initArbiterApiV1ArbitersPost(modaicClient, {
    repo: "<value>",
    inputs: [
      {
        name: "<value>",
        type: "<value>",
      },
    ],
    outputs: [],
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("initArbiterApiV1ArbitersPost failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [models.InitArbiterRequest](../../models/init-arbiter-request.md)                                                                                                              | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[any](../../models/.md)\>**

### Errors

| Error Type                      | Status Code                     | Content Type                    |
| ------------------------------- | ------------------------------- | ------------------------------- |
| errors.HTTPValidationError      | 422                             | application/json                |
| errors.ModaicClientDefaultError | 4XX, 5XX                        | \*/\*                           |

## updateArbiterMetadataApiV1ArbitersMetadataPatch

Patch YAML frontmatter metadata in the arbiter's README.md.

### Example Usage

<!-- UsageSnippet language="typescript" operationID="update_arbiter_metadata_api_v1_arbiters_metadata_patch" method="patch" path="/api/v1/arbiters/metadata" -->
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.updateArbiterMetadataApiV1ArbitersMetadataPatch({
    repo: "<value>",
    metadata: {
      "key": "<value>",
      "key1": "<value>",
      "key2": "<value>",
    },
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ModaicClientCore } from "modaic/core.js";
import { updateArbiterMetadataApiV1ArbitersMetadataPatch } from "modaic/funcs/update-arbiter-metadata-api-v1-arbiters-metadata-patch.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await updateArbiterMetadataApiV1ArbitersMetadataPatch(modaicClient, {
    repo: "<value>",
    metadata: {
      "key": "<value>",
      "key1": "<value>",
      "key2": "<value>",
    },
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("updateArbiterMetadataApiV1ArbitersMetadataPatch failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [models.UpdateArbiterMetadataRequest](../../models/update-arbiter-metadata-request.md)                                                                                         | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[any](../../models/.md)\>**

### Errors

| Error Type                      | Status Code                     | Content Type                    |
| ------------------------------- | ------------------------------- | ------------------------------- |
| errors.HTTPValidationError      | 422                             | application/json                |
| errors.ModaicClientDefaultError | 4XX, 5XX                        | \*/\*                           |

## ingestExamplesApiV1ExamplesPost

Ingest Examples

### Example Usage

<!-- UsageSnippet language="typescript" operationID="ingest_examples_api_v1_examples_post" method="post" path="/api/v1/examples" -->
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.ingestExamplesApiV1ExamplesPost();

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ModaicClientCore } from "modaic/core.js";
import { ingestExamplesApiV1ExamplesPost } from "modaic/funcs/ingest-examples-api-v1-examples-post.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await ingestExamplesApiV1ExamplesPost(modaicClient);
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("ingestExamplesApiV1ExamplesPost failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[any](../../models/.md)\>**

### Errors

| Error Type                      | Status Code                     | Content Type                    |
| ------------------------------- | ------------------------------- | ------------------------------- |
| errors.HTTPValidationError      | 422                             | application/json                |
| errors.ModaicClientDefaultError | 4XX, 5XX                        | \*/\*                           |

## listExamplesApiV1ExamplesGet

Offset-based pagination for examples within a single repo, ordered by (created_at, id) ascending.

### Example Usage

<!-- UsageSnippet language="typescript" operationID="list_examples_api_v1_examples_get" method="get" path="/api/v1/examples" -->
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.listExamplesApiV1ExamplesGet({
    user: "Dejon59",
    program: "<value>",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ModaicClientCore } from "modaic/core.js";
import { listExamplesApiV1ExamplesGet } from "modaic/funcs/list-examples-api-v1-examples-get.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await listExamplesApiV1ExamplesGet(modaicClient, {
    user: "Dejon59",
    program: "<value>",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("listExamplesApiV1ExamplesGet failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.ListExamplesApiV1ExamplesGetRequest](../../models/operations/list-examples-api-v1-examples-get-request.md)                                                         | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[models.PaginatedPage](../../models/paginated-page.md)\>**

### Errors

| Error Type                      | Status Code                     | Content Type                    |
| ------------------------------- | ------------------------------- | ------------------------------- |
| errors.HTTPValidationError      | 422                             | application/json                |
| errors.ModaicClientDefaultError | 4XX, 5XX                        | \*/\*                           |

## deleteExamplesApiV1ExamplesDelete

Delete one or more examples from a repo.

### Example Usage

<!-- UsageSnippet language="typescript" operationID="delete_examples_api_v1_examples_delete" method="delete" path="/api/v1/examples" -->
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.deleteExamplesApiV1ExamplesDelete({
    exampleIds: [
      "<value 1>",
    ],
    arbiterRepo: "<value>",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ModaicClientCore } from "modaic/core.js";
import { deleteExamplesApiV1ExamplesDelete } from "modaic/funcs/delete-examples-api-v1-examples-delete.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await deleteExamplesApiV1ExamplesDelete(modaicClient, {
    exampleIds: [
      "<value 1>",
    ],
    arbiterRepo: "<value>",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("deleteExamplesApiV1ExamplesDelete failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [models.DeleteExamplesRequest](../../models/delete-examples-request.md)                                                                                                        | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[any](../../models/.md)\>**

### Errors

| Error Type                      | Status Code                     | Content Type                    |
| ------------------------------- | ------------------------------- | ------------------------------- |
| errors.HTTPValidationError      | 422                             | application/json                |
| errors.ModaicClientDefaultError | 4XX, 5XX                        | \*/\*                           |

## exportExamplesApiV1ExamplesExportPost

Export a repo's latest prediction state as parquet and return a signed URL.

### Example Usage

<!-- UsageSnippet language="typescript" operationID="export_examples_api_v1_examples_export_post" method="post" path="/api/v1/examples/export" -->
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.exportExamplesApiV1ExamplesExportPost({
    arbiterRepo: "<value>",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ModaicClientCore } from "modaic/core.js";
import { exportExamplesApiV1ExamplesExportPost } from "modaic/funcs/export-examples-api-v1-examples-export-post.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await exportExamplesApiV1ExamplesExportPost(modaicClient, {
    arbiterRepo: "<value>",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("exportExamplesApiV1ExamplesExportPost failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [models.ExportExamplesRequest](../../models/export-examples-request.md)                                                                                                        | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[models.ExportExamplesResponse](../../models/export-examples-response.md)\>**

### Errors

| Error Type                      | Status Code                     | Content Type                    |
| ------------------------------- | ------------------------------- | ------------------------------- |
| errors.HTTPValidationError      | 422                             | application/json                |
| errors.ModaicClientDefaultError | 4XX, 5XX                        | \*/\*                           |

## downloadExportApiV1ExamplesExportDownloadGet

Stream an exported parquet file from S3.

### Example Usage

<!-- UsageSnippet language="typescript" operationID="download_export_api_v1_examples_export_download_get" method="get" path="/api/v1/examples/export/download" -->
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.downloadExportApiV1ExamplesExportDownloadGet({
    fileKey: "<value>",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ModaicClientCore } from "modaic/core.js";
import { downloadExportApiV1ExamplesExportDownloadGet } from "modaic/funcs/download-export-api-v1-examples-export-download-get.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await downloadExportApiV1ExamplesExportDownloadGet(modaicClient, {
    fileKey: "<value>",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("downloadExportApiV1ExamplesExportDownloadGet failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.DownloadExportApiV1ExamplesExportDownloadGetRequest](../../models/operations/download-export-api-v1-examples-export-download-get-request.md)                       | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[any](../../models/.md)\>**

### Errors

| Error Type                      | Status Code                     | Content Type                    |
| ------------------------------- | ------------------------------- | ------------------------------- |
| errors.HTTPValidationError      | 422                             | application/json                |
| errors.ModaicClientDefaultError | 4XX, 5XX                        | \*/\*                           |

## getDistinctHashesApiV1ExamplesDistinctHashesGet

Return distinct arbiter_hash values for the repo's latest predictions.

### Example Usage

<!-- UsageSnippet language="typescript" operationID="get_distinct_hashes_api_v1_examples_distinct_hashes_get" method="get" path="/api/v1/examples/distinct-hashes" -->
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.getDistinctHashesApiV1ExamplesDistinctHashesGet({
    user: "Adelbert44",
    program: "<value>",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ModaicClientCore } from "modaic/core.js";
import { getDistinctHashesApiV1ExamplesDistinctHashesGet } from "modaic/funcs/get-distinct-hashes-api-v1-examples-distinct-hashes-get.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await getDistinctHashesApiV1ExamplesDistinctHashesGet(modaicClient, {
    user: "Adelbert44",
    program: "<value>",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("getDistinctHashesApiV1ExamplesDistinctHashesGet failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.GetDistinctHashesApiV1ExamplesDistinctHashesGetRequest](../../models/operations/get-distinct-hashes-api-v1-examples-distinct-hashes-get-request.md)                | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[string[]](../../models/.md)\>**

### Errors

| Error Type                      | Status Code                     | Content Type                    |
| ------------------------------- | ------------------------------- | ------------------------------- |
| errors.HTTPValidationError      | 422                             | application/json                |
| errors.ModaicClientDefaultError | 4XX, 5XX                        | \*/\*                           |

## hasUncalibratedPredictionsApiV1ExamplesHasUncalibratedGet

Check whether there are predictions without confidence scores.

### Example Usage

<!-- UsageSnippet language="typescript" operationID="has_uncalibrated_predictions_api_v1_examples_has_uncalibrated_get" method="get" path="/api/v1/examples/has-uncalibrated" -->
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.hasUncalibratedPredictionsApiV1ExamplesHasUncalibratedGet({
    user: "Ethyl19",
    program: "<value>",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ModaicClientCore } from "modaic/core.js";
import { hasUncalibratedPredictionsApiV1ExamplesHasUncalibratedGet } from "modaic/funcs/has-uncalibrated-predictions-api-v1-examples-has-uncalibrated-get.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await hasUncalibratedPredictionsApiV1ExamplesHasUncalibratedGet(modaicClient, {
    user: "Ethyl19",
    program: "<value>",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("hasUncalibratedPredictionsApiV1ExamplesHasUncalibratedGet failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                           | Type                                                                                                                                                                                | Required                                                                                                                                                                            | Description                                                                                                                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `request`                                                                                                                                                                           | [operations.HasUncalibratedPredictionsApiV1ExamplesHasUncalibratedGetRequest](../../models/operations/has-uncalibrated-predictions-api-v1-examples-has-uncalibrated-get-request.md) | :heavy_check_mark:                                                                                                                                                                  | The request object to use for the request.                                                                                                                                          |
| `options`                                                                                                                                                                           | RequestOptions                                                                                                                                                                      | :heavy_minus_sign:                                                                                                                                                                  | Used to set various options for making HTTP requests.                                                                                                                               |
| `options.fetchOptions`                                                                                                                                                              | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                             | :heavy_minus_sign:                                                                                                                                                                  | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed.      |
| `options.retries`                                                                                                                                                                   | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                       | :heavy_minus_sign:                                                                                                                                                                  | Enables retrying HTTP requests under certain failure conditions.                                                                                                                    |

### Response

**Promise\<[{ [k: string]: any }](../../models/.md)\>**

### Errors

| Error Type                      | Status Code                     | Content Type                    |
| ------------------------------- | ------------------------------- | ------------------------------- |
| errors.HTTPValidationError      | 422                             | application/json                |
| errors.ModaicClientDefaultError | 4XX, 5XX                        | \*/\*                           |

## getGradedCountApiV1ExamplesGradedCountGet

Count predictions that have been graded (have ground truth).

### Example Usage

<!-- UsageSnippet language="typescript" operationID="get_graded_count_api_v1_examples_graded_count_get" method="get" path="/api/v1/examples/graded-count" -->
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.getGradedCountApiV1ExamplesGradedCountGet({
    user: "Felipa_Hickle14",
    program: "<value>",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ModaicClientCore } from "modaic/core.js";
import { getGradedCountApiV1ExamplesGradedCountGet } from "modaic/funcs/get-graded-count-api-v1-examples-graded-count-get.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await getGradedCountApiV1ExamplesGradedCountGet(modaicClient, {
    user: "Felipa_Hickle14",
    program: "<value>",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("getGradedCountApiV1ExamplesGradedCountGet failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.GetGradedCountApiV1ExamplesGradedCountGetRequest](../../models/operations/get-graded-count-api-v1-examples-graded-count-get-request.md)                            | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[{ [k: string]: any }](../../models/.md)\>**

### Errors

| Error Type                      | Status Code                     | Content Type                    |
| ------------------------------- | ------------------------------- | ------------------------------- |
| errors.HTTPValidationError      | 422                             | application/json                |
| errors.ModaicClientDefaultError | 4XX, 5XX                        | \*/\*                           |

## patchExampleApiV1ExamplesExampleIdAnnotationPatch

Updates an example annotation.

### Example Usage

<!-- UsageSnippet language="typescript" operationID="patch_example_api_v1_examples__example_id__annotation_patch" method="patch" path="/api/v1/examples/{example_id}/annotation" -->
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.patchExampleApiV1ExamplesExampleIdAnnotationPatch({
    exampleId: "<id>",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ModaicClientCore } from "modaic/core.js";
import { patchExampleApiV1ExamplesExampleIdAnnotationPatch } from "modaic/funcs/patch-example-api-v1-examples-example-id-annotation-patch.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await patchExampleApiV1ExamplesExampleIdAnnotationPatch(modaicClient, {
    exampleId: "<id>",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("patchExampleApiV1ExamplesExampleIdAnnotationPatch failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.PatchExampleApiV1ExamplesExampleIdAnnotationPatchRequest](../../models/operations/patch-example-api-v1-examples-example-id-annotation-patch-request.md)            | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[any](../../models/.md)\>**

### Errors

| Error Type                      | Status Code                     | Content Type                    |
| ------------------------------- | ------------------------------- | ------------------------------- |
| errors.HTTPValidationError      | 422                             | application/json                |
| errors.ModaicClientDefaultError | 4XX, 5XX                        | \*/\*                           |

## getExampleByIdApiV1ExamplesExampleIdGet

Get Example By Id

### Example Usage

<!-- UsageSnippet language="typescript" operationID="get_example_by_id_api_v1_examples__example_id__get" method="get" path="/api/v1/examples/{example_id}" -->
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.getExampleByIdApiV1ExamplesExampleIdGet({
    exampleId: "<id>",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ModaicClientCore } from "modaic/core.js";
import { getExampleByIdApiV1ExamplesExampleIdGet } from "modaic/funcs/get-example-by-id-api-v1-examples-example-id-get.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await getExampleByIdApiV1ExamplesExampleIdGet(modaicClient, {
    exampleId: "<id>",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("getExampleByIdApiV1ExamplesExampleIdGet failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [operations.GetExampleByIdApiV1ExamplesExampleIdGetRequest](../../models/operations/get-example-by-id-api-v1-examples-example-id-get-request.md)                               | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[models.PredictedExample](../../models/predicted-example.md)\>**

### Errors

| Error Type                      | Status Code                     | Content Type                    |
| ------------------------------- | ------------------------------- | ------------------------------- |
| errors.HTTPValidationError      | 422                             | application/json                |
| errors.ModaicClientDefaultError | 4XX, 5XX                        | \*/\*                           |

## createPredictionApiV2ArbitersPredictionsPost

Run a single arbiter against a single example and return a flat result.

Unlike v1's ``POST /api/v1/arbiters/predictions`` (which takes a list of
arbiters and wraps the response in a ``predictions`` array), v2 takes
exactly one arbiter and returns ``{example_id, prediction_id, output,
reasoning, messages}``.

### Example Usage

<!-- UsageSnippet language="typescript" operationID="create_prediction_api_v2_arbiters_predictions_post" method="post" path="/api/v2/arbiters/predictions" -->
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.createPredictionApiV2ArbitersPredictionsPost({
    input: {

    },
    arbiterRepo: "<value>",
  });

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ModaicClientCore } from "modaic/core.js";
import { createPredictionApiV2ArbitersPredictionsPost } from "modaic/funcs/create-prediction-api-v2-arbiters-predictions-post.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await createPredictionApiV2ArbitersPredictionsPost(modaicClient, {
    input: {
  
    },
    arbiterRepo: "<value>",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("createPredictionApiV2ArbitersPredictionsPost failed:", res.error);
  }
}

run();
```

### Parameters

| Parameter                                                                                                                                                                      | Type                                                                                                                                                                           | Required                                                                                                                                                                       | Description                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`                                                                                                                                                                      | [models.SrcApiV2ArbitersSchemasPredictExampleRequest](../../models/src-api-v2-arbiters-schemas-predict-example-request.md)                                                     | :heavy_check_mark:                                                                                                                                                             | The request object to use for the request.                                                                                                                                     |
| `options`                                                                                                                                                                      | RequestOptions                                                                                                                                                                 | :heavy_minus_sign:                                                                                                                                                             | Used to set various options for making HTTP requests.                                                                                                                          |
| `options.fetchOptions`                                                                                                                                                         | [RequestInit](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#options)                                                                                        | :heavy_minus_sign:                                                                                                                                                             | Options that are passed to the underlying HTTP request. This can be used to inject extra headers for examples. All `Request` options, except `method` and `body`, are allowed. |
| `options.retries`                                                                                                                                                              | [RetryConfig](../../lib/utils/retryconfig.md)                                                                                                                                  | :heavy_minus_sign:                                                                                                                                                             | Enables retrying HTTP requests under certain failure conditions.                                                                                                               |

### Response

**Promise\<[models.PredictExampleResponse](../../models/predict-example-response.md)\>**

### Errors

| Error Type                      | Status Code                     | Content Type                    |
| ------------------------------- | ------------------------------- | ------------------------------- |
| errors.HTTPValidationError      | 422                             | application/json                |
| errors.ModaicClientDefaultError | 4XX, 5XX                        | \*/\*                           |