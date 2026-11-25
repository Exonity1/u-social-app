# Instructions für KI-Agenten: U social

Diese Datei gilt für jeden Agenten, der in diesem Repository arbeitet
(GitHub Copilot, Claude u. a.). Lies vor jeder Aufgabe auch
`docs/steckbrief.md`, `docs/architektur.md` und `docs/backlog.md` sowie für
Expo-spezifische Hinweise `AGENTS.md`.

## Git – verbindliche Regeln

- **Niemals committen, pushen, mergen oder rebasen.** Das macht das Team
  (Björn Bernhardt) immer selbst. Auch nicht „nur kurz“ und
  auch nicht auf Feature-Branches.
- `main` ist geschützt; Code kommt nur über Pull Requests hinein.
- Gearbeitet wird auf Branches `feature/<kurzname>`. Einen neuen Branch
  anlegen ist erlaubt, wenn das Team darum bittet.

## Projekt in einem Satz

U social ist eine Social-Media-App nur für echte Freunde: Verbinden per
rotierendem QR-Code, drei geheime Kreise, verblassende Posts, chronologischer
endlicher Feed, keine Likes und keine Zahlen – healthy by design.

## Architektur – verbindliche Regeln

- **Kein eigenes Backend.** Die App (Expo, React Native, TypeScript) spricht
  über `supabase-js` direkt mit Supabase.
- **Fachregeln leben in Postgres:** als SQL-Funktionen, RLS-Policies und
  Trigger. Fachregeln nicht zusätzlich in TypeScript nachbauen – die App
  verlässt sich auf die Datenbank.
- **Schemaänderungen nur als Migration** in `supabase/migrations/`
  (`npx supabase migration new <name>`). Nie direkt im Dashboard ändern.
- **Migrationen kommen nur über `main` in die Cloud.** Das einzige
  Supabase-Cloud-Projekt bekommt neue Migrationen ausschließlich über die
  GitHub-Integration beim Merge nach `main` – nie per `npx supabase db push`.
  Entwickelt und getestet wird lokal (`npx supabase start`).
- **Gemergte Migrationen nie ändern.** Korrekturen kommen als neue Migration.
  Vor dem Merge darf eine Migration noch angepasst werden.
- **Jede Tabelle hat RLS aktiviert.** Ohne Policy ist nichts lesbar.
- **Geheime Einsortierung:** `connections` ist gerichtet (zwei Zeilen pro
  Freundschaft) und nur für `owner_id = auth.uid()` lesbar. Nichts darf
  verraten, in welchem Kreis jemand bei anderen steht – auch nicht indirekt
  (Zähler, Fehlermeldungen, Profilfelder).
- **Keine Zahlen in der UI:** keine Likes, Follower-, Freundes-, Kommentar-
  oder View-Zahlen. Keine Lesebestätigungen, kein „schreibt gerade“.
- **Zeitabhängige Funktionen** bekommen einen Parameter `p_now timestamptz
  default now()`, damit Tests Grenzfälle exakt prüfen können.
- **Secrets:** Der `service_role`-Key gehört niemals in die App oder ins
  Repository. Die App nutzt nur URL und `anon`-Key aus `.env`
  (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`).
- **Design:** ausschließlich Dark Mode.

## Tests

- Fachregeln: pgTAP-Tests in `supabase/tests/*.test.sql`, ausgeführt mit
  `npx supabase test db` – automatisch in der CI bei jedem Pull Request,
  lokal optional per Docker (`npx supabase start`).
- UI-Logik (z. B. Verblassen in der letzten Stunde): Jest.
- Jedes Akzeptanzkriterium einer Story wird zu mindestens einem Test.
  Randfälle aus der Spezifikation werden explizit getestet.

## Definition of Done

Eine Story ist fertig, wenn:

1. alle Akzeptanzkriterien erfüllt und als Tests umgesetzt sind (pgTAP für
   Fachregeln, Jest für UI-Logik),
2. Lint, Typecheck und Jest lokal sowie alle Tests inkl. `supabase test db`
   in der CI grün sind,
3. Schemaänderungen ausschließlich als Migration in `supabase/migrations/`
   vorliegen,
4. jede neue Tabelle RLS aktiviert hat und mindestens ein Test unberechtigten
   Zugriff prüft,
5. der Pull Request mit der Checkliste aus `.github/pull_request_template.md`
   selbst reviewt wurde, mit etwas Abstand, am besten am Folgetag, und
   zusätzlich von einem anderen KI-Modell als dem, mit dem der Code entstanden
   ist (frischer Kontext: nur Diff, Story/Spezifikation und diese Datei). Im
   Pull Request steht, welche Hinweise übernommen oder verworfen wurden und
   warum (Ein-Personen-Team seit 11.11.2026),
6. wichtige Entscheidungen im Entscheidungsprotokoll (`docs/architektur.md`)
   und die Arbeit mit dem Agenten im Tagebuch (`docs/tagebuch.md`) stehen.

## Arbeitsweise

- Vor dem Umsetzen einer Story: Spezifikation in `docs/specs/<Nr>-<name>.md`
  (Vorlage `docs/spec.md`); bei Unklarheiten Rückfragen stellen statt raten.
- Kleine, nachvollziehbare Änderungen; keine Abhängigkeiten ohne Rückfrage
  hinzufügen.
