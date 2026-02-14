# **Case Técnico – Processo Seletivo**

Este projeto é uma solução para o controle de ocupação de espaços de ensino, desenvolvida com **NestJS**, **React**, **PostgreSQL** e **Docker**.

---

## **Como Executar o Projeto**

O projeto foi configurado para iniciar rapidamente após o clone, sem necessidade de configurações manuais.

### **Pré-requisitos**
*   **Docker** e **Docker Compose** instalados.

### **Passos para execução**
1.  **Clone o repositório**:
    ```bash
    git clone https://github.com/LucasBarbosa88/case-tecnico.git
    cd case-tecnico
    ```
2.  **Inicie os containers**:
    ```bash
    docker-compose up -d --build
    ```
3.  **Acesse as aplicações**:
    *   **Frontend**: [http://localhost:5173](http://localhost:5173)
    *   **Backend (API)**: [http://localhost:3000/api](http://localhost:3000/api)
    *   **Swagger (Documentação da API)**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

---

## 🔐 **Credenciais de Acesso (Login Inicial)**

O sistema cria um usuário administrador inicial no primeiro boot para fins de teste:

*   **E-mail**: `admin@admin.com`
*   **Senha**: `admin123`

---

## **Problema**

Desenvolver uma aplicação web para **controlar o uso de espaços de ensino**, permitindo análise da taxa de ocupação.  
Um ambiente de ensino pode ser uma **sala de aula**, **laboratório** ou **sala de estudos**.  
A aplicação deve possibilitar o **cadastro de alunos**, que deverão **registrar presença ao entrar e sair do ambiente**.  
A especificidade do projeto (detalhes adicionais, regras de negócio) fica a critério do candidato.

***

## **Pré-requisitos**

*   **Não existe sistema atual na instituição** que forneça estrutura inicial.
*   **Back-end**: Java (Spring) **ou** Node.js.
*   **Front-end**: React **ou** Angular.
*   **Armazenamento**: Implementar **um mecanismo de persistência de dados** (tipo de banco ou tecnologia a critério do candidato).
*   **Funcionalidades obrigatórias**:
    *   CRUD para cadastro de alunos.
    *   Registro de entrada e saída dos ambientes de ensino.
*   **API**:
    *   Deve existir uma API para comunicação entre front-end e back-end.
    *   **A API deve implementar autenticação via token e garantir autorização adequada para que apenas usuários autenticados possam acessar e executar operações permitidas.**

***

## **Critérios de Avaliação**

*   Organização e clareza do código.
*   Uso de boas práticas (estrutura, padrões, segurança).
*   Documentação mínima para execução do projeto.
*   Qualidade da solução proposta (funcionalidade, usabilidade).
*   Criatividade na definição das regras de negócio.

***

## **Como Participar**

1.  **Faça um fork deste repositório.**
2.  Desenvolva sua solução no repositório criado pelo fork.
3.  Certifique-se de que o repositório esteja **público**.
4.  O **último commit** deve ser realizado até **24/11/2025 às 08:00**.
5.  Envie a URL do seu repositório para o e-mail ana.neneve@pucpr.br até o mesmo prazo do commit.
