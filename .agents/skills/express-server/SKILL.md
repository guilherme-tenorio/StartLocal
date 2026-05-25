---
name: express-server
description: Implements StartLocal Express routes, middleware, session locals, MongoDB native queries, bcrypt auth, and PRD-scoped features in index.js. Use when adding routes, fixing server errors, or aligning backend with docs/prd/StartLocal-prd-2026-05-05.md.
disable-model-invocation: true
---

# Express Server

## Arquivo

**`index.js`** — único ponto de rotas e lógica de servidor.

## PRD

Consultar **`docs/prd/StartLocal-prd-2026-05-05.md`** (existe no repo):

- §4 — requisitos por persona (PUB, CAND, EMP)
- §5 — mapa de rotas
- §11 — backlog (**EVOL-01** edição de vaga = pendente, não “sem PRD”)

Atualizar PRD após mudança de escopo.

## Bootstrap

1. `MongoClient` → `db`
2. Índices (email, cnpj)
3. `popularVagasFicticias()` se `vagas` vazia
4. `listen(3000)`

## Middleware

```javascript
res.locals.candidato = req.session?.candidato ?? null;
res.locals.empresa = req.session?.empresa ?? null;
res.locals.currentPath = req.path;
```

## Auth

| Guard | Redirect |
|-------|----------|
| `authCandidato` | `/login-candidato?erro=acesso_negado` |
| `authEmpresa` | `/login-empresa?erro=acesso_negado` |

## Rotas

Ver PRD §5 ou rule `express-server.mdc`.

## Handler

```javascript
app.get('/rota', authX, async (req, res) => {
  try {
    if (id && !ObjectId.isValid(id)) return res.status(404).send('...');
    res.render('view', { /* todas vars da EJS */ });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro em português.');
  }
});
```

## Checklist

- [ ] PRD consultado
- [ ] Auth + ownership
- [ ] Variáveis EJS
- [ ] PRD atualizado se necessário

## Rule

`.agents/rules/express-server.mdc`
