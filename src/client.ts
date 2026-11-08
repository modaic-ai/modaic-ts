import { Nullable, questionBody, hydrateAnswer } from "./questions.js";
import { ModaicConnectionError, ModaicTimeoutError } from "./errors.js";
import { JobProgress } from "./progress.js";
import { type ClientOptions, segment, Transport } from "./transport.js";
import { FineTunes, KnowledgeBase } from "./training.js";
import type {
  Alignment,
  AlignmentList,
  AlignmentLogs,
  BatchDecision,
  BatchDecisionList,
  BranchList,
  CommitList,
  CommitResult,
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
  ResponseSchema,
  Answer,
  QuestionInput,
  DecisionQuestions,
  Question,
  InferredDecisionResponse,
  RollbackParams,
  Tag,
  TagList,
  UpdateModelParams,
  WaitOptions,
} from "./types.js";

interface WireDecisionResponse
  extends Omit<DecisionResponse, "usage" | "thinking" | "exampleId" | "decisionId"> {
  usage: { input_tokens: number; output_tokens: number; reasoning_tokens?: number };
  thinking?: Record<string, {
    max_tokens: number | null;
    reasoning_tokens: number;
    generated_tokens: number;
    finish_reason: "natural" | "budget_exhausted" | "context_exhausted";
    generation_ms: number;
    scoring_ms: number;
    cached_tokens: number | null;
  }>;
  example_id?: string;
  decision_id?: string;
}

interface WireModelSummary extends Omit<ModelSummary, "repositoryId"> {
  repository_id?: string;
}

const TERMINAL_STATUSES = new Set(["completed", "failed", "cancelled"]);

type AnyDecisionParams = CreateDecisionParams<DecisionQuestions>;

function decisionBody(params: AnyDecisionParams & { schema?: ResponseSchema<unknown> }): {
  body: Record<string, unknown>;
  headers?: Record<string, string>;
} {
  const { idempotencyKey, exampleId, reasoningEffort, schema: _schema, ...rest } = params;
  return {
    body: {
      ...rest,
      ...(reasoningEffort === undefined ? {} : { reasoning_effort: reasoningEffort }),
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
      ...(response.usage.reasoning_tokens === undefined
        ? {} : { reasoningTokens: response.usage.reasoning_tokens }),
    },
    ...(response.thinking === undefined ? {} : {
      thinking: Object.fromEntries(Object.entries(response.thinking).map(([id, result]) => [id, {
        maxTokens: result.max_tokens,
        reasoningTokens: result.reasoning_tokens,
        generatedTokens: result.generated_tokens,
        finishReason: result.finish_reason,
        generationMs: result.generation_ms,
        scoringMs: result.scoring_ms,
        cachedTokens: result.cached_tokens,
      }])),
    }),
    ...(response.example_id === undefined ? {} : { exampleId: response.example_id }),
    ...(response.decision_id === undefined ? {} : { decisionId: response.decision_id }),
    ...(response.checkpoint === undefined ? {} : { checkpoint: response.checkpoint }),
    ...(response.revision === undefined ? {} : { revision: response.revision }),
    ...(response.captured === undefined ? {} : { captured: response.captured }),
  };
}

function validate<T>(schema: ResponseSchema<T>, response: unknown): T {
  try {
    return schema.parse(response);
  } catch (error) {
    throw new ModaicConnectionError("Modaic API returned an unexpected response shape.", {
      cause: error,
    });
  }
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

  async create<T>(params: AnyDecisionParams & { schema: ResponseSchema<T> }): Promise<T>;
  async create<const Q extends Record<string, QuestionInput>>(
    params: Omit<CreateDecisionParams, "questions"> & { questions: Q; schema?: never },
  ): Promise<InferredDecisionResponse<Q>>;

  async create(params: CreateDecisionParams): Promise<DecisionResponse>;
  async create(params: AnyDecisionParams): Promise<DecisionResponse<Answer | null>>;
  async create(
    params: AnyDecisionParams & { schema?: ResponseSchema<unknown> },
  ): Promise<unknown> {
    const { questions, gates, definitions } = expandQuestions(params.questions);
    const options = decisionBody({ ...params, ...(questions === undefined ? {} : { questions }) });
    const response = mapDecision(
      await this.transport.request<WireDecisionResponse>("POST", "/systemone", options),
    );
    resolveNullable(response, gates);
    for (const [name, answer] of Object.entries(response.answers)) {
      if (answer !== null) {
        try { response.answers[name] = hydrateAnswer(answer, name, definitions?.[name]); }
        catch (cause) { throw new ModaicConnectionError("Modaic API returned an unexpected answer shape.", { cause }); }
      }
    }
    return params.schema ? validate(params.schema, response) : response;
  }
}

class BoundDecisions {
  readonly #decisions: Decisions;
  readonly #model: string;

  constructor(decisions: Decisions, model: string) {
    this.#decisions = decisions;
    this.#model = model;
  }

  create<T>(
    params: Omit<AnyDecisionParams, "model"> & { schema: ResponseSchema<T> },
  ): Promise<T>;
  create<const Q extends Record<string, QuestionInput>>(
    params: Omit<CreateDecisionParams, "model" | "questions"> & { questions: Q; schema?: never },
  ): Promise<InferredDecisionResponse<Q>>;
  create(params: Omit<CreateDecisionParams, "model">): Promise<DecisionResponse>;
  create(params: Omit<AnyDecisionParams, "model">): Promise<DecisionResponse<Answer | null>>;
  create(
    params: Omit<AnyDecisionParams, "model"> & { schema?: ResponseSchema<unknown> },
  ): Promise<unknown> {
    const { schema, ...rest } = params;
    const merged = { ...rest, model: this.#model };
    return schema
      ? this.#decisions.create({ ...merged, schema })
      : this.#decisions.create(merged);
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
      await this.transport.request<CreatedModel>("POST", "/models", { body: modelBody(params) }),
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
    const { branch, ...rest } = params;
    const body = modelBody(rest);
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

  // Version control. Every model is a Git repository: branches carry ongoing
  // work, tags name commits worth keeping (a good alignment, a release), and
  // a rollback moves a branch back to an earlier commit by committing its
  // tree again, checkpoint and metrics included.

  async listBranches(modelId: string): Promise<BranchList> {
    return this.transport.request<BranchList>("GET", `/models/${segment(modelId)}/branches`);
  }

  async createBranch(modelId: string, params: { name: string; sourceRef?: string }): Promise<CommitResult> {
    const created = await this.transport.request<{ branch: string; commitSha?: string }>(
      "POST",
      `/models/${segment(modelId)}/branches`,
      { body: params },
    );
    return { commitSha: created.commitSha ?? "", branch: created.branch, previousSha: null };
  }

  async deleteBranch(modelId: string, name: string): Promise<void> {
    await this.transport.request<void>("DELETE", `/models/${segment(modelId)}/branches/${segment(name)}`);
  }

  async listCommits(modelId: string, options: { branch?: string } = {}): Promise<CommitList> {
    return this.transport.request<CommitList>(
      "GET",
      `/models/${segment(modelId)}/commits`,
      options.branch === undefined ? {} : { query: { branch: options.branch } },
    );
  }

  async listTags(modelId: string): Promise<TagList> {
    return this.transport.request<TagList>("GET", `/models/${segment(modelId)}/tags`);
  }

  async createTag(modelId: string, params: { name: string; commitSha: string }): Promise<Tag> {
    return this.transport.request<Tag>("POST", `/models/${segment(modelId)}/tags`, { body: params });
  }

  async deleteTag(modelId: string, name: string): Promise<void> {
    await this.transport.request<void>("DELETE", `/models/${segment(modelId)}/tags/${segment(name)}`);
  }

  async rollback(modelId: string, params: RollbackParams): Promise<CommitResult> {
    return this.transport.request<CommitResult>("POST", `/models/${segment(modelId)}/rollbacks`, {
      body: params,
    });
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
      // Optional: without it the API sizes the budget to the validation split.
      ...(maxMetricCalls !== undefined && { budget: { maxMetricCalls } }),
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
  readonly fineTunes: FineTunes;
  readonly knowledgeBase: KnowledgeBase;

  constructor(options: ClientOptions = {}) {
    const transport = new Transport(options);
    this.decisions = new Decisions(transport);
    this.models = new Models(transport);
    this.examples = new Examples(transport);
    this.batchDecisions = new BatchDecisions(transport);
    this.alignments = new Alignments(transport);
    this.fineTunes = new FineTunes(transport);
    this.knowledgeBase = new KnowledgeBase(transport);
  }
}

export { type ClientOptions };
export { Modaic as ModaicClient };

function expandQuestions(input: DecisionQuestions | undefined): {
  questions: Record<string, Question> | undefined;
  definitions: Record<string, Question> | undefined;
  gates: Map<string, { id: string; threshold: number }>;
} {
  const gates = new Map<string, { id: string; threshold: number }>();
  if (input === undefined) return { questions: undefined, definitions: undefined, gates };
  if (input === null || typeof input !== "object" || Array.isArray(input) ||
      input instanceof Nullable || typeof Reflect.get(input, "type") === "string") {
    throw new TypeError("questions must be a dictionary");
  }
  const questions = input;
  const wire: Record<string, Question> = Object.create(null);
  const definitions: Record<string, Question> = Object.create(null);
  for (const [id, value] of Object.entries(questions)) {
    const question = questionBody(value instanceof Nullable ? value.question : value);
    definitions[id] = question;
    wire[id] = question;
    if (!(value instanceof Nullable)) continue;
    const gate = `__modaic_answerable_${id}`;
    if (Object.hasOwn(questions, gate)) throw new Error(`Nullable gate ID conflicts with question ${gate}`);
    wire[gate] = { type: "noul", instructions: {
      task: "Does the supplied state contain enough information to answer this question?",
      question: JSON.parse(JSON.stringify(question)),
    } };
    gates.set(id, { id: gate, threshold: value.threshold });
  }
  return { questions: wire, definitions, gates };
}

function resolveNullable(response: DecisionResponse, gates: Map<string, { id: string; threshold: number }>): void {
  if (gates.size === 0) return;
  response.answers = { ...response.answers };
  for (const [id, gate] of gates) {
    const answers = response.answers as Record<string, Answer | null>;
    const answer = answers[gate.id];
    if (!answer || answer.type !== "noul" || typeof answer.noul !== "number" ||
        !Number.isFinite(answer.noul) || answer.noul < 0 || answer.noul > 1 ||
        !Object.hasOwn(response.answers, id)) {
      throw new ModaicConnectionError(`Missing or malformed answerability gate for ${id}.`);
    }
    delete answers[gate.id];
    if (answer.noul < gate.threshold) answers[id] = null;
  }
}

function modelBody<T extends { questions?: Record<string, Question> }>(params: T): T {
  if (!params.questions) return params;
  return { ...params, questions: Object.fromEntries(Object.entries(params.questions).map(
    ([name, question]) => [name, questionBody(question)],
  )) };
}
