# Jobs

## Overview

### Available Operations

* [startConfidenceScore](#startconfidencescore) - Start Confidence Score Job
* [getConfidenceScoreStatus](#getconfidencescorestatus) - Get Confidence Score Job Status
* [cancelConfidenceScore](#cancelconfidencescore) - Cancel Confidence Score Job
* [startOptimization](#startoptimization) - Start Optimization Job
* [cancelOptimization](#canceloptimization) - Cancel Optimization Job
* [getOptimizationStatus](#getoptimizationstatus) - Get Optimization Job Status
* [getOptimizationLogs](#getoptimizationlogs) - Get Optimization Job Logs
* [startBatchPredictions](#startbatchpredictions) - Start Batch Predictions Job
* [getBatchPredictionStatus](#getbatchpredictionstatus) - Get Batch Predictions Job Status
* [cancelBatchPrediction](#cancelbatchprediction) - Cancel Batch Predictions Job
* [streamBatchEvents](#streambatchevents) - Stream Batch Predictions Events
* [streamBatchResults](#streambatchresults) - Stream Batch Predictions Results

## startConfidenceScore

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
  const result = await modaicClient.jobs.startConfidenceScore({
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
import { jobsStartConfidenceScore } from "modaic/funcs/jobs-start-confidence-score.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await jobsStartConfidenceScore(modaicClient, {
    arbiterRepo: "<value>",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("jobsStartConfidenceScore failed:", res.error);
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

## getConfidenceScoreStatus

Get the status of a confidence score computation job.

### Example Usage

<!-- UsageSnippet language="typescript" operationID="get_confidence_score_job_status_api_v1_jobs_confidence_scores__job_id__get" method="get" path="/api/v1/jobs/confidence-scores/{job_id}" -->
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.jobs.getConfidenceScoreStatus({
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
import { jobsGetConfidenceScoreStatus } from "modaic/funcs/jobs-get-confidence-score-status.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await jobsGetConfidenceScoreStatus(modaicClient, {
    jobId: "<id>",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("jobsGetConfidenceScoreStatus failed:", res.error);
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

## cancelConfidenceScore

Cancel a running confidence score computation job.

### Example Usage

<!-- UsageSnippet language="typescript" operationID="cancel_confidence_score_job_api_v1_jobs_confidence_scores__job_id__delete" method="delete" path="/api/v1/jobs/confidence-scores/{job_id}" -->
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.jobs.cancelConfidenceScore({
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
import { jobsCancelConfidenceScore } from "modaic/funcs/jobs-cancel-confidence-score.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await jobsCancelConfidenceScore(modaicClient, {
    jobId: "<id>",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("jobsCancelConfidenceScore failed:", res.error);
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

## startOptimization

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
  const result = await modaicClient.jobs.startOptimization({
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
import { jobsStartOptimization } from "modaic/funcs/jobs-start-optimization.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await jobsStartOptimization(modaicClient, {
    arbiterRepo: "<value>",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("jobsStartOptimization failed:", res.error);
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

## cancelOptimization

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
  const result = await modaicClient.jobs.cancelOptimization({
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
import { jobsCancelOptimization } from "modaic/funcs/jobs-cancel-optimization.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await jobsCancelOptimization(modaicClient, {
    jobId: "<id>",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("jobsCancelOptimization failed:", res.error);
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

## getOptimizationStatus

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
  const result = await modaicClient.jobs.getOptimizationStatus({
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
import { jobsGetOptimizationStatus } from "modaic/funcs/jobs-get-optimization-status.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await jobsGetOptimizationStatus(modaicClient, {
    jobId: "<id>",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("jobsGetOptimizationStatus failed:", res.error);
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

## getOptimizationLogs

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
  const result = await modaicClient.jobs.getOptimizationLogs({
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
import { jobsGetOptimizationLogs } from "modaic/funcs/jobs-get-optimization-logs.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await jobsGetOptimizationLogs(modaicClient, {
    jobId: "<id>",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("jobsGetOptimizationLogs failed:", res.error);
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

## startBatchPredictions

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
  const result = await modaicClient.jobs.startBatchPredictions({
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
import { jobsStartBatchPredictions } from "modaic/funcs/jobs-start-batch-predictions.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await jobsStartBatchPredictions(modaicClient, {
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
    console.log("jobsStartBatchPredictions failed:", res.error);
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

## getBatchPredictionStatus

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
  const result = await modaicClient.jobs.getBatchPredictionStatus({
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
import { jobsGetBatchPredictionStatus } from "modaic/funcs/jobs-get-batch-prediction-status.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await jobsGetBatchPredictionStatus(modaicClient, {
    jobId: "<id>",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("jobsGetBatchPredictionStatus failed:", res.error);
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

## cancelBatchPrediction

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
  const result = await modaicClient.jobs.cancelBatchPrediction({
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
import { jobsCancelBatchPrediction } from "modaic/funcs/jobs-cancel-batch-prediction.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await jobsCancelBatchPrediction(modaicClient, {
    jobId: "<id>",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("jobsCancelBatchPrediction failed:", res.error);
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

## streamBatchEvents

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
  const result = await modaicClient.jobs.streamBatchEvents({
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
import { jobsStreamBatchEvents } from "modaic/funcs/jobs-stream-batch-events.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await jobsStreamBatchEvents(modaicClient, {
    jobId: "<id>",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("jobsStreamBatchEvents failed:", res.error);
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

## streamBatchResults

Stream results for a batch predictions job as application/x-ndjson.

### Example Usage

<!-- UsageSnippet language="typescript" operationID="stream_batch_predictions_results_api_v1_jobs_batch_predictions__job_id__results_get" method="get" path="/api/v1/jobs/batch/predictions/{job_id}/results" -->
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.jobs.streamBatchResults({
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
import { jobsStreamBatchResults } from "modaic/funcs/jobs-stream-batch-results.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await jobsStreamBatchResults(modaicClient, {
    jobId: "<id>",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("jobsStreamBatchResults failed:", res.error);
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