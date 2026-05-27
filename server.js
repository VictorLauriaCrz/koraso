const express = require('express');
const cors = require('cors');
const PDFDocument = require('pdfkit');

const app = express();
app.use(cors());
app.use(express.json());

const databaseKoraso = {};

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

    const pacienteAtualizado = {
        paciente_id: pacienteId,
        nome: pacienteExiste ? pacienteExiste.nome : "Paciente Via Google Health",
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

    // Design Simples do PDF
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

app.listen(3000, () => console.log('Servidor Rodando na 3000'));