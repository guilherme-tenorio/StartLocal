---
name: wcag-acessibility
description: Audits and implements WCAG 2.1 Level AA for StartLocal—contrast 1.4.3, keyboard 2.1.1, focus 2.4.7, semantics 1.3.1, forms 3.3.x, reflow 1.4.10, ARIA, Lighthouse and axe. Use when editing views/ or public/, or when the user asks for accessibility, WCAG, a11y, or screen reader support.
disable-model-invocation: true
---

# WCAG 2.1 AA — StartLocal

## Quando usar

- Criar ou revisar **`views/**/*.ejs`** ou **`public/css/style.css`**
- Antes de merge em mudanças de UI

**Rule obrigatória:** `.agents/rules/wcag-acessibility.mdc`  
**PRD:** `docs/prd/StartLocal-prd-2026-05-05.md` (§6 Acessibilidade)

---

## Mapa WCAG (AA)

| Área | Critério | Exigência |
|------|----------|-----------|
| Contraste | 1.4.3 | Texto ≥ **4.5:1**; grande ≥ **3:1** |
| Teclado | 2.1.1 | Ações sem mouse |
| Foco | 2.4.7 | `:focus-visible` perceptível |
| Semântica | 1.3.1 | Labels, headings, landmarks |
| Formulários | 3.3.1/3.3.2 | Label + erro textual |
| Reflow | 1.4.10 | Zoom **200%** utilizável |

---

## StartLocal — CSS existente (manter)

```css
.text-muted { color: #5c636a !important; }

:focus-visible {
  outline: 3px solid #0a58ca !important;
  outline-offset: 3px !important;
}
```

`:focus:not(:focus-visible)` sem outline intrusivo para mouse — já em `style.css`.

---

## StartLocal — markup (seguir `navbar.ejs`)

- `<nav aria-label="Navegação Principal">`
- Links com `aria-label` quando necessário
- Toggler: `aria-controls`, `aria-expanded`
- Alerts login: `role="alert"`
- `vaga_detail`: breadcrumb com `aria-label="breadcrumb"`

---

## Teclado e skip link

- Tab order lógico (navbar → main → footer)
- Opcional: link “Ir para conteúdo” → `#main`
- Modais: Escape para fechar

---

## Formulários StartLocal

- `login_*`, `cadastro_*`: label + `required` + erro visível
- `confirm()` em remoção de candidatura — manter
- Campos obrigatórios: texto, não só cor

---

## Nível de vaga

Badge **e** texto (“Básico”, “Intermediário”, “Avançado”) — nunca só cor.

---

## Checklist manual

**Teclado:** [ ] fluxo completo Tab/Enter  
**Contraste:** [ ] axe/Lighthouse sem críticos  
**Conteúdo:** [ ] h1 único; headings sequenciais  
**Formulários:** [ ] labels + erros anunciáveis  
**Reflow:** [ ] zoom 200% em home + login  

---

## Ferramentas

| Ferramenta | Uso |
|------------|-----|
| Lighthouse | Auditoria rápida |
| axe DevTools | Regras DOM |
| [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) | Razão de contraste |

Leitores: NVDA, Narrator, VoiceOver + teclado.

---

## Proibido

- `outline: none` sem substituto
- CSS inline nas EJS
- Informação só por cor
- `href="#"` sem nome em produção

---

## Referências

- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI](https://www.w3.org/WAI/)
