-- El Dashboard muestra cifras financieras del negocio y pasa a ser exclusivo de administrador,
-- ya no es un módulo que se le pueda asignar a un músico.
-- Aplicar en Supabase > SQL Editor o con `supabase db push` (idempotente)

update public.perfiles set modulos = array_remove(modulos, 'dashboard');
alter table public.perfiles alter column modulos set default array['calendario', 'eventos', 'paquetes'];
