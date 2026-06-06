import { resolve } from "node:path";
import { existsSync } from "node:fs";
import { buildContext } from "./scan/signals.js";
import { detectFrameworks } from "./scan/framework.js";
import { detectors } from "./scan/detectors/index.js";
import { scoreReport } from "./score.js";
import { collectSurvey } from "./survey.js";
import { renderTerminal } from "./report/terminal.js";
import { writeMarkdownReport } from "./report/markdown.js";
import { writeSvgReport } from "./report/svg.js";

interface Options {
  path: string;
  json: boolean;
  survey: boolean;
  write: boolean;
  svg: boolean;
}

const HELP = `
agent-readiness — score your AI agent's production-readiness

Usage:
  npx agent-readiness [path] [options]

Options:
  -p, --path <dir>   Project directory to scan (default: current dir)
  --json             Output machine-readable JSON (implies --no-survey)
  --no-survey        Skip the interactive yes/no questions
  --no-write         Don't write AGENT-READINESS.md
  --svg              Also write a shareable AGENT-READINESS.svg card
  -h, --help         Show this help
`;

function parseArgs(argv: string[]): Options | null {
  const opts: Options = { path: ".", json: false, survey: true, write: true, svg: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-h" || a === "--help") return null;
    else if (a === "--json") {
      opts.json = true;
      opts.survey = false;
    } else if (a === "--no-survey") opts.survey = false;
    else if (a === "--no-write") opts.write = false;
    else if (a === "--svg") opts.svg = true;
    else if (a === "--path" || a === "-p") opts.path = argv[++i] ?? ".";
    else if (a && !a.startsWith("-")) opts.path = a;
  }
  return opts;
}

async function main(): Promise<void> {
  const opts = parseArgs(process.argv.slice(2));
  if (!opts) {
    console.log(HELP);
    return;
  }

  const root = resolve(opts.path);
  if (!existsSync(root)) {
    console.error(`Path not found: ${root}`);
    process.exitCode = 1;
    return;
  }

  const ctx = buildContext(root);
  const frameworks = detectFrameworks(ctx.deps);

  if (opts.survey && process.stdin.isTTY) {
    ctx.survey = await collectSurvey(detectors);
  }

  const report = scoreReport(ctx, detectors);

  if (opts.json) {
    console.log(
      JSON.stringify(
        {
          score: report.score,
          grade: report.grade,
          frameworks,
          criticalCount: report.criticalCount,
          checks: report.checks.map((ch) => ({
            id: ch.id,
            status: ch.status,
            earned: ch.earned,
            weight: ch.weight,
            note: ch.note,
          })),
        },
        null,
        2,
      ),
    );
    return;
  }

  console.log(renderTerminal(report, frameworks));
  if (opts.write) {
    const out = writeMarkdownReport(report, frameworks, root);
    console.log(`📄 Report written to ${out}\n`);
  }
  if (opts.svg) {
    const svgOut = writeSvgReport(report, frameworks, root);
    console.log(`🖼  Shareable card written to ${svgOut}\n`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
