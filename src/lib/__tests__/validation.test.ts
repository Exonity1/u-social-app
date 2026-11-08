import { describe, expect, it } from '@jest/globals';

import {
  MAX_DISPLAY_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  validateEmail,
  validateSignIn,
  validateSignUp,
} from '@/lib/validation';

const valid = { displayName: 'Saskia', email: 'saskia@example.de', password: 'a'.repeat(MIN_PASSWORD_LENGTH) };

describe('validateEmail', () => {
  it('akzeptiert eine normale Adresse, auch mit Leerzeichen außen', () => {
    expect(validateEmail('  bjoern@example.de ')).toBeNull();
  });

  it.each(['', '   ', 'bjoern', 'bjoern@', 'bjoern@example'])('lehnt "%s" ab', (email) => {
    expect(validateEmail(email)).not.toBeNull();
  });
});

describe('validateSignIn', () => {
  it('verlangt ein Passwort', () => {
    expect(validateSignIn('bjoern@example.de', '')).not.toBeNull();
  });

  it('ist mit E-Mail und Passwort zufrieden', () => {
    expect(validateSignIn('bjoern@example.de', 'geheim')).toBeNull();
  });
});

describe('validateSignUp', () => {
  it('akzeptiert gültige Eingaben', () => {
    expect(validateSignUp(valid)).toBeNull();
  });

  it('lehnt einen leeren oder nur aus Leerzeichen bestehenden Anzeigenamen ab', () => {
    expect(validateSignUp({ ...valid, displayName: '   ' })).not.toBeNull();
  });

  it('erlaubt genau die maximale Länge des Anzeigenamens, aber nicht mehr', () => {
    expect(validateSignUp({ ...valid, displayName: 'x'.repeat(MAX_DISPLAY_NAME_LENGTH) })).toBeNull();
    expect(validateSignUp({ ...valid, displayName: 'x'.repeat(MAX_DISPLAY_NAME_LENGTH + 1) })).not.toBeNull();
  });

  it('erlaubt genau die minimale Passwortlänge, aber nicht weniger', () => {
    expect(validateSignUp({ ...valid, password: 'a'.repeat(MIN_PASSWORD_LENGTH) })).toBeNull();
    expect(validateSignUp({ ...valid, password: 'a'.repeat(MIN_PASSWORD_LENGTH - 1) })).not.toBeNull();
  });
});
