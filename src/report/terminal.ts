import type { Report, Status } from "../types.js";

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
};

const COLOR: Record<Status, string> = { pass: c.green, weak: c.yellow, fail: c.red };
const ICON: Record<Status, string> = { pass: "✅", weak: "🟡", fail: "🔴" };

function bar(earned: number, weight: number): string {
  const ratio = weight === 0 ? 1 : earned / weight;
  const filled = Math.max(0, Math.min(10, Math.round(ratio * 10)));
  return "█".repeat(filled) + "░".repeat(10 - filled);
}

export function renderTerminal(report: Report, frameworks: string[]): string {
  const gradeText =
    report.grade === "ready"
      ? "Production-ready"
      : report.grade === "risky"
        ? "Risky — patch before shipping"
        : "Not ready — will likely fail in prod";
  const gradeColor =
    report.grade === "ready" ? c.green : report.grade === "risky" ? c.yellow : c.red;
  const emoji = report.grade === "ready" ? "🟢" : report.grade === "risky" ? "🟡" : "🔴";

  const lines: string[] = [];
  lines.push("");
  lines.push(
    `${c.bold}${emoji} Agent Production Readiness: ${gradeColor}${report.score} / 100${c.reset}${c.dim}  (${gradeText})${c.reset}`,
  );
  lines.push(`${c.dim}Framework: ${frameworks.join(", ")}${c.reset}`);
  lines.push("");

  for (const ch of report.checks) {
    const col = COLOR[ch.status];
    const label = ch.title.padEnd(30);
    lines.push(
      `${ICON[ch.status]} ${label} ${col}${bar(ch.earned, ch.weight)}${c.reset} ` +
        `${col}${ch.status.toUpperCase().padEnd(4)}${c.reset} ${c.dim}${ch.note}${c.reset}`,
    );
    if (ch.status !== "pass" && ch.fix) {
      lines.push(`   ${c.dim}↳ ${ch.fix}${c.reset}`);
    }
  }

  lines.push("");
  if (report.criticalCount > 0) {
    lines.push(
      `${c.red}⚠️  ${report.criticalCount} critical risk(s) will bite you in production.${c.reset}`,
    );
  }
  lines.push(
    `${c.cyan}👉 Want a human deep-dive on your agent? Email me for a free 30-min audit → 316195542@qq.com${c.reset}`,
  );
  lines.push("");
  return lines.join("\n");
}
