import { expect, spyOn, test } from "bun:test";

import { Modaic, ModaicAPIError, ModaicTimeoutError } from "../src/index.js";
import { JobProgress } from "../src/progress.js";
import type { Alignment, BatchDecision, JobStatus } from "../src/types.js";

function batch(status: JobStatus = "running"): BatchDecision {
  return {
    id: "batch-123", repositoryId: "model-1", status, phase: "deciding", branch: "main",
    sourceCommitSha: "sha", progress: { total: 5, completed: 2, failed: 1 },
    result: null, error: null, createdAt: "2026-09-23", updatedAt: "2026-09-23",
    startedAt: null, finishedAt: null,
  };
}

function alignment(status: JobStatus = "running"): Alignment {
  return { ...batch(status), phase: "optimizing", resultCommitSha: null,
    progress: { stage: "optimizing", metricCalls: 2, maxMetricCalls: 10 } };
}

test.each([true, false])("batch progress renders correctly with isTTY=%s", isTTY => {
  const writes: string[] = [];
  const display = new JobProgress(true, { isTTY, write: text => writes.push(text) });
  display.update(batch());
  display.update(batch());
  expect(writes).toHaveLength(1);
  expect(writes[0]).toContain("3/5 examples");
  expect(writes[0]).toContain("1 failed");
  display.update({ ...batch("completed"), progress: { total: 5, completed: 4, failed: 1 } });
  display.close();
  display.close();
  const output = writes.join("");
  expect(output).toContain("5/5 examples | completed");
  expect(output.endsWith("\n")).toBe(true);
  expect(output.includes("\r")).toBe(isTTY);
  expect(output).not.toContain("\x1b");
  expect(writes).toHaveLength(isTTY ? 3 : 2);
});

test("alignment shows stages and budget, not invented overall completion", () => {
  const writes: string[] = [];
  const display = new JobProgress(true, { write: text => writes.push(text) });
  display.update({ ...alignment("queued"), phase: "queued", progress: null });
  display.update({ ...alignment(), progress: { stage: "optimizing", metricCalls: 1 } });
  display.update(alignment("completed"));
  display.close();
  expect(writes[0]).toContain("queued");
  expect(writes[0]).not.toContain("NaN");
  expect(writes[1]).toContain("1 metric calls");
  expect(writes[2]).toContain("2/10 metric calls | completed");
  expect(writes[2]).not.toContain("10/10");
});

test("disabled progress never writes, including on errors", () => {
  const writes: string[] = [];
  const display = new JobProgress(false, { write: text => writes.push(text) });
  display.update(batch());
  display.close("wait timed out");
  expect(writes).toEqual([]);
});

test("closed streams do not break progress or hide job results", () => {
  const display = new JobProgress(true, { write: () => { throw new Error("closed"); } });
  expect(() => { display.update(batch()); display.close("wait interrupted"); }).not.toThrow();
});

for (const resource of ["batchDecisions", "alignments"] as const) {
  const factory = resource === "batchDecisions" ? batch : alignment;
  test.each(["completed", "failed", "cancelled"] as const)(`${resource} progress handles %s and does not change requests`, async status => {
    const states: JobStatus[] = ["queued", "running", status];
    const requests: Request[] = [];
    const modaic = new Modaic({ apiKey: "test-key", fetch: async (input, init) => {
      requests.push(new Request(input, init));
      return Response.json(factory(states.shift()));
    } });
    const writes: string[] = [];
    const spy = spyOn(process.stderr, "write").mockImplementation((text) => { writes.push(String(text)); return true; });
    try {
      const result = await modaic[resource].wait("job-1", { progress: true, pollIntervalMs: 0 });
      expect(result.status).toBe(status);
      expect(writes.join("")).toContain(status);
      expect(requests).toHaveLength(3);
      expect(requests.every(r => r.method === "GET" && !new URL(r.url).search && r.body === null)).toBe(true);
    } finally { spy.mockRestore(); }
  });

  test(`${resource} defaults to silent output`, async () => {
    const modaic = new Modaic({ apiKey: "test-key", fetch: async () => Response.json(factory("completed")) });
    const spy = spyOn(process.stderr, "write").mockImplementation(() => true);
    try {
      await modaic[resource].wait("job-1");
      expect(spy).not.toHaveBeenCalled();
    } finally { spy.mockRestore(); }
  });

  test.each(["timeout", "http"])(`${resource} cleans up progress on %s without cancelling job`, async failure => {
    let requests = 0;
    const modaic = new Modaic({ apiKey: "test-key", fetch: async () => {
      requests++;
      return requests === 1 ? Response.json(factory()) : Response.json({ detail: "Unavailable" }, { status: 503 });
    } });
    const writes: string[] = [];
    const spy = spyOn(process.stderr, "write").mockImplementation(text => { writes.push(String(text)); return true; });
    try {
      await expect(modaic[resource].wait("job-1", { progress: true, pollIntervalMs: 0, timeoutMs: failure === "timeout" ? 0 : 1000 }))
        .rejects.toBeInstanceOf(failure === "timeout" ? ModaicTimeoutError : ModaicAPIError);
      expect(writes.join("")).toContain(failure === "timeout" ? "wait timed out" : "wait interrupted");
      expect(writes.join("").endsWith("\n")).toBe(true);
      expect(requests).toBe(failure === "timeout" ? 1 : 2);
    } finally { spy.mockRestore(); }
  });
}
