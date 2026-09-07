---
name: automation
description: Use for designing and implementing AI and business automation workflows, integrations, retries, approvals, and human-in-the-loop processes.
license: Apache-2.0
metadata:
  author: JUST AI
  version: "1.0.0"
---

# JUST AI Automation

## Use When
- Designing automations, workflows, integrations, or agentic processes.

## Workflow
1. Define the business outcome.
2. Map trigger, inputs, conditions, actions, and success state.
3. Add authentication, idempotency, retries, timeouts, logging, and escalation.
4. Define approval points for consequential actions.
5. Test happy paths, duplicate events, failures, and recovery.

## Rules
- Make trigger and completion state explicit.
- Never create uncontrolled loops or duplicate side effects.
- Never hard-code credentials.
- Prefer idempotent operations.
