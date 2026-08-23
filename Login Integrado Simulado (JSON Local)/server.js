const express = require('express');
const cors = require('cors');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const PDFDocument = require('pdfkit');
const { registrarLeitura, gerarSmartReport, formatarData } = require('./smart-report');

const app = express();
app.use(cors());
app.use(express.json());

const databaseKoraso = {};
const sessoes = {};

const USERS_FILE = path.join(__dirname, 'data', 'users.json');

function carregarUsuarios() {
    const dados = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    return dados.usuarios;
}

function salvarUsuarios(lista) {
    fs.writeFileSync(USERS_FILE, JSON.stringify({ usuarios: lista }, null, 2), 'utf8');
}

let usuarios = carregarUsuarios();

function gerarIdPaciente() {
    let id;
    do {
        id = String(Math.floor(10000 + Math.random() * 90000));
    } while (usuarios.some((u) => u.id === id));
    return id;
}

function emailEmUso(email) {
    const normalizado = email.trim().toLowerCase();
    return usuarios.some((u) => u.email.trim().toLowerCase() === normalizado);
}

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

app.post('/api/auth/register', (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
    }

    const nomeLimpo = nome.trim();
    const emailLimpo = email.trim().toLowerCase();

    if (nomeLimpo.length < 2) {
        return res.status(400).json({ error: 'Informe um nome válido.' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo)) {
        return res.status(400).json({ error: 'Informe um e-mail válido.' });
    }

    if (senha.length < 6) {
        return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres.' });
    }

    if (emailEmUso(emailLimpo)) {
        return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
    }

    const id = gerarIdPaciente();
    const novoUsuario = {
        id,
        email: emailLimpo,
        senha,
        perfil: 'paciente',
        nome: nomeLimpo,
        carteirinha: id,
    };

    usuarios.push(novoUsuario);
    salvarUsuarios(usuarios);

    const token = crypto.randomBytes(32).toString('hex');
    sessoes[token] = usuarioPublico(novoUsuario);

    return res.status(201).json({
        message: 'Conta criada com sucesso.',
        token,
        usuario: usuarioPublico(novoUsuario),
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
    const leitura = {
        paciente_id,
        nome,
        bpm_repouso,
        passos_diarios,
        horas_sono,
        data_sincronizacao: new Date().toISOString(),
    };
    databaseKoraso[paciente_id] = registrarLeitura(databaseKoraso[paciente_id], leitura);
    return res.status(201).json({ message: 'Sincronizado.', dados: databaseKoraso[paciente_id] });
});

// 2. Rota de Consulta (GET) - O que o Médico e o Paciente leem
app.get('/api/medico/paciente/:id', (req, res) => {
    const relatorio = databaseKoraso[req.params.id];
    if (!relatorio) return res.status(404).json({ error: 'Não encontrado' });
    return res.status(200).json({
        dados: relatorio,
        smart_report: gerarSmartReport(relatorio),
    });
});

// 2b. Smart Report em JSON (visão clínica consolidada)
app.get('/api/medico/paciente/:id/smart-report', (req, res) => {
    const relatorio = databaseKoraso[req.params.id];
    if (!relatorio) return res.status(404).json({ error: 'Não encontrado' });
    return res.status(200).json({ smart_report: gerarSmartReport(relatorio) });
});

// 3. Rota do Google Health (GET) - A Ponte Korasõ buscando dados na nuvem
app.get('/api/sincronizar/google/:id', (req, res) => {
    const pacienteId = req.params.id;
    const pacienteExiste = databaseKoraso[pacienteId];

    const dadosGoogle = { passos_diarios: 8450, fonte: 'Google Health API' };

    const pacienteJson = usuarios.find((u) => u.id === pacienteId && u.perfil === 'paciente');

    const leitura = {
        paciente_id: pacienteId,
        nome: pacienteExiste?.nome || pacienteJson?.nome || 'Paciente Via Google Health',
        passos_diarios: dadosGoogle.passos_diarios,
        horas_sono: pacienteExiste ? pacienteExiste.horas_sono : 7.5,
        bpm_repouso: pacienteExiste ? pacienteExiste.bpm_repouso : 72,
        data_sincronizacao: new Date().toISOString(),
    };

    databaseKoraso[pacienteId] = registrarLeitura(pacienteExiste, leitura);
    return res.status(200).json({ message: 'Dados da nuvem integrados!', dados: databaseKoraso[pacienteId] });
});

// 4. Rota do Smart Report (PDF) - O diferencial clínico
app.get('/api/medico/paciente/:id/pdf', (req, res) => {
    const paciente = databaseKoraso[req.params.id];
    if (!paciente) return res.status(404).send('Paciente não encontrado');

    const report = gerarSmartReport(paciente);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=smart-report-${paciente.paciente_id}.pdf`);

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.pipe(res);

    doc.fillColor('#0052CC').font('Helvetica-Bold').fontSize(22).text('Korasõ Smart Report Médico', 50, 50);
    doc.fillColor('#5E6C84').font('Helvetica').fontSize(11)
        .text('Relatório inteligente de saúde cardiovascular preventiva', 50, 78);
    doc.moveTo(50, 98).lineTo(550, 98).strokeColor('#DFE1E6').stroke();

    let y = 120;
    doc.fillColor('#172B4D').font('Helvetica-Bold').fontSize(13).text('Identificação', 50, y);
    y += 22;
    doc.font('Helvetica').fontSize(11)
        .text(`Paciente: ${report.nome}`, 50, y)
        .text(`ID Unimed: #${report.paciente_id}`, 300, y);
    y += 18;
    doc.text(`Gerado em: ${formatarData(report.gerado_em)}`, 50, y);
    y += 16;
    doc.text(`Última sincronização: ${formatarData(report.data_ultima_sincronizacao)}`, 50, y);
    y += 16;
    doc.text(`Leituras no histórico: ${report.leituras_disponiveis}`, 50, y);

    y += 28;
    doc.font('Helvetica-Bold').fontSize(13).text('Indicadores atuais', 50, y);
    y += 20;
    doc.font('Helvetica').fontSize(11);
    const ind = report.indicadores;
    doc.text(`• BPM de repouso: ${ind.bpm_repouso.valor} BPM (${ind.bpm_repouso.status})`, 60, y); y += 16;
    doc.text(`• Passos diários: ${ind.passos_diarios.valor} (${ind.passos_diarios.status})`, 60, y); y += 16;
    doc.text(`• Horas de sono: ${ind.horas_sono.valor} h (${ind.horas_sono.status})`, 60, y);

    y += 28;
    doc.font('Helvetica-Bold').fontSize(13).text('Resumo clínico preventivo', 50, y);
    y += 18;
    doc.font('Helvetica').fontSize(11).fillColor('#172B4D')
        .text(report.resumo_clinico, 50, y, { width: 500 });
    y = doc.y + 16;

    doc.font('Helvetica-Bold').fontSize(13).text('Tendências e padrão individual', 50, y);
    y = doc.y + 12;
    doc.font('Helvetica').fontSize(11);
    if (!report.tendencias.length) {
        doc.fillColor('#5E6C84').text('Histórico ainda insuficiente para comparar com o padrão individual. Novas sincronizações enriquecerão esta seção.', 50, y, { width: 500 });
        y = doc.y + 12;
    } else {
        report.tendencias.forEach((t) => {
            doc.fillColor('#172B4D').text(`• ${t.texto}`, 60, y, { width: 480 });
            y = doc.y + 6;
        });
    }

    y += 10;
    doc.fillColor('#172B4D').font('Helvetica-Bold').fontSize(13).text('Alertas preventivos', 50, y);
    y = doc.y + 12;
    doc.font('Helvetica').fontSize(11);
    if (!report.alertas.length) {
        doc.fillColor('#36B37E').text('Nenhum alerta preventivo no momento.', 60, y);
        y = doc.y + 12;
    } else {
        report.alertas.forEach((a) => {
            doc.fillColor(a.nivel === 'atencao' ? '#FF5630' : '#FF8B00').text(`• [${a.nivel}] ${a.texto}`, 60, y, { width: 480 });
            y = doc.y + 6;
        });
    }

    if (y > 680) {
        doc.addPage();
        y = 50;
    } else {
        y += 16;
    }

    doc.fillColor('#172B4D').font('Helvetica-Bold').fontSize(13).text('Histórico recente', 50, y);
    y = doc.y + 12;
    doc.font('Helvetica').fontSize(10).fillColor('#5E6C84');
    report.historico.slice(-7).reverse().forEach((h) => {
        doc.text(
            `${h.data_formatada}  |  BPM ${h.bpm_repouso}  |  ${h.passos_diarios} passos  |  ${h.horas_sono} h sono`,
            50,
            y,
            { width: 500 }
        );
        y = doc.y + 4;
    });

    doc.fontSize(9).fillColor('#5E6C84')
        .text(report.aviso_legal, 50, 750, { align: 'center', width: 500 });

    doc.end();
});

app.use(express.static(__dirname));

app.listen(3000, () => console.log('Servidor Rodando na 3000'));
