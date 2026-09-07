from pathlib import Path

from agent.loader import SkillLoader


ROOT = Path(__file__).parents[1] / "just-ai-skills"


def test_load_all_skills():
    loader = SkillLoader(ROOT)
    skills = loader.list_skills()
    assert len(skills) == 9
    for item in skills:
        loaded = loader.load(item.name)
        assert loaded.instructions
        assert loaded.metadata.name == item.name
