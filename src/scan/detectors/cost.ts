import type { Detector } from "../../types.js";
import { hasAnyDep } from "../signals.js";

const COST_DEPS = [
  "tiktoken",
  "js-tiktoken",
  "gpt-tokenizer",
  "@dqbd/tiktoken",
  "tokencost",
  "helicone",
];

export const cost: Detector = {
  id: "cost",
  title: "Cost / token guardrails",
  weight: 10,
  detect(ctx) {
    const count =
      hasAnyDep(ctx.deps, COST_DEPS) ||
      ctx.grep(/tiktoken|counttokens|usage\.\w*tokens|token_count|encoding_for_model|prompt_tokens/i);
    const budget = ctx.grep(
      /max_tokens|maxtokens|maxoutputtokens|token.?budget|max_cost|maxcost|spend.?limit/i,
    );

    if (count && budget) {
      return { status: "pass", note: "Token usage is tracked and a budget cap is enforced." };
    }
    if (count || budget) {
      return {
        status: "weak",
        note: "Partial cost control — tracking or capping is present, not both.",
        fix: "Track token usage and enforce a hard per-run token/cost budget.",
      };
    }
    return {
      status: "fail",
      note: "No token accounting or budget cap — costs can run away.",
      fix: "Count tokens per run and cut off runs that exceed a budget.",
    };
  },
};
