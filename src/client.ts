import { Nullable, questionBody, hydrateAnswer } from "./questions.js";
import { ModaicConnectionError, ModaicTimeoutError } from "./errors.js";
import { JobProgress } from "./progress.js";
import { type ClientOptions, segment, Transport } from "./transport.js";
import { FineTunes, Resources, Uploads } from "./training.js";
import type {
  Alignment,
  AlignmentList,
  AlignmentLogs,
  BatchDecision,
  BatchDecisionList,
  BranchList,
  CommitDetails,
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
  ExampleSummary,
  Model,
  ModelExamples,
  ModelJobs,
  ModelList,
  ModelSummary,
  ProtegeJob,
  ResponseSchema,
  Answer,
  QuestionInput,
  DecisionQuestions,
  Question,
  InferredDecisionResponse,
  RepositoryFileChange,
  RepositoryFileContents,
  RepositoryFileList,
  RollbackParams,
  Tag,
  TagList,
  UpdateModelParams,
  WaitOptions,
} from "./types.js";

interface WireDecisionResponse
  extends Omit<DecisionResponse, "answers" | "usage" | "thinking" | "exampleId" | "decisionId"> {
  answers: Record<string, (Answer & { p_null?: number }) | null>;
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

function modelPath(repo: string, suffix = ""): string {
  const parts = repo.split("/");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new TypeError("Model repositories must use the workspace/model form.");
  }
  return `/models/${segment(parts[0])}/${segment(parts[1])}${suffix}`;
}

type AnyDecisionParams = CreateDecisionParams<DecisionQuestions>;

function decisionBody(params: AnyDecisionParams & { schema?: ResponseSchema<unknown> }): {
  body: Record<string, unknown>;
  headers?: Record<string, string>;
} {
  const { idempotencyKey, exampleId, reasoningEffort, assets, experimentalNullability,
    experimentalSampling, schema: _schema, ...rest } = params;
  const headers = {
    ...(idempotencyKey === undefined ? {} : { "idempotency-key": idempotencyKey }),
    ...(experimentalNullability === true ? { "X-Modaic-Experimental-Nullability": "true" } : {}),
    ...(experimentalSampling === true ? { "X-Modaic-Experimental-Sampling": "true" } : {}),
  };
  return {
    body: {
      ...rest,
      ...(assets === undefined ? {} : { assets: Object.fromEntries(Object.entries(assets).map(([id, asset]) => [id, { type: asset.type, format: asset.format, data_base64: asset.dataBase64 }])) }),
      ...(reasoningEffort === undefined ? {} : { reasoning_effort: reasoningEffort }),
      ...(exampleId === undefined ? {} : { example_id: exampleId }),
    },
    ...(Object.keys(headers).length === 0 ? {} : { headers }),
  };
}

function mapDecision(response: WireDecisionResponse): DecisionResponse {
  return {
    model: response.model,
    answers: Object.fromEntries(Object.entries(response.answers).map(([name, answer]) => {
      if (answer === null || answer.p_null === undefined) return [name, answer];
      const { p_null: pNull, ...rest } = answer;
      return [name, { ...rest, pNull }];
    })),
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
  const repo = `${workspace}/${model.slug}`;
  const examples = new Examples(transport);
  const alignments = new Alignments(transport);
  const batchDecisions = new BatchDecisions(transport);
  const boundExamples: ModelExamples = Object.freeze({
    ingest: (items: ExampleInput[]) => examples.ingest(repo, items),
    list: (options?: { page?: number; pageSize?: number }) => examples.list(repo, options),
    summary: () => examples.summary(repo),
    get: (exampleId: string) => examples.get(exampleId),
    annotate: (exampleId: string, annotation: Parameters<ModelExamples["annotate"]>[1]) =>
      examples.annotate(exampleId, annotation),
    listDecisions: (exampleId: string) => examples.listDecisions(exampleId),
  });
  const jobs: ModelJobs = Object.freeze({
    alignments: Object.freeze({
      create: (params: CreateAlignmentParams) => alignments.create(repo, params),
      list: (options?: { limit?: number }) => alignments.list(repo, options),
    }),
    batchDecisions: Object.freeze({
      create: (params: CreateBatchDecisionParams) => batchDecisions.create(repo, params),
      list: (options?: { limit?: number }) => batchDecisions.list(repo, options),
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

  async get(workspace: string, model: string, options: { revision?: string } = {}): Promise<Model> {
    return bindModel(
      await this.transport.request<Model>(
        "GET",
        `/models/${segment(workspace)}/${segment(model)}`,
        options.revision === undefined ? {} : { query: { revision: options.revision } },
      ),
      this.transport,
    );
  }

  async update(repo: string, params: UpdateModelParams): Promise<Model> {
    const { branch, ...rest } = params;
    const body = modelBody(rest);
    return bindModel(
      await this.transport.request<Model>("PATCH", modelPath(repo), {
        body,
        ...(branch === undefined ? {} : { query: { branch } }),
      }),
      this.transport,
    );
  }

  async delete(repo: string): Promise<void> {
    await this.transport.request<void>("DELETE", modelPath(repo));
  }

  // Version control. Every model is a Git repository: branches carry ongoing
  // work, tags name commits worth keeping (a good alignment, a release), and
  // a rollback moves a branch back to an earlier commit by committing its
  // tree again, checkpoint and metrics included.

  listFiles(
    repo: string,
    options: { revision?: string; path?: string; recursive?: boolean } = {},
  ): Promise<RepositoryFileList> {
    return this.transport.request("GET", modelPath(repo, "/files"), {
      query: {
        revision: options.revision,
        path: options.path,
        recursive: options.recursive === undefined ? undefined : String(options.recursive),
      },
    });
  }

  getFile(
    repo: string,
    filePath: string,
    options: { revision?: string } = {},
  ): Promise<RepositoryFileContents> {
    const encoded = filePath.split("/").map(segment).join("/");
    return this.transport.request("GET", modelPath(repo, `/files/${encoded}`), {
      query: { revision: options.revision },
    });
  }

  async listBranches(modelId: string): Promise<BranchList> {
    return this.transport.request<BranchList>("GET", modelPath(modelId, "/branches"));
  }

  async createBranch(modelId: string, params: { name: string; sourceRef?: string }): Promise<CommitResult> {
    const created = await this.transport.request<{ branch: string; commitSha?: string }>(
      "POST",
      modelPath(modelId, "/branches"),
      { body: params },
    );
    return { commitSha: created.commitSha ?? "", branch: created.branch, previousSha: null };
  }

  async deleteBranch(modelId: string, name: string): Promise<void> {
    await this.transport.request<void>("DELETE", modelPath(modelId, `/branches/${segment(name)}`));
  }

  async listCommits(modelId: string, options: { branch?: string } = {}): Promise<CommitList> {
    return this.transport.request<CommitList>(
      "GET",
      modelPath(modelId, "/commits"),
      options.branch === undefined ? {} : { query: { branch: options.branch } },
    );
  }

  getCommit(modelId: string, commitSha: string): Promise<CommitDetails> {
    return this.transport.request(
      "GET",
      modelPath(modelId, `/commits/${segment(commitSha)}`),
    );
  }

  commit(
    modelId: string,
    params: {
      branch: string;
      message: string;
      expectedHeadSha: string;
      changes: RepositoryFileChange[];
    },
  ): Promise<CommitResult> {
    return this.transport.request("POST", modelPath(modelId, "/commits"), { body: params });
  }

  async listTags(modelId: string): Promise<TagList> {
    return this.transport.request<TagList>("GET", modelPath(modelId, "/tags"));
  }

  async createTag(modelId: string, params: { name: string; commitSha: string }): Promise<Tag> {
    return this.transport.request<Tag>("POST", modelPath(modelId, "/tags"), { body: params });
  }

  async deleteTag(modelId: string, name: string): Promise<void> {
    await this.transport.request<void>("DELETE", modelPath(modelId, `/tags/${segment(name)}`));
  }

  async rollback(modelId: string, params: RollbackParams): Promise<CommitResult> {
    return this.transport.request<CommitResult>("POST", modelPath(modelId, "/rollbacks"), {
      body: params,
    });
  }
}

export class Examples {
  constructor(private readonly transport: Transport) {}

  async ingest(repo: string, examples: ExampleInput[]): Promise<ExampleIngestResponse> {
    return this.transport.request<ExampleIngestResponse>(
      "POST",
      modelPath(repo, "/examples"),
      { body: { examples } },
    );
  }

  async list(repo: string, options: { page?: number; pageSize?: number } = {}): Promise<ExamplePage> {
    return this.transport.request<ExamplePage>("GET", modelPath(repo, "/examples"), {
      query: { page: options.page ?? 1, pageSize: options.pageSize ?? 30 },
    });
  }

  async summary(repo: string): Promise<ExampleSummary> {
    return this.transport.request("GET", modelPath(repo, "/examples/summary"));
  }

  async get(exampleId: string): Promise<Example> {
    return this.transport.request<Example>("GET", `/examples/${segment(exampleId)}`);
  }

  async annotate(
    exampleId: string,
    annotation: { groundTruth?: Record<string, import("./types.js").JsonValue>; groundReasoning?: string },
  ): Promise<Example> {
    return this.transport.request<Example>(
      "PATCH",
      `/examples/${segment(exampleId)}/annotation`,
      { body: annotation },
    );
  }

  async listDecisions(exampleId: string): Promise<DecisionList> {
    return this.transport.request<DecisionList>(
      "GET",
      `/examples/${segment(exampleId)}/decisions`,
    );
  }
}

export class BatchDecisions {
  constructor(private readonly transport: Transport) {}

  async create(modelId: string, params: CreateBatchDecisionParams): Promise<BatchDecision> {
    const { idempotencyKey, ...body } = params;
    return this.transport.request<BatchDecision>(
      "POST",
      modelPath(modelId, "/batch-decisions"),
      { body, headers: { "idempotency-key": idempotencyKey } },
    );
  }

  async list(modelId: string, options: { limit?: number } = {}): Promise<BatchDecisionList> {
    return this.transport.request<BatchDecisionList>(
      "GET",
      modelPath(modelId, "/batch-decisions"),
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
      modelPath(modelId, "/alignments"),
      { body, headers: { "idempotency-key": idempotencyKey } },
    );
  }

  async list(modelId: string, options: { limit?: number } = {}): Promise<AlignmentList> {
    return this.transport.request<AlignmentList>(
      "GET",
      modelPath(modelId, "/alignments"),
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

export class Protege {
  constructor(private readonly transport: Transport) {}

  create(params: {
    prompt: string;
    repo: string;
    evalOnlyDataset?: string;
  }): Promise<ProtegeJob> {
    return this.transport.request("POST", "/protege", {
      body: {
        prompt: params.prompt,
        repo: params.repo,
        ...(params.evalOnlyDataset === undefined
          ? {}
          : { eval_only_dataset: params.evalOnlyDataset }),
      },
    });
  }

  get(jobId: string): Promise<ProtegeJob> {
    return this.transport.request("GET", `/protege/${segment(jobId)}`);
  }

  cancel(jobId: string): Promise<ProtegeJob> {
    return this.transport.request("DELETE", `/protege/${segment(jobId)}`);
  }

  async wait(jobId: string, options: WaitOptions = {}): Promise<ProtegeJob> {
    const deadline = Date.now() + (options.timeoutMs ?? 3_600_000);
    const pollIntervalMs = options.pollIntervalMs ?? 2_000;
    while (true) {
      const job = await this.get(jobId);
      if (["succeeded", "failed", "cancelled"].includes(job.status)) return job;
      if (Date.now() >= deadline) {
        throw new ModaicTimeoutError(`Timed out waiting for Protégé job ${jobId}.`);
      }
      await sleep(pollIntervalMs);
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
  readonly uploads: Uploads;
  readonly resources: Resources;
  readonly protege: Protege;

  constructor(options: ClientOptions = {}) {
    const transport = new Transport(options);
    this.decisions = new Decisions(transport);
    this.models = new Models(transport);
    this.examples = new Examples(transport);
    this.batchDecisions = new BatchDecisions(transport);
    this.alignments = new Alignments(transport);
    this.fineTunes = new FineTunes(transport);
    this.uploads = new Uploads(transport);
    this.resources = new Resources(transport);
    this.protege = new Protege(transport);
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
