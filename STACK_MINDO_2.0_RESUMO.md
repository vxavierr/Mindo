# 🧱 Stack Proposta – Mindo 2.0

**Objetivo do documento:** dar uma visão rápida e clara de todas as tecnologias que vamos usar na nova versão do Mindo, explicando, em linguagem simples, a função de cada uma.

---

## 1. Frontend (interface do usuário)

| Camada | Tecnologia | Função simples |
|--------|------------|----------------|
| Base da interface | **React 18.3.1** | Biblioteca que cria as telas e componentes reutilizáveis do app. |
| Motor de desenvolvimento | **Vite 7.1.3** | Ferramenta que roda o app em modo dev (super rápido) e gera o pacote final otimizado. |
| Linguagem tipada | **TypeScript 5.x** | JavaScript com “rótulos” (tipos) que evitam erro antes mesmo de rodar. |
| Rotas e páginas | **React Router DOM 7.8.1** | Controla quais páginas aparecem para cada URL (ex: /conceitos, /estudos). |
| Estado global leve | **Zustand** | Guarda informações importantes (usuário, filtros, progresso) sem dor de cabeça. |
| Busca e cache | **TanStack Query (React Query)** | Lida com requisições ao backend, cache e estado de carregamento/erro. |
| Componentes UI | **Shadcn/ui + Tailwind CSS** | Biblioteca de componentes prontos e bonitos, baseados em Tailwind. |
| Editor rico | **Tiptap** | Editor WYSIWYG para criar e editar conceitos com formatação avançada. |
| Grafo visual | **React Flow** | Permite exibir a rede de conceitos com nós e conexões interativas. |
| Notificações / analytics | **PostHog (web)** | Analisa como os usuários usam as telas (funnel, heatmaps, etc.). |

---

## 2. Backend + Banco de Dados

| Camada | Tecnologia | Função simples |
|--------|------------|----------------|
| API principal | **FastAPI (Python)** | Cria endpoints REST e serve como “ponte” entre frontend, banco e IA. |
| Banco relacional | **Supabase (PostgreSQL)** | Guarda usuários, conceitos, revisões, métricas – com autenticação pronta. |
| Extensões do Postgres | **pgvector + pg_cron** | `pgvector`: busca semântica (similaridade de textos). `pg_cron`: tarefas agendadas. |
| Funções serverless | **Supabase Edge Functions** | Scripts rápidos (Deno) para notificações, jobs e integrações. |
| Armazenamento de arquivos | **Supabase Storage** | Armazena imagens, uploads e arquivos do usuário. |
| Tempo real | **Supabase Realtime** | Atualiza dados instantaneamente (ex: novo conceito aparece sem recarregar). |
| Graph Database | **Memgraph Community** | Guarda o grafo de conceitos e relações (ideal para algoritmos de grafos). |
| Bibliotecas Memgraph | **MAGE** | Pacote oficial com algoritmos prontos (PageRank, comunidades, Node2Vec). |

---

## 3. IA & Machine Learning

| Camada | Tecnologia | Função simples |
|--------|------------|----------------|
| Embeddings | **OpenAI `text-embedding-3-small`** | Transforma textos em vetores para medir similaridade entre conceitos. |
| Geração de texto | **Groq (modelos LLaMA 3.1)** | Auto-tagging, geração de questões, resumos e feedback. |
| Modelos tabulares | **XGBoost + scikit-learn** | Prediz dificuldade, ajusta espaçamento de revisões, estima sucesso. |
| Recomendações | **Random Forest** | Sugere quais conceitos revisar/criar com base no histórico. |
| Grafo inteligente | **PyTorch Geometric (GNN)** | Aprende embeddings do grafo para recomendações mais personalizadas. |
| Pipeline ML | **Docker + FastAPI services** | Executa previsões, treina modelos offline e expõe endpoints de IA. |

---

## 4. Mobile (App híbrido)

| Camada | Tecnologia | Função simples |
|--------|------------|----------------|
| Camada nativa | **Capacitor 6** | Empacota o app web em apps nativos (iOS/Android). |
| Push notifications | **Capacitor Push / Local Notifications** | Envia alertas de revisões, lembretes, eventos importantes. |
| Status barra / splash | **Capacitor Plugins oficiais** | Ajusta barra de status, splash screen e integração com hardware. |

---

## 5. Deploy e Infraestrutura

| Camada | Tecnologia | Função simples |
|--------|------------|----------------|
| Frontend hosting | **Vercel (plano Pro)** | Hospeda o app React otimizado com Vite, incluindo HTTPS e CDN global. |
| Backend & grafos | **VPS Hostinger KVM 2** | Roda Docker (FastAPI, Memgraph, Prometheus, Nginx). |
| Containerização | **Docker & Docker Compose** | Empacota todos os serviços backend/ML em ambientes previsíveis. |
| Proxy/Reverso | **Nginx** | Redireciona todas as requisições (HTTPS, roteamento para APIs internas). |
| Monitoramento | **Prometheus + (opcional) Grafana** | Coleta métricas do backend, IA e grafos; alerta quando algo sai do normal. |
| Logs | **Grafana Loki ou Papertrail (opcional)** | Centraliza logs para diagnóstico rápido. |

---

## 6. Ferramentas de Desenvolvimento

| Categoria | Tecnologia | Função simples |
|-----------|------------|----------------|
| Gestão de versões | **Git + GitHub** | Controle de código, PRs e colaboração. |
| Automação | **GitHub Actions** | CI/CD para testes, builds e deploy automatizado. |
| Qualidade | **ESLint + Prettier** | Linting e formatação padronizada. |
| Documentação | **OpenAPI + Swagger UI** | Gera documentação automática dos endpoints. |
| Observabilidade | **Sentry** | Captura erros e crash reports (frontend + backend). |
| Experimentos | **PostHog** | Analytics, AB testing e feature flags. |

---

### ✅ Benefícios da Stack
- **Performance alta** (Vite + React Query + Memgraph).
- **Escalabilidade natural** (Supabase + VPS modular).
- **Experiência forte com IA** (Groq, OpenAI, modelos próprios).
- **Mobile pronto** (Capacitor, notificações nativas).
- **Observabilidade completa** (Sentry, Prometheus, PostHog).

Esta é a base sólida da nova stack Mindo 2.0 – pronta para desenvolvimento rápido (com suporte de IA), escalável e orientada a aprendizado personalizado.
