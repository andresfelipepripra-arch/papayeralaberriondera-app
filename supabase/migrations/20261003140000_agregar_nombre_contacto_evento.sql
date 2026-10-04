-- Persona de contacto del evento (útil cuando el cliente es una empresa).
-- Aplicar en Supabase > SQL Editor o con `supabase db push` (idempotente)

alter table public.eventos add column if not exists nombre_contacto text;
