# Plano de Implementação em Cascata – Mindo 2.0

> **Última atualização:** 17/12/2024 (Auditoria Completa)

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

### 🧩 Fase 0 – Fundamentos e Estabilização de UX

> **Status:** ✅ CONCLUÍDA (com exceções documentadas)

- **Objetivo central da fase:** Garantir que o frontend (Canvas e Editor) esteja visualmente polido, sem bugs de interação e com estruturas de dados prontas para exportação.
- **Resultados esperados:**
  - UX "Mágica" funcionando (Drag, Drop, Connect, Highlight).
  - Tipagem TypeScript (`types.ts`) refletindo exatamente o modelo de banco de dados desejado.
  - Zero dependência de lógica "hardcoded" dentro dos componentes visuais.
- **Pré-requisitos:** Código atual do repositório.

#### Tarefas detalhadas da Fase 0

1.  **[Tarefa 0.1 – Correções Críticas de UX]** ✅ Concluído
    - **Contexto:** O usuário precisa confiar na interface antes de conectarmos um backend.
    - **Módulos impactados:** `CanvasPage`, `MindNode`, `Edges`.
    - **Status:** Implementado (Persistência local, Destaque, Conexões).

2.  **[Tarefa 0.2 – Padronização de Tipos de Dados (Data Contracts)]** ✅ Concluído
    - **Contexto:** O frontend usa tipos (`MindNode`, `EdgeData`) que precisam bater com as tabelas do Supabase.
    - **Módulos impactados:** `types.ts`, `store/slices/*.ts`.
    - **Decisões de design:**
        - Campos `user_id`, `created_at`, `updated_at` em todas as interfaces ✅
        - Interfaces `DTO` (Data Transfer Object) criadas: `NodeDTO`, `EdgeDTO`, `BaseEntity`
        - Tipos de status: `'new' | 'learning' | 'review_due' | 'mastered' | 'inbox'`
    - **Status:** Tipos alinhados com schema SQL (`features/canvas/types.ts`)

3.  **[Tarefa 0.3 – Arquitetura Polimórfica de Nós]** ✅ Concluído (Shadow Feature)
    - **Contexto:** Suporte a múltiplos tipos de conteúdo além de texto.
    - **Módulos impactados:** `features/canvas/components/nodes/*`, `supabase/schema.sql`
    - **Implementação:**
        - 5 tipos de nós: `text`, `code`, `video`, `image`, `pdf`
        - JSONB para dados polimórficos: campo `data` na tabela `nodes`
        - Componentes especializados: `TextNode`, `CodeNode`, `VideoNode`, `ImageNode`, `PdfNode`
    - **Status:** Funcional no frontend e schema SQL preparado.

4.  **[Tarefa 0.4 – Sistema LOD (Level of Detail)]** ⚠️ NÃO UTILIZADO
    - **Contexto:** Otimização de renderização por zoom.
    - **Módulos criados:** `NodeLODBlob.tsx`, `NodeLODSimple.tsx`, `NodeLODDetail.tsx`
    - **Status:** Código existe mas **não está sendo utilizado**. Considerar remoção ou implementação futura.
    - **Decisão:** Revisar na Fase 1.5 se necessário para performance.

5.  **[Tarefa 0.5 – D3-Force para Layout Tipo Obsidian]** 📋 BACKLOG
    - **Contexto:** Alternativa ao Dagre para visualização orgânica estilo "Graph View" do Obsidian.
    - **Módulos:** Importado em `createGraphSlice.ts` (`d3-force`)
    - **Status:** Dependência instalada, lógica não implementada.
    - **Uso futuro:** Considerar para um modo "Graph View" alternativo ao layout Dagre.

---

### ♻️ Fase 1 – O "Cérebro" na Nuvem (Supabase Core)

> **Status:** ⏳ EM ANDAMENTO (~85% concluída)

#### [Fase 1 – Persistência e Autenticação]

- **Objetivo central da fase:** Sair do `localStorage` e ir para a nuvem. O usuário deve poder logar e ver seus nós em qualquer lugar.
- **Resultados esperados:**
  - Autenticação (Login/Cadastro) funcionando.
  - Dados salvos no Postgres (Supabase).
  - "Local-First" básico (o app funciona offline e sincroniza quando volta).
- **Itens do Plano de Ajustes:** Backend Base, Banco Relacional.
- **Pré-requisitos:** Fase 0 concluída (Tipos estáveis).

#### Tarefas detalhadas da Fase 1

1.  **[Tarefa 1.1 – Setup do Supabase e Auth]** ✅ Concluído
    - **Contexto:** Precisamos de um porteiro e um cofre.
    - **Módulos impactados:** `lib/supabase.ts`, `features/auth/*`.
    - **Implementação realizada:**
        - ✅ Projeto Supabase criado (`.env.local` configurado)
        - ✅ Tabelas: `profiles`, `nodes`, `edges`, `memory_units` (schema.sql)
        - ✅ RLS (Row Level Security) configurado para todas as tabelas
        - ✅ `AuthProvider` implementado (`features/auth/AuthContext.tsx`)
        - ✅ Telas Login/Register (`AuthPage.tsx`) com Google OAuth + Email/Senha
        - ✅ Migrations: `001_polymorphic_architecture.sql`, `002_edge_handles.sql`
    - **Riscos:** RLS mal configurado. **Mitigação:** Testar com múltiplos usuários.

2.  **[Tarefa 1.2 – Sincronização Zustand <-> Supabase]** ⏳ 90% Concluída
    - **Contexto:** O Zustand é a verdade local. O Supabase é a verdade remota.
    - **Módulos impactados:** `api/*.ts`, `store/slices/createGraphSlice.ts`.
    - **Implementação realizada:**
        - ✅ `api/nodes.ts` - CRUD completo com JSONB (position, data)
        - ✅ `api/edges.ts` - CRUD com `source_handle`, `target_handle`
        - ✅ `api/memoryUnits.ts` - CRUD de flashcards
        - ✅ `loadGraph()` implementado em `createGraphSlice.ts`
        - ✅ Optimistic UI: atualiza local, persiste em background
        - ⚠️ **BUG:** `loadGraph()` chamado sem verificar `isGraphLoaded` (ver Tarefa 1.2.1)
        - ❌ Rollback em caso de falha não implementado
        - ❌ Indicador visual de "Sincronizando..." não implementado
    - **Critério de pronto:** Criar nó -> Aparece no Supabase -> Recarregar -> Nó persiste.

    **[Tarefa 1.2.1 – Corrigir Guard de loadGraph]** ❌ PENDENTE (PRÓXIMO PASSO)
    - **Problema:** `CanvasPage.tsx:95-99` chama `loadGraph()` em todo mount sem verificar `isGraphLoaded`
    - **Impacto:** Recarrega dados desnecessariamente ao navegar entre páginas
    - **Correção:** Adicionar guard `if (user && !isGraphLoaded)` no useEffect

    **[Tarefa 1.2.2 – Validar Tipos de Status no Supabase]** ❌ PENDENTE
    - **Contexto:** Os tipos de status (`new`, `learning`, `review_due`, `mastered`, `inbox`) estão definidos no TS, mas precisam validar se a lógica de transição está sendo sincronizada corretamente com o banco.
    - **Verificar:** Se as transições de status (ex: `new` -> `learning` -> `mastered`) estão persistindo.

3.  **[Tarefa 1.3 – Supabase Storage para Mídia]** ⏳ 80% Concluída (Shadow Feature)
    - **Contexto:** Armazenamento de arquivos (imagens, vídeos, PDFs).
    - **Módulos impactados:** `createGraphSlice.ts`, `*Node.tsx` components.
    - **Implementação realizada:**
        - ✅ Bucket: `mindo-assets` configurado
        - ✅ Upload de imagens, vídeos e PDFs funcionando
        - ⚠️ **BUG:** Limpeza automática de arquivos ao deletar nó **NÃO FUNCIONA**
    - **Pendência:** Depurar `deleteFileFromStorage()` em `createGraphSlice.ts`

4.  **[Tarefa 1.4 – Persistência de Layout]** ✅ Concluído (Shadow Feature)
    - **Contexto:** Salvar posições e dimensões dos nós.
    - **Implementação realizada:**
        - ✅ Posição salva em coluna JSONB `position`
        - ✅ Dimensões salvas em `data.style` (width, height)
        - ✅ Edge handles persistidos (`source_handle`, `target_handle`)
        - ✅ Migration `002_edge_handles.sql` aplicada

5.  **[Tarefa 1.5 – Dashboard e Analytics]** ⚠️ PARCIALMENTE FUNCIONAL
    - **Contexto:** Widgets de métricas e visualização de progresso.
    - **Módulos:** `features/dashboard/*`, `features/analytics/*`
    - **Status:**
        - ✅ Estrutura de tipos (`UserMetrics`, `RadarDataPoint`)
        - ✅ Componentes visuais (StatCard, HeatmapBlock)
        - ⚠️ **BUG:** Gráfico de Confiança **não funciona**
        - ❌ Dados real do banco não alimentam os widgets (mocks)
    - **Pendência:** Conectar widgets a dados reais do Supabase.

---

### ♻️ Fase 2 – Inteligência de Grafos (Memgraph & FastAPI)

> **Status:** 📋 NÃO INICIADA

#### [Fase 2 – O Diferencial Neural]

- **Objetivo central da fase:** Ativar a "Mente" do Mindo. Sair de um CRUD simples para um sistema que entende conexões.
- **Resultados esperados:**
  - Backend Python (FastAPI) rodando.
  - Memgraph sincronizado com Postgres.
  - Algoritmos de recomendação (PageRank, Comunidades) influenciando a UI.

#### Tarefas detalhadas da Fase 2

1.  **[Tarefa 2.1 – Setup do Backend Python (FastAPI)]** ❌ Pendente
    - **Contexto:** O Python será o orquestrador da inteligência.
    - **Módulos impactados:** Novo repositório ou pasta `/backend`.
    - **Passo a passo:**
        1. Configurar projeto FastAPI com Poetry/Pip.
        2. Criar Docker Compose com: FastAPI, Memgraph, Redis (fila).
        3. Criar endpoint de "Health Check".
    - **Critério de pronto:** `curl localhost:8000/health` retorna 200 OK.

2.  **[Tarefa 2.2 – Sincronização Postgres -> Memgraph]** ❌ Pendente
    - **Contexto:** O Memgraph precisa saber o que está no Supabase.
    - **Decisões de design:**
        - Usar **CDC (Change Data Capture)** ou Webhooks do Supabase.
        - Quando um nó é criado no Supabase -> Webhook chama FastAPI -> FastAPI cria nó no Memgraph.
    - **Passo a passo:**
        1. Configurar Database Webhook no Supabase para tabela `nodes` e `edges`.
        2. Criar endpoint `/webhooks/sync` no FastAPI.
        3. Implementar lógica Cypher para inserir no Memgraph.
    - **Critério de pronto:** Criar nó no Frontend -> Aparece no Memgraph Lab (visualizador do banco).

3.  **[Tarefa 2.3 – Algoritmos de Recomendação]** ❌ Pendente
    - **Contexto:** O app deve sugerir conexões.
    - **Passo a passo:**
        1. Implementar algoritmo de "Link Prediction" (MAGE library do Memgraph).
        2. Expor endpoint `GET /recommendations/{node_id}`.
        3. No Frontend, mostrar sugestões pontilhadas (Socratic Edges sugeridas).
    - **Critério de pronto:** Ao selecionar um nó, o backend sugere 3 nós relacionados.

---

### ♻️ Fase 3 – IA Generativa e RAG (Conteúdo Inteligente)

> **Status:** 📋 NÃO INICIADA

#### [Fase 3 – O Assistente de Conteúdo]

- **Objetivo central da fase:** Permitir que o Mindo entenda e gere conteúdo. O foco aqui é **texto e semântica**.
- **Resultados esperados:**
  - Busca Semântica (encontrar conceitos pelo sentido).
  - Geração automática de Flashcards (Memory Units) via LLM.
  - Chat com o Grafo (RAG).

#### Tarefas detalhadas da Fase 3

1.  **[Tarefa 3.1 – Pipeline de Embeddings]** ❌ Pendente
    - **Contexto:** Transformar cada nó em um vetor matemático.
    - **Módulos impactados:** FastAPI (Service: `embedding_service`), Supabase (`pgvector`).
    - **Nota:** Coluna `embedding vector(1536)` já existe no schema SQL (preparado para futuro).
    - **Passo a passo:**
        1. Implementar trigger no Supabase ou hook no FastAPI: ao criar/editar nó -> gerar embedding (OpenAI `text-embedding-3-small`).
        2. Salvar vetor na coluna `embedding` da tabela `nodes`.
        3. Criar índice HNSW no Postgres para busca rápida.
    - **Critério de pronto:** Busca por "animal que late" retorna o nó "Cachorro".

2.  **[Tarefa 3.2 – Fábrica de Flashcards (LLM Pipeline)]** ❌ Pendente
    - **Contexto:** O usuário escreve, a IA cria o teste.
    - **Passo a passo:**
        1. Integrar cliente Groq (LLaMA 3.1) no FastAPI.
        2. Criar prompt engineering para extrair perguntas/respostas de textos.
        3. Endpoint `POST /generate-cards` recebe texto e retorna JSON estruturado.
    - **Critério de pronto:** Texto de 500 palavras gera 3 flashcards pertinentes em < 2 segundos.

---

### ♻️ Fase 4 – Machine Learning & Personalização (O Cérebro Comportamental)

> **Status:** 📋 NÃO INICIADA

#### [Fase 4 – Aprendendo sobre o Usuário]

- **Objetivo central da fase:** Implementar a inteligência preditiva que adapta o app ao usuário. Aqui entra o **XGBoost, Random Forest e GNN**.
- **Resultados esperados:**
  - SRS (Repetição Espaçada) adaptativo (não apenas algoritmo fixo, mas preditivo).
  - Recomendação de estudos baseada em comportamento.
  - Descoberta de conexões latentes (GNN).
- **Itens do Plano de Ajustes:** Modelos tabulares, Recomendações, Grafo Inteligente.
- **Pré-requisitos:** Fases 1 e 2 (Dados de uso sendo coletados no Supabase/PostHog).

#### Tarefas detalhadas da Fase 4

1.  **[Tarefa 4.1 – Feature Store e Coleta de Métricas]** ❌ Pendente
    - **Contexto:** ML precisa de histórico. Precisamos estruturar os dados de "como o usuário estuda".
    - **Módulos impactados:** Supabase (`analytics_logs`), FastAPI.
    - **Decisões de design:**
        - Criar tabela de logs granulares: `tempo_leitura`, `cliques_em_conexoes`, `erros_em_flashcards`, `horario_estudo`.
    - **Passo a passo:**
        1. Instrumentar frontend para enviar eventos de telemetria para o backend.
        2. Criar views no Postgres que agregam esses dados em "Features" (ex: `avg_response_time`, `session_frequency`).
    - **Critério de pronto:** Tabela de features populada com dados reais de uso.

2.  **[Tarefa 4.2 – Modelos Tabulares (XGBoost/Random Forest)]** ❌ Pendente
    - **Contexto:** Prever a dificuldade de um card e sugerir o próximo passo.
    - **Módulos impactados:** Serviço ML (Python/Scikit-learn).
    - **Passo a passo:**
        1. **Treino Offline:** Exportar dados do Supabase -> Treinar XGBoost para prever `probability_of_recall`.
        2. **Inferência:** Expor modelo via FastAPI (`POST /predict-difficulty`).
        3. **Aplicação:** Ajustar o intervalo do SRS com base na predição (ex: se o modelo diz que o usuário vai esquecer rápido, agendar revisão para amanhã, não semana que vem).
    - **Critério de pronto:** O sistema ajusta datas de revisão de forma diferente para usuários diferentes baseados no histórico.

3.  **[Tarefa 4.3 – Inteligência de Grafo (GNN / PyTorch Geometric)]** ❌ Pendente
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
- **Graph View (D3-Force):** Visualização alternativa estilo Obsidian. Dependência já instalada, implementar após Fase 2.

---

### 🚨 Bugs Conhecidos (Fase 1)

| ID | Descrição | Arquivo | Prioridade |
|----|-----------|---------|------------|
| BUG-001 | `loadGraph()` chamado sem guard `isGraphLoaded` | `CanvasPage.tsx:95-99` | 🔴 Alta |
| BUG-002 | Limpeza de arquivos no Storage não funciona | `createGraphSlice.ts` | 🟡 Média |
| BUG-003 | Gráfico de Confiança não renderiza | `features/dashboard/*` | 🟡 Média |
| BUG-004 | Sistema LOD não utilizado | `nodes/NodeLOD*.tsx` | 🟢 Baixa |

---

**Implementation Cascade Architect v1.1** - Plano atualizado após auditoria de código (17/12/2024).
