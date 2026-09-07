from __future__ import annotations

import json
import os
import urllib.request
from typing import Protocol


class ModelProvider(Protocol):
    def generate(self, system_prompt: str, user_prompt: str) -> str:
        ...


class EchoProvider:
    def generate(self, system_prompt: str, user_prompt: str) -> str:
        return (
            "ECHO_PROVIDER\n\n"
            "SYSTEM:\n"
            f"{system_prompt}\n\n"
            "USER:\n"
            f"{user_prompt}"
        )


class OpenAICompatibleProvider:
    def __init__(self, api_key: str | None = None, model: str | None = None, base_url: str | None = None):
        self.api_key = api_key or os.getenv("JUST_AI_API_KEY")
        self.model = model or os.getenv("JUST_AI_MODEL", "gpt-5.6")
        self.base_url = (base_url or os.getenv("JUST_AI_BASE_URL", "https://api.openai.com/v1")).rstrip("/")
        if not self.api_key:
            raise ValueError("Missing JUST_AI_API_KEY")

    def generate(self, system_prompt: str, user_prompt: str) -> str:
        payload = json.dumps({
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ]
        }).encode("utf-8")

        req = urllib.request.Request(
            f"{self.base_url}/chat/completions",
            data=payload,
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=90) as response:
            data = json.loads(response.read().decode("utf-8"))
        return data["choices"][0]["message"]["content"]
