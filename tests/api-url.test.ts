import { expect, test } from "bun:test";
import { Modaic } from "../src/index.js";

test.each([
  [undefined, undefined, "https://modaic.dev/api/v1"],
  [undefined, "https://env.example/v1/", "https://env.example/v1"],
  ["https://option.example/api/v1///", undefined, "https://option.example/api/v1"],
  ["https://option.example/v1", "https://env.example/v1", "https://option.example/v1"],
  [undefined, "", "https://modaic.dev/api/v1"],
  ["", "https://env.example/v1", "https://env.example/v1"],
])("API URL option=%s environment=%s", async (option, envUrl, expected) => {
  const previous = process.env.MODAIC_API_URL;
  try {
    if (envUrl === undefined) delete process.env.MODAIC_API_URL;
    else process.env.MODAIC_API_URL = envUrl;
    const requests: string[] = [];
    const client = new Modaic({ apiKey: "test", ...(option === undefined ? {} : { baseUrl: option }),
      fetch: async (input) => {
        requests.push(String(input));
        return Response.json({ models: [] });
      },
    });
    await client.models.list();
    expect(requests).toEqual([`${expected}/models`]);
  } finally {
    if (previous === undefined) delete process.env.MODAIC_API_URL;
    else process.env.MODAIC_API_URL = previous;
  }
});
