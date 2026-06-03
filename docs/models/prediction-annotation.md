# PredictionAnnotation

A single annotation for a specific arbiter's prediction.

## Example Usage

```typescript
import { PredictionAnnotation } from "modaic/models";

let value: PredictionAnnotation = {
  arbiterRepo: "<value>",
};
```

## Fields

| Field              | Type               | Required           | Description        |
| ------------------ | ------------------ | ------------------ | ------------------ |
| `arbiterRepo`      | *string*           | :heavy_check_mark: | N/A                |
| `groundTruth`      | *string*           | :heavy_minus_sign: | N/A                |
| `groundReasoning`  | *string*           | :heavy_minus_sign: | N/A                |