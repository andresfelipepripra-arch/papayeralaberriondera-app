-- El rol "operador" pasa a llamarse "musico", y cada perfil guarda qué módulos puede ver
-- (solo aplica a músicos; un administrador siempre ve todo).
-- Aplicar en Supabase > SQL Editor o con `supabase db push` (idempotente)

alter table public.perfiles drop constraint if exists perfiles_rol_check;

update public.perfiles set rol = 'musico' where rol = 'operador';

alter table public.perfiles add constraint perfiles_rol_check check (rol in ('admin', 'musico'));
alter table public.perfiles alter column rol set default 'musico';

alter table public.perfiles
  add column if not exists modulos text[] not null default array['dashboard', 'calendario', 'eventos', 'paquetes'];
