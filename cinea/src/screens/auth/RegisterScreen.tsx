import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CineaScreen } from '../../components/CineaScreen';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SectionTitle } from '../../components/SectionTitle';
import { supabase } from '../../lib/supabase';
import type { AuthStackParamList } from '../../types/navigation';
import { colors } from '../../tokens/colors';
import { spacing } from '../../tokens/spacing';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'> & {
  onLogin: () => void;
};

export function RegisterScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRegister() {
    const normalizedEmail = email.trim();
    const normalizedName = name.trim();

    if (!normalizedEmail || !password) {
      setError('Informe e-mail e senha para criar o cadastro.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      setError('Digite um e-mail válido.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setStatusMessage('');

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          username: normalizedName || undefined,
          display_name: normalizedName || undefined,
        },
      },
    });

    setIsSubmitting(false);

    if (signUpError) {
      setError(signUpError.message || 'Não foi possível concluir o cadastro.');
      return;
    }

    if (data.session) {
      setStatusMessage('Cadastro concluído com sucesso.');
      return;
    }

    setStatusMessage('Cadastro realizado. Confirme o e-mail para ativar sua conta antes do login.');
  }

  return (
    <CineaScreen footer={<PrimaryButton label={isSubmitting ? 'Cadastrando...' : 'Continuar'} onPress={() => void handleRegister()} disabled={isSubmitting} />}>
      <View style={styles.form}>
        <SectionTitle title="Criar cadastro" subtitle="Tela sem referência exportada; layout temporário." size="medium" />
        <TextInput accessibilityLabel="Nome" onChangeText={(value) => {
          setName(value);
          if (error) {
            setError('');
          }
        }} placeholder="Nome" placeholderTextColor={colors.textMuted} style={styles.input} value={name} />
        <TextInput accessibilityLabel="E-mail" autoCapitalize="none" keyboardType="email-address" onChangeText={(value) => {
          setEmail(value);
          if (error) {
            setError('');
          }
        }} placeholder="E-mail" placeholderTextColor={colors.textMuted} style={styles.input} value={email} />
        <TextInput accessibilityLabel="Senha" onChangeText={(value) => {
          setPassword(value);
          if (error) {
            setError('');
          }
        }} placeholder="Senha" placeholderTextColor={colors.textMuted} secureTextEntry style={styles.input} value={password} />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {statusMessage ? <Text style={styles.statusText}>{statusMessage}</Text> : null}
        <PrimaryButton label="Voltar ao login" onPress={() => navigation.navigate('Login')} variant="text" />
      </View>
    </CineaScreen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  input: {
    minHeight: 50,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  errorText: {
    color: '#FFB4A2',
    fontSize: 14,
    marginTop: spacing.xs,
  },
  statusText: {
    color: colors.secondary,
    fontSize: 14,
    marginTop: spacing.xs,
  },
});