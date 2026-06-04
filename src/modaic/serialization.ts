/**
 * Serialization of modaic Signatures into the canonical artifacts shared with the
 * Python SDK and Modaic Hub:
 *
 *   - `config.json`  — the serialized signature schema (pydantic `model_json_schema`
 *                      dialect), via {@link serializeSignatureToConfig}.
 *   - `program.json` — the stored program state (dspy `Module.save` shape), via
 *                      {@link buildProgramJson}.
 *
 * The zod -> JSON Schema walker reproduces only the slice of JSON Schema the Python
 * deserializer understands, plus the dspy field extras (`__dspy_field_type`, `desc`,
 * `prefix`, `title`). Special modaic types (Image/Audio/Scale) are detected via a
 * `.meta().__modaic_type` marker — see `signatures.ts`.
 */
import type { Signature } from "./signatures.js";

/* -------------------------------------------------------------------------- */
/*  zod -> JSON Schema                                                          */
/* -------------------------------------------------------------------------- */

export type JsonSchema = Record<string, any>;

/** Internal `_def`/`def` accessor (zod's shape differs slightly across builds). */
function defOf(schema: any): any {
  return schema?._def ?? schema?.def ?? {};
}

/** Read a schema's registered metadata, tolerant of schemas without `.meta`. */
function metaOf(schema: any): Record<string, any> {
  try {
    return (typeof schema?.meta === "function" ? schema.meta() : undefined) ?? {};
  } catch {
    return {};
  }
}

/** True for `z.any()` / `z.unknown()` — used to emit empty `items` / open objects. */
function isOpen(schema: any): boolean {
  if (!schema) return true;
  const t = defOf(schema).type;
  return t === "any" || t === "unknown";
}

/** Integer detection: `z.int()` reports type "number" with an int `format`. */
function isInteger(schema: any): boolean {
  const d = defOf(schema);
  if (typeof d.format === "string" && d.format.includes("int")) return true;
  const checks = d.checks ?? [];
  return checks.some((c: any) => {
    const f = c?._def?.format ?? c?.format ?? c?._def?.check ?? "";
    return typeof f === "string" && f.includes("int");
  });
}

interface Unwrapped {
  /** The innermost schema after stripping optional/default/nullable wrappers. */
  core: any;
  /** Merged `.meta()` across the wrapper chain (outer wins). */
  meta: Record<string, any>;
  hasDefault: boolean;
  defaultValue?: any;
  optional: boolean;
  nullable: boolean;
}

/** Strip optional/default/nullable wrappers, collecting their effects + metadata. */
function unwrap(schema: any): Unwrapped {
  let cur = schema;
  let hasDefault = false;
  let defaultValue: any;
  let optional = false;
  let nullable = false;
  const metas: Record<string, any>[] = [];

  // Walk outer -> inner.
  // Guard against pathological cycles with a generous bound.
  for (let i = 0; i < 100; i++) {
    metas.push(metaOf(cur));
    const d = defOf(cur);
    if (d.type === "optional") {
      optional = true;
      cur = d.innerType;
    } else if (d.type === "default" || d.type === "prefault") {
      hasDefault = true;
      defaultValue =
        typeof d.defaultValue === "function" ? d.defaultValue() : d.defaultValue;
      cur = d.innerType;
    } else if (d.type === "nullable") {
      nullable = true;
      cur = d.innerType;
    } else {
      break;
    }
  }

  // Merge inner-first so an outer `.meta()`/`.describe()` overrides an inner one.
  let meta: Record<string, any> = {};
  for (let i = metas.length - 1; i >= 0; i--) {
    meta = { ...meta, ...metas[i] };
  }

  return { core: cur, meta, hasDefault, defaultValue, optional, nullable };
}

/** Pretty title from a field name: `name.replace("_"," ")` then Python `str.title()`. */
export function pydanticTitle(name: string): string {
  return name
    .replace(/_/g, " ")
    .replace(/[A-Za-z]+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

/** Field description: `.describe()`/`.meta({desc})`, falling back to dspy's `${name}`. */
export function fieldDesc(meta: Record<string, any>, name: string): string {
  return meta["description"] ?? meta["desc"] ?? `\${${name}}`;
}

/** The JSON-Schema "type fragment" for a leaf/container schema (no field extras). */
function coreFragment(
  core: any,
  meta: Record<string, any>,
  defs: Record<string, JsonSchema>,
): JsonSchema {
  const modaicType = meta["__modaic_type"];

  // Special modaic types (Image/Audio/Scale/Enum) are identified by the marker, not structure.
  if (modaicType === "image" || modaicType === "audio") {
    const name = modaicType === "image" ? "Image" : "Audio";
    defs[name] = { type: `dspy.${name}` };
    return { $ref: `#/$defs/${name}` };
  }
  // Scale/Enum serialize to their underlying Literal (enum for many, const for one — like
  // pydantic) plus marker keys so the Python deserializer rebuilds a Scale/Enum, not a bare
  // Literal. A raw `z.enum` (no marker) stays unmarked, mirroring a plain Python Literal.
  if (modaicType === "scale") {
    const lo = Number(meta["lo"]);
    const hi = Number(meta["hi"]);
    const values: number[] = [];
    for (let v = lo; v <= hi; v++) values.push(v);
    return { ...enumOrConst(values), "x-modaic-type": "Scale", "x-modaic-args": [lo, hi] };
  }
  if (modaicType === "enum") {
    const values = enumValues(core);
    return { ...enumOrConst(values), "x-modaic-type": "Enum", "x-modaic-args": values };
  }

  const d = defOf(core);
  switch (d.type) {
    case "string":
      return { type: "string" };
    case "boolean":
      return { type: "boolean" };
    case "number":
      return { type: isInteger(core) ? "integer" : "number" };
    case "bigint":
      return { type: "integer" };
    case "enum":
      return enumFragment(core);
    case "literal":
      return literalFragment(core);
    case "array":
      return arrayFragment(core, defs);
    case "record":
    case "map":
      return recordFragment(core, defs);
    case "tuple":
      return tupleFragment(core, defs);
    case "union":
      return unionFragment(core, defs);
    case "object":
      return objectFragment(core, defs);
    default:
      // dspy's behavior for unknown/untyped fields is a bare string.
      return { type: "string" };
  }
}

function enumValues(core: any): any[] {
  const opts = core?.options;
  if (Array.isArray(opts)) return opts;
  const entries = defOf(core).entries ?? defOf(core).values;
  if (entries && typeof entries === "object") return Object.values(entries);
  return Array.isArray(entries) ? entries : [];
}

function enumFragment(core: any): JsonSchema {
  // pydantic serializes a single allowed value as `const`, many as `enum` — matching
  // how `modaic.Enum[...]` delegates to a `Literal` (see Python `modaic/types.py`).
  return enumOrConst(enumValues(core));
}

/** `{const}` for one value, `{enum}` for many; integer-typed when all values are numbers. */
function enumOrConst(values: any[]): JsonSchema {
  const allNumbers = values.length > 0 && values.every((v) => typeof v === "number");
  const type = allNumbers ? "integer" : "string";
  if (values.length === 1) {
    return { const: values[0], type };
  }
  return { enum: values, type };
}

function literalFragment(core: any): JsonSchema {
  const raw = defOf(core).values;
  const values = Array.isArray(raw) ? raw : raw != null ? [...raw] : [];
  const typeOf = (v: any): string =>
    typeof v === "number"
      ? Number.isInteger(v)
        ? "integer"
        : "number"
      : typeof v === "boolean"
        ? "boolean"
        : "string";
  if (values.length === 1) {
    return { const: values[0], type: typeOf(values[0]) };
  }
  const allNumbers = values.every((v) => typeof v === "number");
  return { enum: values, type: allNumbers ? "integer" : "string" };
}

function arrayFragment(core: any, defs: Record<string, JsonSchema>): JsonSchema {
  const el = defOf(core).element;
  return { type: "array", items: el && !isOpen(el) ? typeFragment(el, defs) : {} };
}

function recordFragment(core: any, defs: Record<string, JsonSchema>): JsonSchema {
  const val = defOf(core).valueType;
  if (!val || isOpen(val)) {
    return { type: "object", additionalProperties: true };
  }
  return { type: "object", additionalProperties: typeFragment(val, defs) };
}

function tupleFragment(core: any, defs: Record<string, JsonSchema>): JsonSchema {
  const items: any[] = defOf(core).items ?? [];
  const prefixItems = items.map((it) => typeFragment(it, defs));
  return {
    type: "array",
    maxItems: prefixItems.length,
    minItems: prefixItems.length,
    prefixItems,
  };
}

function unionFragment(core: any, defs: Record<string, JsonSchema>): JsonSchema {
  const options: any[] = defOf(core).options ?? [];
  return { anyOf: options.map((o) => typeFragment(o, defs)) };
}

/**
 * Nested object (anonymous). pydantic hoists named models into `$defs`; TS objects
 * are anonymous, so we inline a best-effort object schema. Nested models are rare
 * in pure-judge arbiters — primitives + special types are the common case.
 */
function objectFragment(core: any, defs: Record<string, JsonSchema>): JsonSchema {
  const shape: Record<string, any> = core?.shape ?? defOf(core).shape ?? {};
  const properties: Record<string, JsonSchema> = {};
  const required: string[] = [];
  for (const [name, fieldSchema] of Object.entries(shape)) {
    const info = serializeField(fieldSchema, defs);
    properties[name] = info.fragment;
    if (!info.hasDefault && !info.optional) required.push(name);
  }
  return { type: "object", properties, required };
}

/** Type fragment for a value position (array item, record value, union option). */
function typeFragment(schema: any, defs: Record<string, JsonSchema>): JsonSchema {
  return serializeField(schema, defs).fragment;
}

export interface FieldInfo {
  fragment: JsonSchema;
  /** True when the fragment is a bare `$ref` (pydantic omits a field-level `title`). */
  isRef: boolean;
  optional: boolean;
  hasDefault: boolean;
  defaultValue?: any;
  meta: Record<string, any>;
}

/** Serialize a single Zod field schema into its JSON-Schema fragment + metadata. */
export function serializeField(
  schema: any,
  defs: Record<string, JsonSchema>,
): FieldInfo {
  const u = unwrap(schema);
  let fragment = coreFragment(u.core, u.meta, defs);
  const isRef = typeof fragment["$ref"] === "string";
  if (u.nullable) {
    fragment = { anyOf: [fragment, { type: "null" }] };
  }
  return {
    fragment,
    isRef,
    optional: u.optional,
    hasDefault: u.hasDefault,
    defaultValue: u.defaultValue,
    meta: u.meta,
  };
}

/**
 * Recursively sort object keys alphabetically to match pydantic's output, with two
 * exceptions: the children of `properties` keep declaration order (inputs then
 * outputs), and `default` payloads are left untouched.
 */
export function sortSchema(node: any): any {
  if (Array.isArray(node)) return node.map(sortSchema);
  if (node && typeof node === "object") {
    const out: Record<string, any> = {};
    for (const key of Object.keys(node).sort()) {
      const value = node[key];
      if (key === "properties" && value && typeof value === "object" && !Array.isArray(value)) {
        const props: Record<string, any> = {};
        for (const fieldName of Object.keys(value)) {
          props[fieldName] = sortSchema(value[fieldName]);
        }
        out[key] = props;
      } else if (key === "default") {
        out[key] = value;
      } else {
        out[key] = sortSchema(value);
      }
    }
    return out;
  }
  return node;
}

/* -------------------------------------------------------------------------- */
/*  Naming                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Derive a PascalCase signature title from a repo path.
 *
 * The Python SDK uses the signature class name as the schema `title`; TS
 * signatures are anonymous, so we derive a stable title from the repo's name
 * segment.
 *
 * Examples:
 *   "modaic/quality-judge" -> "QualityJudge"
 *   "modaic/tyrin_judge"   -> "TyrinJudge"
 *   "my-judge"             -> "MyJudge"
 */
export function repoNameToTitle(repo: string): string {
  const name = repo.includes("/") ? repo.split("/").pop()! : repo;
  return name
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

/* -------------------------------------------------------------------------- */
/*  config.json                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * One field entry inside a serialized signature's `properties`.
 *
 * Always carries the dspy extras (`__dspy_field_type`, `desc`, `prefix`) and, for
 * non-`$ref` fields, a pydantic `title`. The remaining keys are whatever JSON-Schema
 * type fragment the field's Zod type produced (`type`, `items`, `enum`, `anyOf`,
 * `$ref`, `additionalProperties`, `prefixItems`, …). Key order in the emitted JSON is
 * alphabetical, matching the Python (pydantic) output.
 */
export interface ConfigField {
  __dspy_field_type: "input" | "output";
  desc?: string;
  prefix?: string | undefined;
  title?: string;
  type?: string;
  default?: unknown;
  $ref?: string;
  items?: JsonSchema;
  enum?: unknown[];
  const?: unknown;
  anyOf?: JsonSchema[];
  additionalProperties?: JsonSchema | boolean;
  prefixItems?: JsonSchema[];
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  [key: string]: unknown;
}

/**
 * The shape of `config.json` — the serialized signature schema.
 *
 * The `signature` object must be compatible with what the Python SDK produces via
 * `serializers.py::serialize_signature` (and reads back via `_deserialize_dspy_signatures`).
 * Concretely:
 *
 * ```json
 * {
 *   "model": null,
 *   "signature": {
 *     "$defs": { "Image": { "type": "dspy.Image" } },   // only when special types are used
 *     "description": "<instructions>",
 *     "properties": {
 *       "<field>": { "__dspy_field_type": "input"|"output", "desc": "...",
 *                    "prefix": "Field:", "title": "Field", "type": "string" }
 *     },
 *     "required": ["<input fields then output fields>"],
 *     "title": "<PascalCase repo name>",
 *     "type": "object"
 *   }
 * }
 * ```
 */
export interface ConfigJson {
  model: null;
  signature: {
    $defs?: Record<string, JsonSchema>;
    description: string;
    properties: Record<string, ConfigField>;
    required: string[];
    title: string;
    type: "object";
  };
}

/**
 * Build `config.json` from a Signature.
 *
 * Input fields are emitted before output fields (matching dspy). A field is in
 * `required` unless it has a Zod default or is `.optional()`. Special modaic types
 * (Image/Audio/Scale/Enum — see `signatures.ts`) serialize to the same JSON the
 * Python SDK uses, so the result round-trips into a `dspy.Signature` with no Python
 * changes.
 *
 * @param signature The Arbiter's signature.
 * @param title The top-level schema title (derived from the repo name).
 */
export function serializeSignatureToConfig(
  signature: Signature,
  title: string,
): ConfigJson {
  const defs: Record<string, JsonSchema> = {};
  const properties: Record<string, ConfigField> = {};
  const required: string[] = [];

  const addFields = (
    shape: Record<string, unknown>,
    direction: "input" | "output",
  ): void => {
    for (const [name, schema] of Object.entries(shape)) {
      const info = serializeField(schema, defs);

      const field: ConfigField = {
        __dspy_field_type: direction,
        desc: fieldDesc(info.meta, name),
        prefix: signature.prefixes[name],
        ...info.fragment,
      };
      // pydantic omits a field-level title when the field is a bare `$ref`.
      if (!info.isRef) {
        field.title = pydanticTitle(name);
      }
      if (info.hasDefault) {
        field.default = info.defaultValue;
      }

      properties[name] = field;
      if (!info.hasDefault && !info.optional) {
        required.push(name);
      }
    }
  };

  addFields(signature.input.shape, "input");
  addFields(signature.output.shape, "output");

  const signatureSchema: ConfigJson["signature"] = {
    description: signature.instructions ?? "",
    properties,
    required,
    title,
    type: "object",
  };
  if (Object.keys(defs).length > 0) {
    signatureSchema.$defs = defs;
  }

  return {
    model: null,
    signature: sortSchema(signatureSchema) as ConfigJson["signature"],
  };
}

/* -------------------------------------------------------------------------- */
/*  program.json                                                                */
/* -------------------------------------------------------------------------- */

/**
 * The serialized `lm` block inside `program.json`. Mirrors what dspy's
 * `LM.dump_state()` writes (see `dspy/clients/lm.py`): the inference model plus
 * its default knobs. The Modaic server reconstructs an LM via `LM(**lm)`, so
 * `model` is the only field it strictly needs; the rest pin dspy's defaults so
 * the stored state round-trips exactly. No secrets are ever included — an
 * `api_key`, if any, is filled in server-side at load time.
 */
export interface LMState {
  /** A LiteLLM model string, e.g. "gpt-oss-120b" or "openai/gpt-4o". */
  model: string;
  model_type: string;
  cache: boolean;
  num_retries: number;
  finetuning_model: string | null;
  launch_kwargs: Record<string, unknown>;
  train_kwargs: Record<string, unknown>;
  // dspy stores temperature/max_tokens in the LM kwargs, so dump_state emits
  // them; null mirrors an LM constructed with only a model string.
  temperature: number | null;
  max_tokens: number | null;
}

/**
 * Build the `lm` state for a model string, matching `dspy.LM(model).dump_state()`
 * with dspy's constructor defaults (model_type="chat", cache=true, num_retries=3,
 * finetuning_model=None, launch_kwargs={}, train_kwargs={}, temperature=None,
 * max_tokens=None). Key order matches the Python artifact.
 */
export function lmStateFromModel(model: string): LMState {
  return {
    model,
    model_type: "chat",
    cache: true,
    num_retries: 3,
    finetuning_model: null,
    launch_kwargs: {},
    train_kwargs: {},
    temperature: null,
    max_tokens: null,
  };
}

/**
 * The shape of `program.json` — the stored program state.
 *
 * Mirrors what the Python SDK writes via `dspy.Module.save` (`precompiled.py`):
 *
 * ```json
 * {
 *   "traces": [], "train": [], "demos": [],
 *   "signature": { "instructions": "...", "fields": [ { "prefix": "Text:", "description": "..." } ] },
 *   "lm": null,
 *   "metadata": { "dependency_versions": { ... } }
 * }
 * ```
 *
 * The `signature` field is exactly what `Signature.dump_state()` returns.
 */
export interface ProgramJson {
  traces: unknown[];
  train: unknown[];
  demos: unknown[];
  signature: { instructions?: string; fields: { prefix: string; description: string }[] };
  lm: LMState | null;
  metadata: { dependency_versions: Record<string, string> };
}

/**
 * Record the runtime versions used to produce this program. The Python side
 * records python/dspy/cloudpickle; on the TS side we record the node version.
 * This is informational metadata only.
 */
function dependencyVersions(): Record<string, string> {
  const versions: Record<string, string> = {};
  const node = typeof process !== "undefined" ? process.versions?.node : undefined;
  if (node) {
    versions["node"] = node;
  }
  return versions;
}

/**
 * Build the `program.json` object for a Signature and inference model.
 *
 * Mirrors dspy's `Module.save`: emit the flat dspy-`Predict` state
 * (`traces`/`train`/`demos`/`signature`/`lm`) then append `metadata`. `model` is a
 * LiteLLM model string written into the `lm` block (without secrets — the Python
 * SDK's `_clean_secrets` masks secret *values* inside `lm` but keeps the model, so a
 * null `lm` would leave the judge unrunnable on the server). Key order: traces,
 * train, demos, signature, lm, metadata.
 */
export function buildProgramJson(
  signature: Signature,
  model: string,
): ProgramJson {
  return {
    traces: [],
    train: [],
    demos: [],
    signature: signature.dump_state(),
    lm: model ? lmStateFromModel(model) : null,
    metadata: { dependency_versions: dependencyVersions() },
  };
}
