from pathlib import Path

from agent.loader import SkillLoader
from agent.router import SkillRouter


ROOT = Path(__file__).parents[1] / "just-ai-skills"


def test_explicit_commands():
    router = SkillRouter(SkillLoader(ROOT))
    result = router.route("/coding /automation Build an API workflow")
    assert result.skills[:2] == ["coding", "automation"]


def test_research_routes():
    router = SkillRouter(SkillLoader(ROOT))
    result = router.route("Research and compare the latest AI agent frameworks")
    assert "ai-research" in result.skills


def test_logo_routes():
    router = SkillRouter(SkillLoader(ROOT))
    result = router.route("Create a scalable logo and visual identity")
    assert "logo-design" in result.skills
