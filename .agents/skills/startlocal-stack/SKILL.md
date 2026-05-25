---
name: startlocal-stack
description: Describes StartLocal product vision, Express/EJS/MongoDB stack, repository layout, MongoDB collections, dual session roles (candidato/empresa), and points to the canonical PRD at docs/prd/StartLocal-prd-2026-05-05.md. Use when onboarding, planning features, or needing full project context.
disable-model-invocation: true
---

# StartLocal Stack

## Produto

Web app SSR: **candidatos** ↔ **empresas** por vagas de estágio em TI (`basico`, `intermediario`, `avancado`).

## Pilha

| Camada | Tecnologia |
|--------|------------|
| Servidor | Node.js + Express 5 → `index.js` |
| Views | EJS 5 + partials |
| UI | Bootstrap 5.3.8 CDN, Bootstrap Icons |
| CSS | `public/css/style.css` |
| DB | MongoDB driver nativo |
| Auth | `bcrypt`, `express-session`, `dotenv` |

## Estrutura

```
index.js
views/partials/{navbar,footer}.ejs
views/*.ejs
public/css/style.css
docs/prd/StartLocal-prd-2026-05-05.md
.agents/
AGENTS.md
```

## PRD (disponível no repositório)

**`docs/prd/StartLocal-prd-2026-05-05.md`** — requisitos funcionais, mapa de rotas (§5), glossário, backlog (§11). Não confundir com PRD legado de blog/CESMAC.

## Coleções

`candidatos`, `empresas`, `vagas`, `candidaturas` — campo `vaga.empresa` é **string** (`nomeEmpresa`).

## Sessão

`req.session.candidato` **ou** `req.session.empresa`.

## Rodar

```bash
npm install
# .env: MONGODB_URI (MongoDB Atlas), MONGODB_DB=startlocal
node index.js
```

## Rule

`.agents/rules/startlocal-stack.mdc` (`alwaysApply: true`)
