// ============================================================
// STARTLOCAL - Servidor Principal (index.js)
// ============================================================
// Aqui importamos todos os pacotes (módulos) que precisamos.
// "require" é o jeito de importar no Node.js (CommonJS).
// ============================================================
 
const express = require('express');       // Framework web - cria o servidor HTTP
const mongoose = require('mongoose');     // ODM para MongoDB - facilita trabalhar com o banco
const bcrypt = require('bcrypt');         // Criptografia de senhas (hash)
const session = require('express-session'); // Gerencia sessões de login
const path = require('path');             // Utilitário para lidar com caminhos de arquivos
 
const app = express();   // Cria a aplicação Express
const PORT = 3000;       // Porta onde o servidor vai rodar
 
// ============================================================
// CONEXÃO COM MONGODB
// ============================================================
// mongoose.connect() abre a conexão com o banco.
// Substitua a URI pela sua connection string do MongoDB Atlas.
// Formato: mongodb+srv://<usuario>:<senha>@<cluster>.mongodb.net/<nomedobanco>
// ============================================================
 
const MONGO_URI = 'mongodb+srv://gtenorio1209_db_user:krCmVrqjBcRgZruR@cluster0.va4ckgg.mongodb.net/startlocal?retryWrites=true&w=majority&appName=Cluster0';
 
mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log('✅ Conectado ao MongoDB com sucesso!');
        popularVagasFicticias(); // Insere vagas de exemplo se o banco estiver vazio
    })
    .catch((err) => {
        console.error('❌ Erro ao conectar no MongoDB:', err.message);
    });
 
// ============================================================
// SCHEMAS E MODELS (Estrutura dos dados no banco)
// ============================================================
// Um Schema define o "formato" de um documento no MongoDB.
// Um Model é a classe que usamos para criar/buscar/editar documentos.
// ============================================================
 
// --- Schema do Candidato ---
const candidatoSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true }, // unique: não permite e-mails duplicados
    senha: { type: String, required: true }, // Aqui vai ficar o HASH, nunca a senha pura
    curso: { type: String },
    habilidades: { type: String },
    criadoEm: { type: Date, default: Date.now },
});
 
// --- Schema da Empresa ---
const empresaSchema = new mongoose.Schema({
    nomeEmpresa: { type: String, required: true },
    cnpj: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    area: { type: String },
    criadoEm: { type: Date, default: Date.now },
});
 
// --- Schema da Vaga ---
const vagaSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    empresa: { type: String, required: true },
    cidade: { type: String, required: true },
    modalidade: { type: String, enum: ['Presencial', 'Híbrido', 'Remoto'] },
    nivel: {
        type: String,
        required: true,
        // enum: só aceita esses três valores
        enum: ['basico', 'intermediario', 'avancado'],
    },
    area: { type: String },
    descricao: { type: String },
    requisitos: [String], // Array de strings: ["JavaScript", "Node.js", ...]
    bolsa: { type: String },
    cargaHoraria: { type: String },
    criadoEm: { type: Date, default: Date.now },
});
 
// Criamos os Models a partir dos Schemas
const Candidato = mongoose.model('Candidato', candidatoSchema);
const Empresa = mongoose.model('Empresa', empresaSchema);
const Vaga = mongoose.model('Vaga', vagaSchema);
 
// ============================================================
// CONFIGURAÇÕES DO EXPRESS
// ============================================================
 
app.set('view engine', 'ejs');                          // Motor de templates: EJS
app.set('views', path.join(__dirname, 'views'));         // Pasta das views
 
app.use(express.urlencoded({ extended: true }));        // Lê dados de formulários HTML
app.use(express.json());                                 // Lê dados JSON no body das requisições
app.use(express.static(path.join(__dirname, 'public'))); // Arquivos estáticos (CSS, imagens)
 
// ============================================================
// CONFIGURAÇÃO DE SESSÃO
// ============================================================
// A sessão guarda dados do usuário logado no servidor.
// O "secret" é uma chave secreta para assinar o cookie de sessão.
// Em produção, coloque isso em uma variável de ambiente (.env)!
// ============================================================
 
app.use(
    session({
        secret: 'startlocal_chave_secreta_2026', // Troque por algo mais seguro em produção!
        resave: false,           // Não salva a sessão se não houver mudanças
        saveUninitialized: false, // Não cria sessão para usuários não logados
        cookie: {
            maxAge: 1000 * 60 * 60 * 2, // Sessão expira em 2 horas (em milissegundos)
        },
    })
);
 
// ============================================================
// MIDDLEWARE DE AUTENTICAÇÃO
// ============================================================
// Um middleware é uma função que roda ANTES da rota principal.
// Usamos para verificar se o usuário está logado antes de
// mostrar páginas protegidas (dashboard, etc.)
// ============================================================
 
// Verifica se o CANDIDATO está logado
function authCandidato(req, res, next) {
    if (req.session && req.session.candidato) {
        next(); // Está logado: passa para a próxima função (a rota)
    } else {
        res.redirect('/login-candidato?erro=acesso_negado'); // Não está logado: redireciona
    }
}
 
// Verifica se a EMPRESA está logada
function authEmpresa(req, res, next) {
    if (req.session && req.session.empresa) {
        next();
    } else {
        res.redirect('/login-empresa?erro=acesso_negado');
    }
}
 
// ============================================================
// ROTAS PÚBLICAS (qualquer um pode acessar)
// ============================================================
 
// Página inicial
app.get('/', (req, res) => {
    res.render('home');
});
 
// Página "Como Funciona"
app.get('/about', (req, res) => {
    res.render('about');
});
 
// ============================================================
// ROTAS DE VAGAS (público)
// ============================================================
 
// Lista todas as vagas (com filtro opcional por nível via query string)
// Exemplo: /vagas?nivel=basico
app.get('/vagas', async (req, res) => {
    try {
        const { nivel, area } = req.query;
 
        // Monta o filtro dinamicamente
        const filtro = {};
        if (nivel && ['basico', 'intermediario', 'avancado'].includes(nivel)) {
            filtro.nivel = nivel;
        }
        if (area) {
            filtro.area = area;
        }
 
        // .find(filtro) busca documentos que correspondem ao filtro
        // .sort() ordena por data de criação (mais recente primeiro)
        const vagas = await Vaga.find(filtro).sort({ criadoEm: -1 });
 
        res.render('vagas', {
            vagas,
            nivelFiltro: nivel || 'todos',
            totalVagas: vagas.length,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao carregar vagas.');
    }
});
 
// ============================================================
// ROTAS DE CANDIDATO - Login e Cadastro
// ============================================================
 
// Exibe a página de login do candidato
app.get('/login-candidato', (req, res) => {
    const erro = req.query.erro || null;
    res.render('login_candidato', { erro });
});
 
// Processa o login do candidato (POST = envio do formulário)
app.post('/login-candidato', async (req, res) => {
    try {
        const { email, senha } = req.body;
 
        // 1. Busca o candidato pelo e-mail no banco
        const candidato = await Candidato.findOne({ email });
 
        if (!candidato) {
            // E-mail não encontrado
            return res.render('login_candidato', { erro: 'E-mail ou senha inválidos.' });
        }
 
        // 2. Compara a senha digitada com o hash salvo no banco
        // bcrypt.compare() retorna true ou false
        const senhaCorreta = await bcrypt.compare(senha, candidato.senha);
 
        if (!senhaCorreta) {
            return res.render('login_candidato', { erro: 'E-mail ou senha inválidos.' });
        }
 
        // 3. Login bem-sucedido: salva os dados na sessão
        req.session.candidato = {
            id: candidato._id,
            nome: candidato.nome,
            email: candidato.email,
        };
 
        // 4. Redireciona para o dashboard
        res.redirect('/dashboard-candidato');
    } catch (err) {
        console.error(err);
        res.render('login_candidato', { erro: 'Erro interno. Tente novamente.' });
    }
});
 
// Exibe a página de cadastro do candidato
app.get('/cadastro-candidato', (req, res) => {
    res.render('cadastro_candidato', { erro: null, sucesso: null });
});
 
// Processa o cadastro do candidato
app.post('/cadastro-candidato', async (req, res) => {
    try {
        const { nome, email, senha, confirmarSenha, curso, habilidades } = req.body;
 
        // Validação: senhas devem ser iguais
        if (senha !== confirmarSenha) {
            return res.render('cadastro_candidato', {
                erro: 'As senhas não coincidem.',
                sucesso: null,
            });
        }
 
        // Validação: e-mail já cadastrado?
        const emailExistente = await Candidato.findOne({ email });
        if (emailExistente) {
            return res.render('cadastro_candidato', {
                erro: 'Este e-mail já está cadastrado.',
                sucesso: null,
            });
        }
 
        // CRIPTOGRAFIA DA SENHA com bcrypt
        // O número 10 é o "salt rounds" - quantas vezes o algoritmo roda.
        // Quanto maior, mais seguro (e mais lento). 10 é o padrão recomendado.
        const senhaCriptografada = await bcrypt.hash(senha, 10);
 
        // Cria e salva o novo candidato no banco
        const novoCandidato = new Candidato({
            nome,
            email,
            senha: senhaCriptografada, // Salvamos o HASH, NUNCA a senha original!
            curso,
            habilidades,
        });
        await novoCandidato.save();
 
        res.render('cadastro_candidato', {
            erro: null,
            sucesso: 'Cadastro realizado com sucesso! Faça seu login.',
        });
    } catch (err) {
        console.error(err);
        res.render('cadastro_candidato', {
            erro: 'Erro ao criar conta. Tente novamente.',
            sucesso: null,
        });
    }
});
 
// Dashboard do candidato (PROTEGIDA: só acessa se estiver logado)
app.get('/dashboard-candidato', authCandidato, async (req, res) => {
    try {
        // Busca as 6 vagas mais recentes para exibir no dashboard
        const vagasRecentes = await Vaga.find().sort({ criadoEm: -1 }).limit(6);
        res.render('dashboard_candidato', {
            candidato: req.session.candidato,
            vagasRecentes,
        });
    } catch (err) {
        res.status(500).send('Erro ao carregar o dashboard.');
    }
});
 
// ============================================================
// ROTAS DE EMPRESA - Login e Cadastro
// ============================================================
 
app.get('/login-empresa', (req, res) => {
    const erro = req.query.erro || null;
    res.render('login_empresa', { erro });
});
 
app.post('/login-empresa', async (req, res) => {
    try {
        const { email, senha } = req.body;
 
        const empresa = await Empresa.findOne({ email });
        if (!empresa) {
            return res.render('login_empresa', { erro: 'E-mail ou senha inválidos.' });
        }
 
        const senhaCorreta = await bcrypt.compare(senha, empresa.senha);
        if (!senhaCorreta) {
            return res.render('login_empresa', { erro: 'E-mail ou senha inválidos.' });
        }
 
        req.session.empresa = {
            id: empresa._id,
            nomeEmpresa: empresa.nomeEmpresa,
            email: empresa.email,
        };
 
        res.redirect('/dashboard-empresa');
    } catch (err) {
        console.error(err);
        res.render('login_empresa', { erro: 'Erro interno. Tente novamente.' });
    }
});
 
app.get('/cadastro-empresa', (req, res) => {
    res.render('cadastro_empresa', { erro: null, sucesso: null });
});
 
app.post('/cadastro-empresa', async (req, res) => {
    try {
        const { nomeEmpresa, cnpj, email, senha, confirmarSenha, area } = req.body;
 
        if (senha !== confirmarSenha) {
            return res.render('cadastro_empresa', {
                erro: 'As senhas não coincidem.',
                sucesso: null,
            });
        }
 
        const emailExistente = await Empresa.findOne({ email });
        if (emailExistente) {
            return res.render('cadastro_empresa', {
                erro: 'Este e-mail já está cadastrado.',
                sucesso: null,
            });
        }
 
        const senhaCriptografada = await bcrypt.hash(senha, 10);
 
        const novaEmpresa = new Empresa({
            nomeEmpresa,
            cnpj,
            email,
            senha: senhaCriptografada,
            area,
        });
        await novaEmpresa.save();
 
        res.render('cadastro_empresa', {
            erro: null,
            sucesso: 'Empresa cadastrada com sucesso! Faça seu login.',
        });
    } catch (err) {
        console.error(err);
        res.render('cadastro_empresa', {
            erro: 'Erro ao cadastrar empresa. Verifique os dados.',
            sucesso: null,
        });
    }
});
 
// Dashboard da empresa (PROTEGIDA)
app.get('/dashboard-empresa', authEmpresa, async (req, res) => {
    try {
        // Busca as vagas publicadas por ESTA empresa
        const minhasVagas = await Vaga.find({ empresa: req.session.empresa.nomeEmpresa }).sort({
            criadoEm: -1,
        });
        res.render('dashboard_empresa', {
            empresa: req.session.empresa,
            minhasVagas,
        });
    } catch (err) {
        res.status(500).send('Erro ao carregar o dashboard.');
    }
});
 
// Rota para publicar nova vaga (POST do formulário no dashboard empresa)
app.post('/publicar-vaga', authEmpresa, async (req, res) => {
    try {
        const { titulo, cidade, modalidade, nivel, area, descricao, requisitos, bolsa, cargaHoraria } =
            req.body;
 
        const novaVaga = new Vaga({
            titulo,
            empresa: req.session.empresa.nomeEmpresa,
            cidade,
            modalidade,
            nivel,
            area,
            descricao,
            // requisitos vem como string separada por vírgula, convertemos para array
            requisitos: requisitos ? requisitos.split(',').map((r) => r.trim()) : [],
            bolsa,
            cargaHoraria,
        });
        await novaVaga.save();
 
        res.redirect('/dashboard-empresa?sucesso=vaga_publicada');
    } catch (err) {
        console.error(err);
        res.redirect('/dashboard-empresa?erro=falha_publicacao');
    }
});
 
// ============================================================
// ROTA DE LOGOUT
// ============================================================
 
app.get('/logout', (req, res) => {
    // Destrói a sessão e redireciona para a home
    req.session.destroy(() => {
        res.redirect('/');
    });
});
 
// ============================================================
// FUNÇÃO: Popular vagas fictícias para o protótipo
// ============================================================
// Só insere se não houver vagas no banco (evita duplicar)
// ============================================================
 
async function popularVagasFicticias() {
    const count = await Vaga.countDocuments();
    if (count > 0) return; // Já tem vagas, não precisa inserir
 
    console.log('📦 Inserindo vagas fictícias no banco...');
 
    const vagas = [
        // --- NÍVEL BÁSICO ---
        {
            titulo: 'Estágio em Suporte de TI',
            empresa: 'TechSolutions Maceió',
            cidade: 'Maceió - AL',
            modalidade: 'Presencial',
            nivel: 'basico',
            area: 'Suporte',
            descricao: 'Auxiliar a equipe de TI no atendimento a chamados internos, configuração de equipamentos e suporte ao usuário final.',
            requisitos: ['Noções de hardware', 'Windows 10/11', 'Boa comunicação'],
            bolsa: 'R$ 800,00',
            cargaHoraria: '20h/semana',
        },
        {
            titulo: 'Estágio em Desenvolvimento Web (Front-end)',
            empresa: 'Agência Digital Norte',
            cidade: 'Maceió - AL',
            modalidade: 'Híbrido',
            nivel: 'basico',
            area: 'Desenvolvimento',
            descricao: 'Apoiar a equipe de desenvolvimento na criação de páginas web utilizando HTML, CSS e Bootstrap.',
            requisitos: ['HTML', 'CSS', 'Bootstrap', 'Vontade de aprender'],
            bolsa: 'R$ 900,00',
            cargaHoraria: '20h/semana',
        },
        {
            titulo: 'Estágio em Banco de Dados',
            empresa: 'DataCenter Alagoas',
            cidade: 'Arapiraca - AL',
            modalidade: 'Presencial',
            nivel: 'basico',
            area: 'Banco de Dados',
            descricao: 'Auxiliar na manutenção e organização de bancos de dados relacionais. Atividades de modelagem e consultas básicas em SQL.',
            requisitos: ['SQL básico', 'Lógica de programação', 'Cursando Sistemas de Informação ou afins'],
            bolsa: 'R$ 850,00',
            cargaHoraria: '25h/semana',
        },
 
        // --- NÍVEL INTERMEDIÁRIO ---
        {
            titulo: 'Estágio em Desenvolvimento Back-end (Node.js)',
            empresa: 'Inovação Digital LTDA',
            cidade: 'Maceió - AL',
            modalidade: 'Remoto',
            nivel: 'intermediario',
            area: 'Desenvolvimento',
            descricao: 'Desenvolvimento de APIs RESTful com Node.js e Express. Integração com banco de dados MongoDB.',
            requisitos: ['JavaScript', 'Node.js', 'Express', 'MongoDB', 'Git'],
            bolsa: 'R$ 1.200,00',
            cargaHoraria: '30h/semana',
        },
        {
            titulo: 'Estágio em QA (Quality Assurance)',
            empresa: 'SoftTech NE',
            cidade: 'Maceió - AL',
            modalidade: 'Híbrido',
            nivel: 'intermediario',
            area: 'Qualidade',
            descricao: 'Criação e execução de casos de teste, testes manuais e automatizados, documentação de bugs e acompanhamento de melhorias.',
            requisitos: ['Lógica de programação', 'Python básico', 'Selenium (diferencial)', 'Atenção a detalhes'],
            bolsa: 'R$ 1.100,00',
            cargaHoraria: '30h/semana',
        },
        {
            titulo: 'Estágio em Redes e Infraestrutura',
            empresa: 'ConectAL Tecnologia',
            cidade: 'Arapiraca - AL',
            modalidade: 'Presencial',
            nivel: 'intermediario',
            area: 'Infraestrutura',
            descricao: 'Suporte a infraestrutura de redes LAN/WAN, configuração de switches e roteadores, monitoramento de servidores.',
            requisitos: ['CCNA em andamento', 'Linux básico', 'TCP/IP', 'Cabeamento estruturado'],
            bolsa: 'R$ 1.050,00',
            cargaHoraria: '30h/semana',
        },
 
        // --- NÍVEL AVANÇADO ---
        {
            titulo: 'Estágio em Desenvolvimento Full Stack (React + Node)',
            empresa: 'StartupAL',
            cidade: 'Maceió - AL',
            modalidade: 'Remoto',
            nivel: 'avancado',
            area: 'Desenvolvimento',
            descricao: 'Desenvolvimento de funcionalidades completas no front e back-end de uma plataforma SaaS. Ambiente ágil com Scrum.',
            requisitos: ['React.js', 'Node.js', 'TypeScript', 'MongoDB', 'Docker (diferencial)', 'Git avançado'],
            bolsa: 'R$ 1.800,00',
            cargaHoraria: '30h/semana',
        },
        {
            titulo: 'Estágio em Segurança da Informação',
            empresa: 'CyberShield Brasil',
            cidade: 'Maceió - AL',
            modalidade: 'Híbrido',
            nivel: 'avancado',
            area: 'Segurança',
            descricao: 'Análise de vulnerabilidades, monitoramento de eventos de segurança (SIEM), suporte a auditorias e testes de penetração.',
            requisitos: ['Linux avançado', 'Python', 'Redes TCP/IP', 'OWASP', 'CTF (diferencial)'],
            bolsa: 'R$ 2.000,00',
            cargaHoraria: '30h/semana',
        },
        {
            titulo: 'Estágio em Data Science / IA',
            empresa: 'AnalyticsBR',
            cidade: 'Remoto',
            modalidade: 'Remoto',
            nivel: 'avancado',
            area: 'Data Science',
            descricao: 'Exploração e análise de dados, construção de modelos de machine learning, visualização de dados e geração de insights.',
            requisitos: ['Python avançado', 'Pandas', 'Scikit-learn', 'SQL', 'Estatística', 'Jupyter Notebook'],
            bolsa: 'R$ 2.200,00',
            cargaHoraria: '30h/semana',
        },
    ];
 
    await Vaga.insertMany(vagas);
    console.log(`✅ ${vagas.length} vagas fictícias inseridas com sucesso!`);
}
 
// ============================================================
// INICIALIZA O SERVIDOR
// ============================================================
 
app.listen(PORT, () => {
    console.log(`🚀 StartLocal rodando em http://localhost:${PORT}`);
});