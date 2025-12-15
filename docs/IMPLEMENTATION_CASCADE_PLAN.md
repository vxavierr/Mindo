# Plano de Implementação em Cascata – Mindo 2.0

### 🧭 Visão Geral da Implementação

- **Objetivo principal:** Transformar o protótipo frontend atual (React + Zustand + Mocks) em uma aplicação Full Stack robusta, integrando persistência real (Supabase), inteligência de grafos (Memgraph) e recursos de IA, sem quebrar a experiência de usuário "Premium" já conquistada.
- **Escopo coberto pelo plano:**
  - Frontend (Refinamento e Integração)
  - Backend (FastAPI + Supabase + Memgraph)
  - Infraestrutura (Docker + Deploy)
  - IA (Embeddings + RAG)
- **Premissas importantes:**
  - O código atual do frontend é a "verdade" da UX; o backend deve servir a essa UX, não o contrário.
  - A migração deve ser gradual: primeiro persistência simples, depois inteligência complexa.
  - A performance do Canvas (60fps) é inegociável.
- **Riscos globais e mitigação macro:**
  - **Risco:** Complexidade do Memgraph travar o desenvolvimento. **Mitigação:** Fase 1 foca apenas em Postgres (Supabase) para garantir persistência básica rápida.
  - **Risco:** "Double-write" (escrever em dois bancos) gerar inconsistência. **Mitigação:** Arquitetura orientada a eventos ou "Source of Truth" único (Postgres) com sincronização para Memgraph.

---

### 🧱 Estratégia de Cascata (Efeito Bola de Neve)

1.  **Fase 0 – Base (UX & Contratos):** Estabilizamos o frontend (já feito parcialmente) e definimos os *tipos de dados* exatos que o backend precisará servir. Isso evita reescrever o backend depois.
2.  **Fase 1 – Persistência (Supabase):** Substituímos o `localStorage` pelo Supabase. Isso habilita login, sincronização entre dispositivos e segurança de dados. O app se torna "real".
3.  **Fase 2 – Inteligência (Memgraph & FastAPI):** Com os dados salvos no Supabase, plugamos o Memgraph para análises complexas (recomendações, caminhos). O frontend não muda, apenas fica "mais esperto".
4.  **Fase 3 – IA Generativa:** Com o grafo estruturado, a IA pode ler o contexto real e gerar conteúdo útil, não alucinações.

---

### 🧩 Fase 0 – Fundamentos e Estabilização de UX (Atual)

- **Objetivo central da fase:** Garantir que o frontend (Canvas e Editor) esteja visualmente polido, sem bugs de interação e com estruturas de dados prontas para exportação.
- **Resultados esperados:**
  - UX "Mágica" funcionando (Drag, Drop, Connect, Highlight).
  - Tipagem TypeScript (`types.ts`) refletindo exatamente o modelo de banco de dados desejado.
  - Zero dependência de lógica "hardcoded" dentro dos componentes visuais.
- **Pré-requisitos:** Código atual do repositório.

#### Tarefas detalhadas da Fase 0

1.  **[Tarefa 0.1 – Correções Críticas de UX]** (✅ Concluído)
    - **Contexto:** O usuário precisa confiar na interface antes de conectarmos um backend.
    - **Módulos impactados:** `CanvasPage`, `MindNode`, `Edges`.
    - **Status:** Implementado (Persistência local, Destaque, Conexões).

2.  **[Tarefa 0.2 – Padronização de Tipos de Dados (Data Contracts)]**
    - **Contexto:** O frontend usa tipos (`MindNode`, `EdgeData`) que precisam bater com as tabelas do Supabase.
    - **Módulos impactados:** `types.ts`, `store/slices/*.ts`.
    - **Decisões de design:**
        - Adicionar campos `user_id`, `created_at`, `updated_at` em todas as interfaces.
        - Separar `VisualState` (x, y, zoom) de `DataState` (conteúdo, conexões) para facilitar a persistência parcial.
    - **Passo a passo:**
        1. Revisar `types.ts`.
        2. Criar interfaces `DTO` (Data Transfer Object) para o que será enviado ao backend.
        3. Atualizar `useMindoStore` para usar esses tipos.
    - **Critério de pronto:** O projeto compila sem erros de tipo e os objetos no `console.log` do Zustand parecem prontos para um `POST /nodes`.
    - **Impacto na próxima fase:** Permite criar as tabelas do Supabase copiando exatamente esses tipos.

---

### ♻️ Fase 1 – O "Cérebro" na Nuvem (Supabase Core)

#### [Fase 1 – Persistência e Autenticação]

- **Objetivo central da fase:** Sair do `localStorage` e ir para a nuvem. O usuário deve poder logar e ver seus nós em qualquer lugar.
- **Resultados esperados:**
  - Autenticação (Login/Cadastro) funcionando.
  - Dados salvos no Postgres (Supabase).
  - "Local-First" básico (o app funciona offline e sincroniza quando volta).
- **Itens do Plano de Ajustes:** Backend Base, Banco Relacional.
- **Pré-requisitos:** Fase 0 concluída (Tipos estáveis).

#### Tarefas detalhadas da Fase 1

1.  **[Tarefa 1.1 – Setup do Supabase e Auth]**
    - **Contexto:** Precisamos de um porteiro e um cofre.
    - **Módulos impactados:** `lib/supabase.ts`, `features/auth/*`.
    - **Passo a passo:**
        1. Criar projeto Supabase.
        2. Configurar tabelas: `profiles`, `nodes`, `edges`, `memory_units`.
        3. Implementar `AuthProvider` no React.
        4. Criar telas de Login/Register (usando componentes Shadcn existentes).
    - **Riscos:** RLS (Row Level Security) mal configurado expor dados. **Mitigação:** Testar acesso anônimo e garantir bloqueio.
    - **Critério de pronto:** Usuário consegue criar conta, logar e ver seu perfil.

2.  **[Tarefa 1.2 – Sincronização Zustand <-> Supabase]**
    - **Contexto:** O Zustand é a verdade local. O Supabase é a verdade remota.
    - **Módulos impactados:** `store/middleware/syncMiddleware.ts` (novo).
    - **Decisões de design:**
        - Usar estratégia "Optimistic UI": atualiza a tela na hora, envia pro banco em background.
        - Se falhar, reverte (rollback) e avisa o usuário.
    - **Passo a passo:**
        1. Criar serviços de API (`api/nodes.ts`, `api/edges.ts`).
        2. No `createGraphSlice`, substituir a lógica de apenas `set()` por `set() + api.createNode()`.
        3. Implementar carregamento inicial (`useEffect` que busca dados do Supabase ao iniciar).
    - **Critério de pronto:** Criar nó no Canvas -> Aparece na tabela do Supabase. Recarregar página -> Nó vem do Supabase.
    - **Impacto na próxima fase:** Dados reais no banco permitem que o Memgraph (Fase 2) tenha o que analisar.

---

### ♻️ Fase 2 – Inteligência de Grafos (Memgraph & FastAPI)

#### [Fase 2 – O Diferencial Neural]

- **Objetivo central da fase:** Ativar a "Mente" do Mindo. Sair de um CRUD simples para um sistema que entende conexões.
- **Resultados esperados:**
  - Backend Python (FastAPI) rodando.
  - Memgraph sincronizado com Postgres.
  - Algoritmos de recomendação (PageRank, Comunidades) influenciando a UI.

#### Tarefas detalhadas da Fase 2

1.  **[Tarefa 2.1 – Setup do Backend Python (FastAPI)]**
    - **Contexto:** O Python será o orquestrador da inteligência.
    - **Módulos impactados:** Novo repositório ou pasta `/backend`.
    - **Passo a passo:**
        1. Configurar projeto FastAPI com Poetry/Pip.
        2. Criar Docker Compose com: FastAPI, Memgraph, Redis (fila).
        3. Criar endpoint de "Health Check".
    - **Critério de pronto:** `curl localhost:8000/health` retorna 200 OK.

2.  **[Tarefa 2.2 – Sincronização Postgres -> Memgraph]**
    - **Contexto:** O Memgraph precisa saber o que está no Supabase.
    - **Decisões de design:**
        - Usar **CDC (Change Data Capture)** ou Webhooks do Supabase.
        - Quando um nó é criado no Supabase -> Webhook chama FastAPI -> FastAPI cria nó no Memgraph.
    - **Passo a passo:**
        1. Configurar Database Webhook no Supabase para tabela `nodes` e `edges`.
        2. Criar endpoint `/webhooks/sync` no FastAPI.
        3. Implementar lógica Cypher para inserir no Memgraph.
    - **Critério de pronto:** Criar nó no Frontend -> Aparece no Memgraph Lab (visualizador do banco).

3.  **[Tarefa 2.3 – Algoritmos de Recomendação]**
    - **Contexto:** O app deve sugerir conexões.
    - **Passo a passo:**
        1. Implementar algoritmo de "Link Prediction" (MAGE library do Memgraph).
        2. Expor endpoint `GET /recommendations/{node_id}`.
        3. No Frontend, mostrar sugestões pontilhadas (Socratic Edges sugeridas).
    - **Critério de pronto:** Ao selecionar um nó, o backend sugere 3 nós relacionados.

---

### ♻️ Fase 3 – IA Generativa e RAG (Conteúdo Inteligente)

#### [Fase 3 – O Assistente de Conteúdo]

- **Objetivo central da fase:** Permitir que o Mindo entenda e gere conteúdo. O foco aqui é **texto e semântica**.
- **Resultados esperados:**
  - Busca Semântica (encontrar conceitos pelo sentido).
  - Geração automática de Flashcards (Memory Units) via LLM.
  - Chat com o Grafo (RAG).

#### Tarefas detalhadas da Fase 3

1.  **[Tarefa 3.1 – Pipeline de Embeddings]**
    - **Contexto:** Transformar cada nó em um vetor matemático.
    - **Módulos impactados:** FastAPI (Service: `embedding_service`), Supabase (`pgvector`).
    - **Passo a passo:**
        1. Implementar trigger no Supabase ou hook no FastAPI: ao criar/editar nó -> gerar embedding (OpenAI `text-embedding-3-small`).
        2. Salvar vetor na coluna `embedding` da tabela `nodes`.
        3. Criar índice HNSW no Postgres para busca rápida.
    - **Critério de pronto:** Busca por "animal que late" retorna o nó "Cachorro".

2.  **[Tarefa 3.2 – Fábrica de Flashcards (LLM Pipeline)]**
    - **Contexto:** O usuário escreve, a IA cria o teste.
    - **Passo a passo:**
        1. Integrar cliente Groq (LLaMA 3.1) no FastAPI.
        2. Criar prompt engineering para extrair perguntas/respostas de textos.
        3. Endpoint `POST /generate-cards` recebe texto e retorna JSON estruturado.
    - **Critério de pronto:** Texto de 500 palavras gera 3 flashcards pertinentes em < 2 segundos.

---

### ♻️ Fase 4 – Machine Learning & Personalização (O Cérebro Comportamental)

#### [Fase 4 – Aprendendo sobre o Usuário]

- **Objetivo central da fase:** Implementar a inteligência preditiva que adapta o app ao usuário. Aqui entra o **XGBoost, Random Forest e GNN**.
- **Resultados esperados:**
  - SRS (Repetição Espaçada) adaptativo (não apenas algoritmo fixo, mas preditivo).
  - Recomendação de estudos baseada em comportamento.
  - Descoberta de conexões latentes (GNN).
- **Itens do Plano de Ajustes:** Modelos tabulares, Recomendações, Grafo Inteligente.
- **Pré-requisitos:** Fases 1 e 2 (Dados de uso sendo coletados no Supabase/PostHog).

#### Tarefas detalhadas da Fase 4

1.  **[Tarefa 4.1 – Feature Store e Coleta de Métricas]**
    - **Contexto:** ML precisa de histórico. Precisamos estruturar os dados de "como o usuário estuda".
    - **Módulos impactados:** Supabase (`analytics_logs`), FastAPI.
    - **Decisões de design:**
        - Criar tabela de logs granulares: `tempo_leitura`, `cliques_em_conexoes`, `erros_em_flashcards`, `horario_estudo`.
    - **Passo a passo:**
        1. Instrumentar frontend para enviar eventos de telemetria para o backend.
        2. Criar views no Postgres que agregam esses dados em "Features" (ex: `avg_response_time`, `session_frequency`).
    - **Critério de pronto:** Tabela de features populada com dados reais de uso.

2.  **[Tarefa 4.2 – Modelos Tabulares (XGBoost/Random Forest)]**
    - **Contexto:** Prever a dificuldade de um card e sugerir o próximo passo.
    - **Módulos impactados:** Serviço ML (Python/Scikit-learn).
    - **Passo a passo:**
        1. **Treino Offline:** Exportar dados do Supabase -> Treinar XGBoost para prever `probability_of_recall`.
        2. **Inferência:** Expor modelo via FastAPI (`POST /predict-difficulty`).
        3. **Aplicação:** Ajustar o intervalo do SRS com base na predição (ex: se o modelo diz que o usuário vai esquecer rápido, agendar revisão para amanhã, não semana que vem).
    - **Critério de pronto:** O sistema ajusta datas de revisão de forma diferente para usuários diferentes baseados no histórico.

3.  **[Tarefa 4.3 – Inteligência de Grafo (GNN / PyTorch Geometric)]**
    - **Contexto:** Encontrar conexões que o usuário não viu.
    - **Módulos impactados:** Memgraph, PyTorch Geometric.
    - **Passo a passo:**
        1. Extrair estrutura do grafo do Memgraph.
        2. Treinar GNN (Graph Neural Network) para aprender embeddings estruturais (Link Prediction).
        3. Sugerir arestas: "Muitos usuários conectam 'Redes Neurais' a 'Álgebra Linear'. Você quer conectar?"
    - **Critério de pronto:** Sugestões de conexão aparecem no Canvas com label "Sugerido pela IA".

---

### 🧪 Plano de Qualidade, Testes e Observabilidade

- **Padrões mínimos:**
  - **Frontend:** ESLint rigoroso, sem `any` no TypeScript. Componentes menores que 200 linhas.
  - **Backend:** Type hints em Python (Pydantic). Cobertura de testes de 80% para lógica de negócio.
- **Estratégia de testes:**
  - **Fase 0:** Testes manuais de UX (o "feeling" é o mais importante).
  - **Fase 1:** Testes de integração (Frontend <-> Supabase). Cypress para fluxos críticos (Login -> Criar Nó -> Logout).
  - **Fase 2:** Testes unitários no Python para garantir que a lógica de grafos está correta.
- **Observabilidade:**
  - **Fase 1:** Sentry no Frontend para pegar crashes.
  - **Fase 2:** Logs estruturados no FastAPI (JSON logs). Prometheus para métricas de latência da IA.

---

### 📌 Itens remanescentes e backlog futuro

- **Mobile Nativo (Capacitor):** Deixado para **Fase 4**. O app web responsivo (PWA) atende o início. Focar em mobile nativo agora desviaria recursos da inteligência.
- **Colaboração em Tempo Real (Multiplayer):** Complexidade altíssima. Fica para uma versão 3.0. O foco agora é "Single Player Mode" perfeito.

---

**Implementation Cascade Architect v1.0** - Plano gerado para execução imediata.
