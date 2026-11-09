import { router } from 'expo-router';
import { useState } from 'react';

import { Button, Field, Notice, Screen, Subtitle, Title } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { validateSignIn } from '@/lib/validation';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function signIn() {
    const validationError = validateSignIn(email, password);
    setError(validationError);
    if (validationError) return;

    setBusy(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (authError) setError('Anmeldung fehlgeschlagen. Prüfe E-Mail und Passwort.');
    // Bei Erfolg wechselt der Navigator automatisch in die App (Stack.Protected).
  }

  return (
    <Screen>
      <Title>U social</Title>
      <Subtitle>Nur für deine echten Freunde.</Subtitle>
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
        label="Passwort"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
        onSubmitEditing={signIn}
      />
      {error && <Notice tone="error">{error}</Notice>}
      <Button title="Einloggen" onPress={signIn} busy={busy} />
      <Button title="Noch kein Konto? Registrieren" variant="quiet" onPress={() => router.replace('/sign-up')} />
    </Screen>
  );
}
