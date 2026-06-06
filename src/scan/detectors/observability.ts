import type { Detector } from "../../types.js";
import { hasAnyDep } from "../signals.js";

const OBS_DEPS = [
  "langfuse",
  "langsmith",
  "@opentelemetry/api",
  "@traceloop/node-server-sdk",
  "@arizeai/openinference-instrumentation",
  "helicone",
  "openllmetry",
  "logfire",
  "braintrust",
  "openinference",
];

export const observability: Detector = {
  id: "observability",
  title: "Observability / tracing",
  weight: 12,
  detect(ctx) {
    const dep = hasAnyDep(ctx.deps, OBS_DEPS);
    const init = ctx.grep(
      /langfuse|langsmith|traceloop|opentelemetry|@observe|withtracing|openinference|instrument\(/i,
    );

    if (dep && init) {
      return { status: "pass", note: "Tracing is installed and initialized." };
    }
    if (dep) {
      return {
        status: "weak",
        note: "A tracing library is installed but not clearly wired up.",
        fix: "Initialize the tracer and instrument your agent runs.",
      };
    }
    return {
      status: "fail",
      note: "No tracing / observability detected — failures will be invisible.",
      fix: "Wire up Langfuse / LangSmith / OpenTelemetry to see where runs break.",
    };
  },
};
