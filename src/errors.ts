export class ModaicError extends Error {
  override readonly name: string = "ModaicError";
}

export interface ModaicAPIErrorOptions {
  status: number;
  code?: string;
  requestId?: string;
  details?: unknown;
  body?: unknown;
}

export class ModaicAPIError extends ModaicError {
  override readonly name = "ModaicAPIError";
  readonly status: number;
  readonly code: string | undefined;
  readonly requestId: string | undefined;
  readonly details: unknown;
  readonly body: unknown;

  constructor(message: string, options: ModaicAPIErrorOptions) {
    super(message);
    this.status = options.status;
    this.code = options.code;
    this.requestId = options.requestId;
    this.details = options.details;
    this.body = options.body;
  }
}

export class ModaicConnectionError extends ModaicError {
  override readonly name = "ModaicConnectionError";
}

export class ModaicTimeoutError extends ModaicError {
  override readonly name = "ModaicTimeoutError";
}
