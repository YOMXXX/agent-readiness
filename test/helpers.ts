import type { ScanContext } from "../src/types";

/** Builds a fully controllable ScanContext for detector unit tests. */
export function makeCtx(opts: {
  deps?: string[];
  files?: string[];
  dirs?: string[];
  text?: string;
  survey?: Record<string, boolean>;
}): ScanContext {
  const deps = new Set((opts.deps ?? []).map((d) => d.toLowerCase()));
  const files = opts.files ?? [];
  const dirs = opts.dirs ?? [];
  const text = opts.text ?? "";
  return {
    root: "/fake",
    deps,
    files,
    survey: opts.survey ?? {},
    grep: (re) => re.test(text),
    hasDir: (name) => dirs.includes(name),
    hasFile: (re) => files.some((f) => re.test(f)),
  };
}
