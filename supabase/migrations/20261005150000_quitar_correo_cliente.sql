-- El correo del cliente ya no se captura en los eventos.
-- Aplicar en Supabase > SQL Editor o con `supabase db push` (idempotente)

alter table public.eventos drop column if exists correo_cliente;
