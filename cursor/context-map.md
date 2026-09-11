# Context Map — loyalty-app-vite

Quick map for humans and AI agents in this frontend repo.

## Project

- Name: Loyalty Frontend (LoyalEasy)
- Repo: `loyalty-app-vite`
- Stack: React 18, Vite, TypeScript, Tailwind, Jest, Cypress, MSW
- Sibling API: `loyalty-program-serverless`
- Cursor hub: `loyalty-cursor`

## Structure

```text
loyalty-app-vite/
├─ .cursor/          # Active rules + optional GitHub hook
├─ cursor/           # Playbook, prompts, frontend context, stack stories
├─ src/              # SPA
├─ cypress/          # E2E
├─ docs/             # Shipped frontend docs
└─ README.md
```

## Read first

| Area | File |
| --- | --- |
| Playbook | `cursor/docs/AI-Project-Playbook.md` |
| Frontend context | `cursor/projects/frontend/project-context.md` |
| Frontend rules | `cursor/projects/frontend/cursor-rules-frontend.md` |
| Product / backlog | `loyalty-cursor/company/` (sibling) |
| Full-stack stories | `loyalty-cursor/analysis/features/` |
| This repo stories | `cursor/analysis/features/` |
| Shipped UI docs | `docs/` |

## Cursor rules

`.cursor/rules/` — keep short. Longer domain rules live under `cursor/projects/frontend/`.
