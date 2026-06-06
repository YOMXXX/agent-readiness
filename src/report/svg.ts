import { writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Report, Status } from "../types.js";

const C = {
  bg: "#0d1117",
  text: "#e6edf3",
  dim: "#8b949e",
  track: "#21262d",
};

const STATUS_COLOR: Record<Status, string> = {
  pass: "#3fb950",
  weak: "#d29922",
  fail: "#f85149",
};

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Renders a shareable 1200×630 (OG/Twitter-card sized) readiness card as SVG. */
export function renderSvg(report: Report, frameworks: string[]): string {
  const gradeColor =
    report.grade === "ready"
      ? STATUS_COLOR.pass
      : report.grade === "risky"
        ? STATUS_COLOR.weak
        : STATUS_COLOR.fail;
  const gradeText =
    report.grade === "ready" ? "PRODUCTION-READY" : report.grade === "risky" ? "RISKY" : "NOT READY";

  const W = 1200;
  const H = 630;
  const scoreStr = String(report.score);
  const slashX = 80 + scoreStr.length * 84 + 18;
  const rows = 5;

  const checkEls = report.checks
    .map((ch, i) => {
      const col = Math.floor(i / rows);
      const row = i % rows;
      const x = 80 + col * 560;
      const y = 372 + row * 47;
      const color = STATUS_COLOR[ch.status];
      const ratio = ch.weight === 0 ? 1 : ch.earned / ch.weight;
      const barW = 120;
      const fillW = Math.round(barW * Math.max(0, Math.min(1, ratio)));
      const barX = x + 400;
      return (
        `<circle cx="${x + 6}" cy="${y - 6}" r="6" fill="${color}"/>` +
        `<text x="${x + 24}" y="${y}" font-size="22" fill="${C.text}">${esc(ch.title)}</text>` +
        `<rect x="${barX}" y="${y - 14}" width="${barW}" height="10" rx="5" fill="${C.track}"/>` +
        `<rect x="${barX}" y="${y - 14}" width="${fillW}" height="10" rx="5" fill="${color}"/>`
      );
    })
    .join("\n  ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="ui-sans-serif, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif">
  <rect width="${W}" height="${H}" fill="${C.bg}"/>
  <text x="80" y="92" font-size="26" letter-spacing="6" fill="${C.dim}">AGENT PRODUCTION READINESS</text>
  <text x="${W - 80}" y="92" font-size="20" fill="${C.dim}" text-anchor="end">${esc(frameworks.join("  ·  "))}</text>

  <text x="80" y="248" font-size="150" font-weight="700" fill="${gradeColor}">${scoreStr}</text>
  <text x="${slashX}" y="248" font-size="54" fill="${C.dim}">/ 100</text>

  <rect x="82" y="278" width="${gradeText.length * 15 + 44}" height="44" rx="22" fill="none" stroke="${gradeColor}" stroke-width="2"/>
  <text x="104" y="306" font-size="22" letter-spacing="2" fill="${gradeColor}">${gradeText}</text>

  <line x1="80" y1="344" x2="${W - 80}" y2="344" stroke="${C.track}" stroke-width="1"/>

  ${checkEls}

  <text x="80" y="602" font-size="24" font-weight="600" fill="${C.text}">⬢ agent-readiness</text>
  <text x="${W - 80}" y="602" font-size="20" fill="${C.dim}" text-anchor="end">88% of agents that demo well fail in production</text>
</svg>`;
}

export function writeSvgReport(report: Report, frameworks: string[], dir: string): string {
  const out = join(dir, "AGENT-READINESS.svg");
  writeFileSync(out, renderSvg(report, frameworks), "utf8");
  return out;
}
