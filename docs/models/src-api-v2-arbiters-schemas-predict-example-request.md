# SrcApiV2ArbitersSchemasPredictExampleRequest

v2 single-arbiter, single-example prediction request.

Differs from v1 ``PredictExampleRequest`` (which takes a list of arbiters)
by accepting exactly one arbiter and putting ground-truth on the example
rather than on the arbiter entry.

## Example Usage

```typescript
import { SrcApiV2ArbitersSchemasPredictExampleRequest } from "modaic/models";

let value: SrcApiV2ArbitersSchemasPredictExampleRequest = {
  input: {
    "key": "<value>",
    "key1": "<value>",
    "key2": "<value>",
  },
  arbiterRepo: "<value>",
};
```

## Fields

| Field                 | Type                  | Required              | Description           |
| --------------------- | --------------------- | --------------------- | --------------------- |
| `input`               | Record<string, *any*> | :heavy_check_mark:    | N/A                   |
| `altId`               | *string*              | :heavy_minus_sign:    | N/A                   |
| `arbiterRepo`         | *string*              | :heavy_check_mark:    | N/A                   |
| `arbiterRevision`     | *string*              | :heavy_minus_sign:    | N/A                   |
| `groundTruth`         | Record<string, *any*> | :heavy_minus_sign:    | N/A                   |
| `groundReasoning`     | *string*              | :heavy_minus_sign:    | N/A                   |
| `computeConfidence`   | *boolean*             | :heavy_minus_sign:    | N/A                   |