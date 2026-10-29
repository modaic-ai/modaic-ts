import type { BoxQuestion, SpanQuestion, ChoiceQuestion, JsonValue, NoulQuestion, ScoreQuestion } from "./types.js";

export class Span implements SpanQuestion {
  readonly type = "span" as const;
  instructions: string;
  constructor(options: Omit<SpanQuestion, "type">) {
    if (!options.instructions.trim() || "criteria" in options) throw new Error("Span requires instructions and rejects criteria.");
    this.instructions = options.instructions;
  }
}

export class Box implements BoxQuestion {
  readonly type = "box" as const;
  instructions: string;
  constructor(options: Omit<BoxQuestion, "type">) {
    if (!options.instructions.length || "criteria" in options) throw new Error("Box requires instructions and rejects criteria.");
    this.instructions = options.instructions;
  }
}

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
