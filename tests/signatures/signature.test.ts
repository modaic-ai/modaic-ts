import { expect, test, describe } from "bun:test";
import { z } from "zod";
import { Signature } from "../../src/modaic/index";

function summarizeSignature() {
  return new Signature({
    instructions: "Summarize the given text into a concise summary.",
    input: z.object({ text: z.string().describe("The text to summarize") }),
    output: z.object({
      summary: z.string().describe("A concise summary of the text"),
    }),
  });
}

describe("Signature.dump_state", () => {
  test("returns instructions + ordered fields with prefixes and descriptions", () => {
    const state = summarizeSignature().dump_state();
    expect(state).toEqual({
      instructions: "Summarize the given text into a concise summary.",
      fields: [
        { prefix: "Text:", description: "The text to summarize" },
        { prefix: "Summary:", description: "A concise summary of the text" },
      ],
    });
  });
});

describe("Signature.parse", () => {
  test("accepts a string signature like ds.ts", () => {
    const sig = Signature.parse("question -> answer");
    expect(sig.dump_state().fields.map((f: any) => f.prefix)).toEqual([
      "Question:",
      "Answer:",
    ]);
  });
});

describe("Signature.load_state", () => {
  test("round-trips instructions and field descriptions", () => {
    const dumped = summarizeSignature().dump_state();

    // Fresh signature with the same field names but no descriptions/instructions.
    const fresh = new Signature({
      instructions: "placeholder",
      input: z.object({ text: z.string() }),
      output: z.object({ summary: z.string() }),
    });

    const restored = fresh.load_state(dumped);
    expect(restored.dump_state()).toEqual(dumped);
  });
});
