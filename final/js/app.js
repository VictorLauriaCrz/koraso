document.addEventListener('DOMContentLoaded', () => {

    // Mapeamento de Botões
    const btnChamarLogin = document.getElementById('btn-chamar-login');
    const btnEntrarDashboard = document.getElementById('btn-entrar-dashboard');
    const btnAutorizar = document.getElementById('btn-autorizar'); // Botão da tela 3

    // Mapeamento das Telas
    const telaBoasVindas = document.getElementById('tela-boas-vindas');
    const telaLogin = document.getElementById('tela-login');
    const telaAutorizacao = document.getElementById('tela-autorizacao');
    const telaHome = document.getElementById('tela-home'); // A nova tela 4

    // Navegação: Tela 1 -> Tela 2
    btnChamarLogin.addEventListener('click', () => {
        telaBoasVindas.classList.remove('ativa');
        telaBoasVindas.classList.add('oculta');
        setTimeout(() => {
            telaLogin.classList.remove('oculta');
            telaLogin.classList.add('ativa');
        }, 50);
    });

    // Navegação: Tela 2 -> Tela 3
    btnEntrarDashboard.addEventListener('click', () => {
        telaLogin.classList.remove('ativa');
        telaLogin.classList.add('oculta');
        setTimeout(() => {
            telaAutorizacao.classList.remove('oculta');
            telaAutorizacao.classList.add('ativa');
        }, 50);
    });

    // Navegação: Tela 3 -> Tela 4 (Home em outro arquivo)
    btnAutorizar.addEventListener('click', () => {
        // Redireciona de verdade para a nova página
        window.location.href = 'home.html';
    });

});