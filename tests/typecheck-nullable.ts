import type { Answer, CreateDecisionParams, QuestionInput, Modaic, ModelDecisions } from "../src/index.js";
import { Choice, Noul, Span, Score } from "../src/index.js";

export async function check(client: Modaic, bound: ModelDecisions,
  params: CreateDecisionParams<Record<string, QuestionInput>>): Promise<void> {
  const questions = {
    country: new Choice({ criteria: { fr: "France", us: "United States" } }).nullable(),
    relevant: new Noul(),
  };
  const result = await client.decisions.create({ model: "mo-latest", state: {}, questions });
  const country: "fr" | "us" | undefined = result.answers.country?.choice;
  // @ts-expect-error A nullable answer requires a null check.
  const unsafe: string = result.answers.country.choice;
  // @ts-expect-error A Noul is not a Choice.
  const wrong: string = result.answers.relevant.choice;
  const dynamic = await client.decisions.create(params);
  // @ts-expect-error Broad question types may contain nullable wrappers.
  const nonnullable: Record<string, Answer> = dynamic.answers;
  const boundResult = await bound.create({ state: {}, questions });
  const boundCountry: "fr" | "us" | undefined = boundResult.answers.country?.choice;
  void country; void unsafe; void wrong; void nonnullable; void boundCountry;
}


export async function dictionaryTypes(client: Modaic): Promise<void> {
  const result = await client.decisions.create({ model: "mo-2.0", state: "Paris", questions: {
    evidence: new Span({ instructions: "Find" }),
    country: new Choice({ criteria: { fr: "France", us: "United States" } }),
    severity: new Score({ criteria: ["Low", "High"] }),
    nullable: new Span({ instructions: "Find" }).nullable(),
  } });
  const start: number = result.answers.evidence.start;
  const value: string = result.answers.evidence.span;
  const code: "fr" | "us" = result.answers.country.choice;
  const severity: number = result.answers.severity.score;
  // @ts-expect-error Nullable dictionary answers need a null check.
  const unsafe: number = result.answers.nullable.start;
  void start; void value; void code; void severity; void unsafe;
}
