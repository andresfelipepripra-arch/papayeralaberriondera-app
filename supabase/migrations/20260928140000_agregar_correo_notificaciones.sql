-- Los recordatorios/confirmaciones son notificaciones internas para el
-- administrador (no se le envían al cliente), a este correo fijo.
-- Aplicar en Supabase > SQL Editor o con `supabase db push` (idempotente)

alter table public.configuracion
  add column if not exists correo_notificaciones text not null default 'papayeralaberriondera@gmail.com';
