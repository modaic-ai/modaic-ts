# AnnotateExampleRequest

Annotate an example with one or more prediction annotations.

## Example Usage

```typescript
import { AnnotateExampleRequest } from "modaic/models";

let value: AnnotateExampleRequest = {
  annotations: [],
};
```

## Fields

| Field                                                               | Type                                                                | Required                                                            | Description                                                         |
| ------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `annotations`                                                       | [models.PredictionAnnotation](../models/prediction-annotation.md)[] | :heavy_check_mark:                                                  | N/A                                                                 |