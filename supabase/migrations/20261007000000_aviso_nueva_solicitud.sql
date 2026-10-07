-- Aviso por correo de nuevas solicitudes de contacto.
-- Tras cada inserción, la base llama a la Edge Function aviso-solicitud con el id.
create extension if not exists pg_net with schema extensions;

-- Momento en que se envió el aviso (null = pendiente). Los visitantes no pueden escribirla.
alter table public.solicitudes_contacto add column notificado_en timestamptz;

create or replace function public.aviso_nueva_solicitud()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform net.http_post(
    url     := 'https://atbjyuovneeulrdzpqln.supabase.co/functions/v1/aviso-solicitud',
    body    := jsonb_build_object('id', new.id),
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  return new;
end;
$$;

revoke all on function public.aviso_nueva_solicitud() from public, anon, authenticated;

create trigger aviso_nueva_solicitud
  after insert on public.solicitudes_contacto
  for each row execute function public.aviso_nueva_solicitud();
