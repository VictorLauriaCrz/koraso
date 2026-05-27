# Korasõ 🫀 | Ponte de Dados Inteligente para Saúde Preventiva

Uma ponte de dados passiva que conecta a rotina física do paciente (smartwatch/celular) ao prontuário médico da Unimed para prevenção cardiovascular.

---

## 🎯 O Desafio
A saúde suplementar atual atua de forma reativa, tratando pacientes quando a doença cardiovascular já está instalada. Durante uma consulta padrão de 15 minutos, o médico não possui dados contínuos sobre o estilo de vida do paciente (sono, sedentarismo e oscilações cardíacas), dificultando a prevenção primária e aumentando a sinistralidade da operadora.

## 💡 A Solução
O **Korasõ** é uma plataforma que atua como uma Ponte de Dados (*Data Bridge*). Através de coleta passiva via integrações nativas (Google Fit e Apple Health), o sistema extrai dados de passos diários, horas de sono e BPM de celulares e smartwatches, sem gerar fricção para o usuário.

Quando o paciente agenda uma consulta, o Korasõ gera um **Smart Report** (Resumo Clínico Inteligente) e o disponibiliza para o médico, otimizando o tempo de consulta e oferecendo um contexto de saúde hiper-personalizado.

---

## 🚀 Status do MVP
Atualmente, o projeto possui uma API funcional que simula o recebimento dos dados do smartwatch (POST) e uma interface Web para o médico visualizar os gráficos do paciente em tempo real (GET). A pagina app-paciente simula o envio de dados para a pagina index que exibe o dashboard para o médico.

* **Simulação Mobile:** Postman (Testes de integração de API) : Atualmente a simulação mobile envia dados da página app, inseridos no servidor, diretamente para a página index onde simula um relatório médico.


### 🛠️ Tecnologias Utilizadas e Arquitetura

O projeto foi reestruturado seguindo o modelo de arquitetura baseada em APIs, separando completamente as regras de negócio (Back-end) das interfaces de interação (Front-end).

* **Back-end (API Rest):** *
* **Node.js** com **Express.js** para criação e roteamento da API.

* **CORS** para liberação de requisições de múltiplas origens de forma segura.
* **PDFKit** para a geração automatizada e dinâmica do *Smart Report* clínico em formato PDF.


* **Front-end (Arquitetura Multitelas):**

* **Dashboard do Médico:** HTML5, CSS3 e Vanilla JavaScript (Fetch API) estruturado para análise de dados, validação de alertas críticos de BPM e emissão de relatórios.
 
* **Simulador do App do Paciente:** Interface mobile-first (HTML/CSS) criada para simular a coleta passiva de dados (*Patient Generated Health Data*) via **Google Health API / Health Connect**.
 
---

**Atualizações futuras**
* **Dashboard na pagina do paciente e opção de envio de dados para o médico.
* **Otimização da pagina do médico com features exclusivos na sessão do médico.
* **Integrações Futuras:** Google Fit API / Apple HealthKit definitivos para exibir dados reais via React Native/Flutter.

---

## 👥 Integrantes 

Este projeto foi desenvolvido pela equipe:

* **Victor Lauria** - *Product Owner (PO), Fullstack Developer & Visual Co-Designer* *(Responsável pela concepção da solução, desenvolvimento técnico da API/Front-end e co-criação da identidade visual/logo)*

* **Rodrigo Farias Lima** - *Business Analyst / Estrategista de Negócios* *(Responsável pela definição do problema, análise de valor e impacto de negócios)*

* **Júlia Leal Benevides Gomes** - *Data & Research Analyst* *(Responsável pelo levantamento de dados, estatísticas e validação do impacto da hiperpersonalização)*

* **Giovanna Rodrigues Pereira** - *Project Manager & Market Analyst* *(Responsável pelo Benchmarking de mercado e estruturação do Roadmap Ágil/Sprints)*

* **Yannie Yshin Kang** - *Brand & UX/UI Designer / Pitch Presentation* *(Responsável pela criação da identidade visual, logo, comunicação visual do painel e estruturação do Pitch Deck)*
