<p align="center">
  <img src="./.github/logo.png" alt="Logo CINEA" width="250" />
</p>

<p align="center">
  <strong>Descubra. Avalie. Organize. Compartilhe.</strong>
</p>

<p align="center">
  Plataforma mobile de curadoria cinematográfica que conecta descoberta de filmes,
  avaliações, comunidade, Tier Lists e serviços de streaming em uma única experiência.
</p>

---

## 📌 Sobre o Projeto

O **CINEA** é um aplicativo mobile voltado para fãs de cinema e cultura pop.

A plataforma tem como objetivo centralizar diferentes etapas da experiência cinematográfica em um único ambiente, permitindo que o usuário descubra novos filmes, consulte informações sobre títulos, publique avaliações, acompanhe opiniões da comunidade, organize filmes em Tier Lists e encontre os serviços de streaming nos quais cada conteúdo está disponível.

O projeto busca transformar a curadoria pessoal de filmes em uma experiência mais **visual, social, interativa e compartilhável**.

---

## 👥 Integrantes

| Integrante | RM | Função |
|---|---|---|
| Victor Hugo de Paula | RM554787 | **Design** (Identidade Visual, UI/UX e Prototipagem) |
| Otavio Santos de Lima Ferrao | RM556452 | **Product Owner** (Gestão de Produto e Escopo) |
| Felipe Carioba | RM558447 | **Dev Front** (Implementação Mobile React Native) |
| Djalma Andrade | RM555530 | **Dev Back/Mock** (Estruturação de Dados e Lógica) |
| Lucas Rodrigues | RM556323 | **QA** (Garantia de Qualidade e Testes) |
---

## 📄 Documento de Escopo

### O Problema
Atualmente, a experiência de descobrir, avaliar e discutir filmes é fragmentada. Um usuário precisa utilizar múltiplas plataformas para pesquisar títulos, consultar opiniões, descobrir em qual streaming o conteúdo está disponível e usar ferramentas externas ou editores de imagem para criar rankings e Tier Lists. Essa fragmentação quebra a imersão e torna a curadoria pessoal um processo pouco integrado.

### Público-Alvo
* **Jovens Adultos e Cinéfilos:** Usuários ativos em redes sociais que gostam de expressar opiniões, debater cultura pop e organizar listas visuais de seus filmes favoritos.
* **Usuários Casuais de Streaming:** Pessoas que buscam otimizar o tempo na hora de escolher o que assistir, necessitando de um hub central que mostre a disponibilidade do catálogo de seus serviços assinados.

### Proposta de Valor
O CINEA transforma a curadoria pessoal em uma experiência altamente compartilhável e visual. A plataforma centraliza a jornada de ponta a ponta: do momento em que o usuário descobre um filme e verifica onde assisti-lo, até a criação nativa de Tier Lists e interação com a comunidade, eliminando a fricção entre aplicativos.

---

## 🎨 Desenvolvimento de Marca e Identidade Visual

A marca e a interface do **CINEA** foram idealizadas para transmitir a atmosfera imersiva de um cinema clássico. 

* **Nome e Logo:** O nome CINEA remete à essência do cinema com uma sonoridade premium. O conceito do logotipo brinca com o espaço negativo, onde um feixe de luz projetado por um refletor revela a silhueta de um espectador no formato da letra "A", colocando o usuário da comunidade sob os holofotes.
* **Paleta de Cores e Tipografia:** A interface utiliza um fundo degradê em tons de vermelho escuro (simulando cortinas de teatro), contrastando com detalhes funcionais e avaliações em amarelo iluminado.

---

## 📱 Protótipo no Figma

A interface e a identidade visual do **CINEA** foram desenvolvidas e prototipadas utilizando o **Figma**.

O protótipo apresenta as principais telas e fluxos planejados para o aplicativo, permitindo visualizar a experiência do usuário antes da implementação em React Native.

### Telas desenvolvidas

- Tela de Login;
- Tela Inicial;
- Tela de Filme;
- Tela de Avaliações;
- Tela de Avaliação;
- Tela de Pesquisa;
- Tela de Usuário;
- Menu do Usuário;
- Tela de Tier List.

### Acessar o protótipo

<p align="center">
  <a href="https://www.figma.com/design/YkjmqKSaibpFj0yNBNTiOU/CINEA---Mobile-Development-and-IoT?node-id=0-1&p=f">
    <strong>🎨 Visualizar protótipo no Figma</strong>
  </a>
</p>


---

## 💼 Ideia de Venda (Pitch)

### Modelo de Negócios
Para garantir viabilidade e rápida adoção, o CINEA operará em um modelo híbrido:
1. **Freemium:** Acesso gratuito às ferramentas centrais da comunidade (avaliar filmes, buscar streamings, criar um número limitado de Tier Lists).
2. **Assinatura Premium:** Plano mensal voltado a *heavy users*, liberando Tier Lists ilimitadas, customização avançada de perfil e exportação em alta resolução sem anúncios.
3. **Afiliados (B2B):** Monetização via comissionamento (CPA) ao redirecionar usuários para a assinatura de serviços de streaming parceiros.

### Diferencial Competitivo
Enquanto as plataformas do mercado atual se limitam a listas textuais e notas numéricas, o CINEA integra a criação de **Tier Lists Nativas**. Isso gera um formato visual dinâmico, pronto para exportação e desenhado para o compartilhamento orgânico em redes sociais, mantendo o usuário engajado sem precisar de softwares de terceiros.

---

## ⚙️ Como Rodar o Projeto

O desenvolvimento mobile será conduzido utilizando **React Native** com **Expo**, garantindo a aplicação fluida dos tokens de design através de uma biblioteca de componentes reutilizáveis.

**Instruções Básicas para rodar o projeto:**
```bash
# Clone o repositório
git clone https://github.com/djxlma/Cinea_App

# Acesse o diretório
cd cinea

# Instale as dependências
npm install

# Inicie a aplicação no Expo
npx expo start
```

### Estrutura de Pastas
O projeto segue a arquitetura orientada a Design System:
* `/src/tokens/`: Variáveis de cores, espaçamento e tipografia exportadas do Figma.
* `/src/components/`: Componentes reutilizáveis (botões, cards).
* `/src/screens/`: Telas completas da aplicação.
* `/src/routes/`: Configuração de navegação.

---

> O protótipo representa a identidade visual e os fluxos iniciais do CINEA e poderá sofrer alterações durante o desenvolvimento da aplicação.

---
