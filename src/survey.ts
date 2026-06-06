import { createInterface } from "node:readline/promises";
import type { Detector } from "./types.js";

/**
 * Asks the yes/no questions declared by detectors to resolve checks that
 * static analysis can't confirm. Returns answers keyed by detector id.
 */
export async function collectSurvey(detectors: Detector[]): Promise<Record<string, boolean>> {
  const answers: Record<string, boolean> = {};
  const pending = detectors.filter((d) => d.surveyQuestion);
  if (pending.length === 0) return answers;

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    console.log("\nA couple of things I can't detect from code — quick yes/no:\n");
    for (const d of pending) {
      const raw = (await rl.question(`❓ ${d.surveyQuestion} [y/N] `)).trim().toLowerCase();
      answers[d.id] = raw === "y" || raw === "yes";
    }
  } finally {
    rl.close();
  }
  return answers;
}
