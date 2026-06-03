import os from "node:os";
import path from "node:path";

/* -------------------------------------------------------------------------- */
/*  Errors                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Base error for all Modaic library failures.
 *
 * Note: the generated Speakeasy SDK has its own unrelated HTTP-transport base
 * error, renamed to `ModaicClientError` via `baseErrorName` in gen.yaml so the
 * two never clash. This `ModaicError` is the library's domain-error base.
 */
export class ModaicError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ModaicError";
  }
}

/**
 * Raised when no access token is available, or the token is rejected by the hub.
 */
export class AuthenticationError extends ModaicError {
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}

/**
 * Raised when a repository that is expected to exist cannot be found on the hub.
 */
export class RepositoryNotFoundError extends ModaicError {
  constructor(message: string) {
    super(message);
    this.name = "RepositoryNotFoundError";
  }
}

/**
 * Raised when creating a repository that already exists and `exist_ok` is false.
 */
export class RepositoryExistsError extends ModaicError {
  constructor(message: string) {
    super(message);
    this.name = "RepositoryExistsError";
  }
}

/* -------------------------------------------------------------------------- */
/*  Config                                                                     */
/* -------------------------------------------------------------------------- */

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

/**
 * Base URL of the Modaic REST API. Mirrors the Python SDK default.
 */
export function getApiUrl(): string {
  return stripTrailingSlash(
    process.env["MODAIC_API_URL"] || "https://api.modaic.dev",
  );
}

/**
 * Base URL of the Modaic git host. Mirrors the Python SDK default.
 */
export function getGitUrl(): string {
  return stripTrailingSlash(
    process.env["MODAIC_GIT_URL"] || "https://git.modaic.dev",
  );
}

/**
 * Resolve the access token: explicit arg first, then the MODAIC_TOKEN env var.
 * Throws if neither is set.
 */
export function resolveToken(accessToken?: string | null): string {
  const token = accessToken ?? process.env["MODAIC_TOKEN"];
  if (!token) {
    throw new AuthenticationError(
      "No access token provided. Pass access_token or set the MODAIC_TOKEN environment variable.",
    );
  }
  return token;
}

/**
 * Root cache directory used for staging git clones. Defaults to
 * `~/.cache/modaic-ts`; override with the `MODAIC_CACHE` environment variable.
 */
export function getCacheDir(): string {
  return (
    process.env["MODAIC_CACHE"] || path.join(os.homedir(), ".cache", "modaic-ts")
  );
}

/**
 * Local staging directory for a repo's git working tree, keyed by "owner/name".
 */
export function stagingDir(repo: string): string {
  return path.join(getCacheDir(), "staging", ...repo.split("/"));
}
