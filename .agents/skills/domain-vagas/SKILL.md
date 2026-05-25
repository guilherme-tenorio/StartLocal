---
name: domain-vagas
description: Implements StartLocal vacancy domain—nivel filters on /vagas, vaga detail, candidaturas POST, empresa publish/remove vaga, and candidatos list per PRD sections PUB and EMP in docs/prd/StartLocal-prd-2026-05-05.md.
disable-model-invocation: true
---

# Domínio — Vagas e Candidaturas

## PRD

- **PUB-*** listagem/detalhe (§4.1)
- **CAND-APP-*** candidaturas (§4.3)
- **EMP-VAGA-*** publicar/remover (§4.5)
- **EVOL-01** editar vaga: **pendente** no PRD — não implementar sem atualizar PRD

Arquivo: `docs/prd/StartLocal-prd-2026-05-05.md`

## Níveis

| DB | Query | Badge |
|----|-------|-------|
| `basico` | `?nivel=basico` | success |
| `intermediario` | `?nivel=intermediario` | warning |
| `avancado` | `?nivel=avancado` | danger |

## Fluxos

**Visitante:** `/vagas`, `/vaga/:id`  
**Candidato:** `POST /candidatar/:id`, `POST /remover-candidatura/:id`  
**Empresa:** `POST /publicar-vaga`, `POST /remover-vaga/:id`, candidatos por vaga

## UI

`vagas.ejs`, `vaga_detail.ejs`, `dashboard_empresa.ejs` (modal), `candidatos_vaga.ejs`

## Acessibilidade

Badges com texto + cor — rule `wcag-acessibility`
