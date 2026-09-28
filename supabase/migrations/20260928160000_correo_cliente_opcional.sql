-- El correo del cliente deja de ser obligatorio (se quita del formulario de creación)
-- Aplicar en Supabase > SQL Editor o con `supabase db push` (idempotente)

alter table public.clientes alter column correo drop not null;
