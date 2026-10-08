# Plano de Testes — CINEA CP5

## 1. Objetivo

Este documento tem como objetivo validar manualmente os fluxos principais do protótipo funcional do CP5 do app CINEA. O foco é confirmar que a autenticação, o perfil, o catálogo, as reviews, as Tier Lists, a navegação e a persistência real no Supabase funcionam de forma consistente no estado atual da aplicação.

Os testes descritos abaixo refletem apenas funcionalidades realmente presentes no app e não incluem recursos inexistentes ou inventados.

## 2. Ambiente de teste

- Sistema operacional: Windows 11
- Framework: Expo SDK 54
- Stack principal: React Native + TypeScript
- Emulador: Android Studio Emulator / Pixel 6
- Backend: Supabase
- Execução: Expo / Metro

Comandos principais:

- `npm install`
- `npx expo start`
- no Windows: `npx.cmd expo start`
- validação TypeScript: `npx.cmd tsc --noEmit`

Não devem ser usados dados reais de produção nem credenciais sensíveis durante os testes.

## 3. Casos de teste

A tabela abaixo organiza os cenários de teste principais do CP5. O status inicial é `PENDENTE` e deve ser atualizado para `VALIDADO` somente quando o fluxo for efetivamente testado durante o desenvolvimento.

| ID | Funcionalidade | Pré-condição | Passos | Resultado esperado | Status |
|---|---|---|---|---|---|
| AUTH-01 | Cadastro com dados válidos | App aberto em tela de cadastro | 1. Informar email válido, senha válida e confirmar cadastro. 2. Concluir o fluxo. | Usuário é criado no Supabase e redirecionado para a aplicação autenticada. | VALIDADO |
| AUTH-02 | Cadastro com email inválido | Tela de cadastro aberta | 1. Informar email mal formatado. 2. Tentar cadastrar. | Sistema rejeita o cadastro e indica erro de validação. | PENDENTE |
| AUTH-03 | Cadastro com senha inválida/curta | Tela de cadastro aberta | 1. Informar senha abaixo do mínimo aceito. 2. Tentar cadastrar. | Sistema bloqueia cadastro e mostra mensagem adequada. | PENDENTE |
| AUTH-04 | Login com usuário válido | Usuário já cadastrado | 1. Acessar tela de login. 2. Informar email e senha corretos. | Login realizado com sucesso e navegação para Home. | VALIDADO |
| AUTH-05 | Login com senha incorreta | Usuário cadastrado | 1. Informar senha errada. 2. Tentar entrar. | Login é negado e erro é exibido. | PENDENTE |
| AUTH-06 | Logout | Usuário autenticado | 1. Acessar menu de usuário. 2. Executar logout. | Sessão termina e app retorna para fluxo de autenticação. | VALIDADO |
| AUTH-07 | Persistência da sessão após reiniciar app | Usuário já logado | 1. Fechar app. 2. Abrir novamente. | Usuário continua autenticado e entra direto na aplicação. | VALIDADO |
| AUTH-08 | Perfil criado automaticamente após cadastro | Cadastro novo realizado | 1. Realizar cadastro com sucesso. 2. Verificar Profile. | Perfil do usuário é criado automaticamente no Supabase. | VALIDADO |
| PROF-01 | Profile sem dados personalizados mostra fallback | Usuário autenticado sem avatar ou dados prontos | 1. Abrir Profile. | App mostra fallback visual do usuário/guest quando não há dados personalizados. | VALIDADO |
| PROF-02 | Profile carrega nome/username real | Usuário autenticado com dados reais | 1. Abrir Profile. | Nome e username exibidos conforme dados do perfil no Supabase. | VALIDADO |
| PROF-03 | Usuário sem avatar vê guest avatar | Perfil sem avatar | 1. Abrir Profile. 2. Observar avatar. | Exibe avatar genérico de guest. | VALIDADO |
| PROF-04 | Selecionar avatar da galeria | Usuário autenticado | 1. Abrir Profile. 2. Escolher avatar via galeria. | Seleção funciona e o app avança para upload. | VALIDADO |
| PROF-05 | Avatar enviado ao Supabase Storage | Usuário autenticado | 1. Selecionar avatar. 2. Confirmar upload. | Imagem é armazenada no bucket privado de avatar do usuário. | VALIDADO |
| PROF-06 | Avatar persiste após logout/login | Avatar já carregado | 1. Fazer logout. 2. Logar novamente. | Avatar continua visível após o re-login. | VALIDADO |
| PROF-07 | Avatar aparece em Profile | Usuário com avatar | 1. Abrir Profile. | Avatar real aparece no perfil do usuário. | VALIDADO |
| PROF-08 | Avatar aparece em Home | Usuário com avatar | 1. Abrir Home. | Avatar aparece no topo da tela principal. | VALIDADO |
| PROF-09 | Avatar aparece no UserMenu | Usuário com avatar | 1. Acessar UserMenu. | Avatar real é exibido no menu do usuário. | VALIDADO |
| HOME-01 | Home carrega catálogo local | App autenticado | 1. Abrir Home. | Catálogo com os 4 filmes aparece corretamente. | VALIDADO |
| HOME-02 | Posters reais aparecem | Catálogo carregado | 1. Abrir Home. | Posters reais dos filmes são exibidos em tela. | VALIDADO |
| HOME-03 | Clique em filme abre Movie Details correto | Home carregada | 1. Selecionar um filme da lista. 2. Confirmar navegação. | Tela de detalhes abre com o filme correto. | VALIDADO |
| SEARCH-01 | Busca vazia mostra todos os filmes | Usuário autenticado | 1. Abrir Search. 2. Deixar campo vazio. | Lista completa de filmes aparece. | VALIDADO |
| SEARCH-02 | Busca parcial por “duna” | Search acessado | 1. Digitar “duna”. | Filme relacionado aparece nos resultados. | VALIDADO |
| SEARCH-03 | Busca parcial por “oppen” | Search acessado | 1. Digitar “oppen”. | Resultado correto para Oppenheimer aparece. | VALIDADO |
| SEARCH-04 | Busca parcial por “chihiro” | Search acessado | 1. Digitar “chihiro”. | Resultado correto para A Viagem de Chihiro aparece. | VALIDADO |
| SEARCH-05 | Busca parcial por “para” | Search acessado | 1. Digitar “para”. | Resultado correto para Parasita aparece. | VALIDADO |
| SEARCH-06 | Busca sem resultado mostra estado vazio | Search acessado | 1. Digitar termo inexistente. | App mostra estado vazio ou sem resultados. | VALIDADO |
| SEARCH-07 | Resultado mantém poster real e navegação correta | Search com resultado | 1. Buscar um filme. 2. Abrir resultado. | Poster e navegação continuam corretos. | VALIDADO |
| MOVIE-01 | Detalhes do filme correto | Usuário autenticado | 1. Abrir Movie Details para um filme. | Informações exibidas correspondem ao filme selecionado. | VALIDADO |
| MOVIE-02 | Poster correto | Movie Details aberto | 1. Conferir poster no topo da tela. | Poster mostrado é o correto para o filme. | VALIDADO |
| MOVIE-03 | Rating exibido corretamente | Movie Details aberto | 1. Observar áreas de avaliação. | Rating do filme aparece de forma consistente. | VALIDADO |
| MOVIE-04 | Botão Avaliações abre avaliações do filme correto | Movie Details aberto | 1. Acessar seção de avaliações. | Tela de reviews abre com o filme selecionado. | VALIDADO |
| REV-01 | Filme sem reviews mostra estado vazio | Filme sem avaliação pública | 1. Abrir reviews do filme. | App mostra estado vazio ou textos correspondentes sem dados. | VALIDADO |
| REV-02 | Criar review com nota e comentário | Usuário autenticado e filme selecionado | 1. Acessar criar review. 2. Selecionar nota. 3. Digitar comentário. 4. Salvar. | Review é criada com sucesso. | VALIDADO |
| REV-03 | Estrelas selecionadas mostram feedback visual | Fluxo de criação de review | 1. Selecionar estrelas. | Feedback visual da nota é exibido corretamente. | VALIDADO |
| REV-04 | Review é persistida no Supabase | Usuário autenticado | 1. Criar review. 2. Verificar banco. | Registro aparece em `public.reviews`. | VALIDADO |
| REV-05 | Review continua após reiniciar app | Review já criada | 1. Reiniciar app. 2. Verificar review no fluxo correspondente. | Review continua disponível após reinício. | VALIDADO |
| REV-06 | Review aparece nas avaliações do filme | Usuário autenticado | 1. Verificar tela de avaliações do filme. | Avaliação do usuário aparece corretamente no filme. | VALIDADO |
| REV-07 | Review aparece em “Minhas avaliações” | Usuário autenticado | 1. Acessar “Minhas avaliações”. | Review do usuário aparece corretamente no listagem. | VALIDADO |
| REV-08 | Filme avaliado aparece em “Avaliados” no Profile | Usuário com reviews | 1. Acessar Profile. 2. Verificar seção de filmes avaliados. | Filmes com avaliação aparecem em “Avaliados”. | VALIDADO |
| REV-09 | Usuário sem reviews vê estado vazio em “Minhas avaliações” | Usuário sem avaliações | 1. Acessar “Minhas avaliações”. | Estado vazio é exibido sem erros. | VALIDADO |
| REV-10 | Fluxo UserMenu -> Fazer uma avaliação -> escolher filme -> publicar | Usuário autenticado | 1. Acessar UserMenu. 2. Escolher opção para avaliar. 3. Selecionar filme. 4. Publicar review. | Fluxo completo funciona sem bloqueios de navegação. | VALIDADO |
| TIER-01 | Usuário sem Tier Lists vê estado vazio | Usuário sem listas | 1. Acessar Tier Lists. | Estado vazio é exibido de forma clara. | VALIDADO |
| TIER-02 | Criar primeira Tier List | Usuário autenticado | 1. Acessar criação de lista. 2. Definir título e descrição. 3. Salvar. | primeira Tier List é criada com sucesso. | VALIDADO |
| TIER-03 | Adicionar filmes em S/A/B/C/D | Tier List em edição | 1. Incluir vários filmes. 2. Associar ranks. | Sistema mantém os filmes e suas posições/ranks corretamente. | VALIDADO |
| TIER-04 | Persistência dos itens no Supabase | Tier List criada | 1. Salvar lista com itens. 2. Verificar banco. | Os itens aparecem na tabela de tier list items. | VALIDADO |
| TIER-05 | Tier List continua após reiniciar app | Lista criada e salva | 1. Reiniciar app. 2. Abrir Tier Lists. | Lista e itens continuam presentes. | VALIDADO |
| TIER-06 | Criar segunda Tier List | Usuário autenticado | 1. Criar uma nova lista. | Segunda lista é criada e exibida junto da primeira. | VALIDADO |
| TIER-07 | Alternar entre múltiplas Tier Lists | Usuário com mais de uma lista | 1. Abrir lista 1. 2. Alternar para lista 2. | Lista correta aparece em cada alternância. | VALIDADO |
| TIER-08 | Editar Tier List | Lista existente | 1. Abrir lista. 2. Alterar título, descrição ou itens. 3. Salvar. | Edição é aplicada com sucesso. | VALIDADO |
| TIER-09 | Excluir Tier List e cancelar confirmação | Lista existente | 1. Tentar excluir. 2. Cancelar confirmação. | Lista permanece intacta. | VALIDADO |
| TIER-10 | Excluir Tier List confirmando | Lista existente | 1. Tentar excluir. 2. Confirmar ação. | Lista é removida corretamente. | VALIDADO |
| TIER-11 | Excluir uma lista quando existem outras | Usuário com múltiplas listas | 1. Excluir uma lista. 2. Observar restante. | Lista removida e demais listas continuam funcionando. | VALIDADO |
| TIER-12 | Excluir última Tier List retorna ao estado vazio | Usuário com uma única lista | 1. Excluir a última lista. | App retorna ao estado vazio sem erro. | VALIDADO |
| TIER-13 | Posters do board correspondem aos filmes corretos | Lista criada com itens | 1. Abrir board da lista. | Posters e filmes exibidos correspondem ao conteúdo da lista. | VALIDADO |
| SEC-01 | Usuário consegue criar review própria | Usuário autenticado | 1. Criar review com user_id próprio. | Operação é permitida pela política do Supabase. | VALIDADO |
| SEC-02 | Usuário não consegue criar review usando user_id de outro usuário | Usuário autenticado em outra conta | 1. Tentar forçar user_id de outro usuário. | Operação é bloqueada pela RLS. | VALIDADO |
| SEC-03 | Usuário consegue criar Tier List própria | Usuário autenticado | 1. Criar lista vinculada ao próprio user_id. | Operação é permitida pela política. | VALIDADO |
| SEC-04 | Usuário não consegue criar Tier List usando user_id de outro usuário | Usuário autenticado em outra conta | 1. Tentar forçar user_id terceiro. | Operação é bloqueada pela RLS. | VALIDADO |
| SEC-05 | Usuário não acessa Tier List de outro usuário | Usuário autenticado | 1. Tentar acessar lista de outro usuário via fluxo ou query. | Sistema bloqueia acesso e não retorna dados de terceiros. | VALIDADO |
| SEC-06 | RLS está habilitado nas 4 tabelas | Supabase com esquema ativo | 1. Verificar tabelas: profiles, reviews, tier_lists e tier_list_items. | RLS aparece habilitado em todas as tabelas. | VALIDADO |
| SEC-07 | Avatar só pode ser gravado na pasta do próprio user_id | Usuário autenticado | 1. Tentar gravar avatar em outra pasta do Storage. | Upload é bloqueado pela policy do bucket. | VALIDADO |
| NAV-01 | Login -> Home | Usuário logado | 1. Iniciar fluxo de login. 2. Entrar em Home. | Navegação correta. | VALIDADO |
| NAV-02 | Home -> Movie Details | Home acessada | 1. Clicar em um filme. | Tela de detalhes aberta com o item correto. | VALIDADO |
| NAV-03 | Movie Details -> Reviews | Filme selecionado | 1. Abrir avaliações do filme. | Navegação para a tela de reviews funciona corretamente. | VALIDADO |
| NAV-04 | UserMenu -> Profile | Usuário autenticado | 1. Abrir UserMenu. 2. Entrar em Profile. | Navegação correta para o perfil. | VALIDADO |
| NAV-05 | UserMenu -> Minhas avaliações | Usuário autenticado | 1. Abrir UserMenu. 2. Acessar Minhas avaliações. | Fluxo abre listagem correta de avaliações. | VALIDADO |
| NAV-06 | UserMenu -> Escolher filme para avaliar | Usuário autenticado | 1. Abrir UserMenu. 2. Selecionar opção de avaliação. | Tela de seleção de filme abre. | VALIDADO |
| NAV-07 | UserMenu -> Tier Lists | Usuário autenticado | 1. Abrir UserMenu. 2. Acessar Tier Lists. | Navegação correta para a área de listas. | VALIDADO |
| NAV-08 | Logout -> Login | Usuário autenticado | 1. Executar logout. 2. Confirmar retorno ao fluxo de login. | Fluxo conclui corretamente. | VALIDADO |

## 4. Checklist de regressão antes da entrega

- [ ] app inicia sem erro
- [ ] login funciona
- [ ] logout funciona
- [ ] avatar persiste
- [ ] Home abre
- [ ] Search funciona
- [ ] Movie Details abre
- [ ] criar review funciona
- [ ] review persiste
- [ ] criar Tier List funciona
- [ ] editar Tier List funciona
- [ ] excluir Tier List funciona
- [ ] múltiplas Tier Lists funcionam
- [ ] Profile reflete reviews reais
- [ ] nenhuma tela principal mostra mock incorreto
- [ ] nenhum erro crítico aparece no Metro
- [ ] `npx.cmd tsc --noEmit` passa

## 5. Evidências recomendadas

Para a entrega do CP5, recomenda-se capturar evidências visuais e de banco das principais telas e integrações. A lista abaixo representa o mínimo útil para validação e apresentação:

- Login
- Cadastro
- Home
- Search
- Movie Details
- Reviews
- Criar Review
- Minhas avaliações
- Profile
- avatar real
- Tier Lists
- criação/edição Tier List
- Supabase reviews
- Supabase tier_lists
- Supabase Storage avatars
- RLS policies
- execução no Android Emulator

Não há necessidade de inserir imagens neste documento; apenas registrar o que deve ser capturado.

## 6. Limitações conhecidas do CP5

- catálogo de filmes ainda é local/mockado, apesar de estar integrado visualmente ao app;
- integração com API externa, como TMDB, não faz parte do CP5 atual;
- algumas funções de menu e configurações ainda não estão implementadas em nível completo;
- APK final fica para o CP6;
- os testes do CP5 são predominantemente manuais e documentados.

Essas limitações são parte do escopo atual e não devem ser tratadas como bugs do protótipo funcional.

## 7. Observação sobre validação

Os casos marcados como `VALIDADO` nesta documentação refletem fluxos que foram efetivamente exercitados durante o desenvolvimento do CP5 e confirmados no estado atual do app. Caso algum cenário seja reexecutado em outra máquina ou ambiente, a validação deve ser revista antes de ser declarado como concluído.
