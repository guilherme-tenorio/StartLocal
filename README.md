# 🚀 StartLocal

StartLocal é uma plataforma digital (Web App) construída para conectar **Estudantes/Candidatos** a **Organizações e Empresas** por meio de postagens de vagas de estágio nos mais variados níveis de senioridade.

O aplicativo conta com painéis individualizados, persistência segura de dados e um ecossistema real de contratação para auxiliar os profissionais em ascensão acadêmica e as empresas em expansão.

---

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído utilizando o modelo Clássico **MVC-like** e renderização pelo lado do servidor (SSR) para SEO aprimorado:

- **Back-end:** JavaScript (ES6+), Node.js, Express.js
- **Banco de Dados:** MongoDB (Driver Nativo com MongoDB Atlas)
- **Front-end:** EJS (Templating Engine), HTML5, CSS3, Bootstrap 5.3
- **Segurança (Autenticação):** `bcrypt` para hashização de senhas, `express-session` para rastreio persistente de navegação.
- **Variáveis de Ambiente:** `dotenv`

---

## ✨ Funcionalidades Principais

### Para Candidatos 🧑‍🎓
- **Perfis Personalizados:** O candidato exibe seus dados centrais (Nome, E-mail, Curso e Habilidades Específicas) para o sistema.
- **Ecossistema de Busca de Vagas:** Filtros ágeis nas buscas para estágios níveis Básico, Intermediário e Avançado.
- **Candidatura Instantânea e Gestão:** É possível enviar um currículo à vaga e recuar (remover a inscrição) com facilidade dentro do respectivo *Dashboard*.

### Para Empresas 💼
- **Gestão de Vagas:** Adicionar postagens formais, estabelecer bolsa auxílio, definir critérios obrigatórios e carga horária para a publicação.
- **Direito à Correção:** Habilidade transacional de deletar permanentemente postagens falhas ou encerradas direto da base de recortes.
- **Painel de Avaliação de Currículos:** Uma aba especial (`/dashboard-empresa/vaga/:id/candidatos`) que filtra os perfis dos aplicantes específicos por vaga. A empresa detém os botões facilitadores para contactar (enviar e-mails) aos estudantes mais alinhados às suas políticas!

---

## 💻 Instalação & Uso

Para rodar este protótipo na sua própria máquina local (localhost), siga as diretrizes abaixo:

### Pré-requisitos
- Ter o [Node.js](https://nodejs.org/en/) instalado (Recomendável a versão LTS).
- Um *Cluster* em andamento no [MongoDB Atlas](https://www.mongodb.com/atlas) (Ou instância local paralela instalada).

### Procedimentos
1. **Clone do Repositório**
   ```bash
   git clone https://github.com/seu-usuario/StartLocal.git
   cd StartLocal
   ```

2. **Instalação das Bibliotecas Módulos Node**
   ```bash
   npm install
   ```

3. **Injeção de Credenciais (.env)**
   - Crie um arquivo com exato nome `.env` na raiz da pasta `StartLocal`.
   - Popule as seguintes estruturas ambientais:
   ```env
   MONGODB_URI="Sua string segura de conexão do MongoDB"
   MONGODB_DB="startlocal"
   ```
   > ⚠️ **NUNCA DEIXE** o arquivo `.env` ser rastreado e postado no repositório. Por isso garantimos que `.env` esteja inserido em `.gitignore`.

4. **Rodando a Aplicação**
   ```bash
   node index.js
   ```
   Seu servidor abrirá na aba: `http://localhost:3000`

---

## 📐 Padrões de Qualidade (Clean Code)
O aplicativo possui as estilizações CSS totalmente externalizadas dentro do `public/css/style.css`, removendo propriedades Inlines do projeto, obedecendo às diretrizes *Clean Code* de hierarquia entre Front e Back. Além de suportar Navegação de Tabulação, Contrastes focados em diretrizes **WCAG2** e `hover` limpo e responsivo.

---

> Desenvolvido com carinho para os profissionais do futuro. 🤝
