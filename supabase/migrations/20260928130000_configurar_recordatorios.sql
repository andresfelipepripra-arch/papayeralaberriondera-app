-- Configuración de recordatorios (escalonados) + historial de correos enviados
-- Aplicar en Supabase > SQL Editor o con `supabase db push` (idempotente)

alter table public.configuracion
  add column if not exists correo_remitente  text,
  add column if not exists envio_automatico  boolean not null default true,
  add column if not exists hora_envio        time not null default '08:00',
  add column if not exists dias_recordatorio integer[] not null default '{7,3,1}',
  add column if not exists dias_confirmacion integer not null default 14;

-- ============ HISTORIAL DE CORREOS ============
-- Registro de cada intento de envío (recordatorio_<dias> o confirmacion),
-- éxito o fallo. Reemplaza el booleano suelto que había en eventos.
create table if not exists public.correos_enviados (
  id           uuid primary key default gen_random_uuid(),
  evento_id    uuid references public.eventos (id) on delete cascade,
  cliente_id   uuid references public.clientes (id) on delete set null,
  tipo         text not null,
  destinatario text,
  estado       text not null check (estado in ('enviado', 'fallido')),
  error        text,
  created_at   timestamptz not null default now()
);

alter table public.correos_enviados enable row level security;

create index if not exists idx_correos_enviados_evento  on public.correos_enviados (evento_id);
create index if not exists idx_correos_enviados_created on public.correos_enviados (created_at desc);

-- Evita reenviar el mismo tipo de correo dos veces para el mismo evento
-- (solo cuenta los envíos exitosos; un fallo sí se puede reintentar).
create unique index if not exists idx_correos_enviados_unico
  on public.correos_enviados (evento_id, tipo)
  where estado = 'enviado';
