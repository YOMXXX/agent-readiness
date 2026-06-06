import { describe, it, expect } from "vitest";
import { badgeMarkdown } from "../src/report/badge";
import type { Report } from "../src/types";

const report = (score: number, grade: Report["grade"]): Report => ({
  score,
  grade,
  checks: [],
  criticalCount: 0,
});

describe("badgeMarkdown", () => {
  it("uses green for ready", () => {
    const md = badgeMarkdown(report(90, "ready"));
    expect(md).toContain("brightgreen");
    expect(md).toContain("90%2F100");
  });
  it("uses yellow for risky", () => {
    expect(badgeMarkdown(report(66, "risky"))).toContain("yellow");
  });
  it("uses red for notready", () => {
    expect(badgeMarkdown(report(10, "notready"))).toContain("red");
  });
  it("produces valid shields markdown", () => {
    expect(badgeMarkdown(report(66, "risky"))).toMatch(
      /^!\[Agent Readiness\]\(https:\/\/img\.shields\.io\/badge\//,
    );
  });
});
