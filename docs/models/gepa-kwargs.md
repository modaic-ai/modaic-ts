# GepaKwargs

## Example Usage

```typescript
import { GepaKwargs } from "modaic/models";

let value: GepaKwargs = {};
```

## Fields

| Field                                                                          | Type                                                                           | Required                                                                       | Description                                                                    |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `auto`                                                                         | [models.Auto](../models/auto.md)                                               | :heavy_minus_sign:                                                             | N/A                                                                            |
| `maxFullEvals`                                                                 | *number*                                                                       | :heavy_minus_sign:                                                             | N/A                                                                            |
| `maxMetricCalls`                                                               | *number*                                                                       | :heavy_minus_sign:                                                             | N/A                                                                            |
| `reflectionMinibatchSize`                                                      | *number*                                                                       | :heavy_minus_sign:                                                             | N/A                                                                            |
| `candidateSelectionStrategy`                                                   | [models.CandidateSelectionStrategy](../models/candidate-selection-strategy.md) | :heavy_minus_sign:                                                             | N/A                                                                            |
| `reflectionLm`                                                                 | [models.Lm](../models/lm.md)                                                   | :heavy_minus_sign:                                                             | N/A                                                                            |
| `skipPerfectScore`                                                             | *boolean*                                                                      | :heavy_minus_sign:                                                             | N/A                                                                            |
| `addFormatFailureAsFeedback`                                                   | *boolean*                                                                      | :heavy_minus_sign:                                                             | N/A                                                                            |
| `componentSelector`                                                            | [models.ComponentSelector](../models/component-selector.md)                    | :heavy_minus_sign:                                                             | N/A                                                                            |
| `useMerge`                                                                     | *boolean*                                                                      | :heavy_minus_sign:                                                             | N/A                                                                            |
| `maxMergeInvocations`                                                          | *number*                                                                       | :heavy_minus_sign:                                                             | N/A                                                                            |
| `seed`                                                                         | *number*                                                                       | :heavy_minus_sign:                                                             | N/A                                                                            |
| `gepaKwargs`                                                                   | Record<string, *any*>                                                          | :heavy_minus_sign:                                                             | N/A                                                                            |