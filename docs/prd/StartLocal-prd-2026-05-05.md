# Documento de Requisitos de Produto (PRD) — StartLocal

**Versão:** 1.0  
**Data:** 05 de maio de 2026  
**Arquivo:** `docs/prd/StartLocal-prd-2026-05-05.md`  
**Repositório:** `StartLocal-main`  
**Contexto:** Web app educacional (Express, EJS, MongoDB) para conectar candidatos a vagas de estágio em TI, com painéis separados para estudantes e empresas.

---

## 1. Visão do produto

**StartLocal** é uma plataforma digital que conecta **candidatos/estudantes** a **empresas** por meio de vagas de estágio em tecnologia, organizadas por nível (**Básico**, **Intermediário**, **Avançado**).

Visitantes podem navegar e consultar vagas sem login. Candidatos autenticados candidatam-se e gerenciam inscrições no próprio painel. Empresas autenticadas publicam vagas, removem publicações próprias e consultam candidatos inscritos por vaga.

O foco pedagógico permanece em arquitetura cliente-servidor, sessões, autorização por papel e CRUD com persistência em MongoDB, com interface em português e renderização no servidor (SSR).

---

## 2. Objetivos

- Oferecer cadastro e login separados para **candidato** e **empresa**, com senha em hash e e-mail único por coleção.
- Exibir dados do usuário logado nos respectivos dashboards (painel do candidato / painel da empresa).
- Permitir busca pública de vagas com filtros por nível e área.
- Restringir publicação de vagas, remoção e visualização de candidatos inscritos à empresa dona da vaga.
- Restringir candidatura e remoção de inscrição ao candidato autenticado.
- Manter navegação, mensagens de erro/sucesso e estilos centralizados em português.

---

## 3. Arquitetura e estrutura do projeto

### 3.1 Stack tecnológica


| Camada       | Tecnologia                                                   |
| ------------ | ------------------------------------------------------------ |
| Servidor     | Node.js, Express 5 (`index.js` na raiz)                      |
| Views        | EJS (SSR), partials reutilizáveis                            |
| Estilos      | Bootstrap 5.3 (CDN), Bootstrap Icons, `public/css/style.css` |
| Banco        | MongoDB (driver nativo `MongoClient`)                        |
| Autenticação | `bcrypt` (hash de senha), `express-session`                  |
| Configuração | `dotenv` (`MONGODB_URI`, `MONGODB_DB`, padrão `startlocal`)  |


### 3.2 Estrutura de pastas e arquivos

```
StartLocal-main/
├── index.js              # Rotas, middleware, conexão MongoDB, seed de vagas
├── package.json
├── README.md
├── public/
│   └── css/
│       └── style.css     # Estilos globais (sem CSS inline nas views)
└── views/
    ├── partials/
    │   ├── navbar.ejs    # Menu com estado de sessão (candidato/empresa/visitante)
    │   └── footer.ejs
    ├── home.ejs
    ├── about.ejs
    ├── vagas.ejs
    ├── vaga_detail.ejs
    ├── login_candidato.ejs
    ├── cadastro_candidato.ejs
    ├── dashboard_candidato.ejs
    ├── login_empresa.ejs
    ├── cadastro_empresa.ejs
    ├── dashboard_empresa.ejs
    └── candidatos_vaga.ejs
```

### 3.3 Modelo de dados (coleções MongoDB)


| Coleção        | Uso principal                                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `candidatos`   | Conta do estudante (nome, e-mail, senha hash, curso, habilidades, `criadoEm`)                                                  |
| `empresas`     | Conta da organização (nomeEmpresa, CNPJ, e-mail, senha hash, área, `criadoEm`)                                                 |
| `vagas`        | Ofertas de estágio (título, empresa, cidade, modalidade, nível, área, descrição, requisitos, bolsa, carga horária, `criadoEm`) |
| `candidaturas` | Inscrição candidato ↔ vaga (`vagaId`, `candidatoId`, `dataInscricao`)                                                          |


**Índices na inicialização:** e-mail único em `candidatos` e `empresas`; CNPJ único em `empresas`.

**Seed:** na primeira execução, se `vagas` estiver vazia, `popularVagasFicticias()` insere vagas de exemplo (níveis básico, intermediário e avançado).

### 3.4 Sessão e autorização

- Sessão `express-session` (2 horas de `maxAge`); variáveis em `res.locals`: `candidato`, `empresa`, `currentPath`.
- Middleware `authCandidato` → redireciona para `/login-candidato?erro=acesso_negado`.
- Middleware `authEmpresa` → redireciona para `/login-empresa?erro=acesso_negado`.
- Logout único: `GET /logout` destrói a sessão e redireciona para `/`.
- Apenas um tipo de usuário por sessão (candidato **ou** empresa).

---

## 4. Escopo funcional

### 4.1 Páginas públicas (sem login)


| ID     | Requisito                                                                                 | Rota / view                         | Prioridade | Estado       |
| ------ | ----------------------------------------------------------------------------------------- | ----------------------------------- | ---------- | ------------ |
| PUB-01 | Página inicial com CTA para candidato, empresa e listagem de vagas                        | `GET /` → `home.ejs`                | Alta       | Implementado |
| PUB-02 | Página institucional “Sobre”                                                              | `GET /about` → `about.ejs`          | Média      | Implementado |
| PUB-03 | Listagem de vagas com filtro por `nivel` (`basico`, `intermediario`, `avancado`) e `area` | `GET /vagas` → `vagas.ejs`          | Alta       | Implementado |
| PUB-04 | Detalhe da vaga; indicar se candidato logado já se candidatou                             | `GET /vaga/:id` → `vaga_detail.ejs` | Alta       | Implementado |


**Critérios de aceitação:** Visitante acessa home, sobre, lista e detalhe de vagas sem autenticação.

---

### 4.2 Candidato — autenticação e cadastro


| ID           | Requisito                                                                                      | Rota                           | Prioridade | Estado       |
| ------------ | ---------------------------------------------------------------------------------------------- | ------------------------------ | ---------- | ------------ |
| CAND-AUTH-01 | Formulário de login (e-mail, senha, POST)                                                      | `GET/POST /login-candidato`    | Alta       | Implementado |
| CAND-AUTH-02 | Mensagem genérica em falha: “E-mail ou senha inválidos.”                                       | POST login                     | Alta       | Implementado |
| CAND-AUTH-03 | Sessão `req.session.candidato` com `id`, `nome`, `email`; redirect para `/dashboard-candidato` | POST login                     | Alta       | Implementado |
| CAND-REG-01  | Cadastro: nome, e-mail, senha, confirmação, curso, habilidades                                 | `GET/POST /cadastro-candidato` | Alta       | Implementado |
| CAND-REG-02  | Validar senhas coincidentes; e-mail único com mensagem clara                                   | POST cadastro                  | Alta       | Implementado |
| CAND-REG-03  | Senha apenas como hash (`bcrypt`, cost 10)                                                     | POST cadastro                  | Alta       | Implementado |
| CAND-REG-04  | Sucesso com mensagem convidando ao login                                                       | POST cadastro                  | Média      | Implementado |


---

### 4.3 Candidato — painel e candidaturas


| ID           | Requisito                                                      | Rota                                         | Prioridade | Estado       |
| ------------ | -------------------------------------------------------------- | -------------------------------------------- | ---------- | ------------ |
| CAND-DASH-01 | Dashboard apenas para candidato autenticado                    | `GET /dashboard-candidato` + `authCandidato` | Alta       | Implementado |
| CAND-DASH-02 | Exibir nome, e-mail, curso e habilidades no painel             | `dashboard_candidato.ejs`                    | Alta       | Implementado |
| CAND-DASH-03 | Listar vagas em que o candidato está inscrito e vagas recentes | Dashboard                                    | Alta       | Implementado |
| CAND-APP-01  | Candidatar-se a uma vaga (sem duplicar inscrição)              | `POST /candidatar/:id`                       | Alta       | Implementado |
| CAND-APP-02  | Remover candidatura própria                                    | `POST /remover-candidatura/:id`              | Alta       | Implementado |
| CAND-NAV-01  | Navbar com “Meu Painel” e “Sair” quando logado                 | `partials/navbar.ejs`                        | Média      | Implementado |


**Critérios de aceitação:** Candidato logado vê seu painel, inscreve-se em vagas válidas uma vez e pode remover a inscrição; visitante é redirecionado ao tentar acessar rotas protegidas.

---

### 4.4 Empresa — autenticação e cadastro


| ID          | Requisito                                                                                         | Rota                         | Prioridade | Estado       |
| ----------- | ------------------------------------------------------------------------------------------------- | ---------------------------- | ---------- | ------------ |
| EMP-AUTH-01 | Formulário de login (e-mail, senha, POST)                                                         | `GET/POST /login-empresa`    | Alta       | Implementado |
| EMP-AUTH-02 | Mensagem genérica em falha: “E-mail ou senha inválidos.”                                          | POST login                   | Alta       | Implementado |
| EMP-AUTH-03 | Sessão `req.session.empresa` com `id`, `nomeEmpresa`, `email`; redirect para `/dashboard-empresa` | POST login                   | Alta       | Implementado |
| EMP-REG-01  | Cadastro: nome da empresa, CNPJ, e-mail, senha, confirmação, área                                 | `GET/POST /cadastro-empresa` | Alta       | Implementado |
| EMP-REG-02  | Validar senhas coincidentes; e-mail único                                                         | POST cadastro                | Alta       | Implementado |
| EMP-REG-03  | Senha em hash; índice único de CNPJ                                                               | POST cadastro / índices      | Alta       | Implementado |


---

### 4.5 Empresa — gestão de vagas e candidatos


| ID          | Requisito                                                                                            | Rota                                                                 | Prioridade | Estado               |
| ----------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ---------- | -------------------- |
| EMP-DASH-01 | Dashboard apenas para empresa autenticada                                                            | `GET /dashboard-empresa` + `authEmpresa`                             | Alta       | Implementado         |
| EMP-DASH-02 | Listar vagas da empresa logada (`empresa` = `nomeEmpresa` da sessão)                                 | Dashboard                                                            | Alta       | Implementado         |
| EMP-VAGA-01 | Publicar vaga (título, cidade, modalidade, nível, área, descrição, requisitos, bolsa, carga horária) | `POST /publicar-vaga`                                                | Alta       | Implementado         |
| EMP-VAGA-02 | Remover vaga própria (filtro por `_id` e `empresa`)                                                  | `POST /remover-vaga/:id`                                             | Alta       | Implementado         |
| EMP-VAGA-03 | Editar vaga existente                                                                                | —                                                                    | Média      | **Não implementado** |
| EMP-CAND-01 | Ver candidatos inscritos em vaga da empresa                                                          | `GET /dashboard-empresa/vaga/:id/candidatos` → `candidatos_vaga.ejs` | Alta       | Implementado         |
| EMP-CAND-02 | Autorização: só vaga cuja `empresa` coincide com a sessão                                            | Rota candidatos                                                      | Alta       | Implementado         |


**Critérios de aceitação:** Empresa logada publica e remove apenas suas vagas; consulta candidatos somente em vagas que publicou; visitante não acessa rotas de gestão.

---

### 4.6 Logout e navegação global


| ID      | Requisito                                                 | Rota              | Prioridade | Estado       |
| ------- | --------------------------------------------------------- | ----------------- | ---------- | ------------ |
| AUTH-05 | Encerrar sessão e voltar à home                           | `GET /logout`     | Média      | Implementado |
| NAV-01  | Menu com links Início, Sobre, dropdown de Vagas por nível | `navbar.ejs`      | Alta       | Implementado |
| NAV-02  | Estado visual da rota ativa (`currentPath`)               | Middleware global | Média      | Implementado |


---

## 5. Mapa de rotas (referência)


| Método   | Rota                                     | Autenticação | Descrição           |
| -------- | ---------------------------------------- | ------------ | ------------------- |
| GET      | `/`                                      | —            | Home                |
| GET      | `/about`                                 | —            | Sobre               |
| GET      | `/vagas`                                 | —            | Lista com filtros   |
| GET      | `/vaga/:id`                              | —            | Detalhe da vaga     |
| GET/POST | `/login-candidato`                       | —            | Login candidato     |
| GET/POST | `/cadastro-candidato`                    | —            | Cadastro candidato  |
| GET      | `/dashboard-candidato`                   | Candidato    | Painel do candidato |
| POST     | `/candidatar/:id`                        | Candidato    | Inscrição na vaga   |
| POST     | `/remover-candidatura/:id`               | Candidato    | Cancelar inscrição  |
| GET/POST | `/login-empresa`                         | —            | Login empresa       |
| GET/POST | `/cadastro-empresa`                      | —            | Cadastro empresa    |
| GET      | `/dashboard-empresa`                     | Empresa      | Painel da empresa   |
| GET      | `/dashboard-empresa/vaga/:id/candidatos` | Empresa      | Candidatos da vaga  |
| POST     | `/publicar-vaga`                         | Empresa      | Nova vaga           |
| POST     | `/remover-vaga/:id`                      | Empresa      | Excluir vaga        |
| GET      | `/logout`                                | —            | Sair                |


**Servidor:** `http://localhost:3000` (porta fixa em `index.js`).

---

## 6. Requisitos não funcionais


| Área                  | Descrição                                                                                                                                                                                                    |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Segurança             | Senhas com `bcrypt`; sessão com `saveUninitialized: false`; em produção usar `secret` via variável de ambiente, `httpOnly` e `secure` no cookie; HTTPS recomendado. CSRF não implementado (evolução futura). |
| Usabilidade           | Interface em português (pt-BR); Bootstrap responsivo; ícones Bootstrap Icons; feedback de erro/sucesso nos formulários e dashboards.                                                                         |
| Acessibilidade        | WCAG 2.1 nível AA: contraste, teclado, foco visível, labels e ARIA em `views/`; estilos em `public/css/style.css`. Regras do agente: `.agents/rules/wcag-acessibility.mdc` e skill `wcag-acessibility`.      |
| Dados                 | MongoDB Atlas via `MONGODB_URI` no `.env`; banco padrão `startlocal`.                                                                                                                                        |
| Organização de código | Rotas concentradas em `index.js`; apresentação em `views/`; assets estáticos em `public/` (CSS externalizado, sem estilos inline).                                                                           |
| Desempenho            | Adequado ao uso acadêmico; listagens sem paginação (evolução se o volume crescer).                                                                                                                           |


---

## 7. Fora do escopo (versão atual)

- Blog, posts ou comentários (escopo do PRD original CESMAC).
- Edição de vaga após publicação.
- Recuperação de senha por e-mail.
- Perfis públicos de candidato (`/u/:slug`).
- Papéis de administrador do sistema.
- API REST separada para mobile.
- Upload de currículo em arquivo (candidatura é registro na coleção `candidaturas`, não anexo).
- Contato por e-mail automatizado a partir do painel da empresa (mencionado no README como facilitador; não há rota de envio de e-mail no `index.js`).

---

## 8. Métricas de sucesso

- **Candidato:** cadastro → login → visualizar dashboard → candidatar-se → remover candidatura, sem erros críticos.
- **Empresa:** cadastro → login → publicar vaga → listar candidatos da vaga → remover vaga, sem erros críticos.
- **Visitante:** navegar home, sobre, listagem e detalhe de vagas sem login.
- **Código:** separação clara entre `index.js` (regras e dados), `views/` (UI) e `public/css/style.css` (estilo).

---

## 9. Dependências e riscos


| Item                 | Detalhe                                                                                                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| MongoDB              | Obrigatório na subida; falha de conexão encerra o processo (`process.exit(1)`).                                                                                          |
| `.env`               | `MONGODB_URI` e `MONGODB_DB`; não versionar (`.gitignore`).                                                                                                              |
| Sessão               | `secret` fixo no código — trocar por variável de ambiente em produção.                                                                                                   |
| Vínculo empresa–vaga | Vagas usam campo texto `empresa` = `nomeEmpresa`; renomear empresa na sessão não atualiza vagas antigas.                                                                 |
| Sessão candidato     | Login grava só `id`, `nome`, `email`; curso/habilidades vêm do cadastro no banco — exibição completa no dashboard pode exigir leitura adicional do documento (evolução). |


---

## 10. Glossário


| Termo        | Significado no StartLocal                                                                                                   |
| ------------ | --------------------------------------------------------------------------------------------------------------------------- |
| Candidato    | Estudante/usuário que busca e se candidata a vagas de estágio.                                                              |
| Empresa      | Organização que publica e gerencia vagas.                                                                                   |
| Vaga         | Oferta de estágio com nível, área, requisitos, bolsa e carga horária.                                                       |
| Candidatura  | Registro de inscrição de um candidato em uma vaga (`candidaturas`).                                                         |
| Nível        | Classificação da vaga: `basico`, `intermediario` ou `avancado`.                                                             |
| Dashboard    | Painel autenticado (`dashboard-candidato` ou `dashboard-empresa`).                                                          |
| Autenticação | Login com e-mail e senha; sessão via `express-session`.                                                                     |
| Autorização  | Middleware que limita rotas ao tipo de usuário logado e à propriedade do recurso (vaga da empresa, inscrição do candidato). |


---

## 11. Evoluções sugeridas (backlog)


| ID      | Melhoria                                                                                         | Prioridade      |
| ------- | ------------------------------------------------------------------------------------------------ | --------------- |
| EVOL-01 | Editar vaga publicada (`PUT` ou formulário no dashboard empresa)                                 | Média           |
| EVOL-02 | Carregar curso/habilidades do candidato do MongoDB no dashboard (não só dados mínimos da sessão) | Média           |
| EVOL-03 | `session.secret` e flags de cookie via `.env`                                                    | Alta (produção) |
| EVOL-04 | Proteção CSRF em formulários POST                                                                | Média           |
| EVOL-05 | Paginação em `/vagas`                                                                            | Baixa           |
| EVOL-06 | Validação de senha mínima e formato de e-mail no servidor                                        | Média           |


---

*Documento alinhado ao repositório **StartLocal-main** — plataforma de vagas de estágio em TI com Express, EJS e MongoDB.*