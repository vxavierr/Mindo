-- ============================================================================
-- MINDO 2.0 - Polymorphic Architecture Schema
-- ============================================================================
-- This schema supports the new polymorphic node system with JSONB columns
-- for flexible data storage (code, video, image, pdf, text nodes).
-- ============================================================================

-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "vector";  -- For future AI embeddings (Phase 3)

-- ============================================================================
-- 1. PROFILES (Users)
-- ============================================================================
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone,
  
  -- Metrics (Gamification)
  confidence_score integer default 0,
  streak_days integer default 0,
  total_nodes integer default 0,
  
  constraint username_length check (char_length(full_name) >= 3)
);

-- RLS for Profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- ============================================================================
-- 2. NODES (The Polymorphic Knowledge Graph)
-- ============================================================================
-- Supports 5 node types: text, code, video, image, pdf
-- Uses JSONB for flexible position and data storage
-- ============================================================================
create table public.nodes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  
  -- Core fields
  title text not null,
  type text not null default 'text' check (type in ('text', 'code', 'video', 'image', 'pdf')),
  status text default 'new' check (status in ('new', 'learning', 'review_due', 'mastered', 'inbox')),
  tags text[] default '{}',
  
  -- JSONB: Position (replaces position_x, position_y)
  -- Format: {"x": 100, "y": 200}
  position jsonb not null default '{"x": 0, "y": 0}',
  
  -- JSONB: Polymorphic data (flexible fields based on type)
  -- For text:  {"content": "<p>...</p>"}
  -- For code:  {"code": "console.log(...)", "language": "javascript"}
  -- For video: {"url": "https://youtube.com/..."}
  -- For image: {"url": "https://..."}
  -- For pdf:   {"url": "https://..."}
  data jsonb not null default '{}',
  
  -- SRS / Meta
  weight integer default 1,
  last_review timestamp with time zone,
  next_review timestamp with time zone,
  
  -- AI Embeddings (Phase 3)
  embedding vector(1536),
  
  -- Timestamps
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance
create index nodes_user_id_idx on public.nodes(user_id);
create index nodes_type_idx on public.nodes(type);
create index nodes_status_idx on public.nodes(status);
create index nodes_data_gin_idx on public.nodes using gin(data);

-- RLS for Nodes
alter table public.nodes enable row level security;

create policy "Users can CRUD their own nodes."
  on nodes for all
  using ( auth.uid() = user_id );

-- ============================================================================
-- 3. EDGES (Connections between Nodes)
-- ============================================================================
create table public.edges (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  
  source_id uuid references public.nodes(id) on delete cascade not null,
  target_id uuid references public.nodes(id) on delete cascade not null,
  
  type text default 'socratic' check (type in ('socratic', 'semantic', 'biologic')),
  label text,
  is_tentative boolean default false,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes
create index edges_user_id_idx on public.edges(user_id);
create index edges_source_id_idx on public.edges(source_id);
create index edges_target_id_idx on public.edges(target_id);

-- RLS for Edges
alter table public.edges enable row level security;

create policy "Users can CRUD their own edges."
  on edges for all
  using ( auth.uid() = user_id );

-- ============================================================================
-- 4. MEMORY UNITS (Flashcards with Polymorphic Anchors)
-- ============================================================================
-- Flashcards linked to specific positions in nodes (text highlights, 
-- video timestamps, code line numbers, etc.)
-- ============================================================================
create table public.memory_units (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  node_id uuid references public.nodes(id) on delete cascade not null,
  
  -- Flashcard content (renamed from question/answer for clarity)
  front text not null,  -- The question/prompt
  back text not null,   -- The answer
  
  -- JSONB: Anchor (polymorphic location within the node)
  -- For text:  {"segment": "highlighted text", "start": 0, "end": 50}
  -- For code:  {"line": 12, "lineEnd": 15}
  -- For video: {"timestamp": 45.5, "timestampEnd": 60.0}
  -- For image: {"x": 100, "y": 200, "width": 50, "height": 50}
  -- For pdf:   {"page": 3, "rect": {"x": 0, "y": 0, "w": 100, "h": 20}}
  anchor jsonb,
  
  -- SRS fields
  status text default 'new' check (status in ('new', 'learning', 'mastered')),
  ease_factor float default 2.5,
  interval integer default 0,
  next_review timestamp with time zone,
  
  -- Timestamps
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes
create index memory_units_user_id_idx on public.memory_units(user_id);
create index memory_units_node_id_idx on public.memory_units(node_id);
create index memory_units_next_review_idx on public.memory_units(next_review);
create index memory_units_anchor_gin_idx on public.memory_units using gin(anchor);

-- RLS for Memory Units
alter table public.memory_units enable row level security;

create policy "Users can CRUD their own memory units."
  on memory_units for all
  using ( auth.uid() = user_id );

-- ============================================================================
-- 5. TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_updated_at_nodes
  before update on public.nodes
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at_edges
  before update on public.edges
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at_memory_units
  before update on public.memory_units
  for each row execute procedure public.handle_updated_at();

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================================
-- 6. MIGRATION HELPER (Run manually if migrating from old schema)
-- ============================================================================
-- If you have existing data, run this to migrate from old columns to JSONB:
--
-- UPDATE nodes SET 
--   position = jsonb_build_object('x', position_x, 'y', position_y),
--   data = jsonb_build_object('content', content)
-- WHERE position IS NULL OR position = '{"x": 0, "y": 0}';
--
-- Then drop old columns:
-- ALTER TABLE nodes DROP COLUMN IF EXISTS position_x;
-- ALTER TABLE nodes DROP COLUMN IF EXISTS position_y;
-- ALTER TABLE nodes DROP COLUMN IF EXISTS content;
-- ============================================================================
