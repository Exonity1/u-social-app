// Formularprüfung in der App. Das ist reine UI-Logik für schnelle Rückmeldung –
// verbindlich prüfen Supabase Auth und die Datenbank.

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_DISPLAY_NAME_LENGTH = 50;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | null {
  if (email.trim() === '') return 'Bitte gib deine E-Mail-Adresse ein.';
  if (!EMAIL_PATTERN.test(email.trim())) return 'Diese E-Mail-Adresse sieht nicht richtig aus.';
  return null;
}

export function validateSignIn(email: string, password: string): string | null {
  return validateEmail(email) ?? (password === '' ? 'Bitte gib dein Passwort ein.' : null);
}

export function validateSignUp(input: { displayName: string; email: string; password: string }): string | null {
  const name = input.displayName.trim();
  if (name === '') return 'Wie sollen deine Freunde dich sehen? Gib einen Anzeigenamen ein.';
  if (name.length > MAX_DISPLAY_NAME_LENGTH) {
    return `Der Anzeigename darf höchstens ${MAX_DISPLAY_NAME_LENGTH} Zeichen lang sein.`;
  }
  const emailError = validateEmail(input.email);
  if (emailError) return emailError;
  if (input.password.length < MIN_PASSWORD_LENGTH) {
    return `Das Passwort muss mindestens ${MIN_PASSWORD_LENGTH} Zeichen lang sein.`;
  }
  return null;
}
