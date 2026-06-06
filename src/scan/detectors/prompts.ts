import type { Detector } from "../../types.js";

export const prompts: Detector = {
  id: "prompts",
  title: "Prompt versioning / reproducibility",
  weight: 6,
  detect(ctx) {
    const promptFile = ctx.hasDir("prompts") || ctx.hasFile(/prompt/i);
    const pinned = ctx.grep(/temperature\s*[:=]/i);

    if (promptFile && pinned) {
      return { status: "pass", note: "Prompts are externalized and sampling params are pinned." };
    }
    if (promptFile || pinned) {
      return {
        status: "weak",
        note: "Partial reproducibility — prompts or sampling params are managed, not both.",
        fix: "Externalize prompts (versioned) and pin model + temperature.",
      };
    }
    return {
      status: "fail",
      note: "Prompts look hardcoded and sampling params are not pinned.",
      fix: "Move prompts into versioned files and pin model + temperature for reproducibility.",
    };
  },
};
