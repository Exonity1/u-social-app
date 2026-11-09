import type { PropsWithChildren } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/constants/colors';

export function Screen({ children }: PropsWithChildren) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {children}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function Title({ children }: PropsWithChildren) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Subtitle({ children }: PropsWithChildren) {
  return <Text style={styles.subtitle}>{children}</Text>;
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor={colors.textMuted} style={styles.input} {...props} />
    </View>
  );
}

export function Notice({ tone, children }: PropsWithChildren<{ tone: 'error' | 'info' }>) {
  return (
    <Text style={[styles.notice, { color: tone === 'error' ? colors.danger : colors.success }]}>{children}</Text>
  );
}

export function Button({
  title,
  onPress,
  busy = false,
  variant = 'primary',
}: {
  title: string;
  onPress: () => void;
  busy?: boolean;
  variant?: 'primary' | 'quiet';
}) {
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      disabled={busy}
      onPress={onPress}
      style={({ pressed }) => [styles.button, primary ? styles.buttonPrimary : styles.buttonQuiet, pressed && { opacity: 0.8 }]}>
      {busy ? (
        <ActivityIndicator color={primary ? colors.accentText : colors.text} />
      ) : (
        <Text style={primary ? styles.buttonPrimaryText : styles.buttonQuietText}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  screen: { flex: 1, paddingHorizontal: 24, justifyContent: 'center', gap: 16 },
  title: { color: colors.text, fontSize: 32, fontWeight: '700', letterSpacing: -0.5 },
  subtitle: { color: colors.textMuted, fontSize: 16, lineHeight: 22, marginBottom: 8 },
  field: { gap: 6 },
  label: { color: colors.textMuted, fontSize: 13, fontWeight: '600', letterSpacing: 0.4 },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  notice: { fontSize: 14, lineHeight: 20 },
  button: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', minHeight: 48, justifyContent: 'center' },
  buttonPrimary: { backgroundColor: colors.accent },
  buttonQuiet: { backgroundColor: 'transparent' },
  buttonPrimaryText: { color: colors.accentText, fontSize: 16, fontWeight: '700' },
  buttonQuietText: { color: colors.text, fontSize: 15, fontWeight: '600' },
});
