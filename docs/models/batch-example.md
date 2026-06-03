# BatchExample

One row in a batch predictions request.

Split contract (mirrors `examples/schemas.py::PredictedExample`):
only `"train"` and `"test"` are valid downstream — `"none"` exists
purely as the storage marker for unannotated rows. Callers MUST NOT
send `"none"` explicitly; omit `split` instead and let `get_split`
randomly assign train/test (80/20) when `ground_truth` is provided.
Without that auto-assignment, annotated batch rows would land in
ClickHouse with `split='none'` and be skipped by every downstream
consumer (GEPA, scoring, dataset export).

## Example Usage

```typescript
import { BatchExample } from "modaic/models";

let value: BatchExample = {
  input: {},
};
```

## Fields

| Field                                                        | Type                                                         | Required                                                     | Description                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `input`                                                      | Record<string, *any*>                                        | :heavy_check_mark:                                           | N/A                                                          |
| `altId`                                                      | *string*                                                     | :heavy_minus_sign:                                           | N/A                                                          |
| `groundTruth`                                                | Record<string, *any*>                                        | :heavy_minus_sign:                                           | N/A                                                          |
| `groundReasoning`                                            | *string*                                                     | :heavy_minus_sign:                                           | N/A                                                          |
| `split`                                                      | [models.BatchExampleSplit](../models/batch-example-split.md) | :heavy_minus_sign:                                           | N/A                                                          |