-- Precio propio del evento (puede subir sobre el precio base del paquete
-- por distancia/ubicación). Si es null, se usa el precio del paquete.
-- Aplicar en Supabase > SQL Editor o con `supabase db push` (idempotente)

alter table public.eventos add column if not exists precio numeric(12,2);
