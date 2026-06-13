/**
 * Batch predictions — the TS port of the Python SDK's `BatchJob` machinery
 * (`modaic_client.client.BatchJob` + its event/result types).
 *
 * A batch predictions job is started by {@link Arbiter.predict_all} via the
 * generated SDK (`client.jobs.startBatchPredictions`). The returned
 * {@link BatchJob} is a handle over that async job: poll its `status()`, stream
 * progress `events()`, fetch `results()`, `cancel()` it, or `wait()` until a
 * milestone and get the results back.
 *
 * Two endpoints are streamed (`/events` as SSE, `/results` as NDJSON). The
 * generated SDK funcs for those parse the body as a single JSON document and so
 * can't read line-delimited streams — `events()` and `results()` therefore use
 * a raw `fetch` and decode line-by-line, mirroring the Python client's
 * `_iter_sse_events` / `results()`.
 */

import { ModaicClient } from "../sdk/sdk.js";
import { AuthenticationError, ModaicError } from "./runtime.js";

/** Which milestone {@link BatchJob.wait} blocks for. */
export type WaitFor = "predictions" | "scores";

/** Per-phase progress counters carried on every progress snapshot. */
export interface ProgressCounters {
  current: number;
  total: number;
  completed: number;
  failed: number;
}

/** Summary of a finished job's result set (only on the terminal snapshot). */
export interface BatchResultsSummary {
  total: number;
  examples: number;
  arbiters: number;
}

/**
 * One progress snapshot from `GET /api/v1/jobs/batch/predictions/{job_id}`
 * or its SSE `/events` stream. Mirrors Python's `BatchProgressEvent`.
 *
 * `event ∈ {start, prediction, score, finish}` records what triggered the
 * snapshot; `status ∈ {predicting, scoring, done, failed}` is the job's phase.
 * `scoresProgress` stays undefined until scoring starts (and for the whole job
 * when `compute_confidence` is false). `error` is set only on `status:"failed"`.
 */
export interface BatchProgressEvent {
  event: string;
  status: string;
  jobId?: string | undefined;
  ts?: number | undefined;
  predictionsProgress?: ProgressCounters | undefined;
  scoresProgress?: ProgressCounters | undefined;
  results?: BatchResultsSummary | undefined;
  error?: string | null | undefined;
}

/**
 * One arbiter's prediction within a batch result row. The TS analog of Python's
 * `ArbiterPrediction`, kept as a plain data type — confidence, when computed,
 * is delivered inline rather than via a lazy-fetching property.
 */
export interface BatchPrediction {
  arbiterRepo: string;
  output: { [k: string]: unknown };
  reasoning: string;
  messages: Array<{ [k: string]: unknown }>;
  predictionId?: string;
  confidence?: number | null;
}

/** One example's results from a batch job, with its per-arbiter predictions. */
export interface BatchExampleResult {
  exampleId: string;
  input?: { [k: string]: unknown };
  predictions: BatchPrediction[];
}

/** Options for {@link BatchJob.wait}. */
export interface WaitOptions {
  /** Milestone to block for. Default `"predictions"`. */
  waitFor?: WaitFor;
  /** Seconds between polls in the fallback path. Default 30. */
  pollInterval?: number;
  /** Overall wait budget in seconds. Default 3600. */
  timeout?: number;
  /** Print a textual progress line to stderr. Default false. */
  showProgress?: boolean;
  /** Called with every progress snapshot (SSE or polled). */
  onEvent?: (event: BatchProgressEvent) => void;
}

/** Construction args for {@link BatchJob}. */
export interface BatchJobInit {
  client: ModaicClient;
  /** Bearer token, used for the raw-fetch streaming endpoints. */
  token: string;
  /** API base URL (e.g. `https://api.modaic.dev`), no trailing slash. */
  baseURL: string;
  jobId: string;
  total: number;
  /** Arbiter repos in request order; maps `predictions[i]` → `arbiters[i]`. */
  arbiters: string[];
}

/** Raised when a batch job reaches a terminal `status:"failed"`. */
export class BatchJobFailedError extends ModaicError {
  constructor(jobId: string, detail?: string | null) {
    super(`Batch job ${jobId} failed: ${detail ?? "unknown error"}`);
    this.name = "BatchJobFailedError";
  }
}

/** Raised when {@link BatchJob.wait} does not reach its milestone in time. */
export class BatchJobTimeoutError extends ModaicError {
  constructor(jobId: string, waitFor: WaitFor, timeout: number, lastStatus: string) {
    super(
      `Batch job ${jobId} did not reach \`${waitFor}\` within ${timeout}s ` +
        `(last status: ${lastStatus})`,
    );
    this.name = "BatchJobTimeoutError";
  }
}

/** Internal: server returned 404 for `/events`; caller falls back to polling. */
class StreamingNotAvailable extends Error {}

const TERMINAL_FOR_PREDICTIONS = new Set(["scoring", "done", "failed"]);
const TERMINAL_FOR_SCORES = new Set(["done", "failed"]);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Yield text lines from a byte stream, stripping a trailing `\r` from each. */
async function* iterLines(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let idx: number;
      while ((idx = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 1);
        yield line.endsWith("\r") ? line.slice(0, -1) : line;
      }
    }
    buffer += decoder.decode();
    if (buffer.length > 0) {
      yield buffer.endsWith("\r") ? buffer.slice(0, -1) : buffer;
    }
  } finally {
    reader.releaseLock();
  }
}

function toCounters(raw: any): ProgressCounters | undefined {
  if (raw == null || typeof raw !== "object") return undefined;
  return {
    current: Number(raw.current ?? 0),
    total: Number(raw.total ?? 0),
    completed: Number(raw.completed ?? 0),
    failed: Number(raw.failed ?? 0),
  };
}

/** Normalize a raw snapshot (snake_case JSON) into a {@link BatchProgressEvent}. */
export function toBatchProgressEvent(raw: any): BatchProgressEvent {
  const results = raw?.results;
  return {
    event: String(raw?.event ?? ""),
    status: String(raw?.status ?? ""),
    jobId: raw?.job_id ?? raw?.jobId ?? undefined,
    ts: typeof raw?.ts === "number" ? raw.ts : undefined,
    predictionsProgress: toCounters(raw?.predictions_progress ?? raw?.predictionsProgress),
    scoresProgress: toCounters(raw?.scores_progress ?? raw?.scoresProgress),
    results: results
      ? {
          total: Number(results.total ?? 0),
          examples: Number(results.examples ?? 0),
          arbiters: Number(results.arbiters ?? 0),
        }
      : undefined,
    error: raw?.error ?? undefined,
  };
}

/** Minimal stderr progress line — the TS stand-in for Python's tqdm bar. */
class ProgressPrinter {
  private n = 0;
  constructor(private readonly total: number) {
    this.render();
  }
  update(target: number): void {
    if (target > this.n) {
      this.n = target;
      this.render();
    }
  }
  finish(): void {
    this.n = this.total;
    this.render();
  }
  close(): void {
    try {
      process.stderr.write("\n");
    } catch {
      /* no stderr (e.g. browser) — progress is best-effort */
    }
  }
  private render(): void {
    try {
      process.stderr.write(`\rBatch predictions: ${this.n}/${this.total}`);
    } catch {
      /* no stderr — best-effort */
    }
  }
}

/** Handle for an in-flight batch predictions job. */
export class BatchJob {
  readonly client: ModaicClient;
  readonly jobId: string;
  readonly total: number;
  readonly arbiters: string[];
  private readonly token: string;
  private readonly baseURL: string;

  constructor(init: BatchJobInit) {
    this.client = init.client;
    this.token = init.token;
    this.baseURL = init.baseURL;
    this.jobId = init.jobId;
    this.total = init.total;
    this.arbiters = init.arbiters;
  }

  /** Latest progress snapshot via `GET /{job_id}` (generated SDK). */
  async status(): Promise<BatchProgressEvent> {
    const raw = await this.client.jobs.getBatchPredictionStatus({
      jobId: this.jobId,
    });
    return toBatchProgressEvent(raw);
  }

  /** Cancel the job via `DELETE /{job_id}` (generated SDK). */
  async cancel(): Promise<unknown> {
    return this.client.jobs.cancelBatchPrediction({ jobId: this.jobId });
  }

  /**
   * Stream progress snapshots from the SSE `/events` endpoint. Terminates on an
   * `event:"finish"` snapshot or when the connection closes. Throws
   * {@link StreamingNotAvailable} on 404 so `wait()` can fall back to polling.
   */
  async *events(
    opts: { timeout?: number; signal?: AbortSignal } = {},
  ): AsyncGenerator<BatchProgressEvent> {
    const timeout = opts.timeout ?? 3600;
    const resp = await this.openStream("/events", "text/event-stream", {
      connectTimeoutMs: timeout * 1000,
      signal: opts.signal,
    });
    if (resp.status === 404) {
      throw new StreamingNotAvailable("server does not expose /events for this job");
    }
    if (!resp.ok) throw await this.httpError(resp);
    if (!resp.body) return;

    let dataBuffer: string[] = [];
    for await (const line of iterLines(resp.body)) {
      if (line === "") {
        if (dataBuffer.length) {
          const payload = dataBuffer.join("\n");
          dataBuffer = [];
          let parsed: any;
          try {
            parsed = JSON.parse(payload);
          } catch {
            continue;
          }
          const evt = toBatchProgressEvent(parsed);
          yield evt;
          if (evt.event === "finish") return;
        }
        continue;
      }
      if (line.startsWith(":")) continue;
      if (line.startsWith("event:")) continue;
      if (line.startsWith("data:")) {
        dataBuffer.push(line.slice("data:".length).replace(/^\s+/, ""));
      }
    }
    if (dataBuffer.length) {
      try {
        yield toBatchProgressEvent(JSON.parse(dataBuffer.join("\n")));
      } catch {
        /* trailing non-JSON block — ignore */
      }
    }
  }

  /** Fetch all result rows from the NDJSON `/results` endpoint. */
  async results(): Promise<BatchExampleResult[]> {
    const resp = await this.openStream("/results", "application/x-ndjson");
    if (!resp.ok) throw await this.httpError(resp);
    const rows: BatchExampleResult[] = [];
    if (!resp.body) {
      const text = await resp.text();
      for (const line of text.split("\n")) {
        if (line.trim()) rows.push(this.rowToResult(JSON.parse(line)));
      }
      return rows;
    }
    for await (const line of iterLines(resp.body)) {
      if (!line.trim()) continue;
      rows.push(this.rowToResult(JSON.parse(line)));
    }
    return rows;
  }

  /**
   * Block until the job reaches `waitFor`, then return its results.
   *
   * Runs the SSE `/events` stream and `GET /{job_id}` polling concurrently: SSE
   * gives low-latency progress (and the terminal frame when the server sends
   * one), while polling is the authority that guarantees termination. The live
   * `/events` stream can emit only a `start` snapshot and then idle without a
   * terminal frame, so SSE alone is not trusted to end the wait. On a 404 / any
   * transport failure the SSE pass simply drops out and polling carries it.
   */
  async wait(opts: WaitOptions = {}): Promise<BatchExampleResult[]> {
    const waitFor = opts.waitFor ?? "predictions";
    const pollInterval = opts.pollInterval ?? 30;
    const timeout = opts.timeout ?? 3600;
    const showProgress = opts.showProgress ?? false;
    const onEvent = opts.onEvent;

    const barTotal = waitFor === "scores" ? this.total * 2 : this.total;
    const bar = showProgress ? new ProgressPrinter(barTotal) : null;

    const barTarget = (evt: BatchProgressEvent): number => {
      let done = evt.predictionsProgress?.current ?? 0;
      if (waitFor === "scores" && evt.scoresProgress) {
        done += evt.scoresProgress.current;
      }
      return done;
    };
    // De-dup progress so the SSE stream and the poller (which run concurrently)
    // don't double-report identical snapshots to the bar / onEvent callback.
    let lastKey = "";
    const dispatch = (evt: BatchProgressEvent): void => {
      const key =
        `${evt.event}|${evt.status}|` +
        `${evt.predictionsProgress?.current ?? ""}|${evt.scoresProgress?.current ?? ""}`;
      if (key === lastKey) return;
      lastKey = key;
      if (bar) bar.update(barTarget(evt));
      if (onEvent) onEvent(evt);
    };
    const isTerminal = (evt: BatchProgressEvent): boolean => {
      if (evt.event === "finish") return true;
      if (waitFor === "predictions") return TERMINAL_FOR_PREDICTIONS.has(evt.status);
      return TERMINAL_FOR_SCORES.has(evt.status);
    };

    const ac = new AbortController();
    // A never-settling promise: a `null` SSE result (stream closed with no
    // terminal frame) is folded into this so it can't win the race below.
    const never = new Promise<BatchProgressEvent>(() => {});

    const ssePass = (async (): Promise<BatchProgressEvent | null> => {
      try {
        for await (const evt of this.events({ timeout, signal: ac.signal })) {
          dispatch(evt);
          if (isTerminal(evt)) return evt;
        }
      } catch {
        // 404 (no stream), abort, or transport failure — polling takes over.
      }
      return null;
    })();

    const pollPass = (async (): Promise<BatchProgressEvent> => {
      const deadline = Date.now() + timeout * 1000;
      for (;;) {
        const evt = await this.status();
        dispatch(evt);
        if (isTerminal(evt)) return evt;
        if (Date.now() >= deadline) {
          throw new BatchJobTimeoutError(this.jobId, waitFor, timeout, evt.status);
        }
        await sleep(pollInterval * 1000);
      }
    })();

    try {
      const terminal = await Promise.race([
        ssePass.then((e) => e ?? never),
        pollPass,
      ]);
      if (terminal.status === "failed") {
        throw new BatchJobFailedError(this.jobId, terminal.error);
      }
      if (bar) bar.finish();
      return await this.results();
    } finally {
      ac.abort(); // tear down the SSE connection
      if (bar) bar.close();
    }
  }

  private rowToResult(payload: any): BatchExampleResult {
    const preds: any[] = Array.isArray(payload?.predictions) ? payload.predictions : [];
    const predictions: BatchPrediction[] = preds.map((p, i) => ({
      arbiterRepo: this.arbiters[i] ?? "",
      output: p?.output ?? {},
      reasoning: p?.reasoning ?? "",
      messages: Array.isArray(p?.messages) ? p.messages : [],
      predictionId: p?.prediction_id ?? p?.predictionId ?? undefined,
      confidence: p?.confidence ?? undefined,
    }));
    return {
      exampleId: String(payload?.example_id ?? payload?.exampleId ?? ""),
      input: payload?.input ?? undefined,
      predictions,
    };
  }

  /** Open a streaming GET against this job, with optional connect timeout. */
  private async openStream(
    suffix: string,
    accept: string,
    opts: { connectTimeoutMs?: number; signal?: AbortSignal | undefined } = {},
  ): Promise<Response> {
    const url =
      `${this.baseURL}/api/v1/jobs/batch/predictions/` +
      `${encodeURIComponent(this.jobId)}${suffix}`;
    const controller = new AbortController();
    // An external signal (from `wait()`) cancels the stream — used to tear down
    // the SSE connection once polling has determined the job is done.
    if (opts.signal) {
      if (opts.signal.aborted) controller.abort();
      else opts.signal.addEventListener("abort", () => controller.abort(), { once: true });
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    // Bound only the connect (header) phase — `fetch` resolves once headers
    // arrive, after which we clear the timer and read the body unbounded
    // (mirrors httpx connect=timeout, read=None).
    if (opts.connectTimeoutMs && opts.connectTimeoutMs > 0) {
      timer = setTimeout(() => controller.abort(), opts.connectTimeoutMs);
    }
    try {
      return await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${this.token}`, Accept: accept },
        signal: controller.signal,
      });
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  private async httpError(resp: Response): Promise<Error> {
    let detail = "";
    try {
      detail = await resp.text();
    } catch {
      /* body already consumed or unavailable */
    }
    if (resp.status === 401 || resp.status === 403) {
      return new AuthenticationError(detail || `Unauthorized (${resp.status})`);
    }
    return new ModaicError(
      `Batch job request failed (${resp.status})${detail ? `: ${detail}` : ""}`,
    );
  }
}
