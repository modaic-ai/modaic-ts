import { ModaicTimeoutError } from "./errors.js";
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
} from "./types.js";

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

function query(options: KnowledgeBaseQuery = {}): Record<string, string | undefined> {
  return { workspace: options.workspace, commitSha: options.commitSha };
}

async function digest(data: Uint8Array): Promise<string> {
  const result = await globalThis.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(result), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export class KnowledgeBaseUploads {
  constructor(private readonly transport: Transport) {}

  create(params: CreateKnowledgeBaseUploadParams): Promise<KnowledgeBaseUpload> {
    return this.transport.request("POST", "/knowledge-base/uploads", { body: params });
  }

  get(uploadId: string, options: { workspace?: string } = {}): Promise<KnowledgeBaseUpload> {
    return this.transport.request("GET", `/knowledge-base/uploads/${segment(uploadId)}`, {
      query: { workspace: options.workspace },
    });
  }

  preparePart(
    uploadId: string,
    params: { partNumber: number; sha256: string; sizeBytes: number; workspace?: string },
  ): Promise<PreparedUploadPart> {
    const { workspace, ...body } = params;
    return this.transport.request("POST", `/knowledge-base/uploads/${segment(uploadId)}/parts`, {
      body,
      query: { workspace },
    });
  }

  confirmPart(
    uploadId: string,
    partNumber: number,
    receipt: string,
    options: { workspace?: string } = {},
  ): Promise<KnowledgeBaseUpload> {
    return this.transport.request(
      "PUT",
      `/knowledge-base/uploads/${segment(uploadId)}/parts/${partNumber}`,
      { body: { receipt }, query: { workspace: options.workspace } },
    );
  }

  async uploadPart(
    uploadId: string,
    partNumber: number,
    data: Uint8Array,
    options: { workspace?: string } = {},
  ): Promise<KnowledgeBaseUpload> {
    const prepared = await this.preparePart(uploadId, {
      partNumber,
      sha256: await digest(data),
      sizeBytes: data.byteLength,
      ...(options.workspace === undefined ? {} : { workspace: options.workspace }),
    });
    const receipt = await this.transport.upload(prepared.uploadUrl, prepared.headers, data);
    return this.confirmPart(uploadId, partNumber, receipt, options);
  }

  complete(uploadId: string, options: { workspace?: string } = {}): Promise<KnowledgeBaseUpload> {
    return this.transport.request("POST", `/knowledge-base/uploads/${segment(uploadId)}/complete`, {
      query: { workspace: options.workspace },
    });
  }

  cancel(uploadId: string, options: { workspace?: string } = {}): Promise<KnowledgeBaseUpload> {
    return this.transport.request("DELETE", `/knowledge-base/uploads/${segment(uploadId)}`, {
      query: { workspace: options.workspace },
    });
  }
}

export class KnowledgeBaseResources {
  constructor(private readonly transport: Transport) {}

  list(
    options: KnowledgeBaseQuery & { kind?: ResourceKind; cursor?: string } = {},
  ): Promise<KnowledgeBaseResourcePage> {
    return this.transport.request("GET", "/knowledge-base/resources", {
      query: { ...query(options), kind: options.kind, cursor: options.cursor },
    });
  }

  get(name: string, options: KnowledgeBaseQuery = {}): Promise<KnowledgeBaseResource> {
    return this.transport.request("GET", `/knowledge-base/resources/${segment(name)}`, {
      query: query(options),
    });
  }

  download(name: string, options: KnowledgeBaseQuery = {}): Promise<Uint8Array> {
    return this.transport.download(`/knowledge-base/resources/${segment(name)}/content`, {
      query: query(options),
    });
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
