-- Ganancia de la papayera para este evento. Si es null, se usa la ganancia general de configuración.
-- Aplicar en Supabase > SQL Editor o con `supabase db push` (idempotente)

alter table public.eventos add column if not exists ganancia_evento numeric(12,2);
