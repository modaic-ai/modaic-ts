<!-- Start SDK Example Usage [usage] -->
```typescript
import { ModaicClient } from "modaic";

const modaicClient = new ModaicClient({
  token: process.env["MODAIC_TOKEN"] ?? "",
});

async function run() {
  const result = await modaicClient.chat.createCompletion();

  console.log(result);
}

run();

```
<!-- End SDK Example Usage [usage] -->