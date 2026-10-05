-- Monto fijo que se queda la papayera por cada evento realizado (el resto se paga a los músicos).
-- Aplicar en Supabase > SQL Editor o con `supabase db push` (idempotente)

alter table public.configuracion add column if not exists ganancia_por_evento numeric(12,2) not null default 70000;
