/**
 * Rich signatures for the e2e matrix — the cases that need real TS code (special
 * modaic types, defaults, nullables, arrays) rather than the plain spec mini-format
 * in specs.json. Keyed by name; the generator (generate.ts) emits each one and the
 * Python suite (test_roundtrip.py) checks the round-trip.
 */
import { z } from "zod";
import { Signature } from "../src/signatures/signature";
import { Image, Audio, Scale, Enum } from "../src/signatures/types";

export const richSignatures: Record<string, Signature> = {
  // Primitives + int default + Image ($ref/$defs) + Scale (int enum) + multi Enum
  // (string enum) + nullable (anyOf null) + array.
  rich_types: new Signature({
    instructions: "Judge the answer.",
    input: z.object({
      question: z.string().describe("the question"),
      n: z.int().default(3),
      score: z.number(),
      flag: z.boolean(),
      photo: Image.field().describe("a picture"),
    }),
    output: z.object({
      rating: Scale(1, 5).describe("1-5"),
      decision: Enum("YES", "NO", "MAYBE"),
      note: z.string().nullable(),
      tags: z.array(z.string()),
    }),
  }),

  // Audio ($ref/$defs) + single-value Enum (const) + (truthy) int default.
  media_enum: new Signature({
    instructions: "Transcribe and classify the clip.",
    input: z.object({
      clip: Audio.field().describe("a sound"),
      retries: z.int().default(2),
    }),
    output: z.object({
      label: Enum("ONLY"),
    }),
  }),

  // Known Python deserialization gaps (see test_roundtrip.py XFAIL). The Python SDK's
  // `_deserialize_dspy_signatures` derives "required" only from a default's presence and
  // uses `if default := field.get("default")`, so:
  //   - a falsy default (0 / "" / false) is dropped and the field becomes required, and
  //   - a plain `.optional()` (no default) is treated as required.
  // The TS serialization is correct; this signature documents the round-trip mismatch.
  python_default_gaps: new Signature({
    instructions: "Exercise falsy-default and optional handling.",
    input: z.object({
      zeroDefault: z.int().default(0),
      maybe: z.string().optional(),
    }),
    output: z.object({ ok: z.boolean() }),
  }),
};
