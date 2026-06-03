/*
 * Generates `sdk-surface.overlay.json` — the Speakeasy overlay that shapes the
 * generated SDK. It is DOCS-DRIVEN: the set of operations the SDK exposes is
 * exactly the endpoints documented under `modaic/docs/api_reference` (each `.mdx`
 * declares its endpoint in an `api: "<METHOD> <path>"` frontmatter field).
 *
 * The overlay:
 *   1. adds a `servers` entry (the spec has none),
 *   2. adds a bearer security scheme + global security, so the SDK authenticates
 *      with `Authorization: Bearer <MODAIC_TOKEN>` instead of the `modaic_session`
 *      cookie (which Speakeasy's TS generator can't handle — it skips those ops),
 *   3. removes the `modaic_session` cookie param and the reserved `authorization`
 *      header param from every operation,
 *   4. marks every operation NOT in the docs allowlist `x-speakeasy-ignore: true`.
 *
 * Re-run after changing the API reference docs:
 *   node .speakeasy/overlays/build-sdk-surface-overlay.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "../..");

// Docs live in the sibling `modaic` repo. Override with MODAIC_DOCS_DIR if needed.
const DOCS_DIR =
  process.env.MODAIC_DOCS_DIR ||
  path.resolve(REPO, "../modaic/docs/api_reference");
const OPENAPI = path.resolve(REPO, "openapi.json");
const OUT = path.resolve(HERE, "sdk-surface.overlay.json");

const SERVER_URL = "https://api.modaic.dev";
const HTTP_METHODS = ["get", "put", "post", "delete", "patch", "options", "head"];

/** Recursively collect *.mdx files, excluding the gRPC docs (not in the REST spec). */
function collectMdx(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "grpc") continue;
      out.push(...collectMdx(full));
    } else if (entry.name.endsWith(".mdx")) {
      out.push(full);
    }
  }
  return out;
}

/** Parse the `api: "<METHOD> <path>"` frontmatter field. */
function apiFromMdx(file) {
  const text = fs.readFileSync(file, "utf8");
  const m = text.match(/^api:\s*"?([A-Z]+)\s+([^"\n]+?)"?\s*$/m);
  if (!m) return null;
  return { method: m[1].toLowerCase(), pathName: m[2].trim() };
}

const spec = JSON.parse(fs.readFileSync(OPENAPI, "utf8"));
const specPaths = spec.paths || {};

// --- build the docs-driven allowlist ----------------------------------------
const allow = new Set(); // "method pathName"
const missing = [];
for (const file of collectMdx(DOCS_DIR)) {
  const api = apiFromMdx(file);
  if (!api) continue;
  const op = specPaths[api.pathName]?.[api.method];
  if (!op) {
    missing.push(`${api.method.toUpperCase()} ${api.pathName} (${path.relative(REPO, file)})`);
    continue;
  }
  allow.add(`${api.method} ${api.pathName}`);
}

// --- per-operation actions ---------------------------------------------------
// For ignored ops: mark x-speakeasy-ignore. For kept ops: strip the unsupported
// `modaic_session` cookie param (the reason Speakeasy skips them). We remove by
// explicit array index rather than a `[?(@.in=="cookie")]` filter because the
// filter form is honored by `speakeasy overlay apply` but NOT by the overlay
// engine inside `speakeasy run`. Explicit index targets work in both.
const ignoreActions = [];
const cookieRemovalActions = [];
let total = 0;
let cookiesRemoved = 0;
for (const pathName of Object.keys(specPaths)) {
  for (const method of HTTP_METHODS) {
    const op = specPaths[pathName]?.[method];
    if (!op) continue;
    total++;

    if (!allow.has(`${method} ${pathName}`)) {
      ignoreActions.push({
        target: `$.paths[${JSON.stringify(pathName)}][${JSON.stringify(method)}]`,
        update: { "x-speakeasy-ignore": true },
      });
      continue;
    }

    // Kept op: remove each cookie param by index, descending so earlier
    // removals don't shift the indices of later ones.
    const params = Array.isArray(op.parameters) ? op.parameters : [];
    const cookieIdx = params
      .map((p, i) => (p && p.in === "cookie" ? i : -1))
      .filter((i) => i >= 0)
      .sort((a, b) => b - a);
    for (const idx of cookieIdx) {
      cookieRemovalActions.push({
        target: `$.paths[${JSON.stringify(pathName)}][${JSON.stringify(method)}].parameters[${idx}]`,
        remove: true,
      });
      cookiesRemoved++;
    }
  }
}

const overlay = {
  overlay: "1.0.0",
  info: {
    title: "Modaic SDK surface",
    version: "1.0.0",
  },
  actions: [
    // 1. base URL (spec has no servers)
    { target: "$", update: { servers: [{ url: SERVER_URL }] } },
    // 2. bearer auth scheme + apply globally. Named `token` so the SDK field is
    //    `token` and the env var is `MODAIC_TOKEN` (matching the rest of the
    //    library), sent as `Authorization: Bearer <MODAIC_TOKEN>`.
    {
      target: "$",
      update: {
        components: {
          securitySchemes: {
            token: { type: "http", scheme: "bearer" },
          },
        },
      },
    },
    { target: "$", update: { security: [{ token: [] }] } },
    // 3. strip the unsupported `modaic_session` cookie param from kept ops
    //    (the reserved `authorization` header param is left in place — Speakeasy
    //    just ignores it, and the bearer scheme above provides auth).
    ...cookieRemovalActions,
    // 4. keep only the documented operations
    ...ignoreActions,
  ],
};

fs.writeFileSync(OUT, JSON.stringify(overlay, null, 2) + "\n");

console.log(`docs dir:      ${DOCS_DIR}`);
console.log(`spec ops:      ${total}`);
console.log(`kept (docs):   ${allow.size}`);
console.log(`ignored:       ${ignoreActions.length}`);
console.log(`cookies removed (from kept ops): ${cookiesRemoved}`);
if (missing.length) {
  console.log(`\nWARNING: ${missing.length} documented endpoint(s) not found in the spec:`);
  for (const m of missing) console.log(`   ${m}`);
}
console.log(`\nwrote ${path.relative(REPO, OUT)}`);
