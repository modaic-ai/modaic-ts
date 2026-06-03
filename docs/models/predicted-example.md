# PredictedExample

A predicted example from a arbiter.
Used for both ingestion (POST) and retrieval (GET) of examples.

Split contract: `"none"` is the ClickHouse marker for unannotated
rows. Callers MUST NOT send `"none"` explicitly — omit `split` and
let `get_split` decide. When `ground_truth` is set, `get_split`
randomly assigns train/test (80/20); when it isn't, split is forced
to `"none"`. Downstream consumers (GEPA, scoring, dataset export)
filter on `split in ('train','test')`, so a row stuck at `"none"`
is invisible to them. The same rule lives on
`jobs/schemas.py::BatchExample`; if you change one, change the other.

## Example Usage

```typescript
import { PredictedExample } from "modaic/models";

let value: PredictedExample = {
  arbiterRepo: "<value>",
};
```

## Fields

| Field                                                                                         | Type                                                                                          | Required                                                                                      | Description                                                                                   |
| --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `id`                                                                                          | *string*                                                                                      | :heavy_minus_sign:                                                                            | N/A                                                                                           |
| `altId`                                                                                       | *string*                                                                                      | :heavy_minus_sign:                                                                            | N/A                                                                                           |
| `arbiterRepo`                                                                                 | *string*                                                                                      | :heavy_check_mark:                                                                            | N/A                                                                                           |
| `arbiterHash`                                                                                 | *string*                                                                                      | :heavy_minus_sign:                                                                            | N/A                                                                                           |
| `input`                                                                                       | *models.Input*                                                                                | :heavy_minus_sign:                                                                            | N/A                                                                                           |
| `groundTruth`                                                                                 | *string*                                                                                      | :heavy_minus_sign:                                                                            | N/A                                                                                           |
| `groundReasoning`                                                                             | *string*                                                                                      | :heavy_minus_sign:                                                                            | N/A                                                                                           |
| `messages`                                                                                    | Record<string, *any*>[]                                                                       | :heavy_minus_sign:                                                                            | N/A                                                                                           |
| `serializedOutput`                                                                            | *string*                                                                                      | :heavy_minus_sign:                                                                            | N/A                                                                                           |
| `reasoning`                                                                                   | *string*                                                                                      | :heavy_minus_sign:                                                                            | N/A                                                                                           |
| `error`                                                                                       | *string*                                                                                      | :heavy_minus_sign:                                                                            | N/A                                                                                           |
| `split`                                                                                       | [models.PredictedExampleSplit](../models/predicted-example-split.md)                          | :heavy_minus_sign:                                                                            | N/A                                                                                           |
| `version`                                                                                     | *number*                                                                                      | :heavy_minus_sign:                                                                            | N/A                                                                                           |
| `predictionTimestamp`                                                                         | [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) | :heavy_minus_sign:                                                                            | N/A                                                                                           |
| `confidence`                                                                                  | *number*                                                                                      | :heavy_minus_sign:                                                                            | N/A                                                                                           |