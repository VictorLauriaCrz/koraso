const express = require('express');
const cors = require('cors');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const PDFDocument = require('pdfkit');

const app = express();
app.use(cors());
app.use(express.json());

const databaseKoraso = {};
const sessoes = {};

const usuarios = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'data', 'users.json'), 'utf8')
).usuarios;

function usuarioPublico(usuario) {
    const { senha, ...dados } = usuario;
    return dados;
}

function extrairToken(req) {
    const auth = req.headers.authorization;
    if (auth && auth.startsWith('Bearer ')) return auth.slice(7);
    return null;
}

function obterSessao(req) {
    const token = extrairToken(req);
    if (!token || !sessoes[token]) return null;
    return sessoes[token];
}

// --- Autenticação simulada (JSON local) ---

app.post('/api/auth/login', (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    const usuario = usuarios.find(
        (u) => u.email === email && u.senha === senha
    );

    if (!usuario) {
        return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    sessoes[token] = usuarioPublico(usuario);

    return res.status(200).json({
        token,
        usuario: usuarioPublico(usuario),
    });
});

app.get('/api/auth/me', (req, res) => {
    const sessao = obterSessao(req);
    if (!sessao) {
        return res.status(401).json({ error: 'Sessão inválida ou expirada.' });
    }
    return res.status(200).json({ usuario: sessao });
});

app.post('/api/auth/logout', (req, res) => {
    const token = extrairToken(req);
    if (token && sessoes[token]) {
        delete sessoes[token];
    }
    return res.status(200).json({ message: 'Logout realizado.' });
});

app.get('/api/auth/pacientes', (req, res) => {
    const sessao = obterSessao(req);
    if (!sessao) {
        return res.status(401).json({ error: 'Sessão inválida ou expirada.' });
    }
    if (sessao.perfil !== 'medico') {
        return res.status(403).json({ error: 'Acesso restrito a médicos.' });
    }

    const pacientes = usuarios
        .filter((u) => u.perfil === 'paciente')
        .map(usuarioPublico);

    return res.status(200).json({ pacientes });
});

// 1. Rota de Sincronização (POST) - Simulando o Relógio enviando dados
app.post('/api/sincronizar', (req, res) => {
    const { paciente_id, nome, bpm_repouso, passos_diarios, horas_sono } = req.body;
    const novoRelatorio = {
        paciente_id, nome, bpm_repouso, passos_diarios, horas_sono,
        data_sincronizacao: new Date().toISOString(),
    };
    databaseKoraso[paciente_id] = novoRelatorio;
    return res.status(201).json({ message: 'Sincronizado.', dados: novoRelatorio });
});

// 2. Rota de Consulta (GET) - O que o Médico e o Paciente leem
app.get('/api/medico/paciente/:id', (req, res) => {
    const relatorio = databaseKoraso[req.params.id];
    if (!relatorio) return res.status(404).json({ error: 'Não encontrado' });
    return res.status(200).json({ dados: relatorio });
});

// 3. Rota do Google Health (GET) - A Ponte Korasõ buscando dados na nuvem
app.get('/api/sincronizar/google/:id', (req, res) => {
    const pacienteId = req.params.id;
    const pacienteExiste = databaseKoraso[pacienteId];

    const dadosGoogle = { passos_diarios: 8450, fonte: 'Google Health API' };

    const pacienteJson = usuarios.find((u) => u.id === pacienteId && u.perfil === 'paciente');

    const pacienteAtualizado = {
        paciente_id: pacienteId,
        nome: pacienteExiste?.nome || pacienteJson?.nome || 'Paciente Via Google Health',
        passos_diarios: dadosGoogle.passos_diarios,
        horas_sono: pacienteExiste ? pacienteExiste.horas_sono : 7.5,
        bpm_repouso: pacienteExiste ? pacienteExiste.bpm_repouso : 72,
        data_sincronizacao: new Date().toISOString()
    };

    databaseKoraso[pacienteId] = pacienteAtualizado;
    return res.status(200).json({ message: 'Dados da nuvem integrados!', dados: pacienteAtualizado });
});

// 4. Rota do Smart Report (PDF) - O diferencial clínico
app.get('/api/medico/paciente/:id/pdf', (req, res) => {
    const paciente = databaseKoraso[req.params.id];
    if (!paciente) return res.status(404).send('Paciente não encontrado');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=report-${paciente.paciente_id}.pdf`);

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.pipe(res);

    doc.fillColor('#0052CC').font('Helvetica-Bold').fontSize(25).text('Korasõ Smart Report', 50, 50);
    doc.fillColor('#444').fontSize(12).text('Relatório de Saúde Cardiovascular Preventiva', 50, 80);
    doc.moveTo(50, 100).lineTo(550, 100).stroke('#DFE1E6');

    doc.fillColor('#172B4D').fontSize(14).text(`Paciente: ${paciente.nome}`, 50, 130);
    doc.text(`ID Unimed: #${paciente.paciente_id}`, 50, 150);

    doc.text('Indicadores Recentes:', 50, 190);
    doc.fontSize(12).text(`• Batimentos: ${paciente.bpm_repouso} BPM`, 70, 210);
    doc.text(`• Passos: ${paciente.passos_diarios}`, 70, 230);
    doc.text(`• Sono: ${paciente.horas_sono} horas`, 70, 250);

    doc.fontSize(10).fillColor('#5E6C84').text('Documento gerado para apoio à decisão clínica. PGHD (Patient Generated Health Data).', 50, 750, { align: 'center' });

    doc.end();
});

app.use(express.static(__dirname));

app.listen(3000, () => console.log('Servidor Rodando na 3000'));
