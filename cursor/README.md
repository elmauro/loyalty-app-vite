# AI Workspace — Loyalty Frontend (`loyalty-app-vite`)

Contexto, prompts y artefactos para Cursor **en este repo**. El kit genérico se sincroniza desde `loyalty-cursor` (`node loyalty-cursor/scripts/sync-cursor-layer.mjs --target frontend`).

## Uso

- `.cursor/rules/` — reglas activas (globs sobre `src/`).
- `cursor/docs/AI-Project-Playbook.md` — flujo intake → close.
- `cursor/projects/frontend/` — contexto y reglas de dominio LoyalEasy.
- Stories de **solo frontend** → `cursor/analysis/features/`.
- Stories **full-stack** → `loyalty-cursor/analysis/features/` (abrir el hub o workspace multi-root).

## Prompts

Adjunta `@cursor/prompts/feature/prompt-story-intake.md` (o el bloque del STORY-LOG del hub).
