# Projekttagebuch: U social

**Team:** Björn Bernhardt, Saskia Wengst

Laufend führen, nicht am Ende nachschreiben -- das Tagebuch liegt im
Repository, die Historie zeigt, wann ein Eintrag entstanden ist. Es geht
nicht um jeden Prompt, sondern um die Stellen, an denen Sie etwas
entschieden haben: zwei bis drei Einträge pro Woche reichen.

Ehrlich bleiben: Ein Vorschlag des Agenten, der schiefging und den Sie
erkannt und korrigiert haben, ist ein guter Eintrag -- kein schlechter.
Bewertet wird die Begründung, nicht ob alles glatt lief.

Bewertet wird jede Person einzeln (§ 17 Abs. 1 PVO). Jeder Eintrag nennt
daher seine Autorin oder seinen Autor; beide Partner schreiben Einträge.

Architekturentscheidungen gehören zusätzlich in das Entscheidungsprotokoll
in `docs/architektur.md`; hier genügt dann ein Verweis.

---

## Woche 4

### 08.11.2026 -- Steckbrief, Backlog und Architektur mit dem Agenten

**Autor/in:** Björn Bernhardt

**Story / Commit:** Vorbereitung für Story 0, `498038d`

**An den Agenten gegeben:** Folien der Werkstatt Woche 4, die Vorlagen in
`docs/` und die Feature-Liste aus unserem vorherigen Brainstorming.
Agentenmodus mit Zugriff auf den Projektordner, Modell Claude Opus 5.5. Der
Agent hat Rückfragen gestellt (Anzahl Kreise, Login-Verfahren, Nutzernamen,
Entfernen von Freunden), die ich beantwortet habe.

**Ergebnis:** Steckbrief mit vier Fachregeln, Backlog mit 18 Stories und
MVP-Linie nach Story 10, Architekturskizze mit Datenmodell und
Entscheidungsprotokoll.

**Entscheidung:** Zwei Vorschläge des Agenten habe ich verworfen:

1. Der Agent wollte den Scope für die zwei Wochen kürzen. Wir behalten den
   vollen Scope (nur Profil-Track und Store-Verteilung fliegen raus) und
   steuern über die MVP-Linie; der große Scope steht als Risiko im
   Steckbrief.
2. Der Agent schlug vor, die Fachregeln zusätzlich als reinen
   TypeScript-Code mit Mock-Daten zu testen. Das habe ich hinterfragt: Unsere
   Regeln leben als SQL-Funktionen und RLS-Policies in Supabase, ein
   TypeScript-Test hätte nur eine Kopie geprüft, die von der echten Regel
   abweichen kann. Stattdessen testen wir mit pgTAP direkt gegen ein lokales
   Supabase (siehe Entscheidungsprotokoll in `docs/architektur.md`).

**Nächstes Mal:** Zuerst klären, wo die Logik tatsächlich läuft, bevor der
Agent Vorschläge zum Testen macht.

### 08.11.2026 -- Walking Skeleton

**Autor/in:** Björn Bernhardt

**Story / Commit:** Story 0, `498038d`

**An den Agenten gegeben:** Backlog-Eintrag Story 0, Architektur und
Instructions. Der Agent hat Code, Migration, pgTAP-Tests und die
GitHub-Actions-Pipeline geschrieben; Installationen und Tests habe ich im
Windows-Terminal selbst ausgeführt, weil der Agent keinen Internetzugang
hatte. Commits und Pushes mache ich grundsätzlich selbst (steht so auch in
`.github/copilot-instructions.md`).

**Ergebnis:** Registrierung, Login, Logout und Startscreen funktionieren im
Browser und auf meinem Android-Handy (Expo Go). Lint, Typecheck, 12
Jest-Tests und 11 pgTAP-Tests sind grün, ebenso die Pipeline, die im
GitHub-Runner ein komplettes Supabase startet.

**Entscheidung:** Übernommen, mit drei Korrekturen unterwegs:

1. `create-expo-app` wollte nicht in den bestehenden Ordner. Beim Verschieben
   per `robocopy` wurde unser `.git`-Ordner durch den des Templates
   überschrieben (Remote weg, Branch hieß `master`). Der Agent hat das an
   `git status` bemerkt; wir haben den Template-Commit als Start-Commit für
   `main` genutzt und den Remote neu eingetragen.
2. Der Typecheck schlug fehl, weil `describe`/`it` unbekannt waren. Statt
   `@types/jest` neu zu installieren, importieren die Tests aus
   `@jest/globals`, das mit Jest schon mitkommt.
3. Das Handy erreichte das lokale Supabase nicht. Schrittweise Diagnose
   (`Test-NetConnection`, `netstat`, Firewall-Regeln) ergab Block-Regeln
   für „Docker Desktop Backend“ in der Windows-Firewall, die unsere
   Erlaubnis-Regel überstimmt haben.

**Nächstes Mal:** Neue Projekte nicht in einen bestehenden Repo-Ordner
kopieren, sondern vorher prüfen, was das Template mitbringt (hier: ein
eigenes Git-Repo).
