-- pgTAP-Tests für Story 0: Profil-Trigger und Zugriffsrechte auf profiles.
-- Ausführen mit: npx supabase test db
begin;
create extension if not exists pgtap with schema extensions;

select plan(11);

-- Testdaten: zwei Nutzerinnen und ein Nutzer ohne Anzeigenamen
insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'bjoern@test.de',  '{"display_name": "  Björn  "}'),
  ('22222222-2222-2222-2222-222222222222', 'saskia@test.de',  '{"display_name": "Saskia"}'),
  ('33333333-3333-3333-3333-333333333333', 'ohne-name@test.de', '{}');

-- Struktur
select has_table('public', 'profiles', 'Tabelle profiles existiert');
select is(
  (select relrowsecurity from pg_class where oid = 'public.profiles'::regclass),
  true,
  'RLS ist auf profiles aktiviert'
);

-- Trigger bei der Registrierung
select is(
  (select display_name from public.profiles where id = '11111111-1111-1111-1111-111111111111'),
  'Björn',
  'Registrierung legt ein Profil an und entfernt Leerzeichen am Rand des Anzeigenamens'
);
select is(
  (select display_name from public.profiles where id = '33333333-3333-3333-3333-333333333333'),
  'Neue Person',
  'Ohne Anzeigenamen wird ein Platzhalter gesetzt'
);
select is(
  (select is_admin from public.profiles where id = '22222222-2222-2222-2222-222222222222'),
  false,
  'Neue Profile sind keine Admins'
);

-- Ab hier als Björn (eingeloggt) handeln
set local role authenticated;
select set_config('request.jwt.claims', '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}', true);

select is(
  (select count(*)::int from public.profiles),
  1,
  'Eingeloggt sieht man nur das eigene Profil'
);

select lives_ok(
  $$ update public.profiles set bio = 'Mag 3D-Druck' where id = '11111111-1111-1111-1111-111111111111' $$,
  'Man kann das eigene Profil ändern'
);

select throws_ok(
  $$ update public.profiles set is_admin = true where id = '11111111-1111-1111-1111-111111111111' $$,
  '42501',
  null,
  'is_admin kann man nicht selbst setzen'
);

select throws_ok(
  $$ insert into public.profiles (id, display_name) values ('44444444-4444-4444-4444-444444444444', 'Fake') $$,
  '42501',
  null,
  'Profile kann man nicht direkt anlegen'
);

update public.profiles set bio = 'gehackt' where id = '22222222-2222-2222-2222-222222222222';

-- Zurück zur Admin-Rolle, um das Ergebnis zu prüfen
reset role;

select is(
  (select bio from public.profiles where id = '22222222-2222-2222-2222-222222222222'),
  null,
  'Fremde Profile bleiben unverändert'
);

-- Anonyme Besucher sehen nichts
set local role anon;
select throws_ok(
  $$ select * from public.profiles $$,
  '42501',
  null,
  'Ohne Login ist profiles nicht lesbar'
);
reset role;

select * from finish();
rollback;
