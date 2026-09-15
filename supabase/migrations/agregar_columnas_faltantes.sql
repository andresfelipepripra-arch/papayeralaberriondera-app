-- Parche: columnas que faltaban al esquema existente
-- Aplicar en Supabase > SQL Editor (idempotente: se puede correr varias veces)

-- ============ PAQUETES ============
alter table public.paquetes add column if not exists duracion_horas numeric;
alter table public.paquetes add column if not exists incluye text;

-- ============ CLIENTES: email -> correo ============
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'clientes' and column_name = 'email'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'clientes' and column_name = 'correo'
  ) then
    alter table public.clientes rename column email to correo;
  end if;
end $$;

-- ============ EVENTOS ============
alter table public.eventos add column if not exists estado text not null default 'pendiente';
alter table public.eventos add column if not exists notas text;