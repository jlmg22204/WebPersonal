-- Solicitudes enviadas desde el formulario de contacto de la web.
create table public.solicitudes_contacto (
  id            bigint generated always as identity primary key,
  creado_en     timestamptz not null default now(),
  nombre        text not null check (char_length(nombre) between 2 and 120),
  empresa       text check (char_length(empresa) <= 160),
  correo        text not null check (char_length(correo) <= 160 and correo ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  telefono      text check (char_length(telefono) <= 40),
  tipo_proyecto text not null check (char_length(tipo_proyecto) <= 80),
  mensaje       text not null check (char_length(mensaje) between 5 and 4000),
  atendido      boolean not null default false
);

comment on table public.solicitudes_contacto is 'Solicitudes de asesoría recibidas desde marvicatta9.net';

-- Los visitantes solo pueden insertar; nadie puede leer con la clave pública.
alter table public.solicitudes_contacto enable row level security;

create policy "Visitantes pueden enviar solicitudes"
  on public.solicitudes_contacto
  for insert
  to anon
  with check (atendido = false);

revoke all on public.solicitudes_contacto from anon, authenticated;
grant insert (nombre, empresa, correo, telefono, tipo_proyecto, mensaje) on public.solicitudes_contacto to anon;
