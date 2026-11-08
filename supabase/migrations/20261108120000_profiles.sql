-- Story 0 (Walking Skeleton): Profile, die bei der Registrierung automatisch entstehen.

create table public.profiles (
  id                  uuid primary key references auth.users (id) on delete cascade,
  display_name        text not null check (char_length(btrim(display_name)) between 1 and 50),
  bio                 text check (char_length(bio) <= 300),
  pronouns            text check (char_length(pronouns) <= 30),
  avatar_path         text,
  favorite_photo_path text,
  is_admin            boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

comment on table public.profiles is 'Öffentliches Profil einer Person. Anzeigename ist bewusst nicht eindeutig.';
comment on column public.profiles.is_admin is 'Nur manuell in der Datenbank setzbar, nie durch Nutzer selbst.';

alter table public.profiles enable row level security;

-- Vorerst sieht jede Person nur ihr eigenes Profil. Lesen durch Verbundene folgt mit Story 2.
create policy "profiles: eigenes Profil lesen"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()));

create policy "profiles: eigenes Profil ändern"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Rechte: Anlegen nur über den Trigger, Löschen nur über das Konto,
-- ändern nur ausgewählte Spalten (insbesondere nicht is_admin).
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (display_name, bio, pronouns, avatar_path, favorite_photo_path) on public.profiles to authenticated;

-- updated_at pflegen
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Profil automatisch anlegen, sobald sich jemand registriert.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(left(nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''), 50), 'Neue Person')
  );
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
