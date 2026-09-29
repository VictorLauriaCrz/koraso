<p align="center">
  <img src="assets/logo-koraso.png" alt="Logo Korasõ" width="280">
</p>

<h1 align="center">Korasõ 🫀</h1>
<p align="center"><i>A ponte entre os dados diários do paciente e o cuidado médico contínuo</i></p>

<p align="center">
  <img src="assets/banner-koraso.png" alt="Identidade visual do Korasõ — tela de login do app" width="720">
</p>

<img src="assets/wave-top.svg" alt="" width="100%">

Uma ponte de dados inteligente que conecta a rotina física do paciente (smartwatch/celular) ao prontuário médico da Unimed, unindo coleta contínua de dados, inteligência artificial e prevenção cardiovascular.

---

## 🎯 O Desafio

A saúde suplementar atual atua de forma reativa, tratando pacientes quando a doença cardiovascular já está instalada. Durante uma consulta padrão de 15 minutos, o médico não possui dados contínuos sobre o estilo de vida do paciente (sono, sedentarismo e oscilações cardíacas), dificultando a prevenção primária e aumentando a sinistralidade da operadora.

## 💡 A Solução

O **Korasõ** atua como uma Ponte de Dados (*Data Bridge*) entre a rotina do paciente e o consultório médico. Via integração **OAuth 2.0 com a Google Health API**, o sistema coleta passos diários, horas de sono, BPM de repouso e calorias direto do smartwatch/celular do paciente, sem gerar fricção.

Esses dados alimentam duas camadas de inteligência:

* **Smart Report** — um resumo clínico em PDF, gerado automaticamente, cruzando indicadores atuais, tendências (comparadas ao *padrão individual* do próprio paciente, não a médias populacionais) e alertas preventivos. Pronto para o médico consultar antes ou durante a consulta.
* **Insights Inteligentes com IA** — usando a **Gemini API**, o Korasõ transforma os mesmos dados em orientações de saúde personalizadas, em linguagem natural e tom acolhedor, entregues direto ao paciente — sem nunca emitir diagnóstico médico.

---

## 🧠 Diferencial: resiliência em camadas

Todo dado externo pode falhar — token expirado, API fora do ar, paciente que ainda não sincronizou nada. O Korasõ foi desenhado para **nunca deixar a tela em branco ou quebrada** por causa disso:

| Camada | Se falhar | O Korasõ faz |
|---|---|---|
| Google Health API | token expirado, quota, rede | usa dados de exemplo automaticamente (`data/google-health-fallback.json`) |
| Gemini API (insights) | sem chave, timeout, resposta vazia | gera o insight por um motor de regras local |
| Paciente sem sincronização | nunca conectou nenhum dispositivo | cria um registro de exemplo na hora, sem retornar erro |
| Conexão do navegador | rede cai no lado do cliente | usa um fallback embutido no próprio front-end |

Com ou sem internet, com ou sem chaves de API configuradas, o paciente e o médico sempre veem algo útil na tela — e sempre no mesmo formato, sem o front-end precisar saber se o dado é real ou de exemplo.

---

## 🚀 Status do MVP

O Korasõ hoje é um produto funcional de ponta a ponta — não apenas uma simulação de API via Postman como na primeira versão.

* **Autenticação e perfis** — login simulado (paciente/médico), sessão compartilhada entre todas as telas (`auth.js`) e **consentimento LGPD explícito** antes de qualquer sincronização de dados.
* **App do Paciente** — dashboard, sincronização com a Google Health (dado real via OAuth 2.0, ou exemplo em caso de falha), geração do Smart Report em PDF e do Insight Inteligente por IA, tudo acionável em um toque.
* **Dashboard Inteligente** — interface animada: contadores numéricos crescentes, barra de progresso da meta de passos, gráfico de sono desenhado na tela, sparkline de BPM reconstruído a partir do histórico real do paciente, cards que surgem em cascata, e um badge indicando se o dado exibido é real ou de exemplo.
* **Connect Zone** — tela de contas e dispositivos conectados (Unimed, Google Health, smartwatch).
* **Portal do Médico** — seleção de paciente, indicadores com status colorido, gráfico de evolução, lista de alertas preventivos, anotações clínicas e emissão do Smart Report.

Diferente da simulação anterior, hoje o fluxo é real de ponta a ponta: o paciente sincroniza pela própria interface, o servidor processa e acumula o histórico, e o médico consulta os mesmos dados ao vivo — com o Smart Report e os Insights de IA sempre disponíveis, mesmo para um paciente que acabou de se cadastrar.

### 🛠️ Tecnologias utilizadas e arquitetura

O projeto segue uma arquitetura baseada em API, separando as regras de negócio (back-end) das interfaces de interação (front-end).

* **⚙️ Back-end (API REST)**
  * **Node.js** com **Express.js** para criação e roteamento da API.
  * **CORS** para liberação segura de requisições de múltiplas origens.
  * **PDFKit** para a geração automatizada do *Smart Report* clínico em PDF.
  * **googleapis** para o fluxo OAuth 2.0 com a **Google Health API** (Health Connect).
  * Integração REST com a **Gemini API** (Google) para os Insights Inteligentes, com fallback local por regras quando a IA não responde.
  * **dotenv** para configurar as integrações externas — todas opcionais: sem nenhuma chave configurada, o sistema roda 100% com dados de exemplo.

* **💻 Front-end (arquitetura multitelas)**
  * **Dashboard do Médico** (portal clínico) — HTML5, CSS3 e Vanilla JavaScript (Fetch API), com gráfico de evolução, indicadores, alertas e anotações clínicas.
  * **Dashboard Inteligente do Paciente** — HTML5, CSS3 e Vanilla JavaScript, com contadores e gráficos animados e badge de fonte de dado (real vs. exemplo).
  * **App do Paciente** — interface mobile-first para sincronizar dados, gerar o Smart Report e consultar o Insight de IA.
  * **Connect Zone** — contas e dispositivos conectados ao ecossistema.
  * **Sessão e privacidade** — sessão compartilhada (`auth.js`) e tela de consentimento LGPD (`autorizacao.html`), reaproveitadas em todas as telas.

---

## 🔭 Atualizações futuras

* **Persistência em banco de dados real** (SQLite/PostgreSQL) no lugar do histórico em memória.
* **Apple HealthKit** como segunda fonte de dados, ao lado da Google Health API.
* **App nativo** (React Native/Flutter) para iOS e Android.
* **Notificações push** para alertas preventivos críticos.
* **Painel populacional/epidemiológico** para a operadora de saúde, com filtros por idade, condição e região.

---

## 👥 Integrantes

Este projeto foi desenvolvido pela equipe:

* **Victor Lauria** — *Product Owner (PO) & Fullstack Developer* *(Concepção da solução e desenvolvimento fullstack, com foco na tela do paciente; responsável por toda a estrutura de back-end da integração com a Gemini API)*

* **Giovanna Rodrigues Pereira** — *Fullstack Developer & Market Analyst* *(Desenvolvimento fullstack com foco na tela do médico e no front-end da integração com a Gemini API; benchmarking de mercado e estruturação do roadmap ágil)*

* **Rodrigo Farias Lima** — *Business Analyst* *(Responsável pelo valor de mercado da solução e por toda a pesquisa do problema que fundamenta o projeto)*

* **Júlia Leal Benevides Gomes** — *Data & Research Analyst* *(Estruturação do pipeline de dados, levantamento de estatísticas e validação do impacto da hiperpersonalização)*

* **Yannie Yshin Kang** — *Brand & UX/UI Designer* *(Responsável por toda a identidade visual e o design da plataforma, além da estruturação do Pitch Deck)*

<br>

<img src="assets/wave-bottom.svg" alt="" width="100%">

<p align="center"><sub>Korasõ · Inteligência clínica para decisões que transformam vidas</sub></p>
