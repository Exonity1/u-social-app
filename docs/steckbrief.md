# Projekt-Steckbrief: U social

**Team:** Björn Bernhardt, Saskia Wengst
**Stand:** 08.11.2026

## Vision

Für junge Menschen, die mit ihren echten Freunden in Kontakt bleiben wollen,
ohne den Druck von Likes, Reichweite und endlosen Feeds, ist U social eine
Social-Media-App für den eigenen Freundeskreis, in der jede Person für ihre
Freunde teilt – ohne Zahlen, ohne Publikum, healthy by design.

## Zielgruppe und Nutzungsszenario

Studierende und junge Erwachsene, die sich im echten Leben treffen und danach
in Kontakt bleiben wollen. Man verbindet sich nur, wenn man sich tatsächlich
gesehen hat (QR-Code), teilt Momente gezielt mit engen Freunden oder dem
weiteren Bekanntenkreis und schaut gelegentlich in einen endlichen Feed,
statt stundenlang zu scrollen. Es gibt keine Creator und kein Publikum:
Alle sind gleichberechtigt und teilen nur für ihre Freunde.

## Kernfunktionen

1. **Verbinden beim echten Treffen:** Neue Freunde werden nur über einen
   rotierenden QR-Code hinzugefügt und in einen von drei Kreisen einsortiert
   (Close Friends, Friends, Bekannte). Wie man selbst bei anderen
   einsortiert ist, sieht man nie.
2. **Verblassende Posts für ausgewählte Kreise:** Text, Bild (mit/ohne Text),
   Video, Audio oder ein Treffen-Vorschlag, sichtbar bis zu einem gewählten
   Kreis und nach 24 h, 72 h oder 7 Tagen verblasst. Eigene Posts bleiben im
   privaten Archiv.
3. **Endlicher, chronologischer Feed:** Alle sichtbaren Posts nach Alter, mit
   Trennlinie „Neu seit deinem letzten Besuch“. Kommentare sind öffentlich
   oder gleichwertig als DM an die postende Person möglich.
4. **Direktnachrichten** zwischen verbundenen Personen, ohne Lesebestätigung
   und ohne „schreibt gerade“.
5. **Sicherheit und Moderation:** Blockieren, Melden mit Hilfsangeboten,
   automatisches Ausblenden ab drei Meldungen und eine Admin-Seite zum
   Freigeben, Löschen, Verwarnen und Sperren.

## Scope

| Drin | Bewusst draußen |
| --- | --- |
| Registrierung und Login per E-Mail + Passwort | Profil-Track (Musik als Profil-Theme) |
| Profil: Anzeigename (nicht eindeutig), Profilbild, Bio, Pronomen, Lieblingsfoto, „Kennt ihr euch seit“ | Verteilung über App Store / Play Store – Endpunkt ist eine baubare APK |
| Verbinden per rotierendem QR-Code, Entfernen löscht beide Richtungen | Likes, Follower- und Freundeszahlen, gemeinsame Freunde |
| Drei umbenennbare Kreise, geheime Einsortierung, neue Freunde im äußersten Kreis | Algorithmischer Feed, Streaks, Lesebestätigungen |
| Posts: Text, Bild, Video (~30 s, 720p), Audio, Treffen (Ort + Text + Zu-/Absage) | Nutzernamen (@handle) und Personensuche |
| Sichtbarkeit bis Kreis X, Ablauf 24 h / 72 h / 7 Tage, Verblassen in der letzten Stunde | Live-Standort |
| Privates Archiv eigener Posts | Light Mode |
| Chronologischer Feed mit Trennlinie | |
| Kommentare öffentlich oder als DM an den Autor | |
| Direktnachrichten | |
| Blockieren, Melden mit Hilfsangeboten, Ausblenden ab drei Meldungen | |
| Admin-Seite (nur bei `is_admin = true`): freigeben, löschen, verwarnen, Konto löschen | |
| Ausschließlich Dark Mode | |
| Onboarding mit der Philosophie (niedrige Priorität) | |

## Kriterien-Check

| Kriterium | Wie erfüllt? |
| --- | --- |
| Persistente Daten | Supabase (Postgres) für Profile, Verbindungen, Posts, Kommentare, DMs und Meldungen; Supabase Storage für Bilder, Videos und Audio. Schema versioniert als Migrations im Repository. |
| Testbare Domänenlogik: mindestens drei Fachregeln mit Randfällen | Die Regeln sind SQL-Funktionen, RLS-Policies und Trigger und werden mit pgTAP gegen ein lokales Supabase getestet: **(1) Sichtbarkeit:** Post sichtbar, wenn Betrachter beim Autor höchstens im gewählten Kreis steht, nicht blockiert ist, der Post nicht abgelaufen und nicht ausgeblendet ist (Randfälle: keine Verbindung, Kreis nachträglich geändert, eigener Post, Blockierung). **(2) Ablauf:** nur 24/72/168 h erlaubt, Ablauf = Erstellzeit + Dauer (Randfälle: genau auf der Grenze, ungültige Dauer). **(3) QR-Verbindung:** Token 30 s gültig und einmalig, keine Verbindung mit sich selbst oder bei Blockierung, keine doppelte Verbindung. **(4) Moderation:** ab drei Meldungen verschiedener Personen ausgeblendet, Mehrfachmeldung derselben Person zählt einmal, höchstens eine Verwarnung. |
| Lauffähig: baut und testet in der CI, startet lokal mit einem dokumentierten Befehl | Expo-App startet lokal mit einem im README dokumentierten Befehl; GitHub Actions führt Lint, App-Tests und `supabase test db` aus; APK über EAS Build. |

## Risiken und offene Fragen

- **Großer Scope für zwei Personen.** Bewusst so gewählt; die MVP-Linie im
  Backlog legt fest, was bis Woche 8 sicher fertig wird.
- **Fehler in RLS-Policies** würden private Posts für falsche Personen
  sichtbar machen – der größte denkbare Vertrauensbruch. Deshalb werden die
  Sichtbarkeitsregeln direkt gegen die Datenbank getestet.
- **Geheime Einsortierung ist nie perfekt:** Vergleichen zwei Freunde ihre
  Feeds, merken sie Unterschiede. Die App selbst verrät nichts.
- **Video** ist aufwendig (Komprimierung in Expo) und belastet Speicher und
  Datenverkehr im Supabase Free Plan (1 GB Speicher, 5 GB Egress/Monat).
- **Realtime für DMs** ist technisch der aufwendigste Teil.
- **Lokale Tests brauchen Docker** (Docker Desktop unter Windows).
- Repository liegt auf GitHub statt im Nordakademie-GitLab (mit dem Dozenten
  abgesprochen); ggf. späterer Umzug.

## Änderungen

- 08.11.2026: Erste Fassung.
