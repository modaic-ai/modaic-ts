# InitArbiterRequest

## Example Usage

```typescript
import { InitArbiterRequest } from "modaic/models";

let value: InitArbiterRequest = {
  repo: "<value>",
  inputs: [
    {
      name: "<value>",
      type: "<value>",
    },
  ],
  outputs: [],
};
```

## Fields

| Field                                             | Type                                              | Required                                          | Description                                       |
| ------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------- |
| `repo`                                            | *string*                                          | :heavy_check_mark:                                | N/A                                               |
| `inputs`                                          | [models.FieldSchema](../models/field-schema.md)[] | :heavy_check_mark:                                | N/A                                               |
| `outputs`                                         | [models.FieldSchema](../models/field-schema.md)[] | :heavy_check_mark:                                | N/A                                               |
| `instructions`                                    | *string*                                          | :heavy_minus_sign:                                | N/A                                               |
| `model`                                           | *string*                                          | :heavy_minus_sign:                                | N/A                                               |
| `baseUrl`                                         | *string*                                          | :heavy_minus_sign:                                | N/A                                               |