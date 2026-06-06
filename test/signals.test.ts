import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildContext } from "../src/scan/signals";

let dir: string;

beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), "ar-test-"));
  writeFileSync(
    join(dir, "package.json"),
    JSON.stringify({ dependencies: { ai: "^4", zod: "^3" } }),
  );
  mkdirSync(join(dir, "src"));
  writeFileSync(join(dir, "src", "agent.ts"), "import { generateObject } from 'ai';\nconst x = 1;");
});

afterAll(() => rmSync(dir, { recursive: true, force: true }));

describe("buildContext", () => {
  it("parses deps from package.json", () => {
    const ctx = buildContext(dir);
    expect(ctx.deps.has("ai")).toBe(true);
    expect(ctx.deps.has("zod")).toBe(true);
  });

  it("collects source files", () => {
    const ctx = buildContext(dir);
    expect(ctx.hasFile(/agent\.ts$/)).toBe(true);
  });

  it("greps file contents", () => {
    const ctx = buildContext(dir);
    expect(ctx.grep(/generateObject/)).toBe(true);
    expect(ctx.grep(/nonexistenttoken/)).toBe(false);
  });

  it("skips node_modules", () => {
    mkdirSync(join(dir, "node_modules", "junk"), { recursive: true });
    writeFileSync(join(dir, "node_modules", "junk", "x.ts"), "SHOULD_NOT_APPEAR");
    const ctx = buildContext(dir);
    expect(ctx.grep(/SHOULD_NOT_APPEAR/)).toBe(false);
  });
});
