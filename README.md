# U social

Social Media nur für echte Freunde – healthy by design. Verbinden per QR-Code
beim echten Treffen, drei geheime Kreise, verblassende Posts, ein endlicher
chronologischer Feed und keine Likes oder Zahlen.

Projekt im Modul „Software mit KI entwickeln“ (Nordakademie) von
Björn Bernhardt und Saskia Wengst.

## Dokumentation

| Datei | Inhalt |
| --- | --- |
| [docs/steckbrief.md](docs/steckbrief.md) | Vision, Kernfunktionen, Scope, Kriterien-Check |
| [docs/architektur.md](docs/architektur.md) | Architekturskizze, Datenmodell, Entscheidungsprotokoll |
| [docs/backlog.md](docs/backlog.md) | Stories mit Akzeptanzkriterien und MVP-Linie |
| [docs/tagebuch.md](docs/tagebuch.md) | Projekttagebuch |
| [.github/copilot-instructions.md](.github/copilot-instructions.md) | Regeln für KI-Agenten und Definition of Done |

## Voraussetzungen

- Node.js 22
- Docker Desktop (läuft im Hintergrund) für das lokale Supabase
- Expo Go auf dem Handy oder ein Browser für die Web-Version

## Einrichten (einmalig)

```bash
npm install
cp .env.example .env.local      # unter Windows: copy .env.example .env.local
npm run db:start                # startet Supabase lokal und wendet alle Migrations an
npx supabase status             # API URL und anon key in .env.local eintragen
```

## Starten

```bash
npm run dev
```

Startet Supabase lokal und den Expo-Entwicklungsserver. Danach im Terminal
`w` für die Web-Version drücken oder den QR-Code mit Expo Go scannen (dafür in
`.env.local` die LAN-IP des PCs statt `127.0.0.1` eintragen).

## Testen

```bash
npm run check
```

Führt Lint, Typecheck, Jest (UI-Logik) und die pgTAP-Tests der Datenbank
(`supabase test db`) aus. Die gleichen Schritte laufen in der GitHub-Actions-
Pipeline bei jedem Pull Request.

| Befehl | Zweck |
| --- | --- |
| `npm test` | Jest-Tests der App |
| `npm run db:test` | pgTAP-Tests gegen das lokale Supabase |
| `npm run db:reset` | lokale Datenbank neu aufsetzen (alle Migrations) |
| `npm run db:stop` | lokales Supabase stoppen |

## Projektstruktur

```
src/app/              Screens (Expo Router)
src/components/       UI-Bausteine
src/lib/              Supabase-Client, Sitzung, UI-Logik
supabase/migrations/  Datenbankschema und Fachregeln (SQL)
supabase/tests/       pgTAP-Tests der Fachregeln
docs/                 Projektdokumentation
```

## Arbeitsweise

`main` ist geschützt. Neue Arbeit entsteht auf `feature/<name>` und kommt per
Pull Request mit Review in `main`. Schemaänderungen nur als Migration
(`npx supabase migration new <name>`), nie direkt im Dashboard.
