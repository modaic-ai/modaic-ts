import { expect, test } from "bun:test";

import { Modaic, ModaicAPIError, ModaicConnectionError, ModaicTimeoutError } from "../src/index.js";

test.each([502, 503])("non-JSON HTTP %i retains status and request ID", async status => {
  const modaic = new Modaic({ apiKey: "test-key", fetch: async () => new Response("Bad gateway", {
    status, headers: { "x-request-id": "gateway-123" },
  }) });
  await expect(modaic.models.list()).rejects.toMatchObject({
    name: "ModaicAPIError", status, requestId: "gateway-123", body: "Bad gateway",
  });
});

test("nested API errors preserve code, body request ID, and details", async () => {
  const body = { error: { code: "conflict", message: "Branch advanced" }, requestId: "body-id", details: { branch: "main" } };
  const modaic = new Modaic({ apiKey: "test-key", fetch: async () => Response.json(body, {
    status: 409, headers: { "x-request-id": "header-id" },
  }) });
  await expect(modaic.models.list()).rejects.toMatchObject({
    name: "ModaicAPIError", status: 409, code: "conflict", message: "Branch advanced",
    requestId: "body-id", details: body.details, body,
  });
});

test("empty HTTP error still exposes its status", async () => {
  const modaic = new Modaic({ apiKey: "test-key", fetch: async () => new Response(null, { status: 403 }) });
  await expect(modaic.models.list()).rejects.toBeInstanceOf(ModaicAPIError);
});

test("invalid JSON on successful HTTP response is a connection error", async () => {
  const modaic = new Modaic({ apiKey: "test-key", fetch: async () => new Response("not json") });
  await expect(modaic.models.list()).rejects.toBeInstanceOf(ModaicConnectionError);
});

test("network failures retain their cause and are not retried", async () => {
  let requests = 0;
  const cause = new TypeError("connection failed");
  const modaic = new Modaic({ apiKey: "test-key", fetch: async () => { requests++; throw cause; } });
  await expect(modaic.models.list()).rejects.toMatchObject({ name: "ModaicConnectionError", cause });
  expect(requests).toBe(1);
});

test("request timeout aborts fetch and is not retried", async () => {
  let requests = 0;
  const modaic = new Modaic({ apiKey: "test-key", timeoutMs: 1, fetch: async (_input, init) => {
    requests++;
    return new Promise<Response>((_resolve, reject) => {
      init!.signal!.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")), { once: true });
    });
  } });
  await expect(modaic.models.list()).rejects.toBeInstanceOf(ModaicTimeoutError);
  expect(requests).toBe(1);
});

test("custom base URL, trailing slash, and headers apply to bound resources", async () => {
  const requests: Request[] = [];
  const modaic = new Modaic({ apiKey: "test-key", baseUrl: "https://example.test/v1/", fetch: async (input, init) => {
    const request = new Request(input, init);
    requests.push(request);
    if (request.method === "POST") return Response.json({ id: "model-1", workspace: "acme", slug: "support" });
    return Response.json({ items: [], page: 1, pageSize: 30, total: 0, totalPages: 0 });
  } });
  const model = await modaic.models.create({ workspace: "acme", slug: "support" });
  await model.examples.list();
  expect(requests[0]!.url).toBe("https://example.test/v1/models");
  expect(requests[1]!.url).toBe("https://example.test/v1/models/model-1/examples?page=1&pageSize=30");
  for (const request of requests) {
    expect(request.headers.get("authorization")).toBe("Bearer test-key");
    expect(request.headers.get("accept")).toBe("application/json");
  }
  expect(requests[0]!.headers.get("content-type")).toBe("application/json");
  expect(requests[1]!.body).toBeNull();
  expect(requests[1]!.headers.has("content-type")).toBe(false);
});

test("204 responses support model deletion and job cancellation", async () => {
  const requests: Request[] = [];
  const modaic = new Modaic({ apiKey: "test-key", fetch: async (input, init) => {
    requests.push(new Request(input, init));
    return new Response(null, { status: 204 });
  } });
  expect(await modaic.models.delete("model-1")).toBeUndefined();
  expect(await modaic.alignments.cancel("job-1")).toBeUndefined();
  expect(await modaic.batchDecisions.cancel("job-2")).toBeUndefined();
  expect(requests).toHaveLength(3);
  expect(requests.every(r => r.method === "DELETE")).toBe(true);
});
