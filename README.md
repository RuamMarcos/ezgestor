
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

|O **EzGestor** é uma solução de gestão empresarial integrada, projetada para atender às necessidades de micro, pequenas e médias empresas. A plataforma, acessível via web e aplicativo móvel, centraliza e automatiza processos essenciais como gestão de vendas, controle de estoque e fluxo de caixa, fornecendo aos gestores uma visão completa e em tempo real do negócio para impulsionar o crescimento e a competitividade no mercado.|![logo](https://github.com/user-attachments/assets/043b5e6c-d9f6-410f-be7f-853a23c47013)|

## 🧾 Requisitos Funcionais

Os Requisitos Funcionais são especificações claras e detalhadas sobre o que o sistema deve realizar. Eles descrevem, de forma objetiva, as ações, processos e comportamentos que a aplicação precisa executar para atender às necessidades do usuário, eles estão organizados logo a seguir.

|Codigo | Título | Descrição |
|-------|--------|-----------|
|RF01| Autenticação de Usuário | O sistema deve permitir que novos usuários se cadastrem e que usuários existentes façam login de forma segura.|
|RF02|Dashboard Central|O sistema deve apresentar um dashboard principal com indicadores e métricas essenciais do negócio em tempo real.|
|RF03|Gestão de Vendas|O sistema deve permitir o registro de novas vendas (PDV - Ponto de Venda) e orçamentos, integrando-os aos demais módulos.|
|RF04|Controle de Estoque|O sistema deve gerenciar o catálogo de produtos e realizar a baixa automática do estoque após cada venda.|
|RF05|Gestão Financeira|O sistema deve controlar o fluxo de caixa, registrando contas a pagar e a receber e permitindo a conciliação bancária.|
|RF06|Emissão de Nota Fiscal Eletrônica (NF-e)|O sistema deve ser integrado para a emissão de Notas Fiscais Eletrônicas (NF-e) de forma simplificada.|
|RF07|Relatórios e Análises|O sistema deve gerar relatórios detalhados sobre vendas, finanças e estoque para apoiar a tomada de decisões.|
|RF08|Gerenciamento de Múltiplos Usuários e Permissões|O sistema deve permitir que o administrador cadastre múltiplos usuários (funcionários) e defina níveis de acesso para cada um.|
|RF09|Acesso via Aplicativo Móvel|O sistema deve ser totalmente funcional em um aplicativo móvel (iOS e Android), permitindo a gestão do negócio de qualquer lugar.|
|RF10|Configurações da Conta e da Empresa|O sistema deve permitir que o usuário configure informações da sua empresa, como logo, endereço, dados fiscais e preferências de operação.|
|RF11|Configurações do PDV (Ponto de Venda)|O sistema deve permitir que o administrador configure quais formas de pagamento são aceitas no PDV (ponto de venda), por meio de toggles na tela de configurações gerais, para que o PDV apresente apenas as opções selecionadas ao operador.|
|RF12|Sistema de Notificações e Alertas|O sistema deve enviar notificações proativas sobre eventos importantes, como estoque baixo, metas de vendas atingidas.|
|RF13|Finalização de Cadastro e Pagamento|O sistema deve permitir que o usuário finalize o cadastro e assine um plano diretamente na tela de pagamento, oferecendo opções como Cartão, PIX e Boleto, l.|
|RF14|Gerenciamento da Assinatura do Usuário| O sistema deve permitir que o usuário visualize e gerencie sua assinatura, altere o plano, atualize dados de pagamento e acesse o histórico de faturas.|


### 🎥 **User Stories**

As User Stories são descrições breves e objetivas de funcionalidades do sistema, redigidas a partir da perspectiva do usuário. Seu propósito é esclarecer qual é a necessidade do usuário e o motivo pelo qual determinada funcionalidade é importante, elas estão apresentadas logo a seguir.

|Título|Descrição|
|------|---------|
|RF01: Autenticação de Usuário|**Eu, como novo administrador,** desejo me cadastrar na plataforma de forma rápida e, posteriormente, acessar minha conta com segurança, **para** começar a utilizar o sistema e organizar meu negócio o mais rápido possível.|
|RF02: Dashboard Central|**Eu, como administrador,** desejo, ao fazer login, visualizar um painel central com os principais indicadores do meu negócio, como faturamento e estoque baixo, **para** ter uma noção instantânea da saúde da minha empresa e tomar decisões rápidas.|
|RF03: Gestão de Vendas|**Eu, como funcionário,** desejo registrar uma nova venda através de uma tela de Ponto de Venda (PDV) ágil e intuitiva, **para** otimizar o atendimento ao cliente e garantir que todas as transações sejam corretamente lançadas no sistema.|
|RF04: Controle de Estoque|**Eu, como funcionário,** desejo que o sistema atualize automaticamente a quantidade de um produto em estoque após cada venda, **para** garantir que nosso inventário esteja sempre preciso e evitar a venda de itens indisponíveis.|
|RF05: Gestão Financeira|**Eu, como administrador,** desejo lançar e gerenciar as contas a pagar e a receber da minha empresa em um local centralizado, **para** manter o controle do fluxo de caixa e garantir a saúde financeira do negócio.|
|RF06: Emissão de Nota Fiscal Eletrônica (NF-e)|**Eu, como administrador,** desejo emitir uma Nota Fiscal Eletrônica (NF-e) a partir de uma venda já registrada, sem precisar redigitar os dados, **para** cumprir com as obrigações fiscais de maneira eficiente e sem erros.|
|RF07: Relatórios e Análises|**Eu, como administrador,** desejo gerar relatórios detalhados de vendas por período, **para** analisar o desempenho da minha empresa, identificar os produtos mais vendidos e planejar estratégias futuras.|
|RF08: Gerenciamento de Múltiplos Usuários e Permissões|**Eu, como administrador,** desejo cadastrar meus funcionários no sistema e limitar o acesso deles apenas aos módulos de Vendas e Estoque, **para** delegar tarefas operacionais com segurança, sem expor dados financeiros sensíveis.|
|RF09: Acesso via Aplicativo Móvel|**Eu, como usuário (administrador ou funcionário),** desejo acessar as funcionalidades essenciais do sistema através de um aplicativo no meu celular, **para** poder gerenciar o negócio ou realizar uma venda mesmo estando longe do computador.|
|RF10: Configurações da Conta e da Empresa|**Eu, como administrador,** desejo configurar os dados da minha empresa, como logotipo e endereço, em uma área de configurações, **para** personalizar documentos e garantir que todas as informações oficiais estejam corretas.|
|RF11: Configurações do PDV (Ponto de Venda)|**Eu, como administrador,** desejo poder ativar e desativar as formas de pagamento aceitas na minha loja (ex: PIX, Cartão, Dinheiro), **para** garantir que o Ponto de Venda mostre aos meus funcionários apenas as opções que realmente oferecemos.|
|RF12: Sistema de Notificações e Alertas|**Eu, como administrador,** desejo receber um alerta automático quando um produto atingir um nível de estoque baixo, **para** que eu possa tomar uma ação de compra proativa e evitar a falta de mercadoria.|
|RF13: Finalização de Cadastro e Pagamento|**Eu, como novo administrador,** desejo poder escolher o plano e realizar o pagamento da assinatura de forma segura durante o processo de cadastro, **para** ativar minha conta e obter acesso completo ao sistema sem interrupções.|
|RF14: Gerenciamento da Assinatura do Usuário|**Eu, como administrador,** desejo acessar uma página onde eu possa ver meu plano atual, meu histórico de faturas e atualizar meus dados de pagamento, **para** ter total controle sobre minha assinatura da plataforma.|

---

## Iterações

### Iteração 1️⃣ - Fundação, Cadastro e Acesso

-   **Valor**: Permitir que um novo usuário cadastre sua empresa, escolha o plano, faça login e acesse o sistema, estabelecendo o núcleo de autenticação e contas da plataforma.
    
-   **Objetivo**: Como novo empreendedor, desejo realizar meu cadastro completo na plataforma, incluindo a seleção do plano, para ter acesso inicial ao sistema e começar a organizar meu negócio.
    
**Requisitos**:

-   **RF01 – Autenticação de Usuário**: Implementar as telas e a lógica para cadastro e login de novos usuários.
    
-   **RF13 – Finalização de Cadastro e Pagamento**: Desenvolver o fluxo para o usuário selecionar um plano e informar os dados de pagamento para ativar a assinatura.
    
-   **RF10 – Configurações da Conta e da Empresa**: Garantir que os dados da empresa informados no cadastro sejam salvos e estruturados.
    
-   **RF02 – Dashboard Central**: Apresentar a tela principal (dashboard) estática que o usuário visualizará após o login.