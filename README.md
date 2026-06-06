# agent-readiness

> Score your AI agent's production-readiness in 60 seconds.
> **88% of agents that demo well fail in production.** Find out if yours will.

```bash
npx agent-readiness
```

Zero config. Zero runtime dependencies. Run it in any agent repo.

## Why

Agents look great in demos and fall apart in prod — hallucinations, runaway
token bills, silent tool-call failures, no way to tell if last week's prompt
tweak made things worse. Industry reports put the production failure rate at
**70–95%**, with cleanup and lost-trust costs running into six figures per
project.

`agent-readiness` statically scans your project and scores it across the 10
dimensions that separate a demo from a system you can trust.

## Example

```
🔴 Agent Production Readiness: 33 / 100  (Not ready — will likely fail in prod)
Framework: Vercel AI SDK

✅ Output guardrails              ██████████ PASS Model output is parsed/validated against a schema.
🟡 Tool-call safety              █████░░░░░ WEAK Tools are used but either schemas or error handling are missing.
🟡 Retries & timeouts            █████░░░░░ WEAK Either retries or timeouts are present, but not both.
🔴 Eval / regression tests       ░░░░░░░░░░ FAIL No eval / regression tests detected.
🔴 Observability / tracing       ░░░░░░░░░░ FAIL No tracing / observability detected — failures will be invisible.
...
⚠️  2 critical risk(s) will bite you in production.
👉 Want a human deep-dive on your agent? Book a free 30-min audit → ...
```

## What it checks

| Dimension | Why it matters |
| --- | --- |
| Eval / regression tests | Know if a change made the agent worse |
| Output guardrails | Stop hallucinated/malformed output reaching users |
| Observability / tracing | See *where* a run failed |
| Tool-call safety | Typed schemas + guarded execution |
| Retries & timeouts | Survive flaky models and downstream services |
| Cost / token guardrails | Don't get a surprise five-figure bill |
| Context management | Avoid context bloat and quality collapse |
| Failure fallbacks | One bad step shouldn't kill the chain |
| Human-in-the-loop | Approval before high-risk actions |
| Prompt versioning | Reproducible, rollback-able behavior |

## Usage

```bash
npx agent-readiness                 # scan current directory
npx agent-readiness ./my-agent      # scan a specific path
npx agent-readiness --json          # machine-readable output
npx agent-readiness --badge         # print a README badge (markdown)
npx agent-readiness --min 70        # exit 1 if score < 70 (CI gate)
npx agent-readiness --no-survey     # skip the interactive questions
```

## Use in CI

Fail a pull request when readiness drops below a threshold:

```yaml
# .github/workflows/agent-readiness.yml
name: Agent Readiness
on: [pull_request]
jobs:
  readiness:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npx agent-readiness --min 70
```

## Add a badge

Show your score in your own README:

```bash
npx agent-readiness --badge
# -> ![Agent Readiness](https://img.shields.io/badge/agent--readiness-66%2F100-yellow)
```

## How scoring works

Each dimension is weighted by how often it causes production incidents and
scored `pass` / `weak` / `fail`. Weights sum to 100.

- **80–100** 🟢 ship it
- **60–79** 🟡 patch first
- **<60** 🔴 not ready

## Supported frameworks

Vercel AI SDK · LangGraph · OpenAI Agents SDK · LangChain · Mastra ·
CrewAI · AutoGen · LlamaIndex · Pydantic AI · (custom projects work too)

---

Built by **YOMXXX** — I help teams ship agents that survive production.
Got a low score? [Email me for a free 30-min audit →](mailto:316195542@qq.com)

MIT License
