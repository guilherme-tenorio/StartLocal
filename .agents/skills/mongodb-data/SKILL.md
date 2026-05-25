---
name: mongodb-data
description: Queries StartLocal MongoDB collections (candidatos, empresas, vagas, candidaturas) with the native driver, ObjectId validation, unique indexes, and popularVagasFicticias seed in index.js.
disable-model-invocation: true
---

# MongoDB Data

## PRD

Modelo §3.3 em `docs/prd/StartLocal-prd-2026-05-05.md`.

## Conexão

```javascript
MONGODB_URI  // connection string MongoDB Atlas (.env)
MONGODB_DB   // default: startlocal
```

## Coleções

| Coleção | Campos chave |
|---------|--------------|
| `candidatos` | nome, email, senha, curso, habilidades |
| `empresas` | nomeEmpresa, cnpj, email, senha, area |
| `vagas` | titulo, empresa (string), nivel, requisitos[] |
| `candidaturas` | vagaId, candidatoId, dataInscricao |

## ObjectId

```javascript
if (!ObjectId.isValid(id)) return res.status(404).send('...');
new ObjectId(req.session.candidato.id)
```

## Índices

email unique (candidatos, empresas); cnpj unique (empresas).

## Seed

`popularVagasFicticias()` — 9 vagas se coleção vazia.

## Não usar

Mongoose em `index.js`.
