# EzGestor - Sistema de Gestão Empresarial

## Universidade Federal do Tocantins (UFT)

**Curso:** Ciência da Computação

**Disciplina:** Projeto de Sistemas

**Semestre:** 2º Semestre de 2025

**Professor:** Edeilson Milhomem da Silva

## 👥 Integrantes do Time

|Nome|Github|
|---|---|
|Douglas Alves da Cruz|[douglasalvesc](https://github.com/douglasalvesc)|
|Italo Henrik Batista Reis|[italohreis](https://github.com/italohreis)|
|Luiz Felipe da Paz Leal|[arkfx](https://github.com/arkfx)|
|Marcos Freire de Melo|[MarcosFrMelo](https://github.com/MarcosFrMelo)|
|Ruam Marcos Maciel dos Santos|[RuamMarcos](https://github.com/RuamMarcos)|


## 📖 Sobre o Projeto

|O **EzGestor** é uma solução de gestão empresarial integrada, projetada para atender às necessidades de micro, pequenas e médias empresas. A plataforma, acessível via web e aplicativo móvel, centraliza e automatiza processos essenciais como gestão de vendas, controle de estoque e fluxo de caixa, fornecendo aos gestores uma visão completa e em tempo real do negócio para impulsionar o crescimento e a competitividade no mercado.

<img width="612" height="612" alt="Logo - EzGestor" src="https://github.com/user-attachments/assets/f7da447a-2494-4b76-ae00-b3f73c82c25c" />

---

## 🚀 Como Rodar o Projeto

### Requisitos

- **Docker** e **Docker Compose** (recomendado para facilidade)
- Ou manualmente: **Python 3.10+**, **Node.js 18+** e **npm**

### Opção 1: Executar com Docker (Recomendado)

```bash
# Clone o repositório
git clone https://github.com/RuamMarcos/ezgestor.git
cd ezgestor

# Inicie os containers
docker-compose up -d

# O sistema estará disponível em:
# - Frontend Web: http://localhost:5173
# - Backend: http://localhost:8000
```

### Opção 2: Executar Manualmente

#### Backend (Django)

```bash
cd backend

# Crie um ambiente virtual
python -m venv venv
venv\Scripts\activate  # Windows
# ou
source venv/bin/activate  # Linux/Mac

# Instale as dependências
pip install -r requirements.txt

# Execute as migrações
python manage.py migrate

# Inicie o servidor
python manage.py runserver
```

#### Frontend (React + Vite)

```bash
cd frontend

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev

# Acesse: http://localhost:5173
```

#### Mobile (React Native + Expo)

```bash
cd mobile

# Instale as dependências
npm install

# Inicie o Expo
npm start

# Escaneie o QR code com o app Expo no seu celular
```

---

## 📚 Documentação Completa

Para informações detalhadas sobre Requisitos Funcionais, User Stories, Modelagem, Planejamento de Iterações, Diagramas de Engenharia e muito mais, acesse:

### 🔗 **[Wiki do Projeto](https://github.com/RuamMarcos/ezgestor/wiki)**

