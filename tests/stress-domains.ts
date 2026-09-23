// Explicitly opt-in, billable QA runner. Retains models and examples.
// MODAIC_E2E=1 + API key/URL/workspace: bun tests/stress-domains.ts RUN_ID OUTPUT.json
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { Choice, Modaic, Noul, Score, type DecisionResponse, type JsonValue, type Question } from "../src/index.js";

interface FixtureExample {
  name: string; state: JsonValue; groundTruth: Record<string, JsonValue>; rationale: string;
}
interface Domain {
  slug: string; mode: string; description: string; keys: [string, string, string];
  questions: Record<string, Question>; examples: FixtureExample[];
}
interface Row {
  name: string; id: string; expected: Record<string, JsonValue>; passed?: boolean;
  latency_ms?: number; elapsed_ms?: number; response?: DecisionResponse; error?: string;
  persistence_verified_ms?: number;
  immediate_replay_ms?: number;
  replay_verified?: boolean;
  quality?: { noul_matches: boolean; choice_matches: boolean; score_absolute_error: number };
}
interface DomainReport {
  domain: string; client: string; model: string; model_id?: string; setup_ms?: number;
  examples: Row[]; errors: string[]; pagination_verified?: boolean; stored_outputs?: number;
}

function validate(result: DecisionResponse, questions: Record<string, Question>) {
  assert.deepEqual(Object.keys(result.answers).sort(), Object.keys(questions).sort());
  assert(result.usage.inputTokens >= 0 && result.usage.outputTokens >= 0);
  for (const [name, answer] of Object.entries(result.answers)) {
    const question = questions[name]!;
    assert.equal(answer.type, question.type);
    if (answer.type === "noul") assert(answer.noul >= 0 && answer.noul <= 1);
    else {
      assert(answer.confidence >= 0 && answer.confidence <= 1);
      const probabilities = Object.values(answer.probabilities);
      assert(probabilities.every((p) => p >= 0 && p <= 1));
      assert(Math.abs(probabilities.reduce((a, b) => a + b, 0) - 1) < 0.01);
      if (answer.type === "choice" && question.type === "choice") {
        assert(answer.choice in question.criteria);
        assert.deepEqual(Object.keys(answer.probabilities).sort(), Object.keys(question.criteria).sort());
      } else if (answer.type === "score" && question.type === "score") {
        assert(answer.score >= 0 && answer.score <= question.criteria.length - 1);
        assert.equal(Object.keys(answer.legend).length, question.criteria.length);
      }
    }
  }
}

async function runDomain(domain: Domain, runId: string, workspace: string): Promise<DomainReport> {
  const client = new Modaic({ timeoutMs: 60_000 });
  const slug = `sdk-stress-${domain.slug}-${runId}`;
  const entry: DomainReport = { domain: domain.slug, client: "typescript", model: `${workspace}/${slug}`,
    examples: [], errors: [] };
  const questions = Object.fromEntries(Object.entries(domain.questions).map(([name, q]) => [name,
    q.type === "noul" ? new Noul(q) : q.type === "choice" ? new Choice(q) : new Score(q)]));
  const started = performance.now();
  try {
    const model = await client.models.create({ workspace, slug, model: "typesafe/jev-latest", questions,
      description: `Synthetic SDK stress test: ${domain.description}` });
    assert.equal(model.workspace, workspace);
    entry.model_id = model.id;
    const fetched = await client.models.get(workspace, slug);
    assert.equal(fetched.id, model.id);
    assert.equal(fetched.workspace.slug, workspace);
    const examples = domain.examples.map((e) => ({ ...e, id: crypto.randomUUID() }));
    await model.examples.ingest(examples.map((e) => ({ id: e.id, state: e.state,
      annotation: { groundTruth: e.groundTruth, groundReasoning: e.rationale } })));
    entry.setup_ms = Math.round(performance.now() - started);
    console.log(`READY ${entry.model}`);
    let next = 0;
    async function worker() {
      while (next < examples.length) {
        const index = next++;
        const e = examples[index]!;
        const row: Row = { name: e.name, id: e.id, expected: e.groundTruth };
        entry.examples.push(row);
        const begin = performance.now();
        const request = { state: e.state, exampleId: e.id, idempotencyKey: `stress-${runId}-${e.id}` };
        try {
          const result = index % 2
            ? await client.decisions.create({ model: entry.model, ...request })
            : await model.decisions.create(request);
          row.latency_ms = Math.round(performance.now() - begin);
          row.response = result;
          validate(result, questions);
          assert(result.captured && result.exampleId === e.id && result.decisionId);
          assert(result.revision && result.checkpoint !== null);
          const binary = result.answers[domain.keys[0]]!;
          const choice = result.answers[domain.keys[1]]!;
          const score = result.answers[domain.keys[2]]!;
          assert(binary.type === "noul" && choice.type === "choice" && score.type === "score");
          row.quality = {
            noul_matches: (binary.noul >= 0.5) === e.groundTruth[domain.keys[0]],
            choice_matches: choice.choice === e.groundTruth[domain.keys[1]],
            score_absolute_error: Math.abs(score.score - Number(e.groundTruth[domain.keys[2]])),
          };
          if (index === 0) {
            const replayBegin = performance.now();
            assert.deepEqual(await model.decisions.create(request), result);
            row.replay_verified = true;
            row.immediate_replay_ms = Math.round(performance.now() - replayBegin);
          }
          const deadline = performance.now() + 30_000;
          let history = await model.examples.listDecisions(e.id);
          while (!history.decisions.length && performance.now() < deadline) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            history = await model.examples.listDecisions(e.id);
          }
          row.persistence_verified_ms = Math.round(performance.now() - begin);
          assert.equal(history.decisions.length, 1);
          const saved = history.decisions[0]!;
          assert.equal(saved.id, result.decisionId);
          assert.equal(saved.error, null);
          assert.deepEqual(saved.request.state, e.state);
          assert.deepEqual(saved.request.questions, domain.questions);
          assert.deepEqual(saved.answers, result.answers);
          const stored = await model.examples.get(e.id);
          assert.deepEqual(stored.state, e.state);
          assert.deepEqual(stored.annotation?.groundTruth, e.groundTruth);
          assert.equal(stored.annotation?.groundReasoning, e.rationale);
          assert.equal(stored.latestDecision?.id, result.decisionId);
          assert.equal(stored.decisionCount, 1);
          row.passed = true;
        } catch (error) {
          row.error = String(error);
          row.elapsed_ms = Math.round(performance.now() - begin);
        }
        console.log(`${row.passed ? "PASS" : "FAIL"} ${e.name} ${row.latency_ms ?? row.elapsed_ms}ms ${row.error ?? ""}`);
      }
    }
    await Promise.all([worker(), worker(), worker()]);
    const pages = [];
    for (let page = 1; page <= 3; page++) pages.push(await model.examples.list({ page, pageSize: 5 }));
    assert(pages.every((p) => p.total === 12 && p.totalPages === 3));
    const items = pages.flatMap((p) => p.items);
    assert.equal(items.length, 12);
    assert.deepEqual(new Set(items.map((e) => e.id)), new Set(examples.map((e) => e.id)));
    entry.pagination_verified = true;
    entry.stored_outputs = items.filter((e) => e.latestDecision !== null).length;
  } catch (error) {
    entry.errors.push(String(error));
    console.log(`DOMAIN FAIL ${entry.model}: ${error}`);
  }
  return entry;
}

if (process.env.MODAIC_E2E !== "1") throw new Error("Set MODAIC_E2E=1; billable requests, retained data");
for (const key of ["MODAIC_API_KEY", "MODAIC_API_URL", "MODAIC_E2E_WORKSPACE"]) {
  if (!process.env[key]) throw new Error(`Missing ${key}`);
}
const [runId, output] = process.argv.slice(2);
if (!runId || !output) throw new Error("Usage: bun tests/stress-domains.ts RUN_ID OUTPUT.json");
const fixture = JSON.parse(await readFile(new URL("./fixtures/domain-stress.json", import.meta.url), "utf8")) as { domains: Domain[] };
const report = { run_id: runId, api_url: process.env.MODAIC_API_URL, domains: [] as DomainReport[] };
for (const domain of fixture.domains.filter((d) => d.mode === "typescript")) {
  report.domains.push(await runDomain(domain, runId, process.env.MODAIC_E2E_WORKSPACE!));
  await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
}
const failures = report.domains.reduce((n, d) => n + d.errors.length + d.examples.filter((e) => !e.passed).length, 0);
console.log(`Finished: ${failures} transport/contract/persistence failures; report ${output}`);
process.exitCode = failures ? 1 : 0;
