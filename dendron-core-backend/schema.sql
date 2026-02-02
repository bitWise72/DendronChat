-- 1) Projects
create table if not exists dendron_projects (
  id text primary key,
  name text not null,
  created_at timestamptz default now()
);

-- 2) Assistant Configuration
create table if not exists dendron_assistant_config (
  project_id text primary key references dendron_projects(id) on delete cascade,
  system_prompt text not null,
  welcome_message text not null,
  theme jsonb not null,
  mascot_url text not null
);

-- 3) Chat Sessions
create table if not exists dendron_sessions (
  id uuid primary key default gen_random_uuid(),
  project_id text references dendron_projects(id) on delete cascade,
  created_at timestamptz default now()
);

-- 4) Chat Messages
create table if not exists dendron_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references dendron_sessions(id) on delete cascade,
  role text not null,
  content text not null,
  created_at timestamptz default now()
);

-- 5) RAG Documents (future-ready)
create table if not exists dendron_documents (
  id uuid primary key default gen_random_uuid(),
  project_id text references dendron_projects(id) on delete cascade,
  source_url text not null,
  created_at timestamptz default now()
);

-- 6) RAG Chunks (vector-ready)
create table if not exists dendron_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references dendron_documents(id) on delete cascade,
  content text not null,
  embedding vector(1536)
);

-- 7) Vector Search RPC
create or replace function match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_project_id text default null
)
returns table (
  id uuid,
  content text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    dendron_chunks.id,
    dendron_chunks.content,
    1 - (dendron_chunks.embedding <=> query_embedding) as similarity
  from dendron_chunks
  join dendron_documents on dendron_documents.id = dendron_chunks.document_id
  where 1 - (dendron_chunks.embedding <=> query_embedding) > match_threshold
  and (filter_project_id is null or dendron_documents.project_id = filter_project_id)
  order by dendron_chunks.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Demo Data Injection
insert into dendron_projects (id, name)
values ('demo', 'Demo Project')
on conflict (id) do nothing;

insert into dendron_assistant_config
(project_id, system_prompt, welcome_message, theme, mascot_url)
values
(
  'demo',
  'You are a helpful assistant.',
  'Hello, how can I help you?',
  '{"primary":"#111827"}',
  'https://placehold.co/64x64'
)
on conflict (project_id) do nothing;
-- 8) DB Connections
create table if not exists dendron_db_connections (
  project_id text primary key,
  db_type text not null,
  encrypted_uri text not null
);

-- 9) DB Allowlist
create table if not exists dendron_db_allowlist (
  project_id text,
  table_name text,
  column_name text,
  primary key (project_id, table_name, column_name)
);
