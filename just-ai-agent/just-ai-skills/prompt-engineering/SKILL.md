---
name: prompt-engineering
description: Use for creating, analyzing, optimizing, and structuring prompts, system instructions, agent policies, tool-use instructions, and reusable prompt templates.
license: Apache-2.0
metadata:
  author: JUST AI
  version: "1.0.0"
---

# JUST AI Prompt Engineering

## Workflow
1. Define task, audience, inputs, outputs, and constraints.
2. Separate policy from task-specific instructions.
3. Specify required behavior, forbidden behavior, tools, and output format.
4. Remove ambiguity and redundancy.
5. Test normal, ambiguous, adversarial, and edge cases.

## Rules
- Prefer precise instructions over vague adjectives.
- Never instruct a model to fabricate information.
- Make machine-readable output schemas explicit when needed.
