-- Nombre de la persona asociada al teléfono alterno del evento (ej. "Mamá", "Asistente").
-- Aplicar en Supabase > SQL Editor o con `supabase db push` (idempotente)

alter table public.eventos add column if not exists nombre_telefono_alterno text;
