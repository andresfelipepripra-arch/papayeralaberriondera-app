-- Ciudad donde se realiza el evento (distinta de la ubicación exacta).
-- Aplicar en Supabase > SQL Editor o con `supabase db push` (idempotente)

alter table public.eventos add column if not exists ciudad text;
