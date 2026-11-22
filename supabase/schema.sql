-- =====================================================================
-- FGC Hub - Esquema completo de base de datos (Supabase / Postgres)
-- El script se puede volver a correr sin romper nada.
-- =====================================================================

-- =====================================================================
-- 1) PERFILES: extiende auth.users con el rol y el gamertag
-- =====================================================================
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text,
  nombre     text,
  gamertag   text,
  rol        text not null default 'jugador' check (rol in ('admin', 'jugador')),
  creado_en  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Al registrarse se crea el perfil (SIEMPRE VA A SER 'JUGADOR'):
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, nombre, gamertag)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'nombre', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'gamertag', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Usuarios que ya existían antes de correr este script
insert into public.profiles (id, email, nombre, gamertag)
select id, email, split_part(email, '@', 1), split_part(email, '@', 1)
from auth.users
on conflict (id) do nothing;

-- Rol del usuario que hace la consulta.
-- SECURITY DEFINER evita la recursión de RLS al consultar profiles desde sus propias políticas.
create or replace function public.mi_rol()
returns text
language sql
stable
security definer set search_path = ''
as $$
  select rol from public.profiles where id = auth.uid()
$$;

drop policy if exists "Ver perfil propio o todos si es admin" on public.profiles;
create policy "Ver perfil propio o todos si es admin"
on public.profiles for select
using (id = auth.uid() or public.mi_rol() = 'admin');

drop policy if exists "Solo admin modifica perfiles" on public.profiles;
create policy "Solo admin modifica perfiles"
on public.profiles for update
using (public.mi_rol() = 'admin')
with check (public.mi_rol() = 'admin');

-- =====================================================================
-- 2) JUEGOS (ABM 1)
-- =====================================================================
create table if not exists public.juegos (
  id            uuid primary key default gen_random_uuid(),
  nombre        text not null unique check (char_length(nombre) between 2 and 80),
  desarrolladora text,
  plataformas   text,
  logo_url      text,                       -- URL del logo / arte oficial
  personajes    text[] not null default '{}',
  creado_en     timestamptz not null default now()
);

alter table public.juegos enable row level security;

drop policy if exists "Lectura publica de juegos" on public.juegos;
create policy "Lectura publica de juegos"
on public.juegos for select using (true);

drop policy if exists "Admin inserta juegos" on public.juegos;
create policy "Admin inserta juegos"
on public.juegos for insert with check (public.mi_rol() = 'admin');

drop policy if exists "Admin actualiza juegos" on public.juegos;
create policy "Admin actualiza juegos"
on public.juegos for update
using (public.mi_rol() = 'admin') with check (public.mi_rol() = 'admin');

drop policy if exists "Admin borra juegos" on public.juegos;
create policy "Admin borra juegos"
on public.juegos for delete using (public.mi_rol() = 'admin');


-- =====================================================================
-- 3) TORNEOS (ABM 2)
-- =====================================================================
create table if not exists public.torneos (
  id          uuid primary key default gen_random_uuid(),
  juego_id    uuid not null references public.juegos (id) on delete restrict,
  nombre      text not null check (char_length(nombre) between 3 and 100),
  descripcion text,
  fecha       timestamptz not null,
  lugar       text,
  zona        text not null,               -- provincia / zona
  cupo        int  not null check (cupo between 2 and 256),
  formato     text not null default 'eliminacion_doble'
              check (formato in ('eliminacion_doble', 'eliminacion_simple', 'round_robin')),
  estado      text not null default 'abierto'
              check (estado in ('abierto', 'cerrado', 'en_curso', 'finalizado')),
  banner_url  text,                         -- key art / banner oficial
  creado_por  uuid references public.profiles (id) on delete set null default auth.uid(),
  creado_en   timestamptz not null default now()
);

create index if not exists torneos_juego_idx on public.torneos (juego_id);
create index if not exists torneos_fecha_idx on public.torneos (fecha);

-- Zona del torneo, también actualiza bases creadas antes de que existiera la columna
alter table public.torneos add column if not exists zona text;

-- Torneos que ya existían: se les asigna una zona provisoria
update public.torneos
set zona = case when lugar ilike '%online%' then 'online' else 'caba' end
where zona is null;

alter table public.torneos alter column zona set not null;

-- Debe coincidir con la lista de src/utils/zonas.js
alter table public.torneos drop constraint if exists torneos_zona_check;
alter table public.torneos add constraint torneos_zona_check check (zona in (
    'caba', 'buenos_aires', 'catamarca', 'chaco', 'chubut', 'cordoba', 'corrientes',
    'entre_rios', 'formosa', 'jujuy', 'la_pampa', 'la_rioja', 'mendoza', 'misiones', 'neuquen',
    'rio_negro', 'rosario', 'salta', 'san_juan', 'san_luis', 'santa_cruz', 'santa_fe',
    'santiago_del_estero', 'tierra_del_fuego', 'tucuman', 'online'
));

create index if not exists torneos_zona_idx on public.torneos (zona);

alter table public.torneos enable row level security;

drop policy if exists "Lectura publica de torneos" on public.torneos;
create policy "Lectura publica de torneos"
on public.torneos for select using (true);

drop policy if exists "Admin inserta torneos" on public.torneos;
create policy "Admin inserta torneos"
on public.torneos for insert with check (public.mi_rol() = 'admin');

drop policy if exists "Admin actualiza torneos" on public.torneos;
create policy "Admin actualiza torneos"
on public.torneos for update
using (public.mi_rol() = 'admin') with check (public.mi_rol() = 'admin');

drop policy if exists "Admin borra torneos" on public.torneos;
create policy "Admin borra torneos"
on public.torneos for delete using (public.mi_rol() = 'admin');


-- =====================================================================
-- 4) INSCRIPCIONES (ABM 3)
-- =====================================================================
create table if not exists public.inscripciones (
  id          uuid primary key default gen_random_uuid(),
  torneo_id   uuid not null references public.torneos (id) on delete cascade,
  jugador_id  uuid not null references public.profiles (id) on delete cascade default auth.uid(),
  gamertag    text,          -- copia del gamertag (lo completa el trigger): permite listar
                             -- inscriptos sin exponer la tabla profiles (que tiene emails)
  main        text not null, -- personaje principal con el que juega
  posicion    int  check (posicion >= 1), -- la carga el organizador al finalizar
  creado_en   timestamptz not null default now(),
  unique (torneo_id, jugador_id)
);

create index if not exists inscripciones_torneo_idx on public.inscripciones (torneo_id);
create index if not exists inscripciones_jugador_idx on public.inscripciones (jugador_id);

alter table public.inscripciones enable row level security;

-- Reglas de negocio que RLS no puede expresar bien: torneo abierto, cupo y main válido.
-- Se bloquea la fila del torneo (FOR UPDATE) para que dos inscripciones simultáneas no superen el cupo.
create or replace function public.validar_inscripcion()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  v_torneo     public.torneos%rowtype;
  v_personajes text[];
  v_inscriptos int;
begin
  select * into v_torneo from public.torneos where id = new.torneo_id for update;
  if not found then
    raise exception 'El torneo no existe';
  end if;

  if v_torneo.estado <> 'abierto' then
    raise exception 'Las inscripciones de este torneo están cerradas';
  end if;

  select count(*) into v_inscriptos from public.inscripciones where torneo_id = new.torneo_id;
  if v_inscriptos >= v_torneo.cupo then
    raise exception 'El torneo no tiene más cupo';
  end if;

  select personajes into v_personajes from public.juegos where id = v_torneo.juego_id;
  if coalesce(array_length(v_personajes, 1), 0) > 0 and not (new.main = any (v_personajes)) then
    raise exception 'El personaje elegido no pertenece a este juego';
  end if;

  if exists (select 1 from public.inscripciones
             where torneo_id = new.torneo_id and jugador_id = new.jugador_id) then
    raise exception 'Ya estás inscripto en este torneo';
  end if;

  select gamertag into new.gamertag from public.profiles where id = new.jugador_id;
  new.posicion := null; -- el jugador nunca define su propia posición
  return new;
end;
$$;

drop trigger if exists antes_de_inscribir on public.inscripciones;
create trigger antes_de_inscribir
  before insert on public.inscripciones
  for each row execute function public.validar_inscripcion();

drop policy if exists "Lectura publica de inscripciones" on public.inscripciones;
create policy "Lectura publica de inscripciones"
on public.inscripciones for select using (true);

-- Un jugador solo puede inscribirse a sí mismo
drop policy if exists "Jugador se inscribe" on public.inscripciones;
create policy "Jugador se inscribe"
on public.inscripciones for insert
to authenticated
with check (jugador_id = auth.uid());

-- Solo el organizador edita
drop policy if exists "Admin actualiza inscripciones" on public.inscripciones;
create policy "Admin actualiza inscripciones"
on public.inscripciones for update
using (public.mi_rol() = 'admin') with check (public.mi_rol() = 'admin');

-- El jugador cancela la suya mientras el torneo esté abierto; el admin borra cualquiera
drop policy if exists "Cancelar inscripcion" on public.inscripciones;
create policy "Cancelar inscripcion"
on public.inscripciones for delete
using (
  public.mi_rol() = 'admin'
  or (
    jugador_id = auth.uid()
    and exists (select 1 from public.torneos t where t.id = torneo_id and t.estado = 'abierto')
  )
);


-- =====================================================================
-- 5) DATOS DE JUEGOS
-- =====================================================================
insert into public.juegos (nombre, desarrolladora, plataformas, personajes) values
  ('Street Fighter 6', 'Capcom', 'PC, PS5, PS4, Xbox Series',
   array['Ryu','Ken','Chun-Li','Luke','Jamie','Guile','Kimberly','Juri','Cammy','Dee Jay',
         'Manon','Marisa','JP','Zangief','Lily','Dhalsim','E. Honda','Blanka','A.K.I.',
         'Rashid','Ed','Akuma','M. Bison','Terry','Mai','Elena']),
  ('Tekken 8', 'Bandai Namco', 'PC, PS5, Xbox Series',
   array['Jin','Kazuya','Jun','Reina','Paul','Law','King','Lars','Jack-8','Nina',
         'Asuka','Leroy','Lili','Hwoarang','Bryan','Claudio','Azucena','Raven',
         'Leo','Steve','Kuma','Panda','Yoshimitsu','Shaheen','Dragunov','Feng',
         'Victor','Alisa','Zafina','Devil Jin','Lee','Heihachi']),
  ('Guilty Gear -Strive-', 'Arc System Works', 'PC, PS5, PS4, Xbox Series, Switch',
   array['Sol Badguy','Ky Kiske','May','Axl Low','Chipp Zanuff','Potemkin','Faust',
         'Millia Rage','Zato-1','Ramlethal','Leo Whitefang','Nagoriyuki','Giovanna',
         'Anji Mito','I-No','Goldlewis','Jack-O','Happy Chaos','Baiken','Testament',
         'Bridget','Sin Kiske','Bedman?','Asuka R#','Johnny','Elphelt','A.B.A','Slayer']),
  ('Mortal Kombat 1', 'NetherRealm Studios', 'PC, PS5, Xbox Series, Switch',
   array['Liu Kang','Kung Lao','Raiden','Johnny Cage','Kitana','Mileena','Scorpion',
         'Sub-Zero','Smoke','Sindel','Li Mei','Ashrah','Baraka','Geras','Havik',
         'Kenshi','Nitara','Rain','Reptile','Shang Tsung','Tanya','General Shao','Reiko'])
on conflict (nombre) do nothing;

insert into public.torneos (juego_id, nombre, descripcion, fecha, lugar, zona, cupo, formato, estado)
select j.id, t.nombre, t.descripcion, now() + t.dias, t.lugar, t.zona, t.cupo, t.formato, t.estado
from (values
  ('Street Fighter 6', 'Street Battles #17', 'Torneo mensual abierto a todos los niveles.',
   interval '7 days',  'Arcade Palermo, CABA', 'caba', 32, 'eliminacion_doble', 'abierto'),
  ('Tekken 8', 'Iron Fist Yatay', 'Torneo de la comunidad Tekken de zona oeste.',
   interval '14 days', 'Centro Cultural Yatay', 'caba', 16, 'eliminacion_doble', 'abierto'),
  ('Guilty Gear -Strive-', 'Heaven or Hell #05', 'Formato liga: todos contra todos.',
   interval '-10 days', 'Online (PC)', 'online', 8, 'round_robin', 'finalizado')
) as t(juego, nombre, descripcion, dias, lugar, zona, cupo, formato, estado)
join public.juegos j on j.nombre = t.juego
where not exists (select 1 from public.torneos x where x.nombre = t.nombre);


