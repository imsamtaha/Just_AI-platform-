from __future__ import annotations

import argparse
from pathlib import Path

from agent.core import JustAIAgent
from agent.provider import EchoProvider, OpenAICompatibleProvider


def main() -> None:
    parser = argparse.ArgumentParser(description="JUST AI Skills Agent")
    parser.add_argument("prompt", nargs="*", help="Task for JUST AI")
    parser.add_argument("--live", action="store_true", help="Use configured OpenAI-compatible provider")
    args = parser.parse_args()

    root = Path(__file__).parent / "just-ai-skills"
    provider = OpenAICompatibleProvider() if args.live else EchoProvider()
    agent = JustAIAgent(root, provider=provider)

    prompt = " ".join(args.prompt).strip() or input("JUST AI > ").strip()
    result = agent.run(prompt)

    print("\nSelected skills:", ", ".join(result.selected_skills))
    print("\nValidation:", result.validation)
    print("\nOutput:\n")
    print(result.output)


if __name__ == "__main__":
    main()
