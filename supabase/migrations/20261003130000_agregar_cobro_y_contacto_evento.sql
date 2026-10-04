-- Datos de contacto, tipo y cobro por evento.
-- telefono_contacto se llena con el teléfono del cliente pero puede cambiarse sin tocar al cliente.
-- Aplicar en Supabase > SQL Editor o con `supabase db push` (idempotente)

alter table public.eventos
  add column if not exists telefono_contacto text,
  add column if not exists telefono_alterno text,
  add column if not exists tipo_evento text,
  add column if not exists abonado numeric(12,2) not null default 0;
