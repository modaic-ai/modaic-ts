export type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue };

export interface NoulQuestion {
  type: "noul";
  instructions?: JsonValue;
  criteria?: { true?: JsonValue; false?: JsonValue } | null;
}

export interface ChoiceQuestion {
  type: "choice";
  instructions?: JsonValue;
  criteria: Record<string, JsonValue>;
}

export interface ScoreQuestion {
  type: "score";
  instructions?: JsonValue;
  criteria: JsonValue[];
}

export type Question = NoulQuestion | ChoiceQuestion | ScoreQuestion;

export interface NoulAnswer {
  type: "noul";
  noul: number;
}

export interface ChoiceAnswer {
  type: "choice";
  choice: string;
  probabilities: Record<string, number>;
  confidence: number;
}

export interface ScoreAnswer {
  type: "score";
  score: number;
  legend: Record<string, JsonValue>;
  probabilities: Record<string, number>;
  confidence: number;
}

export type Answer = NoulAnswer | ChoiceAnswer | ScoreAnswer;

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface CreateDecisionParams {
  state: JsonValue;
  model: string;
  questions?: Record<string, Question>;
  revision?: string;
  exampleId?: string;
  capture?: boolean;
  idempotencyKey?: string;
}

export interface DecisionResponse {
  model: string;
  answers: Record<string, Answer>;
  usage: TokenUsage;
  exampleId?: string;
  decisionId?: string;
  checkpoint?: number;
  revision?: string;
  captured?: boolean;
}

export interface Entity {
  id: string;
  kind: "user" | "organization";
  slug: string;
  name: string;
  description: string | null;
  avatarUrl: string | null;
  [key: string]: unknown;
}

export interface ModelSummary {
  name: string;
  description: string;
  type: "base" | "repository";
  repositoryId?: string;
}

export interface ModelList {
  models: ModelSummary[];
}

export interface ModelConfiguration {
  schemaVersion?: number;
  model?: string;
  checkpoint?: number;
  questions?: Record<string, Question>;
  metrics?: Record<string, unknown>;
  capture?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface CommitResult {
  commitSha: string;
  branch: string;
  previousSha: string | null;
}

export interface ModelDecisions {
  create(params: Omit<CreateDecisionParams, "model">): Promise<DecisionResponse>;
}

export interface ModelExamples {
  ingest(examples: ExampleInput[]): Promise<ExampleIngestResponse>;
  list(options?: { page?: number; pageSize?: number }): Promise<ExamplePage>;
  get(exampleId: string): Promise<Example>;
  annotate(exampleId: string, annotation: {
    groundTruth?: Record<string, JsonValue>;
    groundReasoning?: string;
  }): Promise<Example>;
  listDecisions(exampleId: string): Promise<DecisionList>;
}

export interface ModelJobs {
  readonly alignments: {
    create(params: CreateAlignmentParams): Promise<Alignment>;
    list(options?: { limit?: number }): Promise<AlignmentList>;
  };
  readonly batchDecisions: {
    create(params: CreateBatchDecisionParams): Promise<BatchDecision>;
    list(options?: { limit?: number }): Promise<BatchDecisionList>;
  };
}

export interface CreatedModel {
  readonly decisions: ModelDecisions;
  readonly examples: ModelExamples;
  readonly jobs: ModelJobs;
  id: string;
  workspace: string;
  slug: string;
  description: string | null;
  defaultBranch: string;
  visibility: "private";
  createdAt: string;
  updatedAt: string;
}

export interface Model extends Omit<CreatedModel, "workspace"> {
  workspace: Entity;
  configuration?: ModelConfiguration;
  commit?: CommitResult;
  /**
   * Set by `models.update` when the supplied model and questions already
   * matched the stored configuration: nothing was committed, `commit`
   * points at the current head, and the checkpoint is unchanged.
   */
  unchanged?: boolean;
  [key: string]: unknown;
}

export interface CreateModelParams {
  workspace: string;
  slug: string;
  description?: string;
  defaultBranch?: string;
  model?: string;
  questions?: Record<string, Question>;
}

export interface UpdateModelParams {
  branch?: string;
  description?: string | null;
  model?: string;
  questions?: Record<string, Question>;
  message?: string;
}

export interface AnnotationInput {
  groundTruth: Record<string, JsonValue>;
  groundReasoning?: string;
}

export interface ExampleInput {
  id?: string;
  state: JsonValue;
  annotation?: AnnotationInput;
}

export interface InlineExample {
  id?: string;
  state: JsonValue;
}

export interface Annotation {
  groundTruth: Record<string, JsonValue>;
  groundReasoning: string | null;
  split: "train" | "test";
}

/** Successful decision nested in an example, without history-only fields. */
export interface ExampleDecision {
  id: string;
  commitSha: string;
  model: string;
  answers: Record<string, Answer>;
  request: Record<string, unknown>;
  response: Record<string, unknown>;
  confidence: number | null;
  version: number;
  checkpoint: number;
  revision: string;
  source: "batch" | "live";
  imageUrls: string[];
  createdAt: string;
}

export interface DecisionRecord extends Omit<ExampleDecision, "response"> {
  exampleId: string;
  jobId: string | null;
  response: Record<string, unknown> | null;
  error: string | null;
}

export interface Example {
  id: string;
  state: JsonValue;
  source: "ingest" | "live";
  imageUrls: string[];
  annotation: Annotation | null;
  latestDecision: ExampleDecision | null;
  decisionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExampleIngestResponse {
  examples: Example[];
}

export interface ExamplePage {
  items: Example[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface DecisionList {
  decisions: DecisionRecord[];
}

export type JobStatus = "queued" | "running" | "completed" | "failed" | "cancelled";

export interface JobError {
  code: string;
  message: string;
}

export interface BatchProgress {
  total: number;
  completed: number;
  failed: number;
}

export interface BatchDecision {
  id: string;
  repositoryId: string;
  status: JobStatus;
  phase: "queued" | "deciding" | "done" | "failed" | "cancelled";
  branch: string;
  sourceCommitSha: string;
  progress: BatchProgress;
  result: Record<string, unknown> | null;
  error: JobError | null;
  createdAt: string;
  updatedAt: string;
  startedAt: string | null;
  finishedAt: string | null;
}

export interface BatchDecisionList {
  batchDecisions: BatchDecision[];
}

export type BatchSelection =
  | { exampleIds: string[]; examples?: never; scope?: never }
  | { examples: InlineExample[]; exampleIds?: never; scope?: never }
  | { scope: "all"; exampleIds?: never; examples?: never };

export type CreateBatchDecisionParams = BatchSelection & {
  idempotencyKey: string;
  branch?: string;
  sourceCommitSha?: string;
};

export interface AlignmentProgress {
  stage: "starting" | "optimizing" | "scoring" | "finishing" | "committing" | "done";
  metricCalls?: number;
  maxMetricCalls?: number | null;
  iteration?: number;
  candidates?: number;
  initialScore?: number | null;
  bestScore?: number | null;
  elapsedSeconds?: number;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface Alignment {
  id: string;
  repositoryId: string;
  status: JobStatus;
  phase: "queued" | "optimizing" | "done" | "failed" | "cancelled";
  branch: string;
  sourceCommitSha: string;
  resultCommitSha: string | null;
  result: Record<string, unknown> | null;
  progress: AlignmentProgress | null;
  error: JobError | null;
  createdAt: string;
  updatedAt: string;
  startedAt: string | null;
  finishedAt: string | null;
}

export interface AlignmentList {
  alignments: Alignment[];
}

export interface AlignmentLogs {
  logs: string[];
  available: boolean;
  running: boolean;
}

export interface CreateAlignmentParams {
  branch: string;
  sourceCommitSha: string;
  maxMetricCalls: number;
  idempotencyKey: string;
  reflection?: {
    model?: string;
    minibatchSize?: number;
    seed?: number;
  };
}

export interface WaitOptions {
  /** Show server-reported progress on stderr. Off by default; ignored without a terminal stream. */
  progress?: boolean;
  pollIntervalMs?: number;
  timeoutMs?: number;
}
