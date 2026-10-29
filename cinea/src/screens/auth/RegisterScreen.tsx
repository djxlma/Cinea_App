import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import type { TextInput } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CineaScreen } from '../../components/CineaScreen';
import { CineaInput } from '../../components/CineaInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { supabase } from '../../lib/supabase';
import type { AuthStackParamList } from '../../types/navigation';
import { semanticColors } from '../../tokens/colors';
import { semanticTypography } from '../../tokens/typography';
import { semanticSpacing } from '../../tokens/spacing';
import { sizes } from '../../tokens/sizes';

const logo = require('../../../assets/cinea-logo.png');
const logoAsset = Image.resolveAssetSource(logo);

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'> & {
  onLogin: () => void;
};

export function RegisterScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const logoWidth = Math.min(240, Math.max(0, width - semanticSpacing.xl * 2) * 0.7);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const submitting = useRef(false);
  const mounted = useRef(true);
  const passwordRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  async function handleRegister() {
    if (submitting.current) return;
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
    submitting.current = true;
    setIsSubmitting(true);
    setError('');
    setStatusMessage('');
    try {
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
      if (!mounted.current) return;
      if (signUpError) {
        setError('Não foi possível concluir o cadastro. Confira os dados informados e tente novamente.');
        return;
      }
      if (data.session) {
        setStatusMessage('Cadastro concluído com sucesso.');
        return;
      }
      setStatusMessage('Cadastro realizado. Confirme o e-mail para ativar sua conta antes do login.');
    } catch {
      if (mounted.current) setError('Não foi possível concluir o cadastro. Confira sua conexão e tente novamente.');
    } finally {
      submitting.current = false;
      if (mounted.current) setIsSubmitting(false);
    }
  }

  return (
    <CineaScreen appearance="semantic" keyboardAvoiding keyboardShouldPersistTaps="handled" maxContentWidth={480} contentContainerStyle={styles.content}>
      <ScreenHeader appearance="semantic" onBack={() => navigation.navigate('Login')} />
      <View style={styles.main}>
      <View style={styles.intro}>
        <View style={styles.brand}>
          <Image source={logo} accessibilityLabel="CINEA" resizeMode="contain"
            style={{ width: logoWidth, height: logoWidth * logoAsset.height / logoAsset.width }} />
        </View>
        <View style={styles.heading}>
          <Text accessibilityRole="header" style={styles.title}>Criar conta</Text>
        </View>
      </View>
      <View style={styles.form}>
        <CineaInput label="Nome" placeholder="Como você quer ser chamado?" value={name} disabled={isSubmitting}
          autoComplete="name" textContentType="name" returnKeyType="next" onSubmitEditing={() => emailRef.current?.focus()}
          onChangeText={(value) => { setName(value); if (error) setError(''); }} />
        <CineaInput ref={emailRef} label="E-mail" placeholder="Digite seu e-mail" value={email} disabled={isSubmitting}
          keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" textContentType="emailAddress"
          returnKeyType="next" onSubmitEditing={() => passwordRef.current?.focus()}
          onChangeText={(value) => { setEmail(value); if (error) setError(''); }} />
        <View style={styles.passwordField}>
          <CineaInput ref={passwordRef} label="Senha" placeholder="Crie sua senha" helperText="Pelo menos 6 caracteres." value={password} disabled={isSubmitting}
          secureTextEntry={!showPassword} autoCapitalize="none" autoCorrect={false} autoComplete="new-password" textContentType="newPassword"
          returnKeyType="done" onSubmitEditing={() => void handleRegister()}
          onChangeText={(value) => { setPassword(value); if (error) setError(''); }} />
          <Pressable accessibilityRole="button" accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            accessibilityState={{ disabled: isSubmitting }} disabled={isSubmitting}
            style={styles.passwordToggle} onPress={() => setShowPassword((value) => !value)}>
            {({ pressed }) => <Text style={[styles.passwordToggleText, pressed && styles.passwordTogglePressed]}>
              {showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            </Text>}
          </Pressable>
        </View>
        <View style={styles.actions}>
          {error ? <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}
          {statusMessage ? <Text accessibilityLiveRegion="polite" style={styles.status}>{statusMessage}</Text> : null}
          <PrimaryButton label="Criar conta" variant="primary" fullWidth loading={isSubmitting} onPress={() => void handleRegister()} />
        </View>
      </View>
      <View style={styles.secondary}>
        <Text style={styles.secondaryText}>Já possui uma conta?</Text>
        <PrimaryButton label="Entrar" variant="ghost" disabled={isSubmitting} onPress={() => navigation.navigate('Login')} />
      </View>
      </View>
    </CineaScreen>
  );
}

const styles = StyleSheet.create({
  content: { flexShrink: 0, gap: semanticSpacing.lg, paddingVertical: semanticSpacing.xxl },
  main: { flexGrow: 1, flexShrink: 0, justifyContent: 'center', gap: semanticSpacing.xxl },
  intro: { gap: semanticSpacing.xl },
  brand: { alignItems: 'center', flexGrow: 0 },
  heading: { gap: semanticSpacing.sm },
  title: { ...semanticTypography.title, fontSize: 24, lineHeight: 30, color: semanticColors.text.primary },
  form: { gap: semanticSpacing.xl },
  passwordField: { gap: semanticSpacing.xs },
  passwordToggle: { alignSelf: 'flex-end', minHeight: sizes.touchTargetMin, minWidth: sizes.touchTargetMin, justifyContent: 'center', paddingHorizontal: semanticSpacing.sm },
  passwordToggleText: { ...semanticTypography.bodySmall, color: semanticColors.text.secondary, textAlign: 'right' },
  passwordTogglePressed: { color: semanticColors.text.primary, textDecorationLine: 'underline' },
  actions: { gap: semanticSpacing.md },
  error: { ...semanticTypography.bodySmall, color: semanticColors.feedback.danger.text },
  status: { ...semanticTypography.bodySmall, color: semanticColors.feedback.success.text },
  secondary: { alignItems: 'center' },
  secondaryText: { ...semanticTypography.bodySmall, color: semanticColors.text.secondary, textAlign: 'center' },
});
