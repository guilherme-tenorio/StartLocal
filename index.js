// ============================================================
// STARTLOCAL - Servidor Principal (index.js)
// ============================================================

require('dotenv').config();
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = 3000;

// ============================================================
// CONEXÃO COM MONGODB
// ============================================================
const MONGODB_URI = (process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017').trim();
const DB_NAME = (process.env.MONGODB_DB || 'startlocal').trim();

let db;


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
    session({
        secret: 'startlocal_chave_secreta_2026',
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 2,
        },
    })
);

app.use((req, res, next) => {
    res.locals.candidato = req.session ? req.session.candidato : null;
    res.locals.empresa = req.session ? req.session.empresa : null;
    res.locals.currentPath = req.path;
    next();
});


function authCandidato(req, res, next) {
    if (req.session && req.session.candidato) {
        next();
    } else {
        res.redirect('/login-candidato?erro=acesso_negado');
    }
}

function authEmpresa(req, res, next) {
    if (req.session && req.session.empresa) {
        next();
    } else {
        res.redirect('/login-empresa?erro=acesso_negado');
    }
}


app.get('/', (req, res) => {
    res.render('home');
});

app.get('/about', (req, res) => {
    res.render('about');
});


app.get('/vagas', async (req, res) => {
    try {
        const { nivel, area } = req.query;

        const filtro = {};
        if (nivel && ['basico', 'intermediario', 'avancado'].includes(nivel)) {
            filtro.nivel = nivel;
        }
        if (area) {
            filtro.area = area;
        }

        const vagas = await db.collection('vagas').find(filtro).sort({ criadoEm: -1 }).toArray();

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


app.get('/vaga/:id', async (req, res) => {
    try {
        const vagaId = req.params.id;
        
        if (!ObjectId.isValid(vagaId)) {
            return res.status(404).send('Identificador de vaga inválido.');
        }

        const vaga = await db.collection('vagas').findOne({ _id: new ObjectId(vagaId) });

        if (!vaga) {
            return res.status(404).send('Vaga não encontrada.');
        }

        let jaCandidatou = false;
        if (req.session && req.session.candidato) {
            const candidaturaExistente = await db.collection('candidaturas').findOne({
                vagaId: new ObjectId(vagaId),
                candidatoId: new ObjectId(req.session.candidato.id)
            });
            if (candidaturaExistente) {
                jaCandidatou = true;
            }
        }

        res.render('vaga_detail', { vaga, jaCandidatou });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro interno do servidor ao abrir a vaga.');
    }
});


app.get('/login-candidato', (req, res) => {
    const erro = req.query.erro || null;
    res.render('login_candidato', { erro });
});

app.post('/login-candidato', async (req, res) => {
    try {
        const { email, senha } = req.body;

        const candidato = await db.collection('candidatos').findOne({ email });

        if (!candidato) {
            return res.render('login_candidato', { erro: 'E-mail ou senha inválidos.' });
        }

        const senhaCorreta = await bcrypt.compare(senha, candidato.senha);

        if (!senhaCorreta) {
            return res.render('login_candidato', { erro: 'E-mail ou senha inválidos.' });
        }

        req.session.candidato = {
            id: candidato._id.toString(),
            nome: candidato.nome,
            email: candidato.email,
        };

        res.redirect('/dashboard-candidato');
    } catch (err) {
        console.error(err);
        res.render('login_candidato', { erro: 'Erro interno. Tente novamente.' });
    }
});

app.get('/cadastro-candidato', (req, res) => {
    res.render('cadastro_candidato', { erro: null, sucesso: null });
});

app.post('/cadastro-candidato', async (req, res) => {
    try {
        const { nome, email, senha, confirmarSenha, curso, habilidades } = req.body;

        if (senha !== confirmarSenha) {
            return res.render('cadastro_candidato', {
                erro: 'As senhas não coincidem.',
                sucesso: null,
            });
        }

        const emailExistente = await db.collection('candidatos').findOne({ email });
        if (emailExistente) {
            return res.render('cadastro_candidato', {
                erro: 'Este e-mail já está cadastrado.',
                sucesso: null,
            });
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const novoCandidato = {
            nome,
            email,
            senha: senhaCriptografada,
            curso,
            habilidades,
            criadoEm: new Date()
        };
        
        await db.collection('candidatos').insertOne(novoCandidato);

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

app.get('/dashboard-candidato', authCandidato, async (req, res) => {
    try {
        const candidatoIdObj = new ObjectId(req.session.candidato.id);
        
        // Busca as candidaturas do banco
        const minhasCandidaturasDocs = await db.collection('candidaturas')
            .find({ candidatoId: candidatoIdObj })
            .sort({ dataInscricao: -1 })
            .toArray();

        const idsVagas = minhasCandidaturasDocs.map(c => c.vagaId);
        
        const vagasCandidatadas = await db.collection('vagas')
            .find({ _id: { $in: idsVagas } })
            .toArray();

        const vagasRecentes = await db.collection('vagas').find().sort({ criadoEm: -1 }).limit(4).toArray();
        res.render('dashboard_candidato', {
            candidato: req.session.candidato,
            vagasCandidatadas,
            vagasRecentes,
        });
    } catch (err) {
        res.status(500).send('Erro ao carregar o dashboard.');
    }
});

app.post('/candidatar/:id', authCandidato, async (req, res) => {
    try {
        const vagaId = req.params.id;
        const candidatoId = req.session.candidato.id;

        if (!ObjectId.isValid(vagaId)) return res.status(400).send('Vaga inválida');

        const vagaObjId = new ObjectId(vagaId);
        const candidatoObjId = new ObjectId(candidatoId);

        const existente = await db.collection('candidaturas').findOne({
            vagaId: vagaObjId,
            candidatoId: candidatoObjId
        });

        if (existente) {
            return res.redirect(`/vaga/${vagaId}?erro=ja_inscrito`);
        }

        await db.collection('candidaturas').insertOne({
            vagaId: vagaObjId,
            candidatoId: candidatoObjId,
            dataInscricao: new Date()
        });

        res.redirect(`/dashboard-candidato?sucesso=inscricao_realizada`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Falha ao processar candidatura.');
    }
});

app.post('/remover-candidatura/:id', authCandidato, async (req, res) => {
    try {
        const vagaId = req.params.id;
        const candidatoId = req.session.candidato.id;

        if (!ObjectId.isValid(vagaId)) return res.status(400).send('Vaga inválida');

        await db.collection('candidaturas').deleteOne({
            vagaId: new ObjectId(vagaId),
            candidatoId: new ObjectId(candidatoId)
        });

        res.redirect('/dashboard-candidato?sucesso=candidatura_removida');
    } catch (err) {
        console.error(err);
        res.redirect('/dashboard-candidato?erro=remocao_falhou');
    }
});


app.get('/login-empresa', (req, res) => {
    const erro = req.query.erro || null;
    res.render('login_empresa', { erro });
});

app.post('/login-empresa', async (req, res) => {
    try {
        const { email, senha } = req.body;

        const empresa = await db.collection('empresas').findOne({ email });
        if (!empresa) {
            return res.render('login_empresa', { erro: 'E-mail ou senha inválidos.' });
        }

        const senhaCorreta = await bcrypt.compare(senha, empresa.senha);
        if (!senhaCorreta) {
            return res.render('login_empresa', { erro: 'E-mail ou senha inválidos.' });
        }

        req.session.empresa = {
            id: empresa._id.toString(),
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

        const emailExistente = await db.collection('empresas').findOne({ email });
        if (emailExistente) {
            return res.render('cadastro_empresa', {
                erro: 'Este e-mail já está cadastrado.',
                sucesso: null,
            });
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const novaEmpresa = {
            nomeEmpresa,
            cnpj,
            email,
            senha: senhaCriptografada,
            area,
            criadoEm: new Date()
        };
        await db.collection('empresas').insertOne(novaEmpresa);

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

app.get('/dashboard-empresa', authEmpresa, async (req, res) => {
    try {
        const minhasVagas = await db.collection('vagas').find({ empresa: req.session.empresa.nomeEmpresa }).sort({
            criadoEm: -1,
        }).toArray();
        res.render('dashboard_empresa', {
            empresa: req.session.empresa,
            minhasVagas,
        });
    } catch (err) {
        res.status(500).send('Erro ao carregar o dashboard.');
    }
});

app.get('/dashboard-empresa/vaga/:id/candidatos', authEmpresa, async (req, res) => {
    try {
        const vagaIdObj = new ObjectId(req.params.id);

        const vaga = await db.collection('vagas').findOne({
            _id: vagaIdObj,
            empresa: req.session.empresa.nomeEmpresa
        });

        if (!vaga) {
            return res.status(404).send('Vaga não encontrada ou não autorizada.');
        }

        const inscricoes = await db.collection('candidaturas').find({ vagaId: vagaIdObj }).toArray();
        const candidatosIds = inscricoes.map(i => i.candidatoId);

        const candidatos = await db.collection('candidatos').find({ _id: { $in: candidatosIds } }).toArray();

        const candidatosDetalhados = candidatos.map(cand => {
            const inscricao = inscricoes.find(i => i.candidatoId.toString() === cand._id.toString());
            return {
                ...cand,
                dataInscricao: inscricao ? inscricao.dataInscricao : null
            };
        });

        res.render('candidatos_vaga', {
            empresa: req.session.empresa,
            vaga,
            candidatos: candidatosDetalhados
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao consultar candidatos da vaga.');
    }
});

app.post('/publicar-vaga', authEmpresa, async (req, res) => {
    try {
        const { titulo, cidade, modalidade, nivel, area, descricao, requisitos, bolsa, cargaHoraria } = req.body;

        const novaVaga = {
            titulo,
            empresa: req.session.empresa.nomeEmpresa,
            cidade,
            modalidade,
            nivel,
            area,
            descricao,
            requisitos: requisitos ? requisitos.split(',').map((r) => r.trim()) : [],
            bolsa,
            cargaHoraria,
            criadoEm: new Date()
        };
        await db.collection('vagas').insertOne(novaVaga);

        res.redirect('/dashboard-empresa?sucesso=vaga_publicada');
    } catch (err) {
        console.error(err);
        res.redirect('/dashboard-empresa?erro=falha_publicacao');
    }
});

app.post('/remover-vaga/:id', authEmpresa, async (req, res) => {
    try {
        const vagaId = req.params.id;
        if (!ObjectId.isValid(vagaId)) return res.status(400).send('Vaga inválida');

        await db.collection('vagas').deleteOne({
            _id: new ObjectId(vagaId),
            empresa: req.session.empresa.nomeEmpresa
        });

        res.redirect('/dashboard-empresa?sucesso=vaga_removida');
    } catch (err) {
        console.error(err);
        res.redirect('/dashboard-empresa?erro=falha_remocao');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

// ============================================================
// FUNÇÃO: Popular vagas fictícias
// ============================================================

async function popularVagasFicticias() {
    const count = await db.collection('vagas').countDocuments();
    if (count > 0) return; 

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
            criadoEm: new Date()
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
            criadoEm: new Date()
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
            criadoEm: new Date()
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
            criadoEm: new Date()
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
            criadoEm: new Date()
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
            criadoEm: new Date()
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
            criadoEm: new Date()
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
            criadoEm: new Date()
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
            criadoEm: new Date()
        },
    ];

    await db.collection('vagas').insertMany(vagas);
    console.log(`✅ ${vagas.length} vagas fictícias inseridas com sucesso!`);
}


async function main() {
    try {
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        db = client.db(DB_NAME);
        
        console.log('✅ Conectado ao MongoDB com sucesso!');

        await db.collection('candidatos').createIndex({ email: 1 }, { unique: true });
        await db.collection('empresas').createIndex({ email: 1 }, { unique: true });
        await db.collection('empresas').createIndex({ cnpj: 1 }, { unique: true });

        await popularVagasFicticias();
        
        app.listen(PORT, () => {
            console.log(`🚀 StartLocal rodando em http://localhost:${PORT}`);
        });

    } catch (err) {
        console.error('❌ Falha ao iniciar conexões ou servidor:', err);
        process.exit(1);
    }
}

main();