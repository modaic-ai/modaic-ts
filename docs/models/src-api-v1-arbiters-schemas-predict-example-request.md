# SrcApiV1ArbitersSchemasPredictExampleRequest

## Example Usage

```typescript
import { SrcApiV1ArbitersSchemasPredictExampleRequest } from "modaic/models";

let value: SrcApiV1ArbitersSchemasPredictExampleRequest = {
  input: {
    "key": "<value>",
    "key1": "<value>",
  },
  arbiters: [],
};
```

## Fields

| Field                                                   | Type                                                    | Required                                                | Description                                             |
| ------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------- |
| `input`                                                 | Record<string, *any*>                                   | :heavy_check_mark:                                      | N/A                                                     |
| `altId`                                                 | *string*                                                | :heavy_minus_sign:                                      | N/A                                                     |
| `arbiters`                                              | [models.ArbiterRequest](../models/arbiter-request.md)[] | :heavy_check_mark:                                      | N/A                                                     |