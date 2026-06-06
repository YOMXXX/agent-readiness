import type { Report } from "../types.js";

/** Returns a shields.io README badge (markdown) reflecting the score. */
export function badgeMarkdown(report: Report): string {
  const color =
    report.grade === "ready" ? "brightgreen" : report.grade === "risky" ? "yellow" : "red";
  // shields.io renders "--" as a literal "-"
  const url = `https://img.shields.io/badge/agent--readiness-${report.score}%2F100-${color}`;
  return `![Agent Readiness](${url})`;
}
