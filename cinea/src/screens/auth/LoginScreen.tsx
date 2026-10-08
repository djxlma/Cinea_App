import { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CineaScreen } from '../../components/CineaScreen';
import { PrimaryButton } from '../../components/PrimaryButton';
import { supabase } from '../../lib/supabase';
import type { AuthStackParamList } from '../../types/navigation';
import { colors } from '../../tokens/colors';
import { spacing } from '../../tokens/spacing';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'> & {
  onLogin: () => void;
};

export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin() {
    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password.trim()) {
      setError('Informe seu e-mail e senha para continuar.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      setError('Digite um e-mail válido.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    setIsSubmitting(false);

    if (signInError) {
      setError(signInError.message || 'Não foi possível entrar. Tente novamente.');
    }
  }

  return (
    <CineaScreen
      contentContainerStyle={styles.content}
      footer={<PrimaryButton label={isSubmitting ? 'Entrando...' : 'Entrar'} onPress={() => void handleLogin()} disabled={isSubmitting} />}
    >
      <View style={styles.form}>
        <Image source={require('../../../assets/cinea-logo.png')} resizeMode="contain" style={styles.logo} />
        <Text style={styles.label}>E-mail:</Text>
        <TextInput
          accessibilityLabel="E-mail"
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={(value) => {
            setEmail(value);
            if (error) {
              setError('');
            }
          }}
          placeholder="Digite seu e-mail"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          value={email}
        />
        <Text style={styles.label}>Senha:</Text>
        <TextInput
          accessibilityLabel="Senha"
          onChangeText={(value) => {
            setPassword(value);
            if (error) {
              setError('');
            }
          }}
          placeholder="Digite sua senha"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          style={styles.input}
          value={password}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <Text style={styles.signup}>
          Nao tem uma conta?{' '}
          <Text onPress={() => navigation.navigate('Register')} style={styles.signupLink}>
            Clique aqui para fazer seu cadastro
          </Text>
        </Text>
      </View>
    </CineaScreen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.sm,
    marginTop: 76,
  },
  content: {
    paddingTop: 24,
  },
  logo: {
    alignSelf: 'center',
    width: '88%',
    height: 150,
    marginBottom: 54,
  },
  label: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  input: {
    minHeight: 37,
    paddingHorizontal: 9,
    borderWidth: 1,
    borderColor: '#B28B70',
    borderRadius: 7,
    color: colors.text,
    backgroundColor: '#5D0000',
    fontSize: 17,
  },
  signup: {
    marginTop: spacing.md,
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 17,
    lineHeight: 22,
  },
  signupLink: {
    color: colors.secondary,
    fontWeight: '600',
  },
  errorText: {
    color: '#FFB4A2',
    fontSize: 14,
    marginTop: spacing.xs,
  },
});