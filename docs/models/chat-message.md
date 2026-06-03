# ChatMessage

## Example Usage

```typescript
import { ChatMessage } from "modaic/models";

let value: ChatMessage = {
  role: "<value>",
  content: "<value>",
};
```

## Fields

| Field                   | Type                    | Required                | Description             |
| ----------------------- | ----------------------- | ----------------------- | ----------------------- |
| `role`                  | *string*                | :heavy_check_mark:      | N/A                     |
| `content`               | *string*                | :heavy_check_mark:      | N/A                     |
| `name`                  | *string*                | :heavy_minus_sign:      | N/A                     |
| `toolCalls`             | Record<string, *any*>[] | :heavy_minus_sign:      | N/A                     |