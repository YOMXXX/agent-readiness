import type { Detector } from "../../types.js";
import { hasAnyDep } from "../signals.js";

const RETRY_DEPS = [
  "p-retry",
  "async-retry",
  "retry",
  "tenacity",
  "backoff",
  "p-timeout",
  "exponential-backoff",
];

export const retries: Detector = {
  id: "retries",
  title: "Retries & timeouts",
  weight: 10,
  detect(ctx) {
    const retry =
      hasAnyDep(ctx.deps, RETRY_DEPS) || ctx.grep(/maxretries|max_retries|\bretry\b|backoff/i);
    const timeout = ctx.grep(/timeout|abortsignal|abortcontroller|signal\s*:/i);

    if (retry && timeout) {
      return { status: "pass", note: "Model/tool calls have retries and timeouts." };
    }
    if (retry || timeout) {
      return {
        status: "weak",
        note: "Either retries or timeouts are present, but not both.",
        fix: "Add retries with backoff AND request timeouts around every external call.",
      };
    }
    return {
      status: "fail",
      note: "No retry or timeout handling detected.",
      fix: "Wrap model/tool calls with backoff retries and hard timeouts.",
    };
  },
};
