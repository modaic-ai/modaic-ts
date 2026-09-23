import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { Choice, Noul, Score, type Question, type JsonValue } from "../src/index.js";

const fixture = JSON.parse(readFileSync(new URL("./fixtures/domain-stress.json", import.meta.url), "utf8")) as {
  domains: { slug: string; keys: [string, string, string]; questions: Record<string, Question>;
    examples: { name: string; state: JsonValue; groundTruth: Record<string, JsonValue>; rationale: string }[] }[];
};

for (const domain of fixture.domains) {
  test(`domain workload validates offline: ${domain.slug}`, () => {
    for (const q of Object.values(domain.questions)) {
      const parsed = q.type === "noul" ? new Noul(q) : q.type === "choice" ? new Choice(q) : new Score(q);
      expect(JSON.parse(JSON.stringify(parsed))).toEqual(q);
    }
    expect(domain.examples).toHaveLength(12);
    expect(new Set(domain.examples.map((e) => e.name)).size).toBe(12);
    const [binary, choice, score] = domain.keys;
    const choiceQuestion = domain.questions[choice]!;
    const scoreQuestion = domain.questions[score]!;
    if (choiceQuestion.type !== "choice" || scoreQuestion.type !== "score") throw new Error("Wrong types");
    for (const e of domain.examples) {
      expect(Object.keys(e.groundTruth).sort()).toEqual(Object.keys(domain.questions).sort());
      expect(typeof e.groundTruth[binary]).toBe("boolean");
      expect(String(e.groundTruth[choice]) in choiceQuestion.criteria).toBe(true);
      expect(Number(e.groundTruth[score])).toBeGreaterThanOrEqual(0);
      expect(Number(e.groundTruth[score])).toBeLessThan(scoreQuestion.criteria.length);
      expect(e.rationale).toBeTruthy();
    }
  });
}
