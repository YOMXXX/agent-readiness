import { describe, it, expect } from "vitest";
import { scoreReport } from "../src/score";
import type { Detector, Status } from "../src/types";
import { makeCtx } from "./helpers";

const det = (id: string, weight: number, status: Status): Detector => ({
  id,
  title: id,
  weight,
  detect: () => ({ status, note: "" }),
});

const ctx = makeCtx({});

describe("scoreReport", () => {
  it("sums weighted earned scores (weak = half)", () => {
    const r = scoreReport(ctx, [det("a", 50, "pass"), det("b", 50, "weak")]);
    expect(r.score).toBe(75);
  });

  it("grades ready / risky / notready by thresholds", () => {
    expect(scoreReport(ctx, [det("a", 100, "pass")]).grade).toBe("ready");
    expect(scoreReport(ctx, [det("a", 70, "pass"), det("b", 30, "fail")]).grade).toBe("risky");
    expect(scoreReport(ctx, [det("a", 100, "fail")]).grade).toBe("notready");
  });

  it("counts only high-weight fails as critical", () => {
    const r = scoreReport(ctx, [
      det("a", 15, "fail"),
      det("b", 8, "fail"),
      det("c", 12, "fail"),
    ]);
    expect(r.criticalCount).toBe(2);
  });
});
