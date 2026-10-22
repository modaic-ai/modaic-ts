import { createHash } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "bun:test";

import { Modaic } from "../src/index.js";
import type { ClientOptions } from "../src/index.js";

const JOB_ID = "9e3d5d17-a8db-4e61-b3c6-c8834f8faf12";
const UPLOAD_ID = "41fcc86c-7f49-4daa-a8b1-577db0c8fe76";
const MODEL_ID = "018f5f04-a793-7b21-a1f6-bc6b56789012";
const SHA = "a".repeat(64);
const COMMIT = "b".repeat(40);

function fineTuneJson() {
  return {
    id: JOB_ID,
    repositoryId: MODEL_ID,
    datasetId: "51fcc86c-7f49-4daa-a8b1-577db0c8fe76",
    training_file: "hard-labels",
    datasetCommitSha: COMMIT,
    datasetSha256: SHA,
    status: "done",
    branch: "main",
    sourceCommitSha: COMMIT,
    resultCommitSha: "c".repeat(40),
    training_type: "lora",
    preset: "mo131_lora_head_v1",
    progress: { step: 4 },
    result: {
      metrics: { loss: 0.1 },
      evaluation: null,
      servingQualification: null,
      publication: { commitSha: "c".repeat(40), branch: "main" },
    },
    error: null,
    createdAt: "2026-10-20T00:00:00Z",
    updatedAt: "2026-10-20T00:01:00Z",
    startedAt: "2026-10-20T00:00:01Z",
    finishedAt: "2026-10-20T00:01:00Z",
  };
}

function uploadJson(uploaded = false) {
  return {
    id: UPLOAD_ID,
    name: "hard-labels",
    description: null,
    kind: "dataset",
    sha256: SHA,
    sizeBytes: 4,
    repos: [],
    status: "pending",
    createdAt: "2026-10-20T00:00:00Z",
    expiresAt: "2026-10-21T00:00:00Z",
    partSizeBytes: 4,
    parts: uploaded
      ? [{
          partNumber: 1,
          sha256: createHash("sha256").update("data").digest("hex"),
          sizeBytes: 4,
          uploaded: true,
        }]
      : [],
    result: null,
    error: null,
  };
}

function setup(handler: (request: Request) => Response | Promise<Response>) {
  const requests: Request[] = [];
  const fetcher: NonNullable<ClientOptions["fetch"]> = async (input, init) => {
    const request = new Request(input, init);
    requests.push(request);
    return handler(request);
  };
  return {
    modaic: new Modaic({
      apiKey: "api-secret",
      baseUrl: "https://example.test/api/v1",
      fetch: fetcher,
    }),
    requests,
  };
}

describe("fine-tuning", () => {
  test("maps the complete training surface and job response", async () => {
    const { modaic, requests } = setup((request) => {
      const path = new URL(request.url).pathname;
      if (request.method === "POST") return Response.json(fineTuneJson(), { status: 202 });
      if (path.endsWith("/logs")) {
        return Response.json({ logs: ["trained"], available: true, running: false });
      }
      if (request.method === "DELETE") return new Response(null, { status: 204 });
      if (path.endsWith(JOB_ID)) return Response.json(fineTuneJson());
      return Response.json({ fineTunes: [fineTuneJson()] });
    });

    const created = await modaic.fineTunes.create({
      model: "mo-1.3.1",
      destination: "acme/color-model",
      trainingFile: "hard-labels",
      trainingType: "lora",
      nEpochs: 2,
      nEvals: 3,
      batchSize: "max",
      lrScheduler: { lrSchedulerType: "cosine" },
      earlyStoppingEnabled: true,
      earlyStoppingPatience: 1,
      validationFile: "validation",
      loraR: 8,
      loraAlpha: 16,
      loraDropout: 0.05,
      idempotencyKey: "fine-tune-123",
    });
    expect(created.trainingFile).toBe("hard-labels");
    expect(created.trainingType).toBe("lora");
    expect(created.result?.publication?.commitSha).toBe("c".repeat(40));

    const body = await requests[0]!.json();
    expect(body).toEqual({
      model: "mo-1.3.1",
      destination: "acme/color-model",
      training_file: "hard-labels",
      training_type: "lora",
      n_epochs: 2,
      n_evals: 3,
      batch_size: "max",
      lr_scheduler: { lr_scheduler_type: "cosine" },
      early_stopping_enabled: true,
      early_stopping_patience: 1,
      validation_file: "validation",
      lora_r: 8,
      lora_alpha: 16,
      lora_dropout: 0.05,
    });
    expect(requests[0]!.headers.get("idempotency-key")).toBe("fine-tune-123");

    expect((await modaic.fineTunes.list({ workspace: "acme", modelId: MODEL_ID })).fineTunes[0]!.id)
      .toBe(JOB_ID);
    expect(await modaic.fineTunes.get(JOB_ID)).toMatchObject({ status: "done" });
    expect((await modaic.fineTunes.logs(JOB_ID)).logs).toEqual(["trained"]);
    await modaic.fineTunes.cancel(JOB_ID);
    expect(new URL(requests[1]!.url).searchParams.get("modelId")).toBe(MODEL_ID);
  });
});

describe("knowledge-base uploads", () => {
  test("uploads a hashed part and never sends the API token to transfer hosts", async () => {
    const { modaic, requests } = setup((request) => {
      const url = new URL(request.url);
      if (url.host === "transfer.test") {
        expect(request.headers.get("authorization")).toBe("Bearer part-grant");
        return Response.json({ receipt: "part-receipt" });
      }
      if (url.host === "download.test") {
        expect(request.headers.get("authorization")).toBeNull();
        return new Response("resource-bytes");
      }
      if (url.pathname.endsWith("/parts")) {
        return Response.json({
          partNumber: 1,
          uploadUrl: "https://transfer.test/upload",
          method: "PUT",
          headers: { Authorization: "Bearer part-grant" },
          expiresIn: 300,
        }, { status: 201 });
      }
      if (url.pathname.endsWith("/parts/1")) {
        return Response.json(uploadJson(true));
      }
      if (url.pathname.endsWith("/content")) {
        return new Response(null, {
          status: 307,
          headers: { location: "https://download.test/object" },
        });
      }
      return Response.json(uploadJson(), { status: 201 });
    });

    const session = await modaic.knowledgeBase.uploads.create("acme", {
      kind: "dataset",
      sha256: SHA,
      sizeBytes: 4,
      name: "hard-labels",
    });
    const uploaded = await modaic.knowledgeBase.uploads.uploadPart(
      "acme",
      session.id,
      1,
      new TextEncoder().encode("data"),
    );
    expect(uploaded.parts[0]?.uploaded).toBe(true);
    expect(await modaic.knowledgeBase.resources.download("acme", "hard-labels"))
      .toEqual(new TextEncoder().encode("resource-bytes"));

    const apiRequests = requests.filter((request) => new URL(request.url).host === "example.test");
    expect(apiRequests.every((request) => request.headers.get("authorization") === "Bearer api-secret"))
      .toBe(true);
    expect(await requests[1]!.json()).toEqual({
      partNumber: 1,
      sha256: createHash("sha256").update("data").digest("hex"),
      sizeBytes: 4,
    });
    expect(await requests[3]!.json()).toEqual({ receipt: "part-receipt" });
  });

  test("uploads a path in server-sized parts, completes, and waits for validation", async () => {
    const directory = await mkdtemp(join(tmpdir(), "modaic-upload-"));
    const path = join(directory, "training.jsonl");
    const payload = new TextEncoder().encode("abcdefghij");
    await writeFile(path, payload);
    const transfers: Uint8Array[] = [];
    const progress: number[] = [];

    const session = (status: string) => ({
      ...uploadJson(),
      sha256: createHash("sha256").update(payload).digest("hex"),
      sizeBytes: payload.byteLength,
      partSizeBytes: 4,
      status,
    });
    const { modaic, requests } = setup(async (request) => {
      const url = new URL(request.url);
      if (url.host === "transfer.test") {
        expect(request.headers.get("authorization")).toBe("Bearer part-grant");
        transfers.push(new Uint8Array(await request.arrayBuffer()));
        return Response.json({ receipt: `receipt-${transfers.length}` });
      }
      if (url.pathname.endsWith("/parts")) {
        const body = await request.json() as { partNumber: number };
        return Response.json({
          partNumber: body.partNumber,
          uploadUrl: `https://transfer.test/${body.partNumber}`,
          method: "PUT",
          headers: { Authorization: "Bearer part-grant" },
          expiresIn: 300,
        }, { status: 201 });
      }
      if (url.pathname.includes("/parts/")) return Response.json(session("pending"));
      if (url.pathname.endsWith("/complete")) {
        return Response.json(session("processing"), { status: 202 });
      }
      if (request.method === "GET") return Response.json(session("completed"));
      return Response.json(session("pending"), { status: 201 });
    });

    try {
      const result = await modaic.knowledgeBase.uploads.uploadFile(path, {
        workspace: "acme",
        kind: "dataset",
        name: "hard-labels",
        pollIntervalMs: 0,
        onProgress: ({ uploadedBytes }) => progress.push(uploadedBytes),
      });
      expect(result.status).toBe("completed");
      expect(transfers.map((part) => new TextDecoder().decode(part)))
        .toEqual(["abcd", "efgh", "ij"]);
      expect(progress).toEqual([0, 4, 8, 10]);
      const createBody = await requests[0]!.json() as { sha256: string; sizeBytes: number };
      expect(createBody.sha256).toBe(createHash("sha256").update(payload).digest("hex"));
      expect(createBody.sizeBytes).toBe(10);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});
