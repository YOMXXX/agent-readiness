import type { Detector } from "../../types.js";
import { evals } from "./evals.js";
import { guardrails } from "./guardrails.js";
import { observability } from "./observability.js";
import { toolSafety } from "./toolSafety.js";
import { retries } from "./retries.js";
import { cost } from "./cost.js";
import { context } from "./context.js";
import { fallback } from "./fallback.js";
import { humanInLoop } from "./humanInLoop.js";
import { prompts } from "./prompts.js";

/** All detectors, in display order (highest weight first). */
export const detectors: Detector[] = [
  evals,
  guardrails,
  observability,
  toolSafety,
  retries,
  cost,
  context,
  fallback,
  humanInLoop,
  prompts,
];

// Sanity guard: weights must sum to 100 so the score is a clean percentage.
const total = detectors.reduce((s, d) => s + d.weight, 0);
if (total !== 100) {
  throw new Error(`Detector weights must sum to 100, got ${total}`);
}
