# Login Integrado Simulado (JSON Local)

Autenticação simulada com credenciais em `data/users.json`, sem integração com APIs oficiais da Unimed. Uma tela de login unificada redireciona automaticamente conforme o perfil do usuário.

## Como executar

```bash
npm install
node server.js
```

- **App do paciente (mobile):** http://localhost:3000/login.html
- **Portal do médico (desktop):** http://localhost:3000/login-medico.html

## Credenciais de demonstração

| Perfil | E-mail | Senha | Entrada |
|--------|--------|-------|---------|
| Paciente (Maria Silva) | maria.silva@unimed.demo | koraso123 | `login.html` |
| Paciente (Carlos Souza) | carlos.souza@unimed.demo | koraso123 | `login.html` |
| Médico | joao.medico@unimed.demo | koraso123 | `login-medico.html` |

## Fluxo

1. Paciente entra em `login.html` (experiência mobile) e segue para consentimento/`app-paciente.html`.
2. Médico entra em `login-medico.html` (experiência desktop Unimed) e vai para `index.html`.
3. **Criar Conta** cadastra um novo paciente em `data/users.json`.
4. Páginas protegidas redirecionam ao login correspondente se a sessão for inválida.

## Smart Report Médico

Após o paciente sincronizar dados, o dashboard do médico exibe um painel com resumo clínico preventivo, tendências (comparação com o padrão individual) e alertas. O PDF em `/api/medico/paciente/:id/pdf` inclui as mesmas seções. Também há JSON em `/api/medico/paciente/:id/smart-report`.

Cada sincronização (`POST /api/sincronizar` ou `GET /api/sincronizar/google/:id`) acumula histórico (até 14 leituras) para calcular desvios.

**Nota:** Senhas em texto plano e tokens em memória são aceitáveis apenas para esta simulação acadêmica. Novos cadastros são sempre do perfil **paciente**.
