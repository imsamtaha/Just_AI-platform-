from __future__ import annotations

import json
import urllib.error
import urllib.request
from dataclasses import dataclass
from typing import Any, Dict, Protocol


class PersistenceBackend(Protocol):
    def create_session(self, user_id: str, title: str | None = None) -> str:
        ...

    def save_execution(
        self,
        *,
        user_id: str,
        session_id: str,
        user_input: str,
        output: str,
        selected_skills: list[str],
        validation: Dict[str, Any],
        model: str | None = None,
    ) -> str:
        ...


class PersistenceError(RuntimeError):
    pass


@dataclass
class SupabaseRlsPersistence:
    """PostgREST persistence that preserves Supabase RLS.

    Use a publishable/anon key plus the signed-in user's access token.
    Never use a service-role key in client-facing code.
    """

    supabase_url: str
    publishable_key: str
    access_token: str
    timeout_seconds: int = 20

    def _request(self, table: str, payload: dict[str, Any]) -> list[dict[str, Any]]:
        url = f"{self.supabase_url.rstrip('/')}/rest/v1/{table}"
        body = json.dumps(payload).encode("utf-8")
        request = urllib.request.Request(
            url,
            data=body,
            headers={
                "apikey": self.publishable_key,
                "Authorization": f"Bearer {self.access_token}",
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Prefer": "return=representation",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=self.timeout_seconds) as response:
                raw = response.read().decode("utf-8")
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            raise PersistenceError(f"Supabase write failed ({exc.code}): {detail}") from exc
        except urllib.error.URLError as exc:
            raise PersistenceError(f"Supabase connection failed: {exc.reason}") from exc

        data = json.loads(raw or "[]")
        if not isinstance(data, list) or not data:
            raise PersistenceError(f"Supabase returned no row for {table}")
        return data

    def create_session(self, user_id: str, title: str | None = None) -> str:
        row = self._request(
            "agent_sessions",
            {
                "user_id": user_id,
                "title": title,
                "status": "active",
            },
        )[0]
        return str(row["id"])

    def save_execution(
        self,
        *,
        user_id: str,
        session_id: str,
        user_input: str,
        output: str,
        selected_skills: list[str],
        validation: Dict[str, Any],
        model: str | None = None,
    ) -> str:
        execution = self._request(
            "agent_executions",
            {
                "session_id": session_id,
                "user_id": user_id,
                "input": user_input,
                "output": output,
                "selected_skills": selected_skills,
                "status": "completed" if validation.get("ok") else "failed",
                "validation": validation,
                "model": model,
            },
        )[0]
        execution_id = str(execution["id"])

        for skill_name in selected_skills:
            self._request(
                "agent_skill_usage",
                {
                    "execution_id": execution_id,
                    "user_id": user_id,
                    "skill_name": skill_name,
                    "skill_version": "1.0.0",
                },
            )

        return execution_id
