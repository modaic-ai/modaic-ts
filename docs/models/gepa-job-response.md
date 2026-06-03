# GepaJobResponse

## Example Usage

```typescript
import { GepaJobResponse } from "modaic/models";

let value: GepaJobResponse = {
  jobId: "<id>",
  status: "completed",
};
```

## Fields

| Field                                                                 | Type                                                                  | Required                                                              | Description                                                           |
| --------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `jobId`                                                               | *string*                                                              | :heavy_check_mark:                                                    | N/A                                                                   |
| `status`                                                              | [models.GepaJobResponseStatus](../models/gepa-job-response-status.md) | :heavy_check_mark:                                                    | N/A                                                                   |
| `message`                                                             | *string*                                                              | :heavy_minus_sign:                                                    | N/A                                                                   |
| `results`                                                             | Record<string, *any*>                                                 | :heavy_minus_sign:                                                    | N/A                                                                   |
| `phase`                                                               | [models.Phase](../models/phase.md)                                    | :heavy_minus_sign:                                                    | N/A                                                                   |
| `commitHash`                                                          | *string*                                                              | :heavy_minus_sign:                                                    | N/A                                                                   |