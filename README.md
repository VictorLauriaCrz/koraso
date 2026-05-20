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
Atualmente, o projeto possui uma API funcional que simula o recebimento dos dados do smartwatch (POST) e uma interface Web para o médico visualizar os gráficos do paciente em tempo real (GET).

### 🛠️ Tecnologias Utilizadas
* **Back-end:** Node.js com Express.js e CORS.
* **Front-end Web (Painel do Médico):** HTML5, CSS3 e Vanilla JavaScript (Fetch API).

**Atualizações futuras**
* **Simulação Mobile:** Postman (Testes de integração de API).
* **Integrações Futuras:** Google Fit API / Apple HealthKit via React Native/Flutter.

---

## 👥 Integrantes 

Este projeto foi desenvolvido pela equipe:

* **Victor Lauria** - *Product Owner (PO), Fullstack Developer & Visual Co-Designer* *(Responsável pela concepção da solução, desenvolvimento técnico da API/Front-end e co-criação da identidade visual/logo)*

* **Rodrigo Farias Lima** - *Business Analyst / Estrategista de Negócios* *(Responsável pela definição do problema, análise de valor e impacto de negócios)*

* **Júlia Leal Benevides Gomes** - *Data & Research Analyst* *(Responsável pelo levantamento de dados, estatísticas e validação do impacto da hiperpersonalização)*

* **Giovanna Rodrigues Pereira** - *Project Manager & Market Analyst* *(Responsável pelo Benchmarking de mercado e estruturação do Roadmap Ágil/Sprints)*

* **Yannie Yshin Kang** - *Brand & UX/UI Designer / Pitch Presentation* *(Responsável pela criação da identidade visual, logo, comunicação visual do painel e estruturação do Pitch Deck)*
