from pathlib import Path

from agent.core import JustAIAgent
from agent.provider import EchoProvider


ROOT = Path(__file__).parents[1] / "just-ai-skills"


class FakePersistence:
    def __init__(self):
        self.sessions = []
        self.executions = []

    def create_session(self, user_id: str, title: str | None = None) -> str:
        self.sessions.append({"user_id": user_id, "title": title})
        return "session-1"

    def save_execution(
        self,
        *,
        user_id: str,
        session_id: str,
        user_input: str,
        output: str,
        selected_skills: list[str],
        validation: dict,
        model: str | None = None,
    ) -> str:
        self.executions.append(
            {
                "user_id": user_id,
                "session_id": session_id,
                "user_input": user_input,
                "output": output,
                "selected_skills": selected_skills,
                "validation": validation,
                "model": model,
            }
        )
        return "execution-1"


def test_agent_persists_execution_when_user_context_exists():
    persistence = FakePersistence()
    agent = JustAIAgent(ROOT, provider=EchoProvider(), persistence=persistence)

    result = agent.run(
        "/coding Build a small API",
        user_id="user-1",
        session_title="API task",
    )

    assert result.validation["persistence"]["ok"] is True
    assert result.validation["persistence"]["session_id"] == "session-1"
    assert result.validation["persistence"]["execution_id"] == "execution-1"
    assert len(persistence.sessions) == 1
    assert len(persistence.executions) == 1


def test_agent_does_not_attempt_persistence_without_user_id():
    persistence = FakePersistence()
    agent = JustAIAgent(ROOT, provider=EchoProvider(), persistence=persistence)

    result = agent.run("/research Compare agent frameworks")

    assert result.validation["persistence"]["ok"] is False
    assert result.validation["persistence"]["error"] == "user_id_required"
    assert persistence.sessions == []
    assert persistence.executions == []
