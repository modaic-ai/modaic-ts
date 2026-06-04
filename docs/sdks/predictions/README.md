# Predictions

## Overview

### Available Operations

* [createV1](#createv1) - Create Prediction
* [getConfidence](#getconfidence) - Get Prediction Confidence
* [enqueueConfidence](#enqueueconfidence) - Enqueue Prediction Confidence
* [getConfidenceStatus](#getconfidencestatus) - Get Prediction Confidence Status
* [streamConfidence](#streamconfidence) - Stream Prediction Confidence
* [dispatch](#dispatch) - Dispatch Prediction
* [create](#create) - Create Prediction

## createV1

Create Prediction

### Example Usage

<!-- UsageSnippet language="typescript" operationID="create_prediction_api_v1_arbiters_predictions_post" method="post" path="/api/v1/arbiters/predictions" -->
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.predictions.createV1({
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
import { predictionsCreateV1 } from "modaic/funcs/predictions-create-v1.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await predictionsCreateV1(modaicClient, {
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
    console.log("predictionsCreateV1 failed:", res.error);
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

## getConfidence

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
  const result = await modaicClient.predictions.getConfidence({
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
import { predictionsGetConfidence } from "modaic/funcs/predictions-get-confidence.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await predictionsGetConfidence(modaicClient, {
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
    console.log("predictionsGetConfidence failed:", res.error);
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

## enqueueConfidence

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
  const result = await modaicClient.predictions.enqueueConfidence({
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
import { predictionsEnqueueConfidence } from "modaic/funcs/predictions-enqueue-confidence.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await predictionsEnqueueConfidence(modaicClient, {
    predictionId: "<id>",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("predictionsEnqueueConfidence failed:", res.error);
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

## getConfidenceStatus

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
  const result = await modaicClient.predictions.getConfidenceStatus({
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
import { predictionsGetConfidenceStatus } from "modaic/funcs/predictions-get-confidence-status.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await predictionsGetConfidenceStatus(modaicClient, {
    predictionId: "<id>",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("predictionsGetConfidenceStatus failed:", res.error);
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

## streamConfidence

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
  const result = await modaicClient.predictions.streamConfidence({
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
import { predictionsStreamConfidence } from "modaic/funcs/predictions-stream-confidence.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await predictionsStreamConfidence(modaicClient, {
    predictionId: "<id>",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("predictionsStreamConfidence failed:", res.error);
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

## dispatch

Dispatch Prediction

### Example Usage

<!-- UsageSnippet language="typescript" operationID="dispatch_prediction_api_v1_arbiters_predictions_dispatch_post" method="post" path="/api/v1/arbiters/predictions/dispatch" -->
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.predictions.dispatch({
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
import { predictionsDispatch } from "modaic/funcs/predictions-dispatch.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await predictionsDispatch(modaicClient, {
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
    console.log("predictionsDispatch failed:", res.error);
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

## create

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
  const result = await modaicClient.predictions.create({
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
import { predictionsCreate } from "modaic/funcs/predictions-create.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await predictionsCreate(modaicClient, {
    input: {
  
    },
    arbiterRepo: "<value>",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("predictionsCreate failed:", res.error);
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