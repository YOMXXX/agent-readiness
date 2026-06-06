import type { Detector } from "../../types.js";
import { hasAnyDep } from "../signals.js";

const EVAL_DEPS = [
  "promptfoo",
  "deepeval",
  "braintrust",
  "ragas",
  "langsmith",
  "autoevals",
  "evalite",
  "@evalite/core",
  "vitest-evals",
];

export const evals: Detector = {
  id: "evals",
  title: "Eval / regression tests",
  weight: 15,
  detect(ctx) {
    const dep = hasAnyDep(ctx.deps, EVAL_DEPS);
    const dir =
      ctx.hasDir("evals") ||
      ctx.hasDir("eval") ||
      ctx.hasFile(/\.eval\.[tj]sx?$/i) ||
      ctx.hasFile(/\/evals?\//i);
    const inCI = ctx.hasDir(".github/workflows");

    if (dep && (dir || inCI)) {
      return { status: "pass", note: "Eval tooling present and wired into the project." };
    }
    if (dep || dir) {
      return {
        status: "weak",
        note: "Some eval tooling found, but no clear suite + CI gate.",
        fix: "Group evals into a suite and run them in CI on every PR.",
      };
    }
    return {
      status: "fail",
      note: "No eval / regression tests detected.",
      fix: "Add a regression eval suite (promptfoo, evalite, deepeval) and gate merges on it.",
    };
  },
};
