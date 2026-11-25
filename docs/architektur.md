# Architektur: U social

## Skizze

Die App ist bewusst dünn: Es gibt kein eigenes Backend. Die Fachregeln liegen
als SQL-Funktionen, RLS-Policies und Trigger in Postgres (Supabase) und werden
als Migrations im Repository versioniert. So gelten sie für jeden Zugriff –
auch an der App vorbei – und werden genau dort getestet, wo sie laufen.

```mermaid
flowchart TD
    App["Expo-App (React Native, TypeScript)<br/>Screens, UI-Logik"] -->|supabase-js| Auth[Supabase Auth<br/>E-Mail + Passwort]
    App -->|Tabellen & RPC| API[PostgREST]
    App -->|Upload, Signed URLs| Storage[Supabase Storage]
    App -->|DMs live| RT[Realtime]
    API --> DB[(Postgres)]
    RT --> DB
    DB --- Rules["Fachregeln<br/>SQL-Funktionen, RLS-Policies, Trigger"]
    Storage -->|Storage-Policies nutzen Regeln| Rules
    Cron[pg_cron] -->|Aufräumen| DB
    Tests["pgTAP-Tests<br/>(supabase test db in der CI)"] -.prüfen.-> Rules
    Jest["Jest-Tests"] -.prüfen.-> App
```

## Datenmodell

```mermaid
erDiagram
    profiles ||--|| user_state : hat
    profiles ||--|{ circles : definiert
    profiles ||--o{ connections : "owner"
    profiles ||--o{ qr_tokens : erzeugt
    profiles ||--o{ blocks : blockiert
    profiles ||--o{ posts : schreibt
    posts ||--o| meetups : "bei Typ meetup"
    posts ||--o{ meetup_responses : erhält
    posts ||--o{ comments : erhält
    profiles ||--o{ conversations : führt
    conversations ||--o{ messages : enthält
    profiles ||--o{ reports : meldet
    profiles ||--o{ moderation_actions : betrifft
```

| Tabelle | Wichtige Spalten | Anmerkung |
| --- | --- | --- |
| `profiles` | id (= auth.users.id), display_name, bio, pronouns, avatar_path, favorite_photo_path, is_admin | Anzeigename nicht eindeutig; `is_admin` für Nutzer nicht änderbar |
| `user_state` | user_id, feed_seen_at | getrennt vom Profil, weil Freunde das Profil lesen dürfen |
| `circles` | owner_id, level (1–3), name | Standardnamen Close Friends / Friends / Bekannte, umbenennbar |
| `connections` | owner_id, friend_id, circle_level, connected_at | gerichtet, zwei Zeilen pro Freundschaft; nur `owner_id = auth.uid()` lesbar |
| `qr_tokens` | token_hash, user_id, expires_at, used_at | rotiert alle 30 s |
| `blocks` | blocker_id, blocked_id | löscht bestehende Verbindungen |
| `posts` | id, author_id, type, body, media_path, max_circle, duration_hours, created_at, expires_at, hidden_at | Typen: text, image, video, audio, meetup |
| `meetups` | post_id, location_name, starts_at | Zusatzdaten für Treffen-Posts |
| `meetup_responses` | post_id, user_id, response | Zusagen für alle sichtbar, Absagen nur für den Autor |
| `comments` | id, post_id, author_id, body, created_at, hidden_at | sichtbar für alle, die den Post sehen |
| `conversations` | id, user_a, user_b | eine pro Paar |
| `messages` | id, conversation_id, sender_id, body, media_path, reply_to_post_id | `reply_to_post_id` für „als DM antworten“ |
| `reports` | reporter_id, target_type, target_id, reason, snapshot, status | eindeutig je Melder und Ziel; Snapshot sichert Beweise |
| `moderation_actions` | admin_id, user_id, action, report_id, created_at | warn / delete_content / delete_account |

Storage-Buckets: `avatars` (für Verbundene lesbar), `media` (Pfad
`author_id/post_id/datei`, Lesen nur bei `can_see_post`), `evidence` (nur Admins).

Fachregeln als Datenbankobjekte: `can_see_post()`, Prüfung der Ablaufdauer auf
`posts`, `connect_via_qr()` als RPC, Trigger auf `reports` für das automatische
Ausblenden. Zeitabhängige Funktionen bekommen einen Parameter `p_now` (Standard
`now()`), damit Grenzfälle exakt testbar sind.

## Technologie-Stack

| Bereich | Wahl |
| --- | --- |
| Sprache | TypeScript (App), SQL / PL/pgSQL (Fachregeln) |
| Framework | Expo (React Native) mit Expo Router |
| Datenbank | Supabase (Postgres, Auth, Storage, Realtime): lokal per Docker zum Entwickeln, ein Cloud-Projekt in Frankfurt mit dem Stand von `main` |
| Tests | pgTAP über `supabase test db` in der CI (optional lokal per Docker), Jest für UI-Logik |
| Linter/Formatter | ESLint, Prettier |
| CI | GitHub Actions |
| Build | EAS Build (APK) |

## Entscheidungsprotokoll

| Datum | Entscheidung | Begründung | Alternative (z. B. Agenten-Vorschlag) |
| --- | --- | --- | --- |
| 08.11.2026 | Expo (React Native) statt React-Web-App | Kamera, Audio, Video und eine installierbare App sind für eine Freundes-App zentral | Ursprüngliche Idee: React + Vercel als Web-App |
| 08.11.2026 | Kein eigenes Backend, Fachregeln in Postgres (SQL-Funktionen, RLS, Trigger) | Ein Ort der Wahrheit; Regeln gelten auch für Zugriffe an der App vorbei | Eigener Node-Server mit API |
| 08.11.2026 | Fachregeln mit pgTAP gegen lokales Supabase testen | Getestet wird die echte Implementierung, nicht eine Nachbildung | **Agenten-Vorschlag verworfen:** Regeln zusätzlich als reinen TypeScript-Code mit Mock-Daten testen – hätte nur eine Kopie geprüft, die von der echten Regel abweichen kann |
| 08.11.2026 | Gerichtete Verbindungen (zwei Zeilen pro Freundschaft) | Geheime Einsortierung wird per RLS in der Datenbank erzwungen | Eine Zeile mit zwei Kreisspalten – dann wäre die fremde Einsortierung lesbar |
| 08.11.2026 | Drei feste, umbenennbare Kreise | Ein Schichtenmodell ist einfacher als frei definierbare Gruppen | Beliebig viele Gruppen (vgl. Google+ Circles) |
| 08.11.2026 | Ablaufdauer nur 24 h / 72 h / 7 Tage | 12 h würde FOMO und ständiges Nachsehen fördern | 12 h als zusätzliche Option |
| 08.11.2026 | Login per E-Mail + Passwort | Einfach, Test-Accounts leicht anlegbar | Magic Link, Social Login |
| 08.11.2026 | Anzeigename nicht eindeutig, kein @handle | Verbinden nur per QR, daher keine Suche nötig | Eindeutige Nutzernamen |
| 08.11.2026 | Freund entfernen löscht beide Richtungen | Keine „halben“ Freundschaften | Einseitiges Entfernen |
| 08.11.2026 | Privates Archiv: Medien eigener Posts bleiben erhalten | Gewünschtes Feature; Speicherverbrauch wächst dadurch bewusst | Medien nach Ablauf löschen |
| 08.11.2026 | Supabase-CLI als devDependency | Gleiche Version für Team und CI | Globale Installation |
| 08.11.2026 | Repository auf GitHub, CI über GitHub Actions | Mit dem Dozenten abgesprochen | Nordakademie-GitLab mit `.gitlab-ci.yml` |
| 08.11.2026 | Endpunkt ist eine APK, keine Store-Verteilung | Reicht für Prüfung und Tests | App Store / Play Store |
| 11.11.2026 | Projekt allein fortführen, Scope und MVP-Linie unverändert | Teampartnerin fällt für das Semester aus; voller Scope bleibt Ziel, die MVP-Linie ist das Sicherheitsnetz | **Agenten-Vorschlag verworfen:** MVP-Linie für eine Person nach oben verschieben |
| 20.11.2026 | Nur ein Supabase-Cloud-Projekt (Demo), kein eigenes Projekt für echte Nutzer | Für die Uni-Abgabe gibt es keine echten Nutzer; ein zweites Projekt kann später für Freunde angelegt werden | **Agenten-Vorschlag verworfen:** zwei Cloud-Projekte für dev und prod |
| 25.11.2026 | Migrationen kommen nur über die GitHub-Integration beim Merge nach `main` in die Cloud | Die Cloud entspricht immer genau `main`; nur Code mit grüner CI erreicht die Demo | **Agenten-Vorschlag verworfen:** vor dem Merge manuell per `supabase db push` in die Cloud spielen und dort am Handy testen – die Cloud hätte ungemergte Migrationen enthalten können |
| 25.11.2026 | Gemergte Migrationen werden nie geändert, Korrekturen nur als neue Migration | Repository und Cloud-Datenbank bleiben synchron | Migration anpassen und `db reset` – in der Cloud nicht möglich |
| 25.11.2026 | Testen vor dem Merge lokal, Handy per USB über `adb reverse` | Keine Firewall-Regeln, keine wechselnden IP-Adressen, funktioniert auch am Handy-Hotspot und offline | Handy per WLAN (Firewall-Block-Regeln, Hotspot als öffentliches Netz); Supabase Pro mit Branching (ca. 25 $/Monat) |
| 25.11.2026 | Zusätzliches Review jedes Pull Requests durch ein anderes KI-Modell mit frischem Kontext | Ersetzt teilweise das fehlende Partner-Review; übernommene und verworfene Hinweise werden im PR begründet | Nur Selbst-Review |
| 20.11.2026 | Selbst-Review am Folgetag mit Checkliste (`.github/pull_request_template.md`) statt Partner-Review | Ein-Personen-Team | Review-Pflicht beibehalten – nicht mehr erfüllbar |
| 20.11.2026 | `.gitattributes` erzwingt LF-Zeilenenden | Nach einem Rechnerwechsel zeigte Git 37 Dateien als geändert, die sich nur in den Zeilenenden unterschieden | `core.autocrlf` auf jedem Rechner einzeln einstellen |
