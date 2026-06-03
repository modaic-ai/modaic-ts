# PredictExampleResponse

## Example Usage

```typescript
import { PredictExampleResponse } from "modaic/models";

let value: PredictExampleResponse = {
  exampleId: "<id>",
  predictionId: "<id>",
};
```

## Fields

| Field                   | Type                    | Required                | Description             |
| ----------------------- | ----------------------- | ----------------------- | ----------------------- |
| `exampleId`             | *string*                | :heavy_check_mark:      | N/A                     |
| `predictionId`          | *string*                | :heavy_check_mark:      | N/A                     |
| `output`                | Record<string, *any*>   | :heavy_minus_sign:      | N/A                     |
| `reasoning`             | *string*                | :heavy_minus_sign:      | N/A                     |
| `messages`              | Record<string, *any*>[] | :heavy_minus_sign:      | N/A                     |