import { expect, test } from "bun:test";

import { Modaic } from "../src/index.js";

const JOB_ID = "9e3d5d17-a8db-4e61-b3c6-c8834f8faf12";

test("Protégé lifecycle uses the public contract", async () => {
  const requests: Request[] = [];
  const client = new Modaic({
    apiKey: "test-key",
    baseUrl: "https://example.test/api/v1",
    fetch: async (input, init) => {
      const request = new Request(input, init);
      requests.push(request);
      return Response.json({
        id: JOB_ID,
        status: request.method === "POST" ? "running" : "cancelled",
      }, { status: request.method === "POST" ? 201 : 200 });
    },
  });

  const created = await client.protege.create({
    prompt: "Improve the model",
    repo: "acme/support",
    evalOnlyDataset: "heldout",
  });
  expect(created.status).toBe("running");
  expect(await requests[0]!.json()).toEqual({
    prompt: "Improve the model",
    repo: "acme/support",
    eval_only_dataset: "heldout",
  });
  expect((await client.protege.cancel(created.id)).status).toBe("cancelled");
  expect(new URL(requests[1]!.url).pathname).toBe(`/api/v1/protege/${JOB_ID}`);
});
