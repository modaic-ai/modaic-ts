# GepaJobRequest

## Example Usage

```typescript
import { GepaJobRequest } from "modaic/models";

let value: GepaJobRequest = {
  arbiterRepo: "<value>",
};
```

## Fields

| Field                                         | Type                                          | Required                                      | Description                                   |
| --------------------------------------------- | --------------------------------------------- | --------------------------------------------- | --------------------------------------------- |
| `arbiterRepo`                                 | *string*                                      | :heavy_check_mark:                            | N/A                                           |
| `arbiterRevision`                             | *string*                                      | :heavy_minus_sign:                            | N/A                                           |
| `pushBranch`                                  | *string*                                      | :heavy_minus_sign:                            | N/A                                           |
| `pushTag`                                     | *string*                                      | :heavy_minus_sign:                            | N/A                                           |
| `gepaKwargs`                                  | [models.GepaKwargs](../models/gepa-kwargs.md) | :heavy_minus_sign:                            | N/A                                           |