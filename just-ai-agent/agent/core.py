from __future__ import annotations

from pathlib import Path
from typing import Optional

from .loader import SkillLoader
from .models import AgentResult
from .provider import EchoProvider, ModelProvider
from .router import SkillRouter
from .validator import SkillValidator


BASE_SYSTEM_PROMPT = """You are JUST AI, an execution-focused AI agent.

Your job is to solve the user's task using only the skills activated for the current request.

Execution policy:
1. Follow the activated skill instructions as operational policy.
2. If multiple skills are activated, combine them without duplicating work.
3. Prefer concrete execution over generic advice.
4. State uncertainty instead of inventing facts.
5. Preserve user data, credentials, and existing working systems.
6. For implementation tasks, inspect before modifying and verify before claiming success.
7. Return the completed result or the strongest executable next state.
"""


class JustAIAgent:
    def __init__(
        self,
        skills_root: str | Path,
        provider: Optional[ModelProvider] = None,
        max_skills: int = 3,
    ):
        self.loader = SkillLoader(skills_root)
        self.router = SkillRouter(self.loader, max_skills=max_skills)
        self.validator = SkillValidator()
        self.provider = provider or EchoProvider()

    def run(self, user_input: str) -> AgentResult:
        decision = self.router.route(user_input)
        loaded = [self.loader.load(name) for name in decision.skills]

        skill_block = "\n\n".join(
            f"### ACTIVATED SKILL: {skill.metadata.name}\n{skill.instructions}"
            for skill in loaded
        )

        system_prompt = (
            BASE_SYSTEM_PROMPT
            + "\n\n"
            + "ROUTING DECISION:\n"
            + f"{decision.reason}\n"
            + f"Selected skills: {', '.join(decision.skills)}\n\n"
            + skill_block
        )

        output = self.provider.generate(system_prompt, user_input)
        validation = self.validator.validate(output, decision.skills)

        return AgentResult(
            input=user_input,
            selected_skills=decision.skills,
            prompt=system_prompt,
            output=output,
            validation=validation,
        )
