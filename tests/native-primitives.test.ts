import { expect, test } from "bun:test";
import { Datetime, Date, Time, Text, Span, Modaic } from "../src/index.js";

const formats = ["YYYY", "YYYY-MM", "YYYY-MM-DD", "HH", "HH:MM", "HH:MM:SS", "YYYY-MM-DDTHH", "YYYY-MM-DDTHH:MM", "YYYY-MM-DDTHH:MM:SS"] as const;
for (const format of formats) {
  test(`datetime requires and serializes format ${format}`, () => {
    expect(JSON.parse(JSON.stringify(new Datetime({ instructions: "When?", format })))).toEqual({
      type: "datetime", instructions: "When?", criteria: { format },
    });
  });
}

test("native text, span, and datetime infer their answers and compose nullability", async () => {
  const client = new Modaic({ apiKey: "test", fetch: async (_url, init) => {
    const wire = JSON.parse(String(init?.body));
    expect(wire.questions.when.criteria.format).toBe("YYYY-MM-DD");
    expect(wire.questions.quote.type).toBe("span");
    expect(wire.questions.summary.type).toBe("text");
    return Response.json({ model: "mo-2.0", answers: {
      when: { type: "datetime", datetime: "2024-02-29", probabilities: { "2024-02-29": 1 }, confidence: 1 },
      __modaic_answerable_when: { type: "noul", noul: 0.9 },
      summary: { type: "text", text: "", confidence: 1 },
      quote: { type: "span", span: { text: "Paris", start: 0, end: 5 }, probabilities: {"0": { text: "Paris", start: 0, end: 5 , probability: 1}}, confidence: 1 },
      __modaic_answerable_quote: { type: "noul", noul: 0.1 },
    }, usage: { input_tokens: 1, output_tokens: 1 } });
  }});
  const result = await client.decisions.create({ model: "mo-2.0", state: "Paris", questions: {
    when: new Datetime({ instructions: "When?", format: "YYYY-MM-DD" }).nullable(),
    summary: new Text({ instructions: "Summarize" }),
    quote: new Span({ instructions: "City passage?" }).nullable(),
  }});
  const when: string | undefined = result.answers.when?.datetime;
  const summary: string = result.answers.summary.text;
  const start: number | undefined = result.answers.quote?.span.start;
  expect(when).toBe("2024-02-29");
  expect(summary).toBe("");
  expect(start).toBeUndefined();
  expect(result.answers.quote).toBeNull();
});

test("invalid or missing native datetime formats fail locally", () => {
  expect(new Datetime({ instructions: "When?" }).criteria.format).toBe("YYYY-MM-DDTHH:MM");
  // @ts-expect-error Timezone-bearing patterns are not supported.
  expect(() => new Datetime({ instructions: "When?", format: "YYYY-MM-DDTHH:MM:SSZ" })).toThrow();
});


for (const [question, format, value] of [
  [new Date({ instructions: "When?" }), "YYYY-MM-DD", "2024-02-29"],
  [new Time({ instructions: "When?" }), "HH:MM", "20:05"],
  [new Datetime({ instructions: "When?" }), "YYYY-MM-DDTHH:MM", "2024-02-29T20:05"],
] as const) {
  test(`datetime subclass ${question.constructor.name} retains defaults and identity`, async () => {
    const client = new Modaic({ apiKey: "test", fetch: async (_url, init) => {
      expect(JSON.parse(String(init?.body)).questions.when.criteria.format).toBe(format);
      return Response.json({ model: "mo-2.0", answers: {
        when: { type: "datetime", datetime: value, probabilities: { [value]: 1 }, confidence: 1 },
      }, usage: { input_tokens: 1, output_tokens: 1 } });
    } });
    const result = await client.decisions.create({ model: "mo-2.0", state: {}, questions: { when: question } });
    expect(result.answers.when).toBeInstanceOf(question.constructor);
    expect(result.answers.when).toBeInstanceOf(Datetime);
    expect(result.answers.when.datetime).toBe(value);
  });
}

test("Date and Time precision overrides", () => {
  expect(new Date({ instructions: "Month?", format: "YYYY-MM" }).criteria.format).toBe("YYYY-MM");
  expect(new Time({ instructions: "Hour?", format: "HH" }).criteria.format).toBe("HH");
  expect(new Time({ instructions: "Exact?", format: "HH:MM:SS" }).criteria.format).toBe("HH:MM:SS");
});
