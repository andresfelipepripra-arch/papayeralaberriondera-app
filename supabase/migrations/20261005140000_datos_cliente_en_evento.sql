-- Los datos del cliente pasan a vivir en cada evento (ya no existe el módulo de clientes).
-- Se copian los datos de los clientes existentes para no perder información.
-- La tabla clientes se conserva sin uso; cliente_id queda opcional.
-- Aplicar en Supabase > SQL Editor o con `supabase db push` (idempotente)

alter table public.eventos
  add column if not exists nombre_cliente text,
  add column if not exists correo_cliente text;

update public.eventos e
set
  nombre_cliente = coalesce(e.nombre_cliente, c.nombre),
  correo_cliente = coalesce(e.correo_cliente, c.correo),
  telefono_contacto = coalesce(e.telefono_contacto, c.telefono),
  ciudad = coalesce(e.ciudad, c.ciudad)
from public.clientes c
where e.cliente_id = c.id;

alter table public.eventos alter column cliente_id drop not null;
