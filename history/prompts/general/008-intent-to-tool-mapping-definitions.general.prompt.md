---
id: 008
title: Intent-to-Tool Mapping Definitions
stage: general
date: 2026-02-11
surface: agent
model: claude-opus-4-6
feature: none
branch: main
user: Marhaba
command: natural prompt
labels: ["intent-parser", "nlp-mapping", "mcp-tools", "ai-chatbot"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .claude/skills/intent-mappings.json
tests:
  - none
---

## Prompt

skills : You are an expert in mapping natural language to AI tool invocations.

For each of the following natural language intents, provide:
- Detected intent
- Corresponding MCP skill
- Parameters needed
- Example generated tool call

Example user phrases:
1. "Add a task to buy groceries"
2. "Show me all my tasks"
3. "Mark task 3 as complete"
4. "Remove the meeting task"
5. "Update task 5 with title 'Call mom'"

Return results as structured JSON with:
{
  intent,
  tool,
  parameters,
  sample_tool_call
}

## Response snapshot

Generated comprehensive intent-to-MCP tool mapping file at `.claude/skills/intent-mappings.json` containing:

1. **5 Core Intent Mappings** — Each of the 5 required user phrases mapped with: detected intent, corresponding MCP tool, extracted parameters, resolution logic, sample_tool_call, and expected agent reply.

2. **7 Extended Examples** — Additional real-world phrases covering edge cases: urgency inference ("it's urgent" -> priority=high), informal language ("what's on my plate"), past-tense completion ("I finished"), multi-field updates ("change priority and add a note"), status transitions ("start working on"), and compound filters ("high priority pending ones").

3. **Parsing Rules** — Complete keyword-to-intent trigger lists, title extraction logic, priority inference rules, and field extraction patterns for each of the 5 tools.

4. **Reference Resolution Protocol** — Positional refs ("task 3" -> tasks[2]) and title-based refs ("the meeting task" -> fuzzy match) with a 3-step ambiguity protocol (0 matches, 1 match, 2+ matches).

5. **Edge Cases** — Empty task list handling, out-of-scope message detection, and multi-intent splitting (e.g., "add milk and mark groceries done" -> 2 sequential calls).

## Outcome

- ✅ Impact: Created the complete NLP-to-tool-call contract that the intent-parser agent needs to route user messages to the correct MCP tool with properly extracted parameters.
- 🧪 Tests: No automated tests — specification file. Can be validated by dry-running sample phrases through the parsing rules.
- 📁 Files: 1 file created (.claude/skills/intent-mappings.json)
- 🔁 Next prompts: Implement the intent-parser agent logic that consumes these mappings; add fuzzy matching library; build the conversation manager subagent.
- 🧠 Reflection: Positional references ("task 3") and title-based references ("the groceries task") require fundamentally different resolution strategies. Both must call list_tasks first, but positional uses index mapping while title-based uses fuzzy matching. The ambiguity protocol prevents silent mismatches.

## Evaluation notes (flywheel)

- Failure modes observed: None — mappings generated cleanly from existing MCP tool specs.
- Graders run and results (PASS/FAIL): Manual review PASS — all 5 core mappings align with mcp-tools.json endpoints, parameters, and return types.
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Test intent detection accuracy with 20 diverse user phrases to measure keyword-trigger coverage.
