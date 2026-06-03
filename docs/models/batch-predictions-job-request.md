# BatchPredictionsJobRequest

Request body for ``POST /api/v1/jobs/batch/predictions``.

Either ``examples`` or ``example_ids`` must be set, not both. The
``example_ids`` path re-predicts existing examples (by their ClickHouse
ids) instead of ingesting brand-new ones; predictions are inserted as new
versions on the existing example rows.

## Example Usage

```typescript
import { BatchPredictionsJobRequest } from "modaic/models";

let value: BatchPredictionsJobRequest = {
  arbiters: [],
};
```

## Fields

| Field                                               | Type                                                | Required                                            | Description                                         |
| --------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------- |
| `arbiters`                                          | [models.BatchArbiter](../models/batch-arbiter.md)[] | :heavy_check_mark:                                  | N/A                                                 |
| `examples`                                          | [models.BatchExample](../models/batch-example.md)[] | :heavy_minus_sign:                                  | N/A                                                 |
| `exampleIds`                                        | *string*[]                                          | :heavy_minus_sign:                                  | N/A                                                 |
| `computeConfidence`                                 | *boolean*                                           | :heavy_minus_sign:                                  | N/A                                                 |