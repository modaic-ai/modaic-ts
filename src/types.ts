export type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue };

export type ReasoningEffort = "low" | "medium" | "high" | "xhigh";

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
  reasoningTokens?: number;
}

export interface ThinkingResult {
  maxTokens: number | null;
  reasoningTokens: number;
  generatedTokens: number;
  finishReason: "natural" | "budget_exhausted" | "context_exhausted";
  generationMs: number;
  scoringMs: number;
  cachedTokens: number | null;
}

/**
 * Anything that validates an unknown value into `T`.
 *
 * Zod schemas satisfy this structurally, as do Valibot's and ArkType's
 * parse-throwing wrappers and any hand-written validator, so typed responses
 * cost the SDK no runtime dependency and tie nobody to one library.
 */
export interface ResponseSchema<T> {
  parse(value: unknown): T;
}

export interface CreateDecisionParams {
  state: JsonValue;
  model: string;
  questions?: Record<string, Question>;
  revision?: string;
  exampleId?: string;
  capture?: boolean;
  reasoningEffort?: ReasoningEffort;
  idempotencyKey?: string;
}

export interface DecisionResponse {
  model: string;
  answers: Record<string, Answer>;
  usage: TokenUsage;
  thinking?: Record<string, ThinkingResult>;
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
  create<T>(
    params: Omit<CreateDecisionParams, "model"> & { schema: ResponseSchema<T> },
  ): Promise<T>;
  create(params: Omit<CreateDecisionParams, "model">): Promise<DecisionResponse>;
}

export interface ExampleSummary {
  total: number;
  graded: number;
  commitShas: string[];
}

export interface ModelExamples {
  ingest(examples: ExampleInput[]): Promise<ExampleIngestResponse>;
  list(options?: { page?: number; pageSize?: number }): Promise<ExamplePage>;
  summary(): Promise<ExampleSummary>;
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
  model: string;
  questions?: Record<string, Question>;
}

export interface UpdateModelParams {
  branch?: string;
  description?: string | null;
  model?: string;
  questions?: Record<string, Question>;
  message?: string;
  /**
   * Required to replace questions that alignment wrote. Once a model has an
   * alignment checkpoint, `questions` that differ from the stored ones are
   * refused with `409 alignment_would_be_discarded` unless this is true; the
   * update then commits the new questions and resets the checkpoint to 0.
   */
  discardAlignment?: boolean;
  /**
   * Optimistic concurrency: the branch head you last read (`model.commit.commitSha`).
   * If the branch has advanced since, the update is refused with
   * `409 expected_head_mismatch` instead of overwriting newer commits.
   */
  expectedHeadSha?: string;
}

export interface Branch {
  name: string;
  headSha: string;
  createdAt: string;
}

export interface BranchList {
  branches: Branch[];
}

export interface Commit {
  sha: string;
  parentShas: string[];
  message: string;
  authorName: string;
  authorEmail: string;
  createdAt: string;
}

export interface CommitList {
  commits: Commit[];
}

export interface CommitDetails extends Commit {
  committerName: string;
  committerEmail: string;
  verified: boolean;
  files: Array<{
    path: string;
    status: "added" | "modified" | "deleted" | "renamed" | "copied" | "type_changed" | "unmerged" | "unknown";
    previousPath?: string;
  }>;
  stats: { files: number; additions: number; deletions: number; changes: number };
}

export interface RepositoryFile {
  path: string;
  type: "blob" | "tree" | "symlink" | "submodule";
  mode: string;
}

export interface RepositoryFileList {
  files: RepositoryFile[];
}

export interface RepositoryFileContents {
  path: string;
  revision: string | null;
  contents: string;
}

export type RepositoryFileChange =
  | { operation: "upsert"; path: string; contents: string }
  | { operation: "delete"; path: string };

/** An immutable name for a commit, usable as a decision `revision`. */
export interface Tag {
  name: string;
  commitSha: string;
}

export interface TagList {
  tags: Tag[];
}

export interface RollbackParams {
  branch: string;
  /** Commit whose files become the branch head again, checkpoint and metrics included. */
  targetCommitSha: string;
  /** The branch's current head; a stale value is refused with `409`. */
  expectedHeadSha: string;
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
  /**
   * Metric-call budget for the run. Optional: when omitted, the API sizes
   * the budget to the validation split at launch, which is the recommended
   * default. Set it only to override that sizing.
   */
  maxMetricCalls?: number;
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

export type ResourceKind = "dataset" | "eval-only-dataset" | "artifact";
export type TrainingType = "head_only" | "lora";
export type FineTuneStatus =
  | "queued"
  | "training"
  | "committing"
  | "publishing"
  | "done"
  | "failed"
  | "cancelled";

export interface TrainingControls {
  nEpochs?: number;
  nCheckpoints?: number;
  nEvals?: number;
  batchSize?: number | "max";
  gradientAccumulationSteps?: number;
  learningRate?: number;
  lrScheduler?: {
    lrSchedulerType?: "constant" | "linear" | "cosine";
    lrSchedulerArgs?: { minLrRatio?: number; numCycles?: number };
  };
  warmupRatio?: number;
  maxGradNorm?: number;
  weightDecay?: number;
  randomSeed?: number | null;
  earlyStoppingEnabled?: boolean;
  earlyStoppingPatience?: number;
  earlyStoppingMinDelta?: number;
  earlyStoppingWarmupEvals?: number | null;
}

export interface CreateFineTuneParams extends TrainingControls {
  model: string;
  trainingFile: string;
  trainingType?: TrainingType;
  destination?: string;
  branch?: string;
  sourceCommitSha?: string;
  validationFile?: string;
  evalOnlyDataset?: string;
  suffix?: string;
  fromCheckpoint?: string;
  loraR?: number;
  loraAlpha?: number;
  loraDropout?: number;
  wandbApiKey?: string;
  wandbBaseUrl?: string;
  wandbProjectName?: string;
  wandbName?: string;
  wandbEntity?: string;
  trainVision?: false;
  idempotencyKey?: string;
}

export interface FineTunePublication {
  commitSha: string;
  branch: string;
}

export interface FineTuneResult {
  metrics: Record<string, unknown> | null;
  evaluation: Record<string, unknown> | null;
  servingQualification: Record<string, unknown> | null;
  publication: FineTunePublication | null;
}

export interface FineTune {
  id: string;
  repositoryId: string;
  datasetId: string;
  trainingFile: string;
  datasetCommitSha: string;
  datasetSha256: string;
  status: FineTuneStatus;
  branch: string;
  sourceCommitSha: string;
  resultCommitSha: string | null;
  trainingType: TrainingType;
  preset: string;
  progress: unknown;
  result: FineTuneResult | null;
  error: JobError | null;
  createdAt: string;
  updatedAt: string;
  startedAt: string | null;
  finishedAt: string | null;
}

export interface FineTuneList {
  fineTunes: FineTune[];
}

export interface FineTuneLogs {
  logs: string[];
  available: boolean;
  running: boolean;
}

export interface Resource {
  id: string;
  name: string;
  description: string | null;
  kind: ResourceKind;
  path: string;
  sha256: string;
  sizeBytes: number;
  repos: string[];
  commitSha: string;
}

export interface ResourcePage {
  resources: Resource[];
  commitSha: string | null;
  nextCursor: string | null;
}

export interface UploadPart {
  partNumber: number;
  sha256: string;
  sizeBytes: number;
  uploaded: boolean;
}

export interface Upload {
  id: string;
  name: string;
  description: string | null;
  kind: ResourceKind;
  sha256: string;
  sizeBytes: number;
  repos: string[];
  status: "pending" | "processing" | "completed" | "failed" | "cancelled" | "expired";
  createdAt: string;
  expiresAt: string;
  partSizeBytes: number;
  parts: UploadPart[];
  result: UploadResult | null;
  error: JobError | null;
}

export interface UploadResult {
  name: string;
  description: string | null;
  kind: ResourceKind;
  path: string;
  sha256: string;
  sizeBytes: number;
  repos: string[];
  commitSha: string;
}

export interface PreparedUploadPart {
  partNumber: number;
  uploadUrl: string;
  method: "PUT";
  headers: Record<string, string>;
  expiresIn: number;
}

export interface CreateUploadParams {
  name: string;
  kind: ResourceKind;
  sha256: string;
  sizeBytes: number;
  description?: string;
  repos?: string[];
}

export interface UploadFileProgress {
  uploadedBytes: number;
  totalBytes: number;
  partNumber: number;
  partCount: number;
}

export interface UploadFileParams {
  workspace: string;
  name: string;
  kind: ResourceKind;
  description?: string;
  repos?: string[];
  waitForValidation?: boolean;
  pollIntervalMs?: number;
  timeoutMs?: number;
  onProgress?: (progress: UploadFileProgress) => void;
}

export interface ResourceQuery {
  commitSha?: string;
}

export interface ProtegeJob {
  id: string;
  status: "running" | "succeeded" | "failed" | "cancelled";
}
