from __future__ import annotations

from typing import Dict, List


class SkillValidator:
    def validate(self, output: str, selected_skills: List[str]) -> Dict[str, object]:
        issues = []
        if not output or not output.strip():
            issues.append("empty_output")
        if len(output.strip()) < 20:
            issues.append("very_short_output")
        lower = output.lower()
        suspicious = ["api_key=", "sk-", "password=", "secret="]
        if any(term in lower for term in suspicious):
            issues.append("possible_secret_exposure")
        return {"ok": not issues, "issues": issues, "selected_skills": selected_skills}
