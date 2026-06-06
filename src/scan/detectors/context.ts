import type { Detector } from "../../types.js";

export const context: Detector = {
  id: "context",
  title: "Context management",
  weight: 8,
  surveyQuestion:
    "Does your agent trim or summarize conversation history to manage the context window?",
  detect(ctx) {
    const sig = ctx.grep(
      /summariz|truncat|sliding.?window|trimmessages|trim_messages|contextwindow|messages\.slice|history\.slice|prune|compact|max.?history/i,
    );
    if (sig) {
      return { status: "pass", note: "History is trimmed/summarized to manage context." };
    }
    if (ctx.survey.context === true) {
      return { status: "pass", note: "Context management confirmed via survey." };
    }
    return {
      status: "fail",
      note: "No context-management strategy detected.",
      fix: "Trim or summarize history to avoid context bloat and quality collapse.",
    };
  },
};
