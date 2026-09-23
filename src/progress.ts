import type { Alignment, BatchDecision } from "./types.js";

interface Output {
  isTTY?: boolean;
  write(text: string): unknown;
}

function stderr(): Output | undefined {
  const target = globalThis as typeof globalThis & { process?: { stderr?: Output } };
  return target.process?.stderr;
}

export class JobProgress {
  private output: Output | undefined;
  private previous = "";
  private label = "Job";

  constructor(enabled: boolean, output?: Output) {
    this.output = enabled ? output ?? stderr() : undefined;
  }

  update(job: BatchDecision | Alignment): void {
    if (!this.output) return;
    let current: number | undefined;
    let total: number | undefined;
    let unit: string;
    let status: string;
    if ("resultCommitSha" in job) {
      this.label = `Alignment ${job.id.slice(0, 8)}`;
      current = job.progress?.metricCalls;
      total = job.progress?.maxMetricCalls ?? undefined;
      unit = "metric calls";
      status = `${job.status}, ${job.progress?.stage ?? job.phase}`;
    } else {
      this.label = `Batch decisions ${job.id.slice(0, 8)}`;
      current = job.progress.completed + job.progress.failed;
      total = job.progress.total;
      unit = "examples";
      status = `${job.status}, ${job.progress.failed} failed`;
    }
    let counts = "";
    if (current !== undefined) {
      if (total !== undefined && total > 0) {
        const filled = Math.round(Math.min(1, Math.max(0, current / total)) * 20);
        counts = ` [${"=".repeat(filled)}${" ".repeat(20 - filled)}] ${current}/${total} ${unit}`;
      } else {
        counts = ` ${current} ${unit}`;
      }
    }
    this.render(`${this.label}${counts} | ${status}`);
  }

  close(reason?: string): void {
    if (reason) this.render(`${this.label} | ${reason}`);
    if (this.output?.isTTY && this.previous) this.write("\n");
    this.output = undefined;
  }

  private render(line: string): void {
    if (!this.output || line === this.previous) return;
    const text = this.output.isTTY ? `\r${line.padEnd(this.previous.length)}` : `${line}\n`;
    this.write(text);
    this.previous = line;
  }

  private write(text: string): void {
    try {
      this.output?.write(text);
    } catch {
      // A closed output stream must not change the job result or hide an API error.
      this.output = undefined;
    }
  }
}
