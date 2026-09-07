from __future__ import annotations

import re
from typing import Dict, List

from .loader import SkillLoader
from .models import RouteDecision


DEFAULT_KEYWORDS = {
    "coding": ["code", "coding", "bug", "debug", "python", "javascript", "typescript", "next.js", "nextjs", "react", "api", "backend", "frontend", "database", "refactor", "test", "github", "repository", "repo", "implement", "build"],
    "automation": ["automation", "automate", "workflow", "n8n", "make.com", "zapier", "webhook", "integration", "integrate", "trigger", "crm", "agent workflow"],
    "prompt-engineering": ["prompt", "system prompt", "developer prompt", "prompt engineering", "instructions", "agent prompt", "optimize prompt"],
    "ai-research": ["research", "compare", "study", "investigate", "latest", "sources", "paper", "framework", "benchmark", "market research"],
    "business-strategy": ["strategy", "business model", "go to market", "gtm", "positioning", "pricing", "roadmap", "opportunity", "prioritize", "business plan"],
    "marketing": ["marketing", "campaign", "content", "launch", "brand messaging", "funnel", "linkedin", "social media", "growth", "acquisition"],
    "sales": ["sales", "prospect", "lead", "outreach", "follow-up", "follow up", "proposal", "objection", "pipeline", "qualification", "client"],
    "ui-ux-design": ["ui", "ux", "dashboard", "interface", "wireframe", "design system", "responsive", "accessibility", "user flow", "layout"],
    "logo-design": ["logo", "wordmark", "monogram", "visual identity", "brand mark", "logo design", "emblem"],
}


class SkillRouter:
    def __init__(self, loader: SkillLoader, max_skills: int = 3):
        self.loader = loader
        self.max_skills = max_skills

    def route(self, user_input: str) -> RouteDecision:
        text = user_input.lower().strip()
        explicit = self._explicit_commands(text)
        if explicit:
            return RouteDecision(skills=explicit[: self.max_skills], scores={name: 1.0 for name in explicit[: self.max_skills]}, reason="Explicit skill command(s) detected.")

        scores: Dict[str, float] = {}
        for skill in self.loader.list_skills():
            score = 0.0
            for term in DEFAULT_KEYWORDS.get(skill.name, []):
                if term in text:
                    score += 1.0 if " " not in term else 1.5
            for token in re.findall(r"[a-z0-9-]+", skill.description.lower()):
                if len(token) >= 5 and token in text:
                    score += 0.15
            if score > 0:
                scores[skill.name] = round(score, 3)

        if not scores:
            fallback = "coding" if any(x in text for x in ["build", "create", "implement", "fix"]) else "prompt-engineering"
            return RouteDecision(skills=[fallback], scores={fallback: 0.1}, reason="No strong match; used conservative fallback.")

        ordered = sorted(scores, key=scores.get, reverse=True)[: self.max_skills]
        return RouteDecision(skills=ordered, scores={name: scores[name] for name in ordered}, reason="Skills selected by weighted semantic keyword matching.")

    def _explicit_commands(self, text: str) -> List[str]:
        aliases = {
            "coding": "coding", "code": "coding", "automation": "automation", "prompt": "prompt-engineering", "research": "ai-research", "strategy": "business-strategy", "business": "business-strategy", "marketing": "marketing", "sales": "sales", "design": "ui-ux-design", "ui": "ui-ux-design", "ux": "ui-ux-design", "logo": "logo-design",
        }
        found: List[str] = []
        for cmd in re.findall(r"/([a-z0-9_-]+)", text):
            mapped = aliases.get(cmd)
            if mapped and self.loader.has_skill(mapped) and mapped not in found:
                found.append(mapped)
        return found
