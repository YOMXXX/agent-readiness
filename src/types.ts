// Core type contracts shared across the scanner.

export type Status = "pass" | "weak" | "fail";

export interface CheckResult {
  status: Status;
  /** One-line human explanation of what was (not) found. */
  note: string;
  /** Actionable remediation, shown for weak/fail. */
  fix?: string;
}

export interface Detector {
  /** Stable id, also used as the survey-answer key. */
  id: string;
  title: string;
  /** Contribution to the 0–100 score. All weights sum to 100. */
  weight: number;
  /** If set, the CLI may ask this yes/no question to resolve ambiguity. */
  surveyQuestion?: string;
  detect(ctx: ScanContext): CheckResult;
}

export interface ScanContext {
  root: string;
  /** Lowercased dependency names from package.json / requirements / pyproject. */
  deps: Set<string>;
  /** Relative source-file paths that were collected. */
  files: string[];
  /** yes/no answers keyed by detector id. */
  survey: Record<string, boolean>;
  /** True if any collected source file matches the pattern. */
  grep(pattern: RegExp): boolean;
  /** True if a directory exists (relative to root). */
  hasDir(name: string): boolean;
  /** True if any collected file path matches the pattern. */
  hasFile(pattern: RegExp): boolean;
}

export interface ScoredCheck extends CheckResult {
  id: string;
  title: string;
  weight: number;
  earned: number;
}

export type Grade = "ready" | "risky" | "notready";

export interface Report {
  score: number;
  grade: Grade;
  checks: ScoredCheck[];
  criticalCount: number;
}
