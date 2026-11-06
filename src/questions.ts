import type {
  BoxQuestion,
  ChoiceQuestion,
  DatetimeFormat,
  DatetimeQuestion,
  ExtractionQuestion,
  JsonValue,
  NoulQuestion,
  NumberQuestion,
  ScoreQuestion,
  TextQuestion,
} from "./types.js";

const DATETIME_FORMATS: ReadonlySet<DatetimeFormat> = new Set([
  "YYYY",
  "YYYY-MM",
  "YYYY-MM-DD",
  "HH",
  "HH:MM",
  "HH:MM:SS",
  "YYYY-MM-DDTHH",
  "YYYY-MM-DDTHH:MM",
  "YYYY-MM-DDTHH:MM:SS",
]);

function instructions(value: string, primitive: string): string {
  if (!value.trim()) throw new Error(`${primitive} requires nonempty instructions.`);
  return value;
}

export class Number implements NumberQuestion {
  readonly type = "number" as const;
  instructions: string;
  criteria?: Exclude<NumberQuestion["criteria"], undefined>;
  constructor(options: Omit<NumberQuestion, "type">) {
    this.instructions = instructions(options.instructions, "Number");
    if (options.criteria !== undefined) this.criteria = options.criteria;
  }
}

export class Text implements TextQuestion {
  readonly type = "text" as const;
  instructions: string;
  constructor(options: Omit<TextQuestion, "type">) {
    this.instructions = instructions(options.instructions, "Text");
  }
}

export class Datetime implements DatetimeQuestion {
  readonly type = "datetime" as const;
  instructions: string;
  criteria: DatetimeQuestion["criteria"];
  constructor(options: Omit<DatetimeQuestion, "type">) {
    this.instructions = instructions(options.instructions, "Datetime");
    if (!DATETIME_FORMATS.has(options.criteria.format)) {
      throw new Error("Datetime format is unsupported.");
    }
    this.criteria = options.criteria;
  }
}

export class Extraction implements ExtractionQuestion {
  readonly type = "extraction" as const;
  instructions: string;
  constructor(options: Omit<ExtractionQuestion, "type">) {
    if (!options.instructions.trim() || "criteria" in options) throw new Error("Extraction requires instructions and rejects criteria.");
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
