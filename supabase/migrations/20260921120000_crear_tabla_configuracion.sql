-- Configuración del negocio (una sola fila)
-- Aplicar en Supabase > SQL Editor o con `supabase db push` (idempotente)

create table if not exists public.configuracion (
  id              int primary key default 1 check (id = 1),
  nombre_negocio  text not null default 'Papayera La Berriondera',
  telefono        text,
  correo_contacto text,
  logo_url        text
);

-- Sin policies: solo el backend (service key, que omite RLS) accede a esta tabla.
alter table public.configuracion enable row level security;

insert into public.configuracion (id) values (1)
on conflict (id) do nothing;
