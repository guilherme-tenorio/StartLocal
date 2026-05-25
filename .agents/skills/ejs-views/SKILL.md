---
name: ejs-views
description: Builds StartLocal EJS pages with standard layout, navbar/footer partials, Bootstrap 5.3, nivel badges, forms, session-aware UI, and WCAG 2.1 AA markup under views/. Use when creating or editing SSR templates.
disable-model-invocation: true
---

# EJS Views

## Layout padrão

```html
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>StartLocal - [Página]</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
  <link href="/css/style.css" rel="stylesheet">
</head>
<body class="d-flex flex-column min-vh-100">
  <%- include('partials/navbar') %>
  <main class="flex-grow-1" id="main">...</main>
  <%- include('partials/footer') %>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

## Views

| Arquivo | Rota |
|---------|------|
| `home.ejs` | `/` |
| `about.ejs` | `/about` |
| `vagas.ejs` | `/vagas` |
| `vaga_detail.ejs` | `/vaga/:id` |
| `login_candidato.ejs` | login candidato |
| `cadastro_candidato.ejs` | cadastro |
| `dashboard_candidato.ejs` | dashboard |
| `login_empresa.ejs` | login empresa |
| `cadastro_empresa.ejs` | cadastro |
| `dashboard_empresa.ejs` | dashboard |
| `candidatos_vaga.ejs` | candidatos |

## Acessibilidade (WCAG 2.1 AA)

Ao alterar views, seguir **`.agents/rules/wcag-acessibility.mdc`** e skill **`wcag-acessibility`**:

- `lang="pt-br"`, landmarks, labels, `role="alert"`
- Nível de vaga: badge + texto
- Sem CSS inline

## Badges

| nivel | Classe |
|-------|--------|
| `basico` | `bg-success` |
| `intermediario` | `bg-warning text-dark` |
| `avancado` | `bg-danger` |

## Formulários

`POST`, `action` explícito, `name` = `req.body`, labels, alerts de erro.

## PRD

Critérios de UI: `docs/prd/StartLocal-prd-2026-05-05.md` (§4, §6).

## Rule

`.agents/rules/ejs-views.mdc`
