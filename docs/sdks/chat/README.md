# Chat

## Overview

### Available Operations

* [createCompletion](#createcompletion) - Create Chat Completion

## createCompletion

Create Chat Completion

### Example Usage

<!-- UsageSnippet language="typescript" operationID="create_chat_completion_api_v1_chat_completions_post" method="post" path="/api/v1/chat/completions" -->
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

### Standalone function

The standalone function version of this method:

```typescript
import { ModaicClientCore } from "modaic/core.js";
import { chatCreateCompletion } from "modaic/funcs/chat-create-completion.js";

// Use `ModaicClientCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const modaicClient = new ModaicClientCore({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const res = await chatCreateCompletion(modaicClient);
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("chatCreateCompletion failed:", res.error);
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