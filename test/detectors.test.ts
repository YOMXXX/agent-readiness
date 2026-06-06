import { describe, it, expect } from "vitest";
import { makeCtx } from "./helpers";
import { evals } from "../src/scan/detectors/evals";
import { guardrails } from "../src/scan/detectors/guardrails";
import { toolSafety } from "../src/scan/detectors/toolSafety";
import { context } from "../src/scan/detectors/context";
import { fallback } from "../src/scan/detectors/fallback";

describe("evals detector", () => {
  it("passes with an eval dep + evals dir", () => {
    expect(evals.detect(makeCtx({ deps: ["promptfoo"], dirs: ["evals"] })).status).toBe("pass");
  });
  it("is weak with only a dep", () => {
    expect(evals.detect(makeCtx({ deps: ["promptfoo"] })).status).toBe("weak");
  });
  it("fails with nothing", () => {
    expect(evals.detect(makeCtx({})).status).toBe("fail");
  });
});

describe("guardrails detector", () => {
  it("passes with schema dep + structured usage", () => {
    expect(
      guardrails.detect(makeCtx({ deps: ["zod"], text: "const x = generateObject({ schema })" }))
        .status,
    ).toBe("pass");
  });
  it("fails on raw string output", () => {
    expect(guardrails.detect(makeCtx({ text: "const x = await llm(prompt)" })).status).toBe("fail");
  });
});

describe("toolSafety detector", () => {
  it("is N/A (pass) when no tools are used", () => {
    expect(toolSafety.detect(makeCtx({ text: "just plain text" })).status).toBe("pass");
  });
  it("is weak with schema but no error handling", () => {
    expect(
      toolSafety.detect(makeCtx({ text: "tool({ inputSchema: z.object({}) })" })).status,
    ).toBe("weak");
  });
  it("passes with schema + guarded execution", () => {
    expect(
      toolSafety.detect(
        makeCtx({ text: "tool({ inputSchema: z.object({}) }); try { run() } catch (e) {}" }),
      ).status,
    ).toBe("pass");
  });
});

describe("context detector (survey fallback)", () => {
  it("passes on a static signal", () => {
    expect(context.detect(makeCtx({ text: "trimMessages(history)" })).status).toBe("pass");
  });
  it("passes when survey answer is yes", () => {
    expect(context.detect(makeCtx({ survey: { context: true } })).status).toBe("pass");
  });
  it("fails with no signal and no survey", () => {
    expect(context.detect(makeCtx({})).status).toBe("fail");
  });
});

describe("fallback detector", () => {
  it("passes with an explicit fallback", () => {
    expect(fallback.detect(makeCtx({ text: "use a fallback model on error" })).status).toBe("pass");
  });
  it("is weak with only try/catch", () => {
    expect(fallback.detect(makeCtx({ text: "try { x() } catch (e) {}" })).status).toBe("weak");
  });
  it("fails with nothing", () => {
    expect(fallback.detect(makeCtx({})).status).toBe("fail");
  });
});
