# PaginatedPage

## Example Usage

```typescript
import { PaginatedPage } from "modaic/models";

let value: PaginatedPage = {
  items: [],
  total: 737291,
  unfilteredTotal: 304119,
  page: 407014,
  pageSize: 766181,
  totalPages: 997476,
};
```

## Fields

| Field                                                       | Type                                                        | Required                                                    | Description                                                 |
| ----------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------- |
| `items`                                                     | [models.PredictedExample](../models/predicted-example.md)[] | :heavy_check_mark:                                          | N/A                                                         |
| `total`                                                     | *number*                                                    | :heavy_check_mark:                                          | N/A                                                         |
| `unfilteredTotal`                                           | *number*                                                    | :heavy_check_mark:                                          | N/A                                                         |
| `page`                                                      | *number*                                                    | :heavy_check_mark:                                          | N/A                                                         |
| `pageSize`                                                  | *number*                                                    | :heavy_check_mark:                                          | N/A                                                         |
| `totalPages`                                                | *number*                                                    | :heavy_check_mark:                                          | N/A                                                         |