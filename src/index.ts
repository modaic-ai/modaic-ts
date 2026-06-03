/*
 * Package root barrel for `modaic`.
 *
 * NOT regenerated — listed in `.genignore` so Speakeasy leaves it alone. It
 * combines the two halves of the package:
 *   1. the generated Speakeasy REST SDK (ModaicClient, HTTPClient, SDKOptions, …)
 *   2. the hand-written modaic library layer (Arbiter, Signature, the canonical
 *      config.json / program.json serialization, git + API clients).
 *
 * The generated barrel below does not export `ModaicError` (the SDK's HTTP
 * transport base error is `ModaicClientError`, on the `modaic/models/errors`
 * subpath), so this `ModaicError` — re-exported from ./modaic — is unambiguous.
 *
 * If the generated SDK ever changes its root exports, re-sync the lines below
 * with a fresh generation, keeping the final `./modaic/index.js` re-export.
 */

// --- generated Speakeasy SDK ---
export * from "./lib/config.js";
export * as files from "./lib/files.js";
export { HTTPClient } from "./lib/http.js";
export type { Fetcher, HTTPClientOptions } from "./lib/http.js";
export * from "./sdk/sdk.js";

// --- hand-written modaic library layer ---
export * from "./modaic/index.js";
