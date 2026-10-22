import { ModaicConnectionError, ModaicTimeoutError } from "./errors.js";
import { segment, Transport } from "./transport.js";
import type {
  CreateFineTuneParams,
  CreateKnowledgeBaseUploadParams,
  FineTune,
  FineTuneList,
  FineTuneLogs,
  KnowledgeBaseQuery,
  KnowledgeBaseResource,
  KnowledgeBaseResourcePage,
  KnowledgeBaseUpload,
  PreparedUploadPart,
  ResourceKind,
  TrainingControls,
  UploadFileParams,
} from "./types.js";

const UPLOAD_TERMINAL = new Set(["completed", "failed", "cancelled", "expired"]);
const HASH_BUFFER_BYTES = 8 * 1024 * 1024;

interface WireFineTune extends Omit<FineTune, "trainingFile" | "trainingType"> {
  training_file: string;
  training_type: FineTune["trainingType"];
}

function mapFineTune(value: WireFineTune): FineTune {
  const { training_file, training_type, ...rest } = value;
  return { ...rest, trainingFile: training_file, trainingType: training_type };
}

function controlsBody(params: TrainingControls): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  const keys: [keyof TrainingControls, string][] = [
    ["maxSeqLength", "max_seq_length"],
    ["nEpochs", "n_epochs"],
    ["nCheckpoints", "n_checkpoints"],
    ["nEvals", "n_evals"],
    ["batchSize", "batch_size"],
    ["gradientAccumulationSteps", "gradient_accumulation_steps"],
    ["learningRate", "learning_rate"],
    ["warmupRatio", "warmup_ratio"],
    ["maxGradNorm", "max_grad_norm"],
    ["weightDecay", "weight_decay"],
    ["randomSeed", "random_seed"],
    ["earlyStoppingEnabled", "early_stopping_enabled"],
    ["earlyStoppingPatience", "early_stopping_patience"],
    ["earlyStoppingMinDelta", "early_stopping_min_delta"],
    ["earlyStoppingWarmupEvals", "early_stopping_warmup_evals"],
  ];
  for (const [source, target] of keys) {
    if (params[source] !== undefined) body[target] = params[source];
  }
  if (params.lrScheduler !== undefined) {
    body.lr_scheduler = {
      ...(params.lrScheduler.lrSchedulerType === undefined
        ? {}
        : { lr_scheduler_type: params.lrScheduler.lrSchedulerType }),
      ...(params.lrScheduler.lrSchedulerArgs === undefined
        ? {}
        : {
            lr_scheduler_args: {
              ...(params.lrScheduler.lrSchedulerArgs.minLrRatio === undefined
                ? {}
                : { min_lr_ratio: params.lrScheduler.lrSchedulerArgs.minLrRatio }),
              ...(params.lrScheduler.lrSchedulerArgs.numCycles === undefined
                ? {}
                : { num_cycles: params.lrScheduler.lrSchedulerArgs.numCycles }),
            },
          }),
    };
  }
  return body;
}

function fineTuneBody(params: CreateFineTuneParams): {
  body: Record<string, unknown>;
  headers?: Record<string, string>;
} {
  const {
    model,
    trainingFile,
    taskId,
    trainingType = "head_only",
    destination,
    questions,
    branch,
    sourceCommitSha,
    validationFile,
    suffix,
    fromCheckpoint,
    loraR,
    loraAlpha,
    loraDropout,
    wandbApiKey,
    wandbBaseUrl,
    wandbProjectName,
    wandbName,
    wandbEntity,
    trainVision,
    idempotencyKey,
    ...controls
  } = params;
  return {
    body: {
      model,
      training_file: trainingFile,
      taskId,
      training_type: trainingType,
      ...controlsBody(controls),
      ...(destination === undefined ? {} : { destination }),
      ...(questions === undefined ? {} : { questions }),
      ...(branch === undefined ? {} : { branch }),
      ...(sourceCommitSha === undefined ? {} : { sourceCommitSha }),
      ...(validationFile === undefined ? {} : { validation_file: validationFile }),
      ...(suffix === undefined ? {} : { suffix }),
      ...(fromCheckpoint === undefined ? {} : { from_checkpoint: fromCheckpoint }),
      ...(loraR === undefined ? {} : { lora_r: loraR }),
      ...(loraAlpha === undefined ? {} : { lora_alpha: loraAlpha }),
      ...(loraDropout === undefined ? {} : { lora_dropout: loraDropout }),
      ...(wandbApiKey === undefined ? {} : { wandb_api_key: wandbApiKey }),
      ...(wandbBaseUrl === undefined ? {} : { wandb_base_url: wandbBaseUrl }),
      ...(wandbProjectName === undefined ? {} : { wandb_project_name: wandbProjectName }),
      ...(wandbName === undefined ? {} : { wandb_name: wandbName }),
      ...(wandbEntity === undefined ? {} : { wandb_entity: wandbEntity }),
      ...(trainVision === undefined ? {} : { multimodal_params: { train_vision: trainVision } }),
    },
    ...(idempotencyKey === undefined
      ? {}
      : { headers: { "idempotency-key": idempotencyKey } }),
  };
}

export class FineTunes {
  constructor(private readonly transport: Transport) {}

  async create(params: CreateFineTuneParams): Promise<FineTune> {
    return mapFineTune(
      await this.transport.request<WireFineTune>("POST", "/fine-tunes", fineTuneBody(params)),
    );
  }

  async list(options: { workspace: string; modelId?: string; limit?: number }): Promise<FineTuneList> {
    const response = await this.transport.request<{ fineTunes: WireFineTune[] }>(
      "GET",
      "/fine-tunes",
      { query: { workspace: options.workspace, modelId: options.modelId, limit: options.limit ?? 20 } },
    );
    return { fineTunes: response.fineTunes.map(mapFineTune) };
  }

  async get(jobId: string): Promise<FineTune> {
    return mapFineTune(
      await this.transport.request<WireFineTune>("GET", `/fine-tunes/${segment(jobId)}`),
    );
  }

  logs(jobId: string): Promise<FineTuneLogs> {
    return this.transport.request("GET", `/fine-tunes/${segment(jobId)}/logs`);
  }

  cancel(jobId: string): Promise<void> {
    return this.transport.request("DELETE", `/fine-tunes/${segment(jobId)}`);
  }

  async wait(
    jobId: string,
    options: { pollIntervalMs?: number; timeoutMs?: number } = {},
  ): Promise<FineTune> {
    const pollIntervalMs = options.pollIntervalMs ?? 2_000;
    const deadline = Date.now() + (options.timeoutMs ?? Number.POSITIVE_INFINITY);
    while (true) {
      const job = await this.get(jobId);
      if (["done", "failed", "cancelled"].includes(job.status)) return job;
      if (Date.now() + pollIntervalMs >= deadline) {
        throw new ModaicTimeoutError(`Timed out waiting for fine-tune ${jobId}.`);
      }
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }
  }
}

function workspacePath(workspace: string, suffix: string): string {
  return `/workspaces/${segment(workspace)}${suffix}`;
}

function query(options: KnowledgeBaseQuery = {}): Record<string, string | undefined> {
  return { commitSha: options.commitSha };
}

async function digest(data: Uint8Array): Promise<string> {
  const result = await globalThis.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(result), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export class KnowledgeBaseUploads {
  constructor(private readonly transport: Transport) {}

  create(workspace: string, params: CreateKnowledgeBaseUploadParams): Promise<KnowledgeBaseUpload> {
    return this.transport.request("POST", workspacePath(workspace, "/uploads"), { body: params });
  }

  get(workspace: string, uploadId: string): Promise<KnowledgeBaseUpload> {
    return this.transport.request("GET", workspacePath(workspace, `/uploads/${segment(uploadId)}`));
  }

  preparePart(
    workspace: string,
    uploadId: string,
    params: { partNumber: number; sha256: string; sizeBytes: number },
  ): Promise<PreparedUploadPart> {
    return this.transport.request("POST", workspacePath(workspace, `/uploads/${segment(uploadId)}/parts`), {
      body: params,
    });
  }

  confirmPart(
    workspace: string,
    uploadId: string,
    partNumber: number,
    receipt: string,
  ): Promise<KnowledgeBaseUpload> {
    return this.transport.request(
      "PUT",
      workspacePath(workspace, `/uploads/${segment(uploadId)}/parts/${partNumber}`),
      { body: { receipt } },
    );
  }

  async uploadPart(
    workspace: string,
    uploadId: string,
    partNumber: number,
    data: Uint8Array,
  ): Promise<KnowledgeBaseUpload> {
    const prepared = await this.preparePart(workspace, uploadId, {
      partNumber,
      sha256: await digest(data),
      sizeBytes: data.byteLength,
    });
    const receipt = await this.transport.upload(prepared.uploadUrl, prepared.headers, data);
    return this.confirmPart(workspace, uploadId, partNumber, receipt);
  }

  async wait(
    workspace: string,
    uploadId: string,
    options: { pollIntervalMs?: number; timeoutMs?: number } = {},
  ): Promise<KnowledgeBaseUpload> {
    const pollIntervalMs = options.pollIntervalMs ?? 2_000;
    const deadline = Date.now() + (options.timeoutMs ?? Number.POSITIVE_INFINITY);
    while (true) {
      const upload = await this.get(workspace, uploadId);
      if (UPLOAD_TERMINAL.has(upload.status)) return upload;
      if (Date.now() + pollIntervalMs >= deadline) {
        throw new ModaicTimeoutError(`Timed out waiting for knowledge-base upload ${uploadId}.`);
      }
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }
  }

  async uploadFile(path: string | URL, params: UploadFileParams): Promise<KnowledgeBaseUpload> {
    const [{ createHash }, { open }] = await Promise.all([
      import("node:crypto"),
      import("node:fs/promises"),
    ]);
    const hash = createHash("sha256");
    let sizeBytes = 0;
    const hashHandle = await open(path, "r");
    try {
      const buffer = new Uint8Array(HASH_BUFFER_BYTES);
      while (true) {
        const { bytesRead } = await hashHandle.read(buffer, 0, buffer.byteLength, null);
        if (bytesRead === 0) break;
        hash.update(buffer.subarray(0, bytesRead));
        sizeBytes += bytesRead;
      }
    } finally {
      await hashHandle.close();
    }

    const upload = await this.create(params.workspace, {
      name: params.name,
      kind: params.kind,
      sha256: hash.digest("hex"),
      sizeBytes,
      ...(params.description === undefined ? {} : { description: params.description }),
      ...(params.repos === undefined ? {} : { repos: params.repos }),
    });
    const partCount = sizeBytes === 0 ? 0 : Math.ceil(sizeBytes / upload.partSizeBytes);
    let uploadedBytes = 0;
    try {
      params.onProgress?.({ uploadedBytes, totalBytes: sizeBytes, partNumber: 0, partCount });
      const uploadHandle = await open(path, "r");
      try {
        for (let partNumber = 1; uploadedBytes < sizeBytes; partNumber++) {
          const expected = Math.min(upload.partSizeBytes, sizeBytes - uploadedBytes);
          const buffer = new Uint8Array(expected);
          const { bytesRead } = await uploadHandle.read(buffer, 0, expected, null);
          if (bytesRead === 0) {
            throw new ModaicConnectionError("Local file changed while it was being uploaded.");
          }
          const chunk = bytesRead === expected ? buffer : buffer.subarray(0, bytesRead);
          await this.uploadPart(params.workspace, upload.id, partNumber, chunk);
          uploadedBytes += bytesRead;
          params.onProgress?.({ uploadedBytes, totalBytes: sizeBytes, partNumber, partCount });
        }
      } finally {
        await uploadHandle.close();
      }
    } catch (error) {
      await this.cancel(params.workspace, upload.id).catch(() => undefined);
      throw error;
    }

    const result = await this.complete(params.workspace, upload.id);
    if (params.waitForValidation === false || UPLOAD_TERMINAL.has(result.status)) return result;
    return this.wait(params.workspace, upload.id, {
      ...(params.pollIntervalMs === undefined ? {} : { pollIntervalMs: params.pollIntervalMs }),
      ...(params.timeoutMs === undefined ? {} : { timeoutMs: params.timeoutMs }),
    });
  }

  complete(workspace: string, uploadId: string): Promise<KnowledgeBaseUpload> {
    return this.transport.request("POST", workspacePath(workspace, `/uploads/${segment(uploadId)}/complete`));
  }

  cancel(workspace: string, uploadId: string): Promise<KnowledgeBaseUpload> {
    return this.transport.request("DELETE", workspacePath(workspace, `/uploads/${segment(uploadId)}`));
  }
}

export class KnowledgeBaseResources {
  constructor(private readonly transport: Transport) {}

  list(
    workspace: string,
    options: KnowledgeBaseQuery & { kind?: ResourceKind; glob?: string; cursor?: string } = {},
  ): Promise<KnowledgeBaseResourcePage> {
    return this.transport.request("GET", workspacePath(workspace, "/resources"), {
      query: { ...query(options), kind: options.kind, glob: options.glob, cursor: options.cursor },
    });
  }

  get(workspace: string, name: string, options: KnowledgeBaseQuery = {}): Promise<KnowledgeBaseResource> {
    return this.transport.request("GET", workspacePath(workspace, `/resources/${segment(name)}`), {
      query: query(options),
    });
  }

  download(workspace: string, name: string, options: KnowledgeBaseQuery = {}): Promise<Uint8Array> {
    return this.transport.download(workspacePath(workspace, `/resources/${segment(name)}/content`), {
      query: query(options),
    });
  }

  update(
    workspace: string,
    name: string,
    params: { description?: string | null; repos?: string[] },
  ): Promise<KnowledgeBaseResource> {
    return this.transport.request(
      "PATCH",
      workspacePath(workspace, `/resources/${segment(name)}`),
      { body: params },
    );
  }
}

export class KnowledgeBase {
  readonly uploads: KnowledgeBaseUploads;
  readonly resources: KnowledgeBaseResources;

  constructor(transport: Transport) {
    this.uploads = new KnowledgeBaseUploads(transport);
    this.resources = new KnowledgeBaseResources(transport);
  }
}
