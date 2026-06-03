# UpdateArbiterMetadataRequest

## Example Usage

```typescript
import { UpdateArbiterMetadataRequest } from "modaic/models";

let value: UpdateArbiterMetadataRequest = {
  repo: "<value>",
  metadata: {
    "key": "<value>",
    "key1": "<value>",
  },
};
```

## Fields

| Field                 | Type                  | Required              | Description           |
| --------------------- | --------------------- | --------------------- | --------------------- |
| `repo`                | *string*              | :heavy_check_mark:    | N/A                   |
| `metadata`            | Record<string, *any*> | :heavy_check_mark:    | N/A                   |