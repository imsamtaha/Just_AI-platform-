from __future__ import annotations

from pathlib import Path
import json
import re
from typing import Dict, List

from .models import SkillMetadata, LoadedSkill


class SkillLoader:
    def __init__(self, skills_root: str | Path):
        self.skills_root = Path(skills_root)
        self.registry_path = self.skills_root / "registry.json"
        if not self.registry_path.exists():
            raise FileNotFoundError(f"Missing registry: {self.registry_path}")
        self._registry = self._load_registry()

    def _load_registry(self) -> Dict[str, SkillMetadata]:
        data = json.loads(self.registry_path.read_text(encoding="utf-8"))
        result: Dict[str, SkillMetadata] = {}
        for item in data.get("skills", []):
            result[item["name"]] = SkillMetadata(
                name=item["name"],
                description=item["description"],
                path=item["path"],
                version=item.get("version", "1.0.0"),
                tags=item.get("tags", []),
            )
        return result

    def list_skills(self) -> List[SkillMetadata]:
        return list(self._registry.values())

    def has_skill(self, name: str) -> bool:
        return name in self._registry

    def load(self, name: str) -> LoadedSkill:
        if name not in self._registry:
            raise KeyError(f"Unknown skill: {name}")
        meta = self._registry[name]
        path = self.skills_root / meta.path
        raw = path.read_text(encoding="utf-8")
        instructions = self._strip_frontmatter(raw)
        return LoadedSkill(metadata=meta, instructions=instructions, raw=raw)

    @staticmethod
    def _strip_frontmatter(text: str) -> str:
        if not text.startswith("---"):
            return text.strip()
        match = re.match(r"^---\s*\n.*?\n---\s*\n", text, flags=re.S)
        return text[match.end():].strip() if match else text.strip()
