import type { Detector } from "../../types.js";

export const fallback: Detector = {
  id: "fallback",
  title: "Failure fallbacks",
  weight: 8,
  detect(ctx) {
    const strong = ctx.grep(
      /fallback|circuit.?breaker|degrade|backup.?model|secondary.?model|on_error|\brescue\b/i,
    );
    const errHandling = ctx.grep(/try\s*\{|except\b|\.catch\(/);

    if (strong) {
      return { status: "pass", note: "Explicit fallback / degradation path is present." };
    }
    if (errHandling) {
      return {
        status: "weak",
        note: "Errors are caught, but there is no explicit fallback path.",
        fix: "Add a fallback model/route and a graceful degraded response.",
      };
    }
    return {
      status: "fail",
      note: "No fallback or graceful degradation — one failed step breaks the chain.",
      fix: "Add a fallback model/path and graceful degradation when a step fails.",
    };
  },
};
