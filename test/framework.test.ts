import { describe, it, expect } from "vitest";
import { detectFrameworks } from "../src/scan/framework";

describe("detectFrameworks", () => {
  it("detects Vercel AI SDK", () => {
    expect(detectFrameworks(new Set(["ai"]))).toContain("Vercel AI SDK");
  });
  it("detects LangGraph", () => {
    expect(detectFrameworks(new Set(["@langchain/langgraph"]))).toContain("LangGraph");
  });
  it("falls back to unknown for non-agent deps", () => {
    expect(detectFrameworks(new Set(["lodash"]))).toEqual(["Unknown / custom"]);
  });
});
