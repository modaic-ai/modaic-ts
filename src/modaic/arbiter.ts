import { z } from "zod";
import { Signature } from "./signatures.js";
import {
  serializeSignatureToConfig,
  buildProgramJson,
  repoNameToTitle,
} from "./serialization.js";
import { resolveToken, getApiUrl, ModaicError } from "./runtime.js";
import {
  syncAndPush,
  createRepo,
  type Commit,
  type PushFiles,
} from "./git.js";
import { ModaicClient } from "../sdk/sdk.js";
import type {
  PredictExampleResponse,
  BatchExample,
  BatchPredictionsJobRequest,
} from "../models/index.js";
import {
  BatchJob,
  type BatchExampleResult,
  type BatchProgressEvent,
  type WaitFor,
  type WaitOptions,
} from "./batch.js";

/**
 * The fixed description given to an Arbiter's injected `reasoning` output field.
 * Matches the Python SDK (`make_arbiter`) verbatim — original wording included —
 * so judges authored here stay byte-compatible with Python ones.
 */
const REASONING_DESC =
  "Your reasoning for your answer. Inlude any uncertainties about your answer or ambiguity in the task.";

/**
 * Return a Signature guaranteed to have a `reasoning` output field — the TS analog
 * of Python `make_arbiter`. Arbiters must expose a plain `reasoning: string` output
 * because the server reads `prediction.reasoning` on every prediction; without it,
 * predictions fail server-side.
 *
 * Mirrors `make_arbiter`'s `signature.insert(-2, "reasoning", …)`: reasoning is
 * inserted within the output section just before the last output field (so a
 * single-output judge gets reasoning first). Idempotent — if a `reasoning` output
 * already exists, the signature is returned unchanged.
 */
export function ensure_reasoning_field(
  signature: Signature,
): Signature<z.ZodObject<any>, z.ZodObject<any>> {
  const outShape = signature.output.shape as Record<string, z.ZodType>;
  if ("reasoning" in outShape) {
    return new Signature({
      instructions: signature.instructions,
      input: signature.input,
      output: signature.output,
    });
  }

  // A plain string field. Set the description on both `.describe()` and `.meta()`
  // so it surfaces in program.json (dump_state) and config.json (serializeField).
  let reasoningField: z.ZodType = z.string().describe(REASONING_DESC);
  if (typeof (reasoningField as any).meta === "function") {
    reasoningField = (reasoningField as any).meta({
      description: REASONING_DESC,
      desc: REASONING_DESC,
    });
  }

  const entries = Object.entries(outShape);
  const insertIdx = Math.max(0, entries.length - 1);
  const newShape: Record<string, z.ZodType> = {};
  entries.forEach(([k, field], i) => {
    if (i === insertIdx) newShape["reasoning"] = reasoningField;
    newShape[k] = field;
  });
  if (entries.length === 0) newShape["reasoning"] = reasoningField;

  return new Signature({
    instructions: signature.instructions,
    input: signature.input,
    output: z.object(newShape),
  });
}

/** Options for constructing an Arbiter handle to an existing repo. */
export interface ArbiterOptions {
  /** Git branch used for create/update operations. Default "main". */
  branch?: string;
  /** Revision (branch/tag/commit) used when running predictions. Default = branch. */
  rev?: string;
}

/** Options for `Arbiter.create`. */
export interface CreateOptions {
  repo: string;
  signature: Signature;
  /**
   * The LiteLLM model string the server runs this judge with, e.g.
   * "gpt-oss-120b" or "openai/gpt-4o". Required — an arbiter with no model is
   * not runnable: `predict()` would fail server-side.
   */
  model: string;
  branch?: string;
  tag?: string;
  access_token?: string;
  commit_message?: string;
  private?: boolean;
  metadata?: Record<string, unknown> | null;
  extra_files?: string[] | null;
}

/** Options for `arbiter.update`. */
export interface UpdateOptions {
  /** Optional new signature; when provided, config.json and program.json are rewritten. */
  signature?: Signature;
  /**
   * LiteLLM model string. Required when `signature` is provided, since rewriting
   * `program.json` needs the model written into its `lm` block.
   */
  model?: string;
  metadata?: Record<string, unknown> | null;
  extra_files?: string[] | null;
  commit_message?: string;
  tag?: string;
  access_token?: string;
}

/** Options for `arbiter.predict`. */
export interface PredictOptions {
  ground_truth?: Record<string, unknown> | null;
  ground_reasoning?: string;
  compute_confidence?: boolean;
}

/** Options for `arbiter.predict_all`. Mirrors the Python SDK's `predict_all`. */
export interface PredictAllOptions {
  /**
   * Re-predict existing examples by their ClickHouse ids instead of ingesting
   * new ones. Mutually exclusive with the `examples` argument — pass exactly one.
   */
  example_ids?: string[] | null;
  /** Enqueue batch confidence scoring after predictions persist. Default false. */
  compute_confidence?: boolean;
  /**
   * Milestone to block for, or `null` to return the {@link BatchJob} handle
   * immediately without waiting. Default `"predictions"`. `"scores"` requires
   * `compute_confidence: true`.
   */
  wait_for?: WaitFor | null;
  /** Seconds between polls in the fallback path. Default 30. */
  poll_interval?: number;
  /** Overall wait budget in seconds. Default 3600. */
  timeout?: number;
  /** Print a textual progress line to stderr while waiting. Default false. */
  show_progress?: boolean;
  /** Called with every progress snapshot (SSE or polled) while waiting. */
  on_event?: (event: BatchProgressEvent) => void;
}

/**
 * Supported arbiter probe models, mirroring the Python SDK's `ARBITER_PROBES`
 * (`modaic/programs/arbiters.py`) verbatim. Keys are normalized model names; values
 * become README frontmatter (alongside `is_arbiter: true`). Keep in sync with Python —
 * the commented entries below are kept as-is so the two tables stay aligned.
 */
export const ARBITER_PROBES: Record<string, Record<string, unknown>> = {
  // "qwen3-32b": { probe_model: "modaic/qwen3-32b-probe", size: "medium" },
  // "qwen3-vl-32b-instruct": { probe_model: "modaic/qwen3-32b-probe", size: "medium" },
  // "qwen3.5-4b": { probe_model: "modaic/qwen3.5-4b-probe", size: "small", supports_reasoning: true },
  "llama-3.1-8b": { model: "llama-3.1-8b", size: "small" },
  "llama-3.1-8b-instruct": { model: "llama-3.1-8b", size: "small" },
  "gpt-oss-120b": { model: "gpt-oss-120b", size: "medium", supports_reasoning: true },
};

/**
 * Normalize a LiteLLM model string to its bare model name — the TS analog of Python's
 * `normalize_model_name`. Strips any provider prefix, lowercases, and turns `:` tags into
 * `-` (e.g. `"openai/GPT-OSS-120B"` and `"vllm/gpt-oss-120b:latest"` → `"gpt-oss-120b"`).
 */
export function normalizeModelName(model: string): string {
  return model.toLowerCase().split("/").pop()!.replace(/:/g, "-");
}

/**
 * Build the arbiter metadata stamped into the README frontmatter for `model` — the TS
 * analog of Python `make_arbiter`'s `predict.metadata |= {"is_arbiter": True, **ARBITER_PROBES[...]}`.
 *
 * Throws if the (normalized) model isn't a supported probe model, matching the Python SDK.
 * The Python `register_reasoning_model`/litellm step is intentionally skipped: the TS SDK
 * never runs the LLM locally, so there is nothing to register.
 */
export function arbiterMetadata(model: string): Record<string, unknown> {
  const normalized = normalizeModelName(model);
  const probe = ARBITER_PROBES[normalized];
  if (!probe) {
    throw new Error(
      `Arbiters are not supported for model ${model}, see ` +
        "https://docs.modaic.dev/guides/basic_usage/create_an_arbiter",
    );
  }
  return { is_arbiter: true, ...probe };
}

/**
 * A handle to a Modaic Arbiter (an LLM judge) stored on Modaic Hub.
 *
 * Like `modaic_client.Arbiter`, this is a thin wrapper over the Modaic REST API
 * and git — it never runs an LLM locally. `predict()` calls the API; `create()`
 * and `update()` write the judge's `config.json` / `program.json` and push them
 * to the hub via git, mirroring `modaic.Predict.push_to_hub`.
 */
export class Arbiter {
  repo: string;
  branch: string;
  rev: string;

  constructor(repo: string, opts: ArbiterOptions = {}) {
    this.repo = repo;
    this.branch = opts.branch ?? "main";
    this.rev = opts.rev ?? this.branch;
  }

  /**
   * Create a new Arbiter repo on the hub and push its signature.
   *
   * Builds `config.json` (signature schema) and `program.json` (stored prompt)
   * the same way the Python SDK does, creates the remote repo (private by
   * default), then commits & pushes on `branch`.
   */
  static async create(opts: CreateOptions): Promise<Arbiter> {
    const branch = opts.branch ?? "main";
    const token = resolveToken(opts.access_token);

    // Build files first so a bad signature fails before we create a repo.
    // Inject the `reasoning` output field so the judge is a valid Arbiter.
    const signature = ensure_reasoning_field(opts.signature);
    const config = serializeSignatureToConfig(
      signature,
      repoNameToTitle(opts.repo),
    );
    const program = buildProgramJson(signature, opts.model);

    await createRepo(opts.repo, {
      private: opts.private ?? true,
      existOk: true,
      token,
    });

    await syncAndPush({
      repo: opts.repo,
      branch,
      token,
      files: { config, program },
      // Stamp is_arbiter + the probe metadata the confidence scorer needs (user metadata wins,
      // matching Python's `self.metadata | (metadata or {})`). Throws on an unsupported model.
      metadata: { ...arbiterMetadata(opts.model), ...(opts.metadata ?? {}) },
      extraFiles: opts.extra_files ?? null,
      commitMessage: opts.commit_message ?? "(no commit message)",
      tag: opts.tag,
    });

    return new Arbiter(opts.repo, { branch, rev: opts.tag ?? branch });
  }

  /**
   * Pull the latest commit of this Arbiter's branch, write whatever is provided
   * (a new signature rewrites config.json + program.json; metadata updates the
   * README; extra_files are copied in), then commit & push.
   */
  async update(opts: UpdateOptions = {}): Promise<Commit> {
    const token = resolveToken(opts.access_token);

    const files: PushFiles = {};
    if (opts.signature) {
      if (!opts.model) {
        throw new Error(
          "update() requires `model` when `signature` is provided, so the " +
            "rewritten program.json records the inference model.",
        );
      }
      const signature = ensure_reasoning_field(opts.signature);
      files.config = serializeSignatureToConfig(
        signature,
        repoNameToTitle(this.repo),
      );
      files.program = buildProgramJson(signature, opts.model);
    }

    return syncAndPush({
      repo: this.repo,
      branch: this.branch,
      token,
      files,
      // When the model is (re)written, re-stamp is_arbiter + probe metadata; a metadata-only update
      // leaves it untouched. User metadata wins.
      metadata: opts.model ? { ...arbiterMetadata(opts.model), ...(opts.metadata ?? {}) } : (opts.metadata ?? null),
      extraFiles: opts.extra_files ?? null,
      commitMessage: opts.commit_message ?? "(no commit message)",
      tag: opts.tag,
    });
  }

  /**
   * Run this Arbiter against a single input via the Modaic API. The server runs
   * the LLM; this is a pure HTTP call through the generated SDK
   * (`POST /api/v2/arbiters/predictions`).
   */
  async predict(
    input: Record<string, unknown>,
    opts: PredictOptions = {},
  ): Promise<PredictExampleResponse> {
    // Resolve the token up front so a missing token throws AuthenticationError
    // before any client is constructed.
    const token = resolveToken();
    const client = new ModaicClient({ token, serverURL: getApiUrl() });
    return client.predictions.create({
      input,
      arbiterRepo: this.repo,
      arbiterRevision: this.rev,
      groundTruth: opts.ground_truth ?? null,
      groundReasoning: opts.ground_reasoning ?? "",
      computeConfidence: opts.compute_confidence ?? false,
    });
  }

  /**
   * Run a batch of predictions against this Arbiter as an async job.
   *
   * Mirrors Python's `Arbiter.predict_all`: it starts a batch job via
   * `client.jobs.startBatchPredictions` (this single arbiter), then — unless
   * `wait_for` is `null` — blocks until the requested milestone and returns the
   * per-example results. With `wait_for: null` it returns the {@link BatchJob}
   * handle immediately so the caller can drive `status()` / `wait()` / `cancel()`.
   *
   * Pass exactly one input mode: `examples` (ingest new rows) or
   * `opts.example_ids` (re-predict existing rows by ClickHouse id).
   */
  async predict_all(
    examples: BatchExample[] | null,
    opts: PredictAllOptions = {},
  ): Promise<BatchJob | BatchExampleResult[]> {
    const waitFor = opts.wait_for === undefined ? "predictions" : opts.wait_for;
    const computeConfidence = opts.compute_confidence ?? false;
    const exampleIds = opts.example_ids ?? null;

    // Exactly one of `examples` / `example_ids`.
    if ((examples == null) === (exampleIds == null)) {
      throw new ModaicError(
        "predict_all requires exactly one of `examples` or `example_ids`",
      );
    }
    if (waitFor === "scores" && !computeConfidence) {
      throw new ModaicError(
        "wait_for='scores' requires compute_confidence=true",
      );
    }

    let nExamples: number;
    if (examples != null) {
      if (examples.length > 1000) {
        throw new ModaicError("predict_all accepts at most 1000 examples per call");
      }
      examples.forEach((ex, i) => {
        if (ex == null || ex.input == null) {
          throw new ModaicError(`examples[${i}] is missing required 'input' key`);
        }
      });
      nExamples = examples.length;
    } else {
      if (exampleIds!.length > 1000) {
        throw new ModaicError(
          "predict_all accepts at most 1000 example_ids per call",
        );
      }
      nExamples = exampleIds!.length;
    }

    // Resolve the token up front so a missing token throws AuthenticationError
    // before any client is constructed.
    const token = resolveToken();
    const baseURL = getApiUrl();
    const client = new ModaicClient({ token, serverURL: baseURL });

    const request: BatchPredictionsJobRequest = {
      arbiters: [{ arbiterRepo: this.repo, arbiterRevision: this.rev }],
      computeConfidence,
    };
    if (examples != null) request.examples = examples;
    if (exampleIds != null) request.exampleIds = exampleIds;

    const data: any = await client.jobs.startBatchPredictions(request);

    const job = new BatchJob({
      client,
      token,
      baseURL,
      jobId: data?.job_id ?? data?.jobId,
      total: data?.total ?? nExamples, // single arbiter ⇒ total = n_examples
      arbiters: [this.repo],
    });

    if (waitFor == null) return job;

    // Build wait options without passing `undefined` (exactOptionalPropertyTypes).
    const waitOpts: WaitOptions = { waitFor };
    if (opts.poll_interval !== undefined) waitOpts.pollInterval = opts.poll_interval;
    if (opts.timeout !== undefined) waitOpts.timeout = opts.timeout;
    if (opts.show_progress !== undefined) waitOpts.showProgress = opts.show_progress;
    if (opts.on_event !== undefined) waitOpts.onEvent = opts.on_event;
    return job.wait(waitOpts);
  }

  /**
   * Alias for {@link predict}. (Python's `__call__` is not idiomatic in TS.)
   */
  call(
    input: Record<string, unknown>,
    opts: PredictOptions = {},
  ): Promise<PredictExampleResponse> {
    return this.predict(input, opts);
  }
}
