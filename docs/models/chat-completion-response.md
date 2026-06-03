# ChatCompletionResponse

## Example Usage

```typescript
import { ChatCompletionResponse } from "modaic/models";

let value: ChatCompletionResponse = {
  model: "Altima",
  choices: [
    {
      index: 558818,
      message: {
        role: "<value>",
        content: "<value>",
      },
    },
  ],
  usage: {
    promptTokens: 168168,
    completionTokens: 119907,
    totalTokens: 935321,
  },
};
```

## Fields

| Field                                                                | Type                                                                 | Required                                                             | Description                                                          |
| -------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `id`                                                                 | *string*                                                             | :heavy_minus_sign:                                                   | N/A                                                                  |
| `object`                                                             | *string*                                                             | :heavy_minus_sign:                                                   | N/A                                                                  |
| `created`                                                            | *number*                                                             | :heavy_minus_sign:                                                   | N/A                                                                  |
| `model`                                                              | *string*                                                             | :heavy_check_mark:                                                   | N/A                                                                  |
| `choices`                                                            | [models.ChatCompletionChoice](../models/chat-completion-choice.md)[] | :heavy_check_mark:                                                   | N/A                                                                  |
| `usage`                                                              | [models.CompletionUsage](../models/completion-usage.md)              | :heavy_check_mark:                                                   | N/A                                                                  |
| `systemFingerprint`                                                  | *string*                                                             | :heavy_minus_sign:                                                   | N/A                                                                  |