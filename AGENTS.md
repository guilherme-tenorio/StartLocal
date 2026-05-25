# StartLocal — Guia para agentes de IA

Este repositório é o **StartLocal**: plataforma web SSR que conecta candidatos (estudantes) a empresas por vagas de estágio em TI, com níveis Básico, Intermediário e Avançado.

## Stack

| Camada | Tecnologia |
|--------|------------|
| Servidor | Node.js, Express 5 — `index.js` |
| Views | EJS + `views/partials/` |
| Estilos | Bootstrap 5.3 (CDN), `public/css/style.css` |
| Banco | MongoDB (driver nativo) |
| Auth | `bcrypt`, `express-session`, `dotenv` |

## Estrutura principal

```
index.js              # Rotas, middleware, MongoDB, seed
views/                # Templates EJS (SSR)
public/css/style.css  # CSS global (sem inline nas views)
docs/prd/             # Requisitos de produto
.agents/              # Rules e skills para assistentes
```

## Configuração do agente (`.agents/`)

### Rules — `.agents/rules/`

Regras curtas aplicadas por escopo de arquivo:

| Rule | Quando |
|------|--------|
| `startlocal-stack.mdc` | Sempre |
| `express-server.mdc` | Ao editar `index.js` |
| `ejs-views.mdc` | Ao editar `views/**/*.ejs` |
| `wcag-acessibility.mdc` | Ao editar views ou `public/**/*.css` |

### Skills — `.agents/skills/`

Workflows detalhados; anexar no chat com `@nome-da-pasta`:

| Skill | Uso |
|-------|-----|
| `startlocal-stack` | Visão geral, coleções, setup |
| `express-server` | Rotas, handlers, auth em `index.js` |
| `ejs-views` | Layout EJS, partials, formulários |
| `wcag-acessibility` | Auditoria WCAG 2.1 AA (Lighthouse, teclado, ARIA) |
| `auth-sessions` | Login/cadastro candidato e empresa |
| `mongodb-data` | Queries, ObjectId, índices |
| `domain-vagas` | Vagas, filtros, candidaturas |
| `docs-prd` | PRD e backlog |

Índice: `.agents/README.md`  
PRD: `docs/prd/StartLocal-prd-2026-05-05.md`

## Convenções obrigatórias

- **Idioma:** UI e mensagens de erro em português (pt-BR).
- **Arquitetura:** lógica em `index.js`; apresentação em `views/`; CSS em `public/`.
- **Sessão:** `req.session.candidato` **ou** `req.session.empresa` — um papel por sessão.
- **MongoDB:** driver nativo; não introduzir Mongoose em rotas novas.
- **Segurança:** senhas com `bcrypt`; nunca commitar `.env`.
- **Acessibilidade:** seguir skill `wcag-acessibility` e rule homônima em mudanças em `views/` ou `public/`.

## Executar localmente

```bash
npm install
# .env: MONGODB_URI (connection string do MongoDB Atlas), MONGODB_DB=startlocal
node index.js
# http://localhost:3000
```

## Papéis e rotas (resumo)

- **Público:** `/`, `/about`, `/vagas`, `/vaga/:id`
- **Candidato:** login/cadastro, `/dashboard-candidato`, candidatar/remover inscrição
- **Empresa:** login/cadastro, `/dashboard-empresa`, publicar/remover vaga, listar candidatos por vaga
- **Global:** `GET /logout`

## PRD (requisitos)

**Arquivo vigente:** `docs/prd/StartLocal-prd-2026-05-05.md`

Contém mapa de rotas (§5), requisitos por persona (§4), acessibilidade (§6) e backlog **EVOL-*** (§11). Consultar antes de novas features; atualizar coluna **Estado** após implementar.

## Fora de escopo (§7 do PRD — não implementar sem atualizar PRD)

- Edição de vaga (**EVOL-01** pendente)
- Blog/posts, API REST mobile, admin global
- Recuperação de senha por e-mail

## Antes de concluir uma tarefa

1. Conferir rotas, views e variáveis `res.render`.
2. Testar fluxo (visitante, candidato ou empresa).
3. **WCAG 2.1 AA** se alterou `views/` ou `public/` (rule + skill `wcag-acessibility`).
4. Atualizar `docs/prd/StartLocal-prd-2026-05-05.md` se o escopo mudou.
