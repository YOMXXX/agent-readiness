import type { Detector } from "../../types.js";

export const humanInLoop: Detector = {
  id: "humanInLoop",
  title: "Human-in-the-loop",
  weight: 6,
  surveyQuestion:
    "Do high-risk actions (payments, deletes, sending emails) require human approval before running?",
  detect(ctx) {
    const sig = ctx.grep(
      /interrupt\(|human.?in.?the.?loop|requireapproval|require_approval|\bapproval\b|awaitconfirm|\bconfirm\(|breakpoint|nodeinterrupt/i,
    );
    if (sig) {
      return { status: "pass", note: "Approval / interrupt step found for sensitive actions." };
    }
    if (ctx.survey.humanInLoop === true) {
      return { status: "pass", note: "Human approval confirmed via survey." };
    }
    return {
      status: "fail",
      note: "No human approval step for high-risk actions.",
      fix: "Require explicit approval before payments, deletes, or outbound messages.",
    };
  },
};
