import { hasAnyDep } from "./signals.js";

interface FrameworkRule {
  label: string;
  packages: string[];
}

const FRAMEWORKS: FrameworkRule[] = [
  { label: "Vercel AI SDK", packages: ["ai", "@ai-sdk/openai", "@ai-sdk/anthropic"] },
  { label: "LangGraph", packages: ["@langchain/langgraph", "langgraph"] },
  { label: "OpenAI Agents SDK", packages: ["@openai/agents", "@openai/agents-core", "openai-agents"] },
  { label: "LangChain", packages: ["langchain", "@langchain/core"] },
  { label: "Mastra", packages: ["@mastra/core", "mastra"] },
  { label: "CrewAI", packages: ["crewai"] },
  { label: "AutoGen", packages: ["autogen", "pyautogen", "autogen-agentchat"] },
  { label: "LlamaIndex", packages: ["llamaindex", "llama-index", "llama_index"] },
  { label: "Pydantic AI", packages: ["pydantic-ai", "pydantic_ai"] },
];

/** Returns the human labels of every agent framework detected via deps. */
export function detectFrameworks(deps: Set<string>): string[] {
  const hits = FRAMEWORKS.filter((f) => hasAnyDep(deps, f.packages)).map((f) => f.label);
  return hits.length > 0 ? hits : ["Unknown / custom"];
}
