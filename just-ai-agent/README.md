# JUST AI Agent

Skills-first agent runtime for the JUST AI platform.

## Architecture

User Request -> Skill Router -> Skill Loader -> Prompt Composer -> Model Provider -> Validator

## Commands

- /coding
- /automation
- /research
- /prompt
- /business
- /marketing
- /sales
- /design
- /logo

Multiple skills can be composed in one request.

## Run

```bash
python main.py "/coding /automation Build a webhook workflow"
```

Use `--live` after configuring the environment variables in `.env.example`.
