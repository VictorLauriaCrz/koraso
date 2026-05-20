const express = require('express');
const cors = require('cors');

const app = express();

//segurança ne rpzd!!

app.use(cors());
app.use(express.json()); // pra api entender dado de json

//algum dia havera um banco de dados de vdd pro teste, mas por enquanto, vamos usar um array pra guardar os dados

const databaseKoraso = [];

app.post('/api/sincronizar', (req, res) => {

    const { paciente_id, nome, bpm_repouso, passos_diarios, horas_sono, } = req.body; 

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

    
    databaseKoraso.push(novoRelatorio);

    return res.status(201).json({ 
        message: 'Dados sincronizados com sucesso.', 
        dados: novoRelatorio });
});

app.get('/api/medico/paciente/:id', (req, res) => {
    const idBuscado = req.params.id;

    const relatorio = databaseKoraso.find(dado => dado.paciente_id === idBuscado);

    if (!relatorio) {
        return res.status(404).json({ error: 'Paciente não encontrado.' });
    }

    return res.status(200).json({ dados: relatorio });
});

const PORTA = 3000; 
app.listen(PORTA, () => {
    console.log(`Servidor rodando na porta ${PORTA}`);
});