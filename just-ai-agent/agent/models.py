from dataclasses import dataclass, field
from typing import List, Dict, Any


@dataclass
class SkillMetadata:
    name: str
    description: str
    path: str
    version: str = "1.0.0"
    tags: List[str] = field(default_factory=list)


@dataclass
class LoadedSkill:
    metadata: SkillMetadata
    instructions: str
    raw: str


@dataclass
class RouteDecision:
    skills: List[str]
    scores: Dict[str, float]
    reason: str


@dataclass
class AgentResult:
    input: str
    selected_skills: List[str]
    prompt: str
    output: str
    validation: Dict[str, Any]
