import type { Detector } from "../../types.js";
import { hasAnyDep } from "../signals.js";

const STRUCT_DEPS = [
  "zod",
  "valibot",
  "yup",
  "@sinclair/typebox",
  "ajv",
  "pydantic",
  "instructor",
  "outlines",
  "guardrails-ai",
];

export const guardrails: Detector = {
  id: "guardrails",
  title: "Output guardrails",
  weight: 15,
  detect(ctx) {
    const dep = hasAnyDep(ctx.deps, STRUCT_DEPS);
    const usage = ctx.grep(
      /generateobject|streamobject|withstructuredoutput|response_format|responseformat|zodresponseformat|response_model|\.parse\(|model_validate/i,
    );

    if (dep && usage) {
      return { status: "pass", note: "Model output is parsed/validated against a schema." };
    }
    if (dep || usage) {
      return {
        status: "weak",
        note: "Schema tooling present but validation of model output looks partial.",
        fix: "Validate every model response against a schema before using it.",
      };
    }
    return {
      status: "fail",
      note: "Raw model output appears to be used without schema validation.",
      fix: "Use structured output (zod / pydantic / instructor) and reject invalid responses.",
    };
  },
};
