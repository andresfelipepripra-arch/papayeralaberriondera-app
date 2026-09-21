-- Sistema simple de roles
-- Aplicar en Supabase > SQL Editor (idempotente: se puede correr varias veces)

-- ============ PERFILES ============
-- No se puede alterar auth.users directamente, así que el rol vive en una
-- tabla aparte referenciada 1 a 1 contra auth.users.
create table if not exists public.perfiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  rol        text not null default 'operador' check (rol in ('admin', 'operador')),
  created_at timestamptz not null default now()
);

alter table public.perfiles enable row level security;

-- El backend usa la service key (bypassa RLS). Esta policy es para que el
-- frontend (anon/authenticated key) pueda leer el rol del propio usuario.
drop policy if exists "Los usuarios pueden ver su propio perfil" on public.perfiles;
create policy "Los usuarios pueden ver su propio perfil"
  on public.perfiles for select
  using (auth.uid() = id);

-- ============ BACKFILL ============
-- Crea un perfil (rol 'operador' por defecto) para usuarios que ya existían
-- antes de esta migración.
insert into public.perfiles (id)
select id from auth.users
on conflict (id) do nothing;
