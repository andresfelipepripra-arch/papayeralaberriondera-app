-- Barrio donde se realiza el evento (aparece en el resumen que se copia).
-- Aplicar en Supabase > SQL Editor o con `supabase db push` (idempotente)

alter table public.eventos add column if not exists barrio text;
