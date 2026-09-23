import { ModaicAPIError, ModaicConnectionError, ModaicTimeoutError } from "./errors.js";

const DEFAULT_BASE_URL = "https://modaic.dev/api/v1";

type Fetch = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

export interface ClientOptions {
  apiKey?: string;
  baseUrl?: string;
  timeoutMs?: number;
  fetch?: Fetch;
}

interface RequestOptions {
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  headers?: Record<string, string>;
}

function environment(name: string): string | undefined {
  const target = globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  };
  return target.process?.env?.[name];
}

function object(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export class Transport {
  readonly #apiKey: string;
  readonly #baseUrl: string;
  readonly #timeoutMs: number;
  readonly #fetch: Fetch;

  constructor(options: ClientOptions = {}) {
    const apiKey = options.apiKey ?? environment("MODAIC_API_KEY");
    if (!apiKey) {
      throw new Error("Set MODAIC_API_KEY or pass apiKey to the client.");
    }
    const fetchImplementation = options.fetch ?? globalThis.fetch;
    if (!fetchImplementation) {
      throw new Error("A global fetch implementation or options.fetch is required.");
    }
    this.#apiKey = apiKey;
    this.#baseUrl = (options.baseUrl || environment("MODAIC_API_URL") || DEFAULT_BASE_URL).replace(
      /\/+$/,
      "",
    );
    this.#timeoutMs = options.timeoutMs ?? 30_000;
    this.#fetch = fetchImplementation;
  }

  async request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
    const deadline = performance.now() + this.#timeoutMs;
    const delays = [100, 200, 400, 800, 1600];
    for (let attempt = 0; ; attempt++) {
      const remaining = deadline - performance.now();
      if (attempt > 0 && remaining <= 0) throw new ModaicTimeoutError("Modaic API replay timed out.");
      try {
        return await this.#requestOnce<T>(method, path, options, attempt === 0 ? this.#timeoutMs : remaining);
      } catch (error) {
        const delay = delays[attempt];
        if (!(error instanceof ModaicAPIError) || error.status !== 409
          || error.code !== "decision_in_progress" || method !== "POST" || path !== "/systemone"
          || !new Headers(options.headers).get("idempotency-key") || delay === undefined) throw error;
        if (performance.now() + delay >= deadline) throw new ModaicTimeoutError("Modaic API replay timed out.");
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  async #requestOnce<T>(method: string, path: string, options: RequestOptions, timeoutMs: number): Promise<T> {
    const url = new URL(`${this.#baseUrl}${path}`);
    for (const [key, value] of Object.entries(options.query ?? {})) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    let response: Response;
    try {
      const headers = new Headers(options.headers);
      headers.set("authorization", `Bearer ${this.#apiKey}`);
      headers.set("accept", "application/json");
      if (options.body !== undefined) headers.set("content-type", "application/json");
      response = await this.#fetch(url, {
        method,
        headers,
        signal: controller.signal,
        ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
      });
    } catch (error) {
      clearTimeout(timeout);
      if (controller.signal.aborted) {
        throw new ModaicTimeoutError("Modaic API request timed out.", { cause: error });
      }
      throw new ModaicConnectionError("Could not reach the Modaic API.", { cause: error });
    }

    let text: string;
    try {
      // Fetch resolves at headers; retain the timeout until the body arrives.
      text = await response.text();
    } catch (error) {
      if (controller.signal.aborted) {
        throw new ModaicTimeoutError("Modaic API request timed out.", { cause: error });
      }
      throw new ModaicConnectionError("Could not read the Modaic API response.", { cause: error });
    } finally {
      clearTimeout(timeout);
    }
    let body: unknown;
    if (text) {
      try {
        body = JSON.parse(text) as unknown;
      } catch (error) {
        if (response.ok) {
          throw new ModaicConnectionError("Modaic API returned invalid JSON.", { cause: error });
        }
        body = text;
      }
    }

    if (!response.ok) {
      let message = `Modaic API returned HTTP ${response.status}.`;
      let code: string | undefined;
      let requestId = response.headers.get("x-request-id") ?? undefined;
      let details: unknown;
      if (object(body)) {
        if (typeof body.code === "string") code = body.code;
        if (typeof body.detail === "string") message = body.detail;
        if (typeof body.requestId === "string") requestId = body.requestId;
        details = body.details;
        if (object(body.error)) {
          if (typeof body.error.code === "string") code = body.error.code;
          if (typeof body.error.message === "string") message = body.error.message;
        }
      }
      throw new ModaicAPIError(message, {
        status: response.status,
        ...(code === undefined ? {} : { code }),
        ...(requestId === undefined ? {} : { requestId }),
        details,
        body,
      });
    }

    return body as T;
  }
}

export function segment(value: string): string {
  return encodeURIComponent(value);
}
