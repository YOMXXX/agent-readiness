import type { Detector } from "../../types.js";

export const toolSafety: Detector = {
  id: "toolSafety",
  title: "Tool-call safety",
  weight: 10,
  detect(ctx) {
    const usesTools = ctx.grep(
      /\btools?\s*[:=]|definetool|\btool\(|@tool\b|functiontool|tool_choice|function_call|dynamictool/i,
    );
    if (!usesTools) {
      return { status: "pass", note: "No tool usage detected — not applicable." };
    }

    const hasSchema = ctx.grep(
      /inputschema|parameters\s*:|args_schema|parameters_json_schema|z\.object|zodfunction/i,
    );
    const hasGuard = ctx.grep(/try\s*\{|except\b|\.catch\(/);

    if (hasSchema && hasGuard) {
      return { status: "pass", note: "Tools have typed schemas and execution is guarded." };
    }
    if (hasSchema || hasGuard) {
      return {
        status: "weak",
        note: "Tools are used but either schemas or error handling are missing.",
        fix: "Give every tool a typed schema and wrap execution in error handling.",
      };
    }
    return {
      status: "fail",
      note: "Tools are called with no schema validation or error handling.",
      fix: "Validate tool args with a schema and catch tool execution failures.",
    };
  },
};
