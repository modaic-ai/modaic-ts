# ConfidenceStatusResponse

## Example Usage

```typescript
import { ConfidenceStatusResponse } from "modaic/models";

let value: ConfidenceStatusResponse = {
  status: "queued",
  predictionId: "<id>",
};
```

## Fields

| Field                                                                                   | Type                                                                                    | Required                                                                                | Description                                                                             |
| --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `status`                                                                                | [models.ConfidenceStatusResponseStatus](../models/confidence-status-response-status.md) | :heavy_check_mark:                                                                      | N/A                                                                                     |
| `predictionId`                                                                          | *string*                                                                                | :heavy_check_mark:                                                                      | N/A                                                                                     |
| `score`                                                                                 | *number*                                                                                | :heavy_minus_sign:                                                                      | N/A                                                                                     |
| `error`                                                                                 | *string*                                                                                | :heavy_minus_sign:                                                                      | N/A                                                                                     |