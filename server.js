const express = require('express');
const cors = require('cors');

const app = express();

// segurança ne rpzd!!
app.use(cors());
app.use(express.json()); // pra api entender dado de json

// Transformei o Array [] em um Objeto {} para usar o ID como chave única.
// Isso impede dados duplicados do mesmo paciente e mantém a versão mais recente!
const databaseKoraso = {};

app.post('/api/sincronizar', (req, res) => {

    const { paciente_id, nome, bpm_repouso, passos_diarios, horas_sono } = req.body; 

    if (!paciente_id || !nome || !bpm_repouso || !passos_diarios || !horas_sono) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    const novoRelatorio = {
        paciente_id, 
        nome,
        bpm_repouso,
        passos_diarios,
        horas_sono,
        data_sincronizacao: new Date().toISOString(),
    };

    // Salva ou atualiza os dados usando o ID como etiqueta
    databaseKoraso[paciente_id] = novoRelatorio;

    return res.status(201).json({ 
        message: 'Dados sincronizados com sucesso.', 
        dados: novoRelatorio 
    });
});

app.get('/api/medico/paciente/:id', (req, res) => {
    const idBuscado = req.params.id;

    // Em vez de .find(), nós vamos direto na "etiqueta" certa.
    const relatorio = databaseKoraso[idBuscado];

    if (!relatorio) {
        return res.status(404).json({ error: 'Paciente não encontrado.' });
    }

    return res.status(200).json({ dados: relatorio });
});

const PORTA = 3000; 
app.listen(PORTA, () => {
    console.log(`Servidor rodando na porta ${PORTA}`);
});