const aceite = document.getElementById("aceiteAutorizacao");
const autorizar = document.getElementById("autorizar");
const agoraNao = document.getElementById("agoraNao");

function obterIdUsuarioLogado() {
    const raw = localStorage.getItem("koraso_session");

    if (!raw) return null;

    try {
        const sessao = JSON.parse(raw);
        return sessao?.usuario?.id || null;
    } catch {
        return null;
    }
}

autorizar.addEventListener("click", () => {
    if (!aceite.checked) {
        alert("Você precisa aceitar a Política de Privacidade e os Termos de Uso.");
        return;
    }

    const usuarioId = obterIdUsuarioLogado();

    if (!usuarioId) {
        alert("Sessão não encontrada. Faça login novamente.");
        window.location.href = "login.html";
        return;
    }

    localStorage.setItem(`consentimentoAceito_${usuarioId}`, "true");

    window.location.href = "app-paciente.html";
});

agoraNao.addEventListener("click", () => {
    const confirmar = confirm(
        "Sem a autorização, alguns recursos do Korasõ não poderão ser utilizados. Deseja continuar sem autorizar?"
    );

    if (!confirmar) return;

    const usuarioId = obterIdUsuarioLogado();

    if (!usuarioId) {
        window.location.href = "login.html";
        return;
    }

    localStorage.setItem(`consentimentoAceito_${usuarioId}`, "false");
    window.location.href = "app-paciente.html";
});