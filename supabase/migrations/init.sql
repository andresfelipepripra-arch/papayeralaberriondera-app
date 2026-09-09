-- Migración inicial: esquema de la papayera
-- Aplicar en Supabase > SQL Editor (o con psql / Management API)

-- ============ CLIENTES ============
create table if not exists public.clientes (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  email       text not null,
  telefono    text,
  created_at  timestamptz not null default now()
);

-- ============ PAQUETES ============
create table if not exists public.paquetes (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  descripcion text,
  precio      numeric(12,2) not null default 0,
  created_at  timestamptz not null default now()
);

-- ============ EVENTOS ============
create table if not exists public.eventos (
  id                          uuid primary key default gen_random_uuid(),
  cliente_id                  uuid not null references public.clientes (id) on delete cascade,
  paquete_id                  uuid references public.paquetes (id) on delete set null,
  fecha                       timestamptz not null,
  ubicacion                   text,
  correo_recordatorio_enviado boolean not null default false,
  created_at                  timestamptz not null default now()
);

-- ============ SEGURIDAD A NIVEL DE FILA ============
-- La service key del backend omite RLS. Las policies para anon/authenticated
-- se agregarán cuando se implemente la autenticación.
alter table public.clientes enable row level security;
alter table public.paquetes enable row level security;
alter table public.eventos   enable row level security;

-- ============ ÍNDICES ============
create index if not exists idx_eventos_fecha     on public.eventos (fecha);
create index if not exists idx_eventos_cliente   on public.eventos (cliente_id);
create index if not exists idx_eventos_paquete   on public.eventos (paquete_id);