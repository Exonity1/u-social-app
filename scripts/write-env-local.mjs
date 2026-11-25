// Schreibt .env.local mit URL und anon key des LOKALEN Supabase.
// Läuft automatisch nach `npm run db:start`, manuell mit `npm run env:local`.
// Übernimmt nur URL und anon/publishable key – nie den service_role-/secret-Key.
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const ENV_FILE = '.env.local';

let raw;
try {
  raw = execSync('npx supabase status -o json', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
} catch {
  console.error('Lokales Supabase läuft nicht. Erst `npm run db:start` ausführen (Docker Desktop muss laufen).');
  process.exit(1);
}

// Hinweise der CLI (z. B. Update-Meldungen) können vor dem JSON stehen.
const status = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1));
const url = status.API_URL;
const key = status.ANON_KEY ?? status.PUBLISHABLE_KEY;

if (!url || !key) {
  console.error('API_URL oder anon key nicht in `supabase status` gefunden:', Object.keys(status).join(', '));
  process.exit(1);
}

const values = {
  EXPO_PUBLIC_SUPABASE_URL: url,
  EXPO_PUBLIC_SUPABASE_ANON_KEY: key,
};

// Vorhandene andere Einträge in .env.local bleiben erhalten.
const lines = existsSync(ENV_FILE) ? readFileSync(ENV_FILE, 'utf8').split(/\r?\n/) : [];
for (const [name, value] of Object.entries(values)) {
  const index = lines.findIndex((line) => line.startsWith(`${name}=`));
  if (index >= 0) lines[index] = `${name}=${value}`;
  else lines.push(`${name}=${value}`);
}
writeFileSync(ENV_FILE, lines.filter((line, i) => line !== '' || i < lines.length - 1).join('\n') + '\n');

console.log(`${ENV_FILE} aktualisiert: ${url}`);
