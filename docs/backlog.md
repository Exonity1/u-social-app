# Product Backlog: U social

Geordnet: oben steht, was zuerst umgesetzt wird. Jede Story ist vertikal
geschnitten (durchquert alle nötigen Schichten: App, Datenbank, Policies) und
hat zwei bis drei prüfbare Akzeptanzkriterien. Kriterien zu Fachregeln werden
als pgTAP-Tests gegen die Datenbank umgesetzt.

## 0 -- Walking Skeleton

Als neue Nutzerin möchte ich mich mit E-Mail und Passwort registrieren und
einloggen, damit ich in die App komme und alle Komponenten (App, Auth,
Datenbank, Tests, CI) einmal durchlaufen werden.

- [x] Nach der Registrierung legt ein Trigger automatisch ein Profil in `profiles` an; der Startscreen zeigt den Anzeigenamen.
- [x] Login, Logout und das Wiederherstellen der Sitzung nach einem App-Neustart funktionieren.
- [x] Ein Befehl aus dem README startet die App lokal; Lint, Jest und `supabase test db` sind grün.
- [x] Pipeline (Lint + Tests) ist grün

## 1 -- Profil bearbeiten

Als Nutzer möchte ich Anzeigename, Bio, Pronomen, Profilbild und ein
Lieblingsfoto festlegen, damit meine Freunde wissen, wer ich bin.

- [ ] Die Änderungen werden gespeichert und sind nach einem Neustart weiterhin sichtbar.
- [ ] Ein Nutzer kann nur sein eigenes Profil ändern, und `is_admin` kann er nicht selbst setzen (pgTAP).
- [ ] Es werden weder Freundes- noch Postzahlen angezeigt.

## 2 -- Verbinden per QR-Code

Als Nutzerin möchte ich mich mit jemandem verbinden, indem eine Person den
rotierenden QR-Code der anderen scannt, damit nur Menschen verbunden sind,
die sich wirklich getroffen haben.

- [ ] Der QR-Code erneuert sich alle 30 Sekunden; ein abgelaufenes oder bereits benutztes Token wird abgelehnt (pgTAP).
- [ ] Eine Verbindung mit sich selbst und eine doppelte Verbindung sind nicht möglich (pgTAP).
- [ ] Nach dem Scan stehen beide im äußersten Kreis des jeweils anderen, und beide sehen „Kennt ihr euch seit <Datum>“.

## 3 -- Kreise verwalten

Als Nutzer möchte ich Freunde in die Kreise Close Friends, Friends und
Bekannte einsortieren und die Kreise umbenennen, damit ich steuern kann,
wer was sieht.

- [ ] Die Freundesliste ist nach letztem Kontakt sortiert und zeigt keine Gesamtzahl.
- [ ] Niemand kann lesen, in welchem Kreis er selbst bei anderen steht – weder in der App noch per direkter Datenbankabfrage (pgTAP).
- [ ] Umbenannte Kreisnamen sind nur für die eigene Person sichtbar.

## 4 -- Text-Post mit Sichtbarkeit und Ablauf

Als Nutzerin möchte ich einen Text-Post schreiben, der bis zu einem
gewählten Kreis sichtbar ist und nach 24 h, 72 h oder 7 Tagen verblasst,
damit ich ohne Druck teilen kann.

- [ ] Nur die Dauern 24, 72 und 168 Stunden werden akzeptiert; `expires_at` = Erstellzeit + Dauer (pgTAP, inkl. Grenze genau zum Ablaufzeitpunkt).
- [ ] Ein Post ist nur für verbundene Personen sichtbar, deren Kreis höchstens dem gewählten Kreis entspricht; der Autor sieht seinen Post immer (pgTAP).
- [ ] Wird ein Freund in einen äußeren Kreis verschoben, verliert er sofort den Zugriff auf Posts, die nur für innere Kreise bestimmt sind (pgTAP).

## 5 -- Chronologischer Feed

Als Nutzer möchte ich alle Posts, die ich sehen darf, chronologisch sehen,
damit ich in kurzer Zeit auf dem neuesten Stand bin.

- [ ] Der Feed zeigt nur sichtbare, nicht abgelaufene Posts, sortiert nach Erstellzeit, und endet mit „Du bist auf dem neuesten Stand“.
- [ ] Eine Trennlinie markiert „Neu seit deinem letzten Besuch“; der Autor erfährt nicht, wer seinen Post gesehen hat.
- [ ] Posts verblassen optisch erst in der letzten Stunde vor dem Ablauf (Jest).

## 6 -- Bild-Post

Als Nutzerin möchte ich ein Bild mit oder ohne Text posten, damit ich
Momente teilen kann.

- [ ] Bilder werden vor dem Upload verkleinert und komprimiert und im privaten Bucket `media` gespeichert.
- [ ] Eine Bilddatei kann nur abgerufen werden, wer auch den Post sehen darf (Storage-Policy, pgTAP).
- [ ] Nicht erlaubte Dateitypen und zu große Dateien werden abgelehnt.

## 7 -- Direktnachrichten

Als Nutzer möchte ich verbundenen Personen Nachrichten schreiben, damit wir
uns direkt austauschen können.

- [ ] Nachrichten erscheinen ohne Neuladen beim Gegenüber (Realtime).
- [ ] Nur die beiden Beteiligten können eine Unterhaltung lesen, und schreiben können nur verbundene, nicht blockierte Personen (pgTAP).
- [ ] Es gibt keine Lesebestätigung und keine „schreibt gerade“-Anzeige.

## 8 -- Kommentare öffentlich oder als DM

Als Nutzerin möchte ich auf einen Post öffentlich kommentieren oder
gleichwertig als DM an den Autor antworten, damit ich selbst wählen kann,
wie persönlich meine Antwort ist.

- [ ] Beide Optionen sind in der UI gleichwertig dargestellt; die DM enthält einen Verweis auf den Post.
- [ ] Öffentliche Kommentare sieht genau, wer auch den Post sehen darf (pgTAP).
- [ ] Es wird keine Kommentarzahl angezeigt.

## 9 -- Freund entfernen und Blockieren

Als Nutzer möchte ich Verbindungen leise lösen und Personen blockieren
können, damit ich mich sicher fühle.

- [ ] Entfernen löscht die Verbindung in beiden Richtungen, ohne die andere Person zu benachrichtigen.
- [ ] Nach dem Blockieren sehen sich beide gegenseitig nicht mehr (Posts, Kommentare, DMs), und ein erneutes Verbinden per QR ist nicht möglich (pgTAP).

## 10 -- Melden mit automatischem Ausblenden

Als Nutzerin möchte ich Posts, Kommentare, Nachrichten und Profile melden
können und dabei Hilfsangebote sehen, damit Probleme schnell behandelt werden.

- [ ] Ab drei Meldungen verschiedener Personen wird der Inhalt automatisch ausgeblendet; mehrere Meldungen derselben Person zählen einmal; eigene Inhalte können nicht gemeldet werden (pgTAP).
- [ ] Beim Melden wird ein Snapshot des Inhalts gesichert, der auch nach Ablauf oder Löschung erhalten bleibt.
- [ ] Der Meldevorgang zeigt Hilfsangebote (z. B. TelefonSeelsorge, Nummer gegen Kummer).

---

**MVP-Linie** -- alles oberhalb muss bis Woche 8 fertig sein, alles
unterhalb nur, wenn Zeit bleibt.

---

## 11 -- Admin-Seite

Als Admin möchte ich alle gemeldeten Inhalte sehen und Maßnahmen ergreifen,
damit die Community sicher bleibt.

- [ ] Die Admin-Seite erscheint nur bei `is_admin = true`; alle Admin-Aktionen werden zusätzlich in der Datenbank geprüft (pgTAP).
- [ ] Ein Admin kann Inhalte freigeben oder dauerhaft löschen und Nutzer verwarnen.
- [ ] Nach höchstens einer Verwarnung führt ein weiterer Verstoß zur Löschung des Kontos; gesicherte Beweise bleiben erhalten (pgTAP).

## 12 -- Treffen-Post

Als Nutzer möchte ich ein Treffen vorschlagen (Ort + Text), damit wir uns im
echten Leben sehen.

- [ ] Freunde, die den Post sehen, können zu- oder absagen und ihre Antwort ändern.
- [ ] Zusagen sind für alle sichtbar, die den Post sehen; Absagen nur für den Autor (pgTAP).

## 13 -- Audio-Post

Als Nutzerin möchte ich eine Sprachnachricht posten, damit ich ohne großen
Aufwand etwas teilen kann.

- [ ] Aufnahme, Upload und Wiedergabe funktionieren auf Android.
- [ ] Für Audiodateien gelten dieselben Sichtbarkeitsregeln wie für Bilder (pgTAP).

## 14 -- Video-Post

Als Nutzer möchte ich kurze Videos posten, damit ich bewegte Momente teilen
kann.

- [ ] Videos sind auf ca. 30 Sekunden und 720p begrenzt und werden vor dem Upload komprimiert.
- [ ] Für Videodateien gelten dieselben Sichtbarkeitsregeln wie für Bilder (pgTAP).

## 15 -- Privates Archiv

Als Nutzerin möchte ich meine abgelaufenen Posts weiterhin sehen, damit
meine Erinnerungen nicht verloren gehen.

- [ ] Abgelaufene Posts sind nur für den Autor im Archiv sichtbar, für alle anderen nicht (pgTAP).

## 16 -- Onboarding

Als neuer Nutzer möchte ich beim ersten Start die Idee von U social erklärt
bekommen, damit ich verstehe, warum es keine Likes und Zahlen gibt.

- [ ] Das Onboarding erscheint genau einmal nach der ersten Anmeldung und lässt sich überspringen.

## 17 -- APK bauen

Als Team möchten wir eine installierbare APK erzeugen, damit die App auf
echten Android-Geräten getestet werden kann.

- [ ] Ein dokumentierter Befehl (EAS Build) erzeugt eine APK, die sich auf einem Android-Gerät installieren und starten lässt.
