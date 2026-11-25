# U social

Social Media nur für echte Freunde – healthy by design. Verbinden per QR-Code
beim echten Treffen, drei geheime Kreise, verblassende Posts, ein endlicher
chronologischer Feed und keine Likes oder Zahlen.

Projekt im Modul „Software mit KI entwickeln“ (Nordakademie) von
Björn Bernhardt (bis 11.11.2026 gemeinsam mit Saskia Wengst).

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
- Docker Desktop für das lokale Supabase (Images einmal im WLAN laden: mehrere GB)
- Android Platform-Tools (`adb`): kommen mit Android Studio
  (`%LOCALAPPDATA%\Android\Sdk\platform-tools`, ggf. in den PATH aufnehmen)
  oder einzeln per `winget install Google.PlatformTools`
- Android-Handy mit Expo Go und aktiviertem USB-Debugging (nur während der
  Entwicklung einschalten) – oder ein Emulator aus Android Studio; `adb reverse`
  funktioniert mit beiden

## Einrichten (einmalig)

```bash
npm install
npm run db:start                # lokales Supabase starten, Migrationen anwenden, .env.local schreiben
```

`db:start` schreibt `.env.local` automatisch mit URL und anon key des lokalen
Supabase (Script `scripts/write-env-local.mjs`). Manuell geht das mit
`npm run env:local`.

## Starten

Handy per USB anschließen, dann:

```bash
npm run db:start                # falls Supabase noch nicht läuft
npm run dev:usb                 # adb reverse + Expo-Server; danach im Terminal "a" drücken
```

`adb reverse` leitet die Ports 54321 (Supabase) und 8081 (Expo) über das
USB-Kabel weiter. Das Handy spricht dadurch mit `localhost` des Laptops –
ohne WLAN, Firewall-Regeln oder IP-Adressen, auch am Handy-Hotspot oder
offline. Für reine UI-Arbeit geht auch `npm run dev` und dann `w` für die
Web-Version im Browser.

## Datenbank ändern

```bash
npx supabase migration new <name>   # neue Migration in supabase/migrations/
npm run db:reset                    # lokale Datenbank mit allen Migrationen neu aufsetzen
npm run db:test                     # pgTAP-Tests lokal ausführen
```

In die Cloud kommen Migrationen **nur über `main`**: Beim Merge spielt die
GitHub-Integration von Supabase sie automatisch ein. Kein manuelles
`supabase db push`. Gemergte Migrationen werden nie mehr geändert –
Korrekturen kommen als neue Migration.

## Testen

```bash
npm run check       # Lint, Typecheck, Jest
npm run db:test     # pgTAP-Tests gegen das lokale Supabase
```

Bei jedem Pull Request führt GitHub Actions alles aus, die pgTAP-Tests gegen
ein frisch gestartetes Supabase im Runner.

| Befehl | Zweck |
| --- | --- |
| `npm run db:start` / `db:stop` | lokales Supabase starten / stoppen |
| `npm run db:reset` | lokale Datenbank neu aufsetzen |
| `npm run usb` | nur die Port-Weiterleitung per `adb reverse` |

## Umgebungen

| Umgebung | Zweck | Stand |
| --- | --- | --- |
| Lokal (Docker) | Entwickeln und Testen, Handy per USB | Feature-Branch |
| Supabase Cloud (ein Projekt, Frankfurt) | Demo für den Dozenten | immer `main` |

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
Pull Request mit Selbst-Review (Checkliste im PR-Template) in `main`. Schemaänderungen nur als Migration
(`npx supabase migration new <name>`), nie direkt im Dashboard.
