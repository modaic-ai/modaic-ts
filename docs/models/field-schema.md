# FieldSchema

## Example Usage

```typescript
import { FieldSchema } from "modaic/models";

let value: FieldSchema = {
  name: "<value>",
  type: "<value>",
};
```

## Fields

| Field                 | Type                  | Required              | Description           |
| --------------------- | --------------------- | --------------------- | --------------------- |
| `name`                | *string*              | :heavy_check_mark:    | N/A                   |
| `type`                | *string*              | :heavy_check_mark:    | N/A                   |
| `allowedValues`       | *any*[]               | :heavy_minus_sign:    | N/A                   |
| `objectSchema`        | Record<string, *any*> | :heavy_minus_sign:    | N/A                   |
| `nullable`            | *boolean*             | :heavy_minus_sign:    | N/A                   |
| `description`         | *string*              | :heavy_minus_sign:    | N/A                   |