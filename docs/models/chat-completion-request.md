# ChatCompletionRequest

## Example Usage

```typescript
import { ChatCompletionRequest } from "modaic/models";

let value: ChatCompletionRequest = {
  model: "Cruze",
  messages: [],
};
```

## Fields

| Field                                             | Type                                              | Required                                          | Description                                       |
| ------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------- |
| `model`                                           | *string*                                          | :heavy_check_mark:                                | N/A                                               |
| `messages`                                        | [models.ChatMessage](../models/chat-message.md)[] | :heavy_check_mark:                                | N/A                                               |
| `temperature`                                     | *number*                                          | :heavy_minus_sign:                                | N/A                                               |
| `topP`                                            | *number*                                          | :heavy_minus_sign:                                | N/A                                               |
| `n`                                               | *number*                                          | :heavy_minus_sign:                                | N/A                                               |
| `stream`                                          | *boolean*                                         | :heavy_minus_sign:                                | N/A                                               |
| `stop`                                            | *models.Stop*                                     | :heavy_minus_sign:                                | N/A                                               |
| `maxTokens`                                       | *number*                                          | :heavy_minus_sign:                                | N/A                                               |
| `presencePenalty`                                 | *number*                                          | :heavy_minus_sign:                                | N/A                                               |
| `frequencyPenalty`                                | *number*                                          | :heavy_minus_sign:                                | N/A                                               |
| `logitBias`                                       | Record<string, *number*>                          | :heavy_minus_sign:                                | N/A                                               |
| `user`                                            | *string*                                          | :heavy_minus_sign:                                | N/A                                               |