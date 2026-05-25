---
name: docs-prd
description: Reads and updates StartLocal product requirements in docs/prd/StartLocal-prd-2026-05-05.md—functional IDs, route map section 5, implementation status, glossary, and EVOL backlog. Use when scoping, verifying, or documenting features; the PRD file exists in this repository.
disable-model-invocation: true
---

# Docs & PRD

## Arquivo canônico (existe no repositório)

```
docs/prd/StartLocal-prd-2026-05-05.md
```

**Não** usar caminhos antigos (`blog-cesmac-prd`, `startlocal-prd-2026-05-18`) — o PRD vigente é o arquivo acima.

## Conteúdo do PRD

| Seção | Conteúdo |
|-------|----------|
| §1–3 | Visão, objetivos, arquitetura |
| §4 | Requisitos (PUB, CAND, EMP) + coluna **Estado** |
| §5 | Mapa de rotas |
| §6 | Não funcionais (acessibilidade WCAG) |
| §7 | Fora de escopo |
| §11 | Backlog EVOL-* |

## Quando consultar

- **Antes** de feature nova → §4 e §7
- **Depois** de implementar → atualizar **Estado** e §5
- Dúvida de rota → §5

## Prefixos

| Prefixo | Área |
|---------|------|
| PUB-* | Público |
| CAND-* | Candidato |
| EMP-* | Empresa |
| EVOL-* | Backlog |

## Implementado vs pendente

| Item | Estado |
|------|--------|
| Auth, dashboards, candidaturas, publicar/remover vaga | Implementado (ver §4) |
| Editar vaga (EVOL-01) | Pendente |
| CSRF, reset senha, API mobile | Fora de escopo §7 |

## Atualizar PRD

1. §4 — coluna Estado
2. §5 — rotas novas
3. §11 — remover EVOL concluído

## Relacionados

- `AGENTS.md` — guia do agente
- `.agents/rules/startlocal-stack.mdc` — referência ao PRD
- `README.md` — instalação (complementar)
