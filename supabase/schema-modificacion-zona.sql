alter table public.torneos add column if not exists zona text;

-- Torneos que ya existían: se les asigna una zona provisoria (editala después desde la app)
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
