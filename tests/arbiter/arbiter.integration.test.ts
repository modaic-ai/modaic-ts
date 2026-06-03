/**
 * Integration tests for the `Arbiter` class against a LIVE Modaic Hub.
 *
 * These actually create repos, push/update signatures over git, pull them back
 * from the hub, and run a prediction server-side. They need:
 *   - MODAIC_TOKEN        a real access token (https://modaic.dev)
 *   - git installed       (push/clone happen over git)
 *   - network access to api.modaic.dev + git.modaic.dev
 *
 * They are SKIPPED unless BOTH MODAIC_TOKEN and MODAIC_INTEGRATION are set, so a
 * routine `bun test` never creates real repos. Run them with:
 *
 *   MODAIC_INTEGRATION=1 MODAIC_TOKEN=... bun test tests/arbiter/arbiter.integration.test.ts
 *   # or: MODAIC_TOKEN=... npm run test:integration
 *
 * Optional: MODAIC_TEST_MODEL overrides the LiteLLM model (default gpt-oss-120b).
 * The predict test needs that model to have a provider key configured on the hub.
 *
 * Every repo created here is registered for best-effort deletion in afterAll.
 */
import { expect, test, describe, beforeAll, afterAll } from "bun:test";
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { simpleGit } from "simple-git";
import {
  Arbiter,
  Signature,
  Enum,
  getUserInfo,
  getApiUrl,
  getGitUrl,
  getCacheDir,
} from "../../src/modaic/index";

const TOKEN = process.env.MODAIC_TOKEN ?? "";
const MODEL = process.env.MODAIC_TEST_MODEL ?? "gpt-oss-120b";
const RUN = Boolean(TOKEN) && Boolean(process.env.MODAIC_INTEGRATION);

// The hub needs a moment to index a freshly-pushed arbiter before inference can
// load it; predicting too soon yields an empty output. Tune with MODAIC_PROPAGATION_MS.
const PROPAGATION_MS = Number(process.env.MODAIC_PROPAGATION_MS ?? 30_000);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const suite = RUN ? describe : describe.skip;

suite("Arbiter integration (live Modaic Hub)", () => {
  let owner = "";
  const createdRepos: string[] = [];

  beforeAll(async () => {
    owner = (await getUserInfo(TOKEN)).login;
  });

  afterAll(async () => {
    // Best-effort cleanup — don't fail the suite if a delete doesn't go through.
    for (const repo of createdRepos) {
      try {
        await fetch(`${getApiUrl()}/api/v2/repos/${repo}`, {
          method: "DELETE",
          headers: { Authorization: `token ${TOKEN}`, Accept: "application/json" },
        });
      } catch {
        /* ignore */
      }
    }
  });

  /** A unique repo path under the authenticated user, registered for cleanup. */
  function uniqueRepo(slug: string): string {
    const rand = Math.floor(Math.random() * 1e6);
    const repo = `${owner}/modaic-ts-it-${slug}-${Date.now()}-${rand}`;
    createdRepos.push(repo);
    return repo;
  }

  /** Pull the repo fresh from the hub via git and read its arbiter artifacts. */
  async function pullFromHub(
    repo: string,
  ): Promise<{ config: any; program: any }> {
    const gitUrl = getGitUrl();
    const protocol = gitUrl.startsWith("https://") ? "https://" : "http://";
    const host = gitUrl.replace(/^https?:\/\//, "");
    const remote = `${protocol}${owner}:${TOKEN}@${host}/${repo}.git`;

    // Clone under the MODAIC_CACHE dir (default ~/.cache/modaic-ts), same root the
    // library stages pushes in.
    const base = path.join(getCacheDir(), "it-clones");
    fs.mkdirSync(base, { recursive: true });
    const dir = fs.mkdtempSync(path.join(base, "pull-"));
    try {
      await simpleGit().clone(remote, dir, ["--depth", "1"]);
      const config = JSON.parse(
        fs.readFileSync(path.join(dir, "config.json"), "utf-8"),
      );
      const program = JSON.parse(
        fs.readFileSync(path.join(dir, "program.json"), "utf-8"),
      );
      return { config, program };
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }

  test(
    "create() pushes the signature; pulling from the hub reflects it",
    async () => {
      const repo = uniqueRepo("create");
      const signature = new Signature({
        instructions: "Judge whether the answer is correct.",
        input: z.object({
          question: z.string().describe("The question"),
          answer: z.string().describe("The proposed answer"),
        }),
        output: z.object({
          verdict: z.string().describe("correct or incorrect"),
        }),
      });

      const arbiter = await Arbiter.create({ repo, signature, model: MODEL });
      expect(arbiter.repo).toBe(repo);
      expect(arbiter.branch).toBe("main");

      const { config, program } = await pullFromHub(repo);

      // --- config.json (serialized signature schema) ---
      expect(config.model).toBeNull();
      expect(config.signature.description).toBe(
        "Judge whether the answer is correct.",
      );
      const props = config.signature.properties;
      expect(props.question.__dspy_field_type).toBe("input");
      expect(props.question.prefix).toBe("Question:");
      expect(props.answer.__dspy_field_type).toBe("input");
      expect(props.verdict.__dspy_field_type).toBe("output");
      // create() injects a `reasoning` output field (make_arbiter parity).
      expect(props.reasoning.__dspy_field_type).toBe("output");
      expect(config.signature.required).toEqual(
        expect.arrayContaining(["question", "answer", "verdict", "reasoning"]),
      );

      // --- program.json (stored program state) ---
      expect(program.lm.model).toBe(MODEL);
      expect(program.signature.instructions).toBe(
        "Judge whether the answer is correct.",
      );
      expect(program.signature.fields.map((f: any) => f.prefix)).toEqual([
        "Question:",
        "Answer:",
        "Reasoning:",
        "Verdict:",
      ]);
    },
    120_000,
  );

  test(
    "update() rewrites the signature; pulling reflects the change",
    async () => {
      const repo = uniqueRepo("update");

      const v1 = new Signature({
        instructions: "First instructions.",
        input: z.object({ question: z.string() }),
        output: z.object({ verdict: z.string() }),
      });
      const arbiter = await Arbiter.create({ repo, signature: v1, model: MODEL });

      const before = await pullFromHub(repo);
      expect(before.config.signature.description).toBe("First instructions.");
      expect(before.config.signature.properties.context).toBeUndefined();

      // Update with new instructions + an added input field.
      const v2 = new Signature({
        instructions: "Updated instructions — be strict.",
        input: z.object({
          question: z.string(),
          context: z.string().describe("Supporting context"),
        }),
        output: z.object({ verdict: z.string() }),
      });
      const commit = await arbiter.update({
        signature: v2,
        model: MODEL,
        commit_message: "update signature",
      });
      expect(commit.repo).toBe(repo);
      expect(typeof commit.sha).toBe("string");

      const after = await pullFromHub(repo);
      expect(after.config.signature.description).toBe(
        "Updated instructions — be strict.",
      );
      expect(after.config.signature.properties.context.__dspy_field_type).toBe(
        "input",
      );
      expect(after.program.signature.instructions).toBe(
        "Updated instructions — be strict.",
      );
      // The new commit should differ from the create commit.
      expect(after.program.signature.fields.map((f: any) => f.prefix)).toEqual([
        "Question:",
        "Context:",
        "Reasoning:",
        "Verdict:",
      ]);
    },
    150_000,
  );

  test(
    "create() then predict() runs the judge server-side",
    async () => {
      const repo = uniqueRepo("predict");
      const signature = new Signature({
        instructions:
          "Decide whether the answer correctly answers the question. " +
          "Output 'yes' or 'no'.",
        input: z.object({
          question: z.string().describe("The question"),
          answer: z.string().describe("The answer to judge"),
        }),
        // Arbiter output fields must be enumerable (a finite output space), not a
        // bare string — otherwise the hub's judge pipeline has nothing to extract.
        output: z.object({
          verdict: Enum("yes", "no").describe("yes or no"),
        }),
      });

      const arbiter = await Arbiter.create({ repo, signature, model: MODEL });

      // Wait for the hub to index the freshly-pushed arbiter before running it.
      await sleep(PROPAGATION_MS);

      const result = await arbiter.predict({
        question: "What is the capital of France?",
        answer: "Paris",
      });

      expect(typeof result.exampleId).toBe("string");
      expect(result.exampleId.length).toBeGreaterThan(0);
      expect(typeof result.predictionId).toBe("string");
      // The judge produced an output for the `verdict` field.
      expect(result.output).toBeTruthy();
      expect(result.output).toHaveProperty("verdict");
      // Reasoning is always present on an arbiter prediction (string, may be empty).
      expect(typeof result.reasoning === "string").toBe(true);
    },
    180_000,
  );
});
