# DispatchPredictionRequest

Request to dispatch a prediction to multiple arbiters. Will get the prediction then send it to a backend of choice.
Args:
    input: The input to the prediction.
    arbiters_map: A map of score names to arbiter requests.

## Example Usage

```typescript
import { DispatchPredictionRequest } from "modaic/models";

let value: DispatchPredictionRequest = {
  input: {
    "key": "<value>",
    "key1": "<value>",
    "key2": "<value>",
  },
  arbitersMap: {},
  altId: "<id>",
};
```

## Fields

| Field                                                                 | Type                                                                  | Required                                                              | Description                                                           |
| --------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `input`                                                               | Record<string, *any*>                                                 | :heavy_check_mark:                                                    | N/A                                                                   |
| `arbitersMap`                                                         | Record<string, [models.ArbiterRequest](../models/arbiter-request.md)> | :heavy_check_mark:                                                    | N/A                                                                   |
| `altId`                                                               | *string*                                                              | :heavy_check_mark:                                                    | N/A                                                                   |