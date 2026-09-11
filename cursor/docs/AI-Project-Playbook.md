# AI Project Playbook — loyalty-app-vite

Guía para usar Cursor en el frontend LoyalEasy. Misma metodología que Simulith / foundation: intake → analysis → implement → validate → review → close.

## Regla central

- Este repo define UI, rutas, servicios, tipos, mocks y E2E.
- Contratos (Swagger, REGLAS-NEGOCIO) viven en `loyalty-program-serverless`.
- Producto y stories full-stack viven en `loyalty-cursor`.
- Si el contrato cambia, alinea Swagger ↔ `src/services/` ↔ `src/types/` ↔ MSW ↔ Cypress antes de cerrar.

## Layout

```text
loyalty-app-vite/
├─ src/
├─ cypress/
├─ docs/
├─ cursor/
│  ├─ docs/AI-Project-Playbook.md
│  ├─ projects/frontend/
│  ├─ prompts/
│  ├─ scripts/
│  └─ analysis/features/<area>/<slug>/
└─ .cursor/rules/
```

## Context routing

| Area | Lee primero | Agrega solo si aplica |
| --- | --- | --- |
| Frontend | `cursor/projects/frontend/project-context.md`, `cursor-rules-frontend.md`, paths `src/` | Swagger del endpoint; MSW/Cypress |
| Product / backlog | `loyalty-cursor/company/` | código solo si hay que implementar |
| Full-stack | Paquete en `loyalty-cursor/analysis/features/` + ambos repos | — |
| Studies | `loyalty-cursor/analysis/studies/` | — |

## Flujo

```text
INTAKE → STORY → ANALYSIS → IMPLEMENT → VALIDATE → REVIEW → CLOSE
```

Gates: `node cursor/scripts/run-feature-gates.mjs --slug <slug> --phase <phase>`

Validación: [`story-validation.md`](story-validation.md). Frontend tests: `npm test`, `npm run lint`, Cypress si el flujo UI cambió.

## Quick start

```text
@cursor/prompts/feature/prompt-story-intake.md
Mode: A

<describe the UI change>
```

Registro en el hub (ticket + STORY-LOG):

```bash
node ../loyalty-cursor/scripts/new-feature.mjs --name "<Feature name>" --area frontend --stack frontend
```

O en este repo (paquete local):

```bash
node cursor/scripts/new-feature.mjs --name "<Feature name>" --area frontend --stack frontend
```

Usa el hub cuando la story es de producto o cruza API+UI. Usa este `cursor/` cuando el trabajo es solo SPA.

### Lifecycle

```text
@cursor/prompts/feature/prompt-feature-lifecycle.md

Feature slug: <slug>
Feature name: <name>
Ticket/story: LOY-###
Stack scope: frontend
Start at: analysis
Run tests: yes
Auto-close: yes
```

## Definición de terminado

- Coincide con `user-story.md`.
- Checklist con evidencia y `Review: **pass**`.
- Gate `close-readiness` en verde.
- INDEX de **este** repo actualizado; si nació en el hub, también INDEX/registry del hub.
- Contrato UI alineado (services/types/MSW/Cypress) si cambió.

## Referencia

- Prompts: `cursor/prompts/README.md`
- Hub: `loyalty-cursor/docs/AI-Loyalty-Playbook.md`
- Monorepo: `project-foundation-template/docs/examples/04-loyalty-monorepo.md`
