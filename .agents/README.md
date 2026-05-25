# StartLocal — `.agents`

Configuração de contexto para assistentes de IA no repositório **StartLocal**.

**Cursor:** as rules em `.agents/rules/` são espelhadas em **`.cursor/rules/`** para aplicação automática por escopo de arquivo.

## PRD

**`docs/prd/StartLocal-prd-2026-05-05.md`** — documento de requisitos vigente (rotas, estados, backlog).

## Rules (`.agents/rules/`)

| Arquivo | description (resumo) | globs | alwaysApply |
|---------|----------------------|-------|-------------|
| `startlocal-stack.mdc` | Stack, pastas, coleções, PRD | — | `true` |
| `express-server.mdc` | Rotas e `index.js` | `index.js` | `false` |
| `ejs-views.mdc` | Templates EJS + WCAG markup | `views/**/*.ejs` | `false` |
| `wcag-acessibility.mdc` | WCAG 2.1 AA em views/CSS | `views/**/*.ejs`, `public/**/*.css` | `false` |

## Skills (`.agents/skills/`)

Anexe com `@nome-da-pasta` (ex.: `@wcag-acessibility`).

| Skill | description (resumo) |
|-------|----------------------|
| `startlocal-stack` | Visão geral e PRD |
| `express-server` | Backend `index.js` |
| `ejs-views` | Templates EJS |
| `wcag-acessibility` | Auditoria WCAG 2.1 AA |
| `auth-sessions` | Login e sessão |
| `mongodb-data` | MongoDB nativo |
| `domain-vagas` | Vagas e candidaturas |
| `docs-prd` | Leitura/atualização do PRD |

Guia raiz: **`AGENTS.md`**
