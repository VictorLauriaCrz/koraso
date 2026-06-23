# Login Integrado Simulado (JSON Local)

Autenticação simulada com credenciais em `data/users.json`, sem integração com APIs oficiais da Unimed. Uma tela de login unificada redireciona automaticamente conforme o perfil do usuário.

## Como executar

```bash
npm install
node server.js
```

Abra no navegador: `http://localhost:3000/login.html`

## Credenciais de demonstração

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Paciente (Maria Silva) | maria.silva@unimed.demo | koraso123 |
| Paciente (Carlos Souza) | carlos.souza@unimed.demo | koraso123 |
| Médico | joao.medico@unimed.demo | koraso123 |

## Fluxo

1. Login em `login.html` valida e-mail e senha contra o JSON local.
2. Paciente é redirecionado ao `app-paciente.html` com sessão personalizada.
3. Médico é redirecionado ao `index.html` com seletor de pacientes.
4. Páginas protegidas redirecionam ao login se a sessão é inválida.

**Nota:** Senhas em texto plano e tokens em memória são aceitáveis apenas para esta simulação acadêmica.
