# ChatCompletionChoice

## Example Usage

```typescript
import { ChatCompletionChoice } from "modaic/models";

let value: ChatCompletionChoice = {
  index: 741605,
  message: {
    role: "<value>",
    content: "<value>",
  },
};
```

## Fields

| Field                                           | Type                                            | Required                                        | Description                                     |
| ----------------------------------------------- | ----------------------------------------------- | ----------------------------------------------- | ----------------------------------------------- |
| `index`                                         | *number*                                        | :heavy_check_mark:                              | N/A                                             |
| `message`                                       | [models.ChatMessage](../models/chat-message.md) | :heavy_check_mark:                              | N/A                                             |
| `finishReason`                                  | *string*                                        | :heavy_minus_sign:                              | N/A                                             |