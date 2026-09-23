import { expect, test } from "bun:test";
import { Transport } from "../src/transport.js";
import { ModaicAPIError, ModaicTimeoutError } from "../src/index.js";

test("timeout covers a stalled response body, not only headers", async () => {
  const transport = new Transport({ apiKey: "test", timeoutMs: 10,
    fetch: async (_url, init) => new Response(new ReadableStream({
      start(controller) {
        init?.signal?.addEventListener("abort", () => controller.error(new Error("aborted")), { once: true });
      },
    })),
  });
  await expect(transport.request("GET", "/models")).rejects.toBeInstanceOf(ModaicTimeoutError);
});

for (const scenario of ["pending", "conflict", "other_path", "no_key", "exhausted", "timeout", "success"]) {
  test(`decision replay retry: ${scenario}`, async () => {
    const requests: Request[] = [];
    const transport = new Transport({ apiKey: "test", timeoutMs: scenario === "timeout" ? 10 : 30_000,
      fetch: async (url, init) => {
        requests.push(new Request(url, init));
        if (scenario === "success" || (scenario === "pending" && requests.length === 3)) {
          return Response.json({ ok: true });
        }
        return Response.json({ code: scenario === "conflict" ? "idempotency_key_reused" : "decision_in_progress",
          requestId: "last-request", detail: "pending" }, { status: 409 });
      } });
    const pending = transport.request("POST", scenario === "other_path" ? "/models" : "/systemone", {
      body: { state: false }, headers: scenario === "no_key" ? {} : { "idempotency-key": "unchanged" },
    });
    if (scenario === "pending" || scenario === "success") await expect(pending).resolves.toEqual({ ok: true });
    else if (scenario === "timeout") await expect(pending).rejects.toBeInstanceOf(ModaicTimeoutError);
    else {
      await expect(pending).rejects.toBeInstanceOf(ModaicAPIError);
      await expect(pending).rejects.toMatchObject({ status: 409, requestId: "last-request" });
    }
    expect(requests.length).toBe(scenario === "pending" ? 3 : scenario === "exhausted" ? 6 : 1);
    const bodies = await Promise.all(requests.map((r) => r.text()));
    expect(new Set(bodies).size).toBe(1);
    expect(new Set(requests.map((r) => r.headers.get("idempotency-key"))).size).toBe(1);
  });
}
