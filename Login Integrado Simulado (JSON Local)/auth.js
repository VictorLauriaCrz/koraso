const SESSION_KEY = 'koraso_session';
const API_BASE = window.location.origin;

function salvarSessao(token, usuario) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ token, usuario }));
}

function obterSessao() {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function limparSessao() {
    localStorage.removeItem(SESSION_KEY);
}

function paginaLoginPorPerfil(perfil) {
    return perfil === 'medico' ? 'login-medico.html' : 'login.html';
}

function redirecionarPorPerfil(perfil) {
    if (perfil === 'paciente') {
        const sessao = obterSessao();
        const usuarioId = sessao?.usuario?.id;

        if (!usuarioId) {
            window.location.href = 'login.html';
            return;
        }

        const chaveConsentimento = `consentimentoAceito_${usuarioId}`;
        const consentimentoAceito = localStorage.getItem(chaveConsentimento);

        if (consentimentoAceito === 'true') {
            window.location.href = 'app-paciente.html';
        } else {
            window.location.href = 'autorizacao.html';
        }
    } else if (perfil === 'medico') {
        window.location.href = 'index.html';
    }
}

async function validarTokenRemoto(token) {
    const resposta = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!resposta.ok) return null;
    const dados = await resposta.json();
    return dados.usuario;
}

async function verificarSessao(perfilEsperado) {
    const destinoLogin = paginaLoginPorPerfil(perfilEsperado || 'paciente');
    const sessao = obterSessao();
    if (!sessao?.token) {
        window.location.href = destinoLogin;
        return null;
    }

    const usuario = await validarTokenRemoto(sessao.token);
    if (!usuario) {
        limparSessao();
        window.location.href = destinoLogin;
        return null;
    }

    if (perfilEsperado && usuario.perfil !== perfilEsperado) {
        redirecionarPorPerfil(usuario.perfil);
        return null;
    }

    salvarSessao(sessao.token, usuario);
    return { token: sessao.token, usuario };
}

async function logout(destino) {
    const sessao = obterSessao();
    const perfil = sessao?.usuario?.perfil;
    if (sessao?.token) {
        try {
            await fetch(`${API_BASE}/api/auth/logout`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${sessao.token}` },
            });
        } catch {
            // Ignora falha de rede no logout
        }
    }
    limparSessao();
    window.location.href = destino || paginaLoginPorPerfil(perfil);
}

async function listarPacientes() {
    const sessao = obterSessao();
    if (!sessao?.token) return [];

    const resposta = await fetch(`${API_BASE}/api/auth/pacientes`, {
        headers: { Authorization: `Bearer ${sessao.token}` },
    });
    if (!resposta.ok) return [];
    const dados = await resposta.json();
    return dados.pacientes || [];
}
