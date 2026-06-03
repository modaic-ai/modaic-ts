/**
 * E2E generator: turn a named signature into the on-disk artifacts the Modaic hub
 * stores — `config.json` (signature schema) and `program.json` (prompt/state) —
 * using the package's real `serializeSignatureToConfig` / `buildProgramJson`.
 *
 * Signatures come from two places:
 *   - specs.json        — simple specs (string/number/boolean fields)
 *   - rich_signatures.ts — special types (Image/Audio/Scale/Enum), defaults, arrays, nullables
 *
 * Usage:
 *   bun run e2e_tests/generate.ts list                  # print all signature names (JSON)
 *   bun run e2e_tests/generate.ts <name> <outDir>       # emit config.json + program.json
 *
 * The Python e2e test then deserializes <outDir> with the real SDK and checks the round-trip.
 */
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { Signature } from "../src/signatures/signature";
import { buildProgramJson } from "../src/serialization/program";
import { serializeSignatureToConfig } from "../src/serialization/config";
import { repoNameToTitle } from "../src/serialization/naming";
import { richSignatures } from "./rich_signatures";

type FieldSpec = { name: string; type: string; desc?: string };
type Spec = {
  instructions?: string;
  inputs: FieldSpec[];
  outputs: FieldSpec[];
  repo?: string;
};

const specs = JSON.parse(
  fs.readFileSync(path.join(import.meta.dir, "specs.json"), "utf-8"),
) as Record<string, Spec>;

function zodFor(type: string): z.ZodType {
  switch (type) {
    case "number":
      return z.number();
    case "boolean":
      return z.boolean();
    case "string":
    default:
      return z.string();
  }
}

function buildShape(fields: FieldSpec[]): z.ZodObject<any> {
  const shape: Record<string, z.ZodType> = {};
  for (const f of fields) {
    const t = zodFor(f.type);
    shape[f.name] = f.desc ? t.describe(f.desc) : t;
  }
  return z.object(shape);
}

/** Resolve a name to a Signature + the repo path used to derive the schema title. */
function resolve(name: string): { signature: Signature; repo: string } {
  if (name in richSignatures) {
    return { signature: richSignatures[name]!, repo: `e2e/${name}` };
  }
  const spec = specs[name];
  if (!spec) {
    console.error(`unknown signature: ${name}`);
    process.exit(2);
  }
  const signature = new Signature({
    instructions: spec.instructions,
    input: buildShape(spec.inputs),
    output: buildShape(spec.outputs),
  });
  return { signature, repo: spec.repo ?? `e2e/${name}` };
}

const [, , arg1, arg2] = process.argv;

if (arg1 === "list" || arg1 === "--list") {
  console.log(
    JSON.stringify([...Object.keys(specs), ...Object.keys(richSignatures)]),
  );
  process.exit(0);
}

const name = arg1;
const outDir = arg2;
if (!name || !outDir) {
  console.error("usage: bun run e2e_tests/generate.ts <name|list> [outDir]");
  process.exit(2);
}

const { signature, repo } = resolve(name);

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, "program.json"),
  JSON.stringify(buildProgramJson(signature), null, 2),
);

try {
  const config = serializeSignatureToConfig(signature, repoNameToTitle(repo));
  fs.writeFileSync(
    path.join(outDir, "config.json"),
    JSON.stringify(config, null, 2),
  );
  console.log(`wrote config.json + program.json to ${outDir}`);
} catch (e) {
  console.warn(`config.json skipped (serializer not ready): ${(e as Error).message}`);
  console.log(`wrote program.json to ${outDir}`);
}
