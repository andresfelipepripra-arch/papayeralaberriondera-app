-- Duración propia del evento (puede ser distinta a la del paquete, ej. 2 horas en vez de 45 min).
-- Si es null, se usa la duración del paquete.
-- Aplicar en Supabase > SQL Editor o con `supabase db push` (idempotente)

alter table public.eventos add column if not exists duracion_horas numeric;
