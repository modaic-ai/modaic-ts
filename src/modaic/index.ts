/**
 * The modaic library layer — a git client + Modaic API client that turns zod
 * Signatures into the canonical `config.json` / `program.json` format shared with
 * the Python SDK and Modaic Hub.
 *
 * This is hand-written and lives alongside the generated Speakeasy REST SDK. The
 * package root (`src/main.ts`) re-exports both.
 */

// Signatures & special field types
export { Signature, infer_prefix, Image, Audio, Scale, Enum } from "./signatures.js";
export type { InferInput, InferOutput, ModaicTypeTag } from "./signatures.js";

// Arbiter (high-level judge API)
export { Arbiter, ensure_reasoning_field } from "./arbiter.js";
export type {
  ArbiterOptions,
  CreateOptions,
  UpdateOptions,
  PredictOptions,
} from "./arbiter.js";

// Serialization — the canonical config.json / program.json format
export {
  serializeSignatureToConfig,
  buildProgramJson,
  lmStateFromModel,
  repoNameToTitle,
  serializeField,
  fieldDesc,
  pydanticTitle,
  sortSchema,
} from "./serialization.js";
export type {
  ConfigJson,
  ConfigField,
  ProgramJson,
  LMState,
  JsonSchema,
  FieldInfo,
} from "./serialization.js";

// Git + hub client (git-host REST calls that aren't part of the typed SDK)
export { syncAndPush, createRepo, getUserInfo } from "./git.js";
export type { Commit, PushFiles, SyncAndPushOptions, UserInfo } from "./git.js";

// The Arbiter prediction response comes straight from the generated SDK.
export type { PredictExampleResponse } from "../models/index.js";

// Runtime — config helpers + error hierarchy
export {
  getApiUrl,
  getGitUrl,
  resolveToken,
  getCacheDir,
  stagingDir,
  ModaicError,
  AuthenticationError,
  RepositoryNotFoundError,
  RepositoryExistsError,
} from "./runtime.js";
