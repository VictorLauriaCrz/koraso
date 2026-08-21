document.addEventListener('DOMContentLoaded', () => {

    // Mapeia os elementos do HTML
    const passosDisplay = document.getElementById('passos-display');
    const bpmDisplay = document.getElementById('bpm-display');
    const caloriasDisplay = document.getElementById('calorias-display');
    const btnGerarPdf = document.getElementById('btn-gerar-pdf');

    // Função que integra com o Dashboard que fizemos antes
    async function carregarMetricas() {
        try {
            // Simulando um delay de rede de 1 segundo para parecer real
            setTimeout(() => {
                // Aqui entraria o seu fetch('http://localhost:3000/api/metricas')
                const mockDados = {
                    passos: 3450,
                    bpm: 72,
                    calorias: 1240
                };

                // Atualiza a interface
                passosDisplay.textContent = mockDados.passos.toLocaleString('pt-BR');
                bpmDisplay.textContent = `${mockDados.bpm} bpm`;
                caloriasDisplay.textContent = `${mockDados.calorias} kcal`;

                // Muda a cor do texto dos passos se bater a meta (5000)
                if (mockDados.passos >= 5000) {
                    passosDisplay.style.color = '#27ae60'; // Verde
                }
            }, 1000);

        } catch (error) {
            passosDisplay.textContent = "Erro";
            console.error("Falha ao carregar dashboard:", error);
        }
    }

    // Ação do Smart Report (Para ser construída a seguir)
    btnGerarPdf.addEventListener('click', () => {
        alert("Iniciando geração do Smart Report PDF com base nas métricas atuais...");
        // Aqui chamaremos a rota de gerar PDF depois
    });

    // Inicia o carregamento assim que a página abre
    carregarMetricas();
});