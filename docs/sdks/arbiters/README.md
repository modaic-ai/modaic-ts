# Arbiters

## Overview

### Available Operations

* [get](#get) - Get Arbiter
* [getSchema](#getschema) - Get Arbiter Schema Output
* [createChatCompletion](#createchatcompletion) - Create Chat Completion
* [getSupportedModels](#getsupportedmodels) - Get Supported Models
* [init](#init) - Init Arbiter
* [updateMetadata](#updatemetadata) - Update Arbiter Metadata

## get

Get Arbiter

### Example Usage

<!-- UsageSnippet language="typescript" operationID="get_arbiter_api_v1_arbiters__get" method="get" path="/api/v1/arbiters/" -->
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.arbiters.get({
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
import { arbitersGet } from "modaic/funcs/arbiters-get.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await arbitersGet(modaicClient, {
    repo: "<value>",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("arbitersGet failed:", res.error);
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

## getSchema

Get Arbiter Schema Output

### Example Usage

<!-- UsageSnippet language="typescript" operationID="get_arbiter_schema_output_api_v1_arbiters_schema_get" method="get" path="/api/v1/arbiters/schema" -->
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.arbiters.getSchema({
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
import { arbitersGetSchema } from "modaic/funcs/arbiters-get-schema.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await arbitersGetSchema(modaicClient, {
    repo: "<value>",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("arbitersGetSchema failed:", res.error);
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

## createChatCompletion

Create Chat Completion

### Example Usage

<!-- UsageSnippet language="typescript" operationID="create_chat_completion_api_v1_arbiters_chat_completions_post" method="post" path="/api/v1/arbiters/chat/completions" -->
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.arbiters.createChatCompletion({
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
import { arbitersCreateChatCompletion } from "modaic/funcs/arbiters-create-chat-completion.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await arbitersCreateChatCompletion(modaicClient, {
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
    console.log("arbitersCreateChatCompletion failed:", res.error);
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

## getSupportedModels

Get Supported Models

### Example Usage

<!-- UsageSnippet language="typescript" operationID="get_supported_models_api_v1_arbiters_supported_models_get" method="get" path="/api/v1/arbiters/supported-models" -->
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.arbiters.getSupportedModels();

  console.log(result);
}

run();
```

### Standalone function

The standalone function version of this method:

```typescript
import { ModaicClientCore } from "modaic/core.js";
import { arbitersGetSupportedModels } from "modaic/funcs/arbiters-get-supported-models.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await arbitersGetSupportedModels(modaicClient);
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("arbitersGetSupportedModels failed:", res.error);
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

## init

Init Arbiter

### Example Usage

<!-- UsageSnippet language="typescript" operationID="init_arbiter_api_v1_arbiters_post" method="post" path="/api/v1/arbiters" -->
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.arbiters.init({
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
import { arbitersInit } from "modaic/funcs/arbiters-init.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await arbitersInit(modaicClient, {
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
    console.log("arbitersInit failed:", res.error);
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

## updateMetadata

Patch YAML frontmatter metadata in the arbiter's README.md.

### Example Usage

<!-- UsageSnippet language="typescript" operationID="update_arbiter_metadata_api_v1_arbiters_metadata_patch" method="patch" path="/api/v1/arbiters/metadata" -->
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.arbiters.updateMetadata({
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
import { arbitersUpdateMetadata } from "modaic/funcs/arbiters-update-metadata.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await arbitersUpdateMetadata(modaicClient, {
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
    console.log("arbitersUpdateMetadata failed:", res.error);
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