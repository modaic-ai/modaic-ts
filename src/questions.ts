import type { ChoiceQuestion, JsonValue, NoulQuestion, ScoreQuestion, Question, TextQuestion, SpanQuestion, DatetimeQuestion, DatetimeFormat, Answer, NumberQuestion, BoxQuestion, BoxCoordinates, ExtractionQuestion, ExtractionAnswer } from "./types.js";


const answerData = new WeakMap<object, Answer>();
const definitions = new WeakMap<object, Question>();
const names = new WeakMap<object, string>();
const definitionConstructors = new WeakMap<object, Function>();

class Primitive {
  constructor(name?: string) {
    if (name !== undefined) names.set(this, name);
  }
  get name(): string | undefined { return names.get(this); }
  toQuestion(): Question {
    if (answerData.has(this)) {
      const original = definitions.get(this);
      if (!original) throw new Error("The original question definition is unavailable for this answer");
      return { ...original };
    }
    return { ...this } as unknown as Question;
  }
  toJSON(): unknown { return answerData.get(this) ?? this.toQuestion(); }
}

function answered<T extends Answer["type"]>(value: object, type: T): Extract<Answer, { type: T }> {
  const answer = answerData.get(value);
  if (!answer || answer.type !== type) throw new Error("Answer fields are only available after inference");
  return answer as Extract<Answer, { type: T }>;
}

export function questionBody(value: Question): Question {
  const result = JSON.parse(JSON.stringify(value instanceof Primitive ? value.toQuestion() : value));
  if (value instanceof Primitive) definitionConstructors.set(result, value.constructor);
  return result;
}

export function hydrateAnswer(answer: Answer, name: string, definition?: Question): Answer {
  if (answer instanceof Primitive) return answer;
  const constructors = { noul: Noul, choice: Choice, score: Score, text: Text, span: Span,
    number: Number, datetime: Datetime, box: Box, extraction: Extraction };
  const required: Record<Answer["type"], Record<string, "number" | "string" | "object">> = {
    noul: { noul: "number" },
    extraction: { extraction: "object", confidence: "number" },
    box: { box: "object", confidence: "number" },
    choice: { choice: "string", probabilities: "object", confidence: "number" },
    score: { score: "number", legend: "object", probabilities: "object", confidence: "number" },
    text: { text: "string", confidence: "number" },
    span: { span: "string", start: "number", end: "number", confidence: "number" },
    number: { value: "number", probabilities: "object", variance: "number" },
    datetime: { datetime: "string", probabilities: "object", confidence: "number" },
  };
  if (!required[answer.type]) throw new Error("Unknown answer type");
  for (const [key, type] of Object.entries(required[answer.type])) {
    const value = Reflect.get(answer, key);
    if (answer.type === "box" && key === "confidence" && value === null) continue;
    if (typeof value !== type || value === null ||
        (type === "number" && !globalThis.Number.isFinite(value)) ||
        (type === "object" && Array.isArray(value))) throw new Error(`Invalid answer field ${key}`);
  }
  if (answer.type === "span" && (!globalThis.Number.isInteger(answer.start) ||
      !globalThis.Number.isInteger(answer.end) || answer.start < 0 || answer.end <= answer.start || answer.span.length === 0)) {
    throw new Error("Invalid span boundaries");
  }
  if (answer.type === "box") {
    const { top, bottom, left, right } = answer.box;
    if (![top, bottom, left, right].every(value => typeof value === "number" && globalThis.Number.isFinite(value) && value >= 0 && value <= 1) ||
        top >= bottom || left >= right || (answer.confidence !== null && (answer.confidence < 0 || answer.confidence > 1))) throw new Error("Invalid box boundaries");
  }
  const constructor = (definition && definitionConstructors.get(definition)) ?? constructors[answer.type];
  if (!constructor) throw new Error("Unknown answer type");
  if (definition && definition.type !== answer.type) throw new Error("Answer type does not match its question");
  const result = Object.create(constructor.prototype) as Primitive;
  for (const [key, value] of Object.entries(answer)) {
    Object.defineProperty(result, key, { value, enumerable: true });
  }
  if (definition) {
    for (const key of ["instructions", "criteria"] as const) {
      if (key in definition) Object.defineProperty(result, key, { value: Reflect.get(definition, key), enumerable: false });
    }
    definitions.set(result, definition);
  }
  answerData.set(result, answer);
  names.set(result, name);
  return result as unknown as Answer;
}

export class Nullable<Q extends Question = Question> {
  constructor(readonly question: Q, readonly threshold = 0.5) {
    if (!globalThis.Number.isFinite(threshold) || threshold < 0 || threshold > 1) {
      throw new Error("Nullable threshold must be a finite number between 0 and 1.");
    }
  }

  nullable(threshold = 0.5): Nullable<Q> {
    return new Nullable(this.question, threshold);
  }
}

export class Noul extends Primitive implements NoulQuestion {
  get noul(): number { return answered(this, "noul").noul; }
  nullable(threshold = 0.5): Nullable<this> {
    return new Nullable(this, threshold);
  }

  readonly type = "noul" as const;
  instructions?: JsonValue;
  criteria?: Exclude<NoulQuestion["criteria"], undefined>;

  constructor(options: Omit<NoulQuestion, "type"> & { name?: string } = {}) {
    super(options.name);
    if (options.instructions !== undefined) this.instructions = options.instructions;
    if (options.criteria !== undefined) this.criteria = options.criteria;
  }
}

export class Choice<K extends string = string> extends Primitive implements ChoiceQuestion {
  get choice(): K { return answered(this, "choice").choice as K; }
  get probabilities(): Record<string, number> { return answered(this, "choice").probabilities; }
  get confidence(): number { return answered(this, "choice").confidence; }
  nullable(threshold = 0.5): Nullable<this> {
    return new Nullable(this, threshold);
  }

  readonly type = "choice" as const;
  instructions?: JsonValue;
  criteria: Record<K, JsonValue>;

  constructor(options: Omit<ChoiceQuestion, "type" | "criteria"> & { criteria: Record<K, JsonValue>; name?: string }) {
    super(options.name);
    if (Object.keys(options.criteria).length === 0) {
      throw new Error("Choice criteria must contain at least one option.");
    }
    if (options.instructions !== undefined) this.instructions = options.instructions;
    this.criteria = options.criteria;
  }
}

export class Score extends Primitive implements ScoreQuestion {
  get score(): number { return answered(this, "score").score; }
  get legend(): Record<string, JsonValue> { return answered(this, "score").legend; }
  get probabilities(): Record<string, number> { return answered(this, "score").probabilities; }
  get confidence(): number { return answered(this, "score").confidence; }
  nullable(threshold = 0.5): Nullable<this> {
    return new Nullable(this, threshold);
  }

  readonly type = "score" as const;
  instructions?: JsonValue;
  criteria: ScoreQuestion["criteria"];

  constructor(options: Omit<ScoreQuestion, "type"> & { name?: string }) {
    super(options.name);
    if (options.criteria.length === 0) throw new Error("Score criteria must contain at least one level.");
    if (options.instructions !== undefined) this.instructions = options.instructions;
    this.criteria = options.criteria;
  }
}


function instructions(value: string): void {
  if (typeof value !== "string" || value.trim().length === 0) throw new Error("instructions must be a nonempty string");
}

export class Text extends Primitive implements TextQuestion {
  get text(): string { return answered(this, "text").text; }
  get confidence(): number { return answered(this, "text").confidence; }
  readonly type = "text" as const;
  instructions: string;
  constructor(options: { instructions: string; name?: string }) {
    super(options.name);
    instructions(options.instructions);
    this.instructions = options.instructions;
  }
  nullable(threshold = 0.5): Nullable<this> { return new Nullable(this, threshold); }
}

export class Span extends Primitive implements SpanQuestion {
  get span(): string { return answered(this, "span").span; }
  get start(): number { return answered(this, "span").start; }
  get end(): number { return answered(this, "span").end; }
  get confidence(): number { return answered(this, "span").confidence; }
  readonly type = "span" as const;
  instructions: string;
  constructor(options: { instructions: string; name?: string }) {
    super(options.name);
    instructions(options.instructions);
    this.instructions = options.instructions;
  }
  nullable(threshold = 0.5): Nullable<this> { return new Nullable(this, threshold); }
}

export class Datetime extends Primitive implements DatetimeQuestion {
  get datetime(): string { return answered(this, "datetime").datetime; }
  get probabilities(): Record<string, number> { return answered(this, "datetime").probabilities; }
  get confidence(): number { return answered(this, "datetime").confidence; }
  readonly type = "datetime" as const;
  instructions: string;
  criteria: { format: DatetimeFormat };
  constructor(options: { instructions: string; format?: DatetimeFormat; name?: string }) {
    super(options.name);
    instructions(options.instructions);
    const formats: readonly string[] = ["YYYY", "YYYY-MM", "YYYY-MM-DD", "HH", "HH:MM", "HH:MM:SS",
      "YYYY-MM-DDTHH", "YYYY-MM-DDTHH:MM", "YYYY-MM-DDTHH:MM:SS"];
    const format = options.format ?? "YYYY-MM-DDTHH:MM";
    if (!formats.includes(format)) throw new Error("A supported ISO datetime format is required");
    this.instructions = options.instructions;
    this.criteria = { format };
  }
  nullable(threshold = 0.5): Nullable<this> { return new Nullable(this, threshold); }
}


export class Number extends Primitive implements NumberQuestion {
  readonly type = "number" as const;
  instructions: string;
  criteria?: Exclude<NumberQuestion["criteria"], undefined>;
  constructor(options: Omit<NumberQuestion, "type"> & { name?: string }) {
    super(options.name);
    instructions(options.instructions);
    this.instructions = options.instructions;
    if (options.criteria !== undefined) this.criteria = options.criteria;
  }
  get value(): number { return answered(this, "number").value; }
  get probabilities(): Record<string, number> { return answered(this, "number").probabilities; }
  get variance(): number { return answered(this, "number").variance; }
  nullable(threshold = 0.5): Nullable<this> { return new Nullable(this, threshold); }
}


export class Date extends Datetime {
  constructor(options: { instructions: string; format?: "YYYY" | "YYYY-MM" | "YYYY-MM-DD"; name?: string }) {
    const format = options.format ?? "YYYY-MM-DD";
    if (!["YYYY", "YYYY-MM", "YYYY-MM-DD"].includes(format)) throw new Error("Unsupported Date format");
    super({ ...options, format });
  }
}

export class Time extends Datetime {
  constructor(options: { instructions: string; format?: "HH" | "HH:MM" | "HH:MM:SS"; name?: string }) {
    const format = options.format ?? "HH:MM";
    if (!["HH", "HH:MM", "HH:MM:SS"].includes(format)) throw new Error("Unsupported Time format");
    super({ ...options, format });
  }
}


export class Box extends Primitive implements BoxQuestion {
  readonly type = "box" as const;
  instructions: string;
  constructor(options: { instructions: string; name?: string }) {
    super(options.name);
    if ("criteria" in options) throw new Error("Box rejects criteria.");
    instructions(options.instructions);
    this.instructions = options.instructions;
  }
  get box(): BoxCoordinates { return answered(this, "box").box; }
  get confidence(): number | null { return answered(this, "box").confidence; }
  nullable(threshold = 0.5): Nullable<this> { return new Nullable(this, threshold); }
}

export class Extraction extends Primitive implements ExtractionQuestion {
  readonly type = "extraction" as const;
  instructions: string;
  get extraction(): ExtractionAnswer["extraction"] { return answered(this, "extraction").extraction; }
  get confidence(): number { return answered(this, "extraction").confidence; }
  nullable(threshold = 0.5): Nullable<this> { return new Nullable(this, threshold); }
  constructor(options: Omit<ExtractionQuestion, "type"> & { name?: string }) {
    super(options.name);
    if (!options.instructions.trim() || "criteria" in options) throw new Error("Extraction requires instructions and rejects criteria.");
    this.instructions = options.instructions;
  }
}
