# GetConfidenceRequest

## Example Usage

```typescript
import { GetConfidenceRequest } from "modaic/models";

let value: GetConfidenceRequest = {
  arbiterRepo: "<value>",
  messages: [
    {
      "key": "<value>",
      "key1": "<value>",
      "key2": "<value>",
    },
  ],
};
```

## Fields

| Field                   | Type                    | Required                | Description             |
| ----------------------- | ----------------------- | ----------------------- | ----------------------- |
| `arbiterRepo`           | *string*                | :heavy_check_mark:      | N/A                     |
| `predictionId`          | *string*                | :heavy_minus_sign:      | N/A                     |
| `messages`              | Record<string, *any*>[] | :heavy_check_mark:      | N/A                     |