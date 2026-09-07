---
name: coding
description: Use for software engineering tasks including architecture, implementation, debugging, refactoring, testing, code review, and production hardening.
license: Apache-2.0
metadata:
  author: JUST AI
  version: "1.0.0"
---

# JUST AI Coding

## Use When
- Building, modifying, debugging, reviewing, or refactoring software.
- Designing application architecture or implementation plans.

## Workflow
1. Inspect existing structure and conventions.
2. Identify the smallest safe change.
3. Implement production-quality code.
4. Validate inputs, errors, security, and types.
5. Run the narrowest useful tests or checks.
6. Review the diff for regressions and secrets.
7. Report what changed and what was verified.

## Rules
- Inspect before changing.
- Preserve working functionality unless a breaking change is required.
- Never expose secrets.
- Do not claim tests passed unless they were run.
