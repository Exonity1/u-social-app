import { useEffect, useState } from 'react';

import { Button, Notice, Screen, Subtitle, Title } from '@/components/ui';
import { useSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';

export default function HomeScreen() {
  const { session } = useSession();
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    supabase
      .from('profiles')
      .select('display_name')
      .eq('id', session.user.id)
      .single()
      .then(({ data, error: queryError }) => {
        if (queryError) setError('Dein Profil konnte nicht geladen werden.');
        else setDisplayName(data.display_name);
      });
  }, [session]);

  return (
    <Screen>
      <Title>{displayName ? `Hallo, ${displayName}` : 'Hallo'}</Title>
      <Subtitle>Hier entsteht bald dein Feed. Du bist auf dem neuesten Stand.</Subtitle>
      {error && <Notice tone="error">{error}</Notice>}
      <Button title="Ausloggen" variant="quiet" onPress={() => supabase.auth.signOut()} />
    </Screen>
  );
}
