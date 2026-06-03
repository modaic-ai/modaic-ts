# ListExamplesApiV1ExamplesGetRequest

## Example Usage

```typescript
import { ListExamplesApiV1ExamplesGetRequest } from "modaic/models/operations";

let value: ListExamplesApiV1ExamplesGetRequest = {
  user: "Aaron.Abbott74",
  program: "<value>",
};
```

## Fields

| Field                                                                | Type                                                                 | Required                                                             | Description                                                          |
| -------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `user`                                                               | *string*                                                             | :heavy_check_mark:                                                   | N/A                                                                  |
| `program`                                                            | *string*                                                             | :heavy_check_mark:                                                   | N/A                                                                  |
| `page`                                                               | *number*                                                             | :heavy_minus_sign:                                                   | N/A                                                                  |
| `pageSize`                                                           | *number*                                                             | :heavy_minus_sign:                                                   | N/A                                                                  |
| `version`                                                            | *number*                                                             | :heavy_minus_sign:                                                   | N/A                                                                  |
| `commitHash`                                                         | *string*                                                             | :heavy_minus_sign:                                                   | N/A                                                                  |
| `commitHashes`                                                       | *string*                                                             | :heavy_minus_sign:                                                   | Comma-separated arbiter hashes to filter by                          |
| `search`                                                             | *string*                                                             | :heavy_minus_sign:                                                   | Search across input, output, and ground_truth                        |
| `sortBy`                                                             | *string*                                                             | :heavy_minus_sign:                                                   | Column to sort by (output, ground_truth, confidence, version, input) |
| `sortOrder`                                                          | *string*                                                             | :heavy_minus_sign:                                                   | Sort direction: asc or desc                                          |
| `maxConfidence`                                                      | *number*                                                             | :heavy_minus_sign:                                                   | Only return predictions with confidence below this value             |
| `searchMode`                                                         | [operations.SearchMode](../../models/operations/search-mode.md)      | :heavy_minus_sign:                                                   | Search mode: keyword or semantic                                     |
| `hideGraded`                                                         | *boolean*                                                            | :heavy_minus_sign:                                                   | Hide examples that already have ground truth                         |