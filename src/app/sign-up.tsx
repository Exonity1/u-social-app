import { router } from 'expo-router';
import { useState } from 'react';

import { Button, Field, Notice, Screen, Subtitle, Title } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { MIN_PASSWORD_LENGTH, validateSignUp } from '@/lib/validation';

export default function SignUpScreen() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function signUp() {
    setInfo(null);
    const validationError = validateSignUp({ displayName, email, password });
    setError(validationError);
    if (validationError) return;

    setBusy(true);
    const { data, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      // Der Datenbank-Trigger legt daraus das Profil an.
      options: { data: { display_name: displayName.trim() } },
    });
    setBusy(false);

    if (authError) {
      setError('Registrierung fehlgeschlagen. Vielleicht gibt es diese E-Mail-Adresse schon?');
    } else if (!data.session) {
      // Nur wenn im Supabase-Projekt die E-Mail-Bestätigung aktiv ist.
      setInfo('Fast geschafft: Bestätige deine E-Mail-Adresse und melde dich dann an.');
    }
  }

  return (
    <Screen>
      <Title>Willkommen</Title>
      <Subtitle>Keine Likes, keine Zahlen. Nur du und deine Freunde.</Subtitle>
      <Field label="Anzeigename" value={displayName} onChangeText={setDisplayName} autoComplete="name" />
      <Field
        label="E-Mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      <Field
        label={`Passwort (mind. ${MIN_PASSWORD_LENGTH} Zeichen)`}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        onSubmitEditing={signUp}
      />
      {error && <Notice tone="error">{error}</Notice>}
      {info && <Notice tone="info">{info}</Notice>}
      <Button title="Konto erstellen" onPress={signUp} busy={busy} />
      <Button title="Schon dabei? Einloggen" variant="quiet" onPress={() => router.replace('/sign-in')} />
    </Screen>
  );
}
