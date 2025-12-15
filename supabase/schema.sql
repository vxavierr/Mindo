-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enable pgvector for embeddings (Future proofing for Phase 3)
create extension if not exists "vector";

-- 1. PROFILES (Users)
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

-- 2. NODES (The Knowledge Graph)
create table public.nodes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  
  title text not null,
  content text, -- HTML content
  type text default 'text', -- 'text', 'audio'
  status text default 'new', -- 'new', 'learning', 'mastered'
  tags text[] default '{}',
  
  -- Visual State
  position_x float default 0,
  position_y float default 0,
  
  -- SRS / Meta
  weight integer default 1,
  last_review timestamp with time zone,
  next_review timestamp with time zone,
  
  -- Embeddings (Phase 3)
  embedding vector(1536),
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Nodes
alter table public.nodes enable row level security;

create policy "Users can CRUD their own nodes."
  on nodes for all
  using ( auth.uid() = user_id );

-- 3. EDGES (Connections)
create table public.edges (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  
  source_id uuid references public.nodes(id) on delete cascade not null,
  target_id uuid references public.nodes(id) on delete cascade not null,
  
  type text default 'socratic', -- 'socratic', 'semantic', 'biologic'
  label text,
  is_tentative boolean default false,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Edges
alter table public.edges enable row level security;

create policy "Users can CRUD their own edges."
  on edges for all
  using ( auth.uid() = user_id );

-- 4. MEMORY UNITS (Flashcards)
create table public.memory_units (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  node_id uuid references public.nodes(id) on delete cascade not null,
  
  question text not null,
  answer text not null,
  text_segment text, -- The anchor text in the node content
  
  status text default 'new',
  ease_factor float default 2.5,
  interval integer default 0,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Memory Units
alter table public.memory_units enable row level security;

create policy "Users can CRUD their own memory units."
  on memory_units for all
  using ( auth.uid() = user_id );

-- TRIGGERS for updated_at
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

-- TRIGGER for creating profile on signup
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
