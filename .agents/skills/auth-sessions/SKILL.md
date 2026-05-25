---
name: auth-sessions
description: Manages StartLocal dual authentication—candidato and empresa registration, bcrypt passwords, express-session payloads, authCandidato/authEmpresa guards, and resource ownership per docs/prd/StartLocal-prd-2026-05-05.md.
disable-model-invocation: true
---

# Auth & Sessions

## PRD

Requisitos **CAND-*** e **EMP-*** em `docs/prd/StartLocal-prd-2026-05-05.md` (§4.2–4.5).

## Fluxos

| Papel | Coleção | Sessão | Dashboard |
|-------|---------|--------|-----------|
| Candidato | `candidatos` | `req.session.candidato` | `/dashboard-candidato` |
| Empresa | `empresas` | `req.session.empresa` | `/dashboard-empresa` |

## Login

1. `findOne({ email })`
2. `bcrypt.compare`
3. Falha: `"E-mail ou senha inválidos."`
4. Sessão + redirect dashboard

**Candidato:** `{ id, nome, email }`  
**Empresa:** `{ id, nomeEmpresa, email }`

## Cadastro

- `senha === confirmarSenha`
- E-mail único (mensagem clara)
- `bcrypt.hash(senha, 10)`

## Logout

`GET /logout` → `session.destroy()` → `/`

## Ownership

- Candidatura → `candidatoId` da sessão
- Vaga → `vaga.empresa === session.empresa.nomeEmpresa`

## Backlog (PRD §11)

EVOL-03 secret em `.env`; EVOL-04 CSRF
