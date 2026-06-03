# ExportExamplesResponse

A presigned parquet download for exported examples.

## Example Usage

```typescript
import { ExportExamplesResponse } from "modaic/models";

let value: ExportExamplesResponse = {
  downloadUrl: "https://triangular-footrest.name",
  fileKey: "<value>",
  fileName: "example.file",
  expiresIn: 704959,
  rowCount: 969396,
};
```

## Fields

| Field              | Type               | Required           | Description        |
| ------------------ | ------------------ | ------------------ | ------------------ |
| `downloadUrl`      | *string*           | :heavy_check_mark: | N/A                |
| `fileKey`          | *string*           | :heavy_check_mark: | N/A                |
| `fileName`         | *string*           | :heavy_check_mark: | N/A                |
| `expiresIn`        | *number*           | :heavy_check_mark: | N/A                |
| `rowCount`         | *number*           | :heavy_check_mark: | N/A                |