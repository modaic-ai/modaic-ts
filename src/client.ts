import { ModaicTimeoutError } from "./errors.js";
import { JobProgress } from "./progress.js";
import { type ClientOptions, segment, Transport } from "./transport.js";
import type {
  Alignment,
  AlignmentList,
  AlignmentLogs,
  BatchDecision,
  BatchDecisionList,
  CreateAlignmentParams,
  CreateBatchDecisionParams,
  CreateDecisionParams,
  CreateModelParams,
  CreatedModel,
  DecisionList,
  DecisionResponse,
  Example,
  ExampleIngestResponse,
  ExampleInput,
  ExamplePage,
  Model,
  ModelExamples,
  ModelJobs,
  ModelList,
  ModelSummary,
  UpdateModelParams,
  WaitOptions,
} from "./types.js";

interface WireDecisionResponse
  extends Omit<DecisionResponse, "usage" | "exampleId" | "decisionId"> {
  usage: { input_tokens: number; output_tokens: number };
  example_id?: string;
  decision_id?: string;
}

interface WireModelSummary extends Omit<ModelSummary, "repositoryId"> {
  repository_id?: string;
}

const TERMINAL_STATUSES = new Set(["completed", "failed", "cancelled"]);

function decisionBody(params: CreateDecisionParams): {
  body: Record<string, unknown>;
  headers?: Record<string, string>;
} {
  const { idempotencyKey, exampleId, ...rest } = params;
  return {
    body: {
      ...rest,
      ...(exampleId === undefined ? {} : { example_id: exampleId }),
    },
    ...(idempotencyKey === undefined
      ? {}
      : { headers: { "idempotency-key": idempotencyKey } }),
  };
}

function mapDecision(response: WireDecisionResponse): DecisionResponse {
  return {
    model: response.model,
    answers: response.answers,
    usage: {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    },
    ...(response.example_id === undefined ? {} : { exampleId: response.example_id }),
    ...(response.decision_id === undefined ? {} : { decisionId: response.decision_id }),
    ...(response.checkpoint === undefined ? {} : { checkpoint: response.checkpoint }),
    ...(response.revision === undefined ? {} : { revision: response.revision }),
    ...(response.captured === undefined ? {} : { captured: response.captured }),
  };
}

function mapModels(response: { models: WireModelSummary[] }): ModelList {
  return {
    models: response.models.map((model) => ({
      name: model.name,
      description: model.description,
      type: model.type,
      ...(model.repository_id === undefined ? {} : { repositoryId: model.repository_id }),
    })),
  };
}

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export class Decisions {
  constructor(private readonly transport: Transport) {}

  async create(params: CreateDecisionParams): Promise<DecisionResponse> {
    const options = decisionBody(params);
    return mapDecision(
      await this.transport.request<WireDecisionResponse>("POST", "/systemone", options),
    );
  }
}

class BoundDecisions {
  readonly #decisions: Decisions;
  readonly #model: string;

  constructor(decisions: Decisions, model: string) {
    this.#decisions = decisions;
    this.#model = model;
  }

  create(params: Omit<CreateDecisionParams, "model">): Promise<DecisionResponse> {
    return this.#decisions.create({ ...params, model: this.#model });
  }
}

function bindModel<T extends CreatedModel | Model>(model: T, transport: Transport): T {
  const workspace = typeof model.workspace === "string" ? model.workspace : model.workspace.slug;
  const modelId = model.id;
  const examples = new Examples(transport);
  const alignments = new Alignments(transport);
  const batchDecisions = new BatchDecisions(transport);
  const boundExamples: ModelExamples = Object.freeze({
    ingest: (items: ExampleInput[]) => examples.ingest(modelId, items),
    list: (options?: { page?: number; pageSize?: number }) => examples.list(modelId, options),
    get: (exampleId: string) => examples.get(modelId, exampleId),
    annotate: (exampleId: string, annotation: Parameters<ModelExamples["annotate"]>[1]) =>
      examples.annotate(modelId, exampleId, annotation),
    listDecisions: (exampleId: string) => examples.listDecisions(modelId, exampleId),
  });
  const jobs: ModelJobs = Object.freeze({
    alignments: Object.freeze({
      create: (params: CreateAlignmentParams) => alignments.create(modelId, params),
      list: (options?: { limit?: number }) => alignments.list(modelId, options),
    }),
    batchDecisions: Object.freeze({
      create: (params: CreateBatchDecisionParams) => batchDecisions.create(modelId, params),
      list: (options?: { limit?: number }) => batchDecisions.list(modelId, options),
    }),
  });
  Object.defineProperty(model, "decisions", {
    value: new BoundDecisions(new Decisions(transport), `${workspace}/${model.slug}`),
    enumerable: false,
    writable: false,
    configurable: false,
  });
  Object.defineProperty(model, "examples", { value: boundExamples, enumerable: false });
  Object.defineProperty(model, "jobs", { value: jobs, enumerable: false });
  return model;
}

export class Models {
  constructor(private readonly transport: Transport) {}

  async list(): Promise<ModelList> {
    return mapModels(
      await this.transport.request<{ models: WireModelSummary[] }>("GET", "/models"),
    );
  }

  async create(params: CreateModelParams): Promise<CreatedModel> {
    return bindModel(
      await this.transport.request<CreatedModel>("POST", "/models", { body: params }),
      this.transport,
    );
  }

  async get(workspace: string, model: string): Promise<Model> {
    return bindModel(
      await this.transport.request<Model>(
        "GET",
        `/entities/${segment(workspace)}/models/${segment(model)}`,
      ),
      this.transport,
    );
  }

  async update(modelId: string, params: UpdateModelParams): Promise<Model> {
    const { branch, ...body } = params;
    return bindModel(
      await this.transport.request<Model>("PATCH", `/models/${segment(modelId)}`, {
        body,
        ...(branch === undefined ? {} : { query: { branch } }),
      }),
      this.transport,
    );
  }

  async delete(modelId: string): Promise<void> {
    await this.transport.request<void>("DELETE", `/models/${segment(modelId)}`);
  }
}

export class Examples {
  constructor(private readonly transport: Transport) {}

  async ingest(modelId: string, examples: ExampleInput[]): Promise<ExampleIngestResponse> {
    return this.transport.request<ExampleIngestResponse>(
      "POST",
      `/models/${segment(modelId)}/examples`,
      { body: { examples } },
    );
  }

  async list(modelId: string, options: { page?: number; pageSize?: number } = {}): Promise<ExamplePage> {
    return this.transport.request<ExamplePage>("GET", `/models/${segment(modelId)}/examples`, {
      query: { page: options.page ?? 1, pageSize: options.pageSize ?? 30 },
    });
  }

  async get(modelId: string, exampleId: string): Promise<Example> {
    return this.transport.request<Example>(
      "GET",
      `/models/${segment(modelId)}/examples/${segment(exampleId)}`,
    );
  }

  async annotate(
    modelId: string,
    exampleId: string,
    annotation: { groundTruth?: Record<string, import("./types.js").JsonValue>; groundReasoning?: string },
  ): Promise<Example> {
    return this.transport.request<Example>(
      "PATCH",
      `/models/${segment(modelId)}/examples/${segment(exampleId)}/annotation`,
      { body: annotation },
    );
  }

  async listDecisions(modelId: string, exampleId: string): Promise<DecisionList> {
    return this.transport.request<DecisionList>(
      "GET",
      `/models/${segment(modelId)}/examples/${segment(exampleId)}/decisions`,
    );
  }
}

export class BatchDecisions {
  constructor(private readonly transport: Transport) {}

  async create(modelId: string, params: CreateBatchDecisionParams): Promise<BatchDecision> {
    const { idempotencyKey, ...body } = params;
    return this.transport.request<BatchDecision>(
      "POST",
      `/models/${segment(modelId)}/batch-decisions`,
      { body, headers: { "idempotency-key": idempotencyKey } },
    );
  }

  async list(modelId: string, options: { limit?: number } = {}): Promise<BatchDecisionList> {
    return this.transport.request<BatchDecisionList>(
      "GET",
      `/models/${segment(modelId)}/batch-decisions`,
      { query: { limit: options.limit ?? 20 } },
    );
  }

  async get(batchDecisionId: string): Promise<BatchDecision> {
    return this.transport.request<BatchDecision>(
      "GET",
      `/batch-decisions/${segment(batchDecisionId)}`,
    );
  }

  async cancel(batchDecisionId: string): Promise<void> {
    await this.transport.request<void>("DELETE", `/batch-decisions/${segment(batchDecisionId)}`);
  }

  async wait(batchDecisionId: string, options: WaitOptions = {}): Promise<BatchDecision> {
    const timeoutMs = options.timeoutMs ?? 300_000;
    const pollIntervalMs = options.pollIntervalMs ?? 1_000;
    const deadline = Date.now() + timeoutMs;
    const display = new JobProgress(options.progress ?? false);
    try {
      while (true) {
        const job = await this.get(batchDecisionId);
        display.update(job);
        if (TERMINAL_STATUSES.has(job.status)) return job;
        if (Date.now() >= deadline) {
          throw new ModaicTimeoutError(`Timed out waiting for batch decision ${batchDecisionId}.`);
        }
        await sleep(pollIntervalMs);
      }
    } catch (error) {
      display.close(error instanceof ModaicTimeoutError ? "wait timed out" : "wait interrupted");
      throw error;
    } finally {
      display.close();
    }
  }
}

export class Alignments {
  constructor(private readonly transport: Transport) {}

  async create(modelId: string, params: CreateAlignmentParams): Promise<Alignment> {
    const { idempotencyKey, maxMetricCalls, reflection, ...rest } = params;
    const body = {
      ...rest,
      budget: { maxMetricCalls },
      reflection: { seed: 0, ...reflection },
    };
    return this.transport.request<Alignment>(
      "POST",
      `/models/${segment(modelId)}/alignments`,
      { body, headers: { "idempotency-key": idempotencyKey } },
    );
  }

  async list(modelId: string, options: { limit?: number } = {}): Promise<AlignmentList> {
    return this.transport.request<AlignmentList>(
      "GET",
      `/models/${segment(modelId)}/alignments`,
      { query: { limit: options.limit ?? 20 } },
    );
  }

  async get(alignmentId: string): Promise<Alignment> {
    return this.transport.request<Alignment>("GET", `/alignments/${segment(alignmentId)}`);
  }

  async logs(alignmentId: string): Promise<AlignmentLogs> {
    return this.transport.request<AlignmentLogs>(
      "GET",
      `/alignments/${segment(alignmentId)}/logs`,
    );
  }

  async cancel(alignmentId: string): Promise<void> {
    await this.transport.request<void>("DELETE", `/alignments/${segment(alignmentId)}`);
  }

  async wait(alignmentId: string, options: WaitOptions = {}): Promise<Alignment> {
    const timeoutMs = options.timeoutMs ?? 900_000;
    const pollIntervalMs = options.pollIntervalMs ?? 1_000;
    const deadline = Date.now() + timeoutMs;
    const display = new JobProgress(options.progress ?? false);
    try {
      while (true) {
        const alignment = await this.get(alignmentId);
        display.update(alignment);
        if (TERMINAL_STATUSES.has(alignment.status)) return alignment;
        if (Date.now() >= deadline) {
          throw new ModaicTimeoutError(`Timed out waiting for alignment ${alignmentId}.`);
        }
        await sleep(pollIntervalMs);
      }
    } catch (error) {
      display.close(error instanceof ModaicTimeoutError ? "wait timed out" : "wait interrupted");
      throw error;
    } finally {
      display.close();
    }
  }
}

export class Modaic {
  readonly decisions: Decisions;
  readonly models: Models;
  readonly examples: Examples;
  readonly batchDecisions: BatchDecisions;
  readonly alignments: Alignments;

  constructor(options: ClientOptions = {}) {
    const transport = new Transport(options);
    this.decisions = new Decisions(transport);
    this.models = new Models(transport);
    this.examples = new Examples(transport);
    this.batchDecisions = new BatchDecisions(transport);
    this.alignments = new Alignments(transport);
  }
}

export { type ClientOptions };
export { Modaic as ModaicClient };
