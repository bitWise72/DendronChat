-- Dendron SQL Schema (Run this in Supabase SQL Editor)

-- 1. Enable vector extension
create extension if not exists vector;

-- 2. Assistant configuration table
create table if not exists dendron_assistant_config (
  project_id text primary key,
  system_prompt text not null,
  welcome_message text not null,
  theme jsonb not null,
  mascot_url text not null
);

-- 3. Chunks table for RAG
create table if not exists dendron_chunks (
  id uuid primary key default gen_random_uuid(),
  project_id text not null,
  content text not null,
  embedding vector(1536)
);

-- 4. Vector search RPC function
create or replace function match_chunks(
  query_embedding vector(1536),
  match_count int,
  pid text
)
returns table (content text)
language sql
as $$
  select content
  from dendron_chunks
  where project_id = pid
  order by embedding <-> query_embedding
  limit match_count;
$$;
