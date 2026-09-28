-- Los eventos nuevos entran confirmados por defecto (no pendientes).
-- "Pendiente" sigue existiendo como opción seleccionable manualmente.
-- Aplicar en Supabase > SQL Editor o con `supabase db push` (idempotente)

alter table public.eventos alter column estado set default 'confirmado';
