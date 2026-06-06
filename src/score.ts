import type { Detector, Grade, Report, ScanContext, ScoredCheck } from "./types.js";

const MULTIPLIER: Record<string, number> = { pass: 1, weak: 0.5, fail: 0 };

export function scoreReport(ctx: ScanContext, detectors: Detector[]): Report {
  const checks: ScoredCheck[] = detectors.map((d) => {
    const r = d.detect(ctx);
    const earned = Math.round(d.weight * (MULTIPLIER[r.status] ?? 0) * 10) / 10;
    return { id: d.id, title: d.title, weight: d.weight, earned, ...r };
  });

  const score = Math.round(checks.reduce((s, c) => s + c.earned, 0));
  const grade: Grade = score >= 80 ? "ready" : score >= 60 ? "risky" : "notready";
  const criticalCount = checks.filter((c) => c.status === "fail" && c.weight >= 10).length;

  return { score, grade, checks, criticalCount };
}
