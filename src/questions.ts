import type { ChoiceQuestion, JsonValue, NoulQuestion, ScoreQuestion } from "./types.js";

export class Noul implements NoulQuestion {
  readonly type = "noul" as const;
  instructions?: JsonValue;
  criteria?: Exclude<NoulQuestion["criteria"], undefined>;

  constructor(options: Omit<NoulQuestion, "type"> = {}) {
    if (options.instructions !== undefined) this.instructions = options.instructions;
    if (options.criteria !== undefined) this.criteria = options.criteria;
  }
}

export class Choice implements ChoiceQuestion {
  readonly type = "choice" as const;
  instructions?: JsonValue;
  criteria: ChoiceQuestion["criteria"];

  constructor(options: Omit<ChoiceQuestion, "type">) {
    if (Object.keys(options.criteria).length === 0) {
      throw new Error("Choice criteria must contain at least one option.");
    }
    if (options.instructions !== undefined) this.instructions = options.instructions;
    this.criteria = options.criteria;
  }
}

export class Score implements ScoreQuestion {
  readonly type = "score" as const;
  instructions?: JsonValue;
  criteria: ScoreQuestion["criteria"];

  constructor(options: Omit<ScoreQuestion, "type">) {
    if (options.criteria.length === 0) throw new Error("Score criteria must contain at least one level.");
    if (options.instructions !== undefined) this.instructions = options.instructions;
    this.criteria = options.criteria;
  }
}
