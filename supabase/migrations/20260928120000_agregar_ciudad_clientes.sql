-- Ciudad del cliente (usada en la vista de Clientes)
-- Aplicar en Supabase > SQL Editor o con `supabase db push` (idempotente)

alter table public.clientes add column if not exists ciudad text;
