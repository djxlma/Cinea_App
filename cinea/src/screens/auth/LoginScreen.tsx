import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import type { TextInput } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CineaScreen } from '../../components/CineaScreen';
import { CineaInput } from '../../components/CineaInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { supabase } from '../../lib/supabase';
import type { AuthStackParamList } from '../../types/navigation';
import { semanticColors } from '../../tokens/colors';
import { semanticTypography } from '../../tokens/typography';
import { semanticSpacing } from '../../tokens/spacing';
import { sizes } from '../../tokens/sizes';

const logo = require('../../../assets/cinea-logo.png');
const logoAsset = Image.resolveAssetSource(logo);

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'> & {
  onLogin: () => void;
};

export function LoginScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const logoWidth = Math.min(240, Math.max(0, width - semanticSpacing.xl * 2) * 0.7);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const submitting = useRef(false);
  const mounted = useRef(true);
  const passwordRef = useRef<TextInput>(null);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  async function handleLogin() {
    if (submitting.current) return;
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
    submitting.current = true;
    setIsSubmitting(true);
    setError('');
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      if (mounted.current && signInError) {
        setError('Não foi possível entrar. Confira seu e-mail e senha e tente novamente.');
      }
    } catch {
      if (mounted.current) setError('Não foi possível entrar. Confira sua conexão e tente novamente.');
    } finally {
      submitting.current = false;
      if (mounted.current) setIsSubmitting(false);
    }
  }

  return (
    <CineaScreen appearance="semantic" keyboardAvoiding keyboardShouldPersistTaps="handled" maxContentWidth={480} contentContainerStyle={styles.content}>
      <View style={styles.intro}>
        <View style={styles.brand}>
          <Image source={logo} accessibilityLabel="CINEA" resizeMode="contain"
            style={{ width: logoWidth, height: logoWidth * logoAsset.height / logoAsset.width }} />
        </View>
        <View style={styles.heading}>
          <Text accessibilityRole="header" style={styles.title}>Entrar</Text>
          <Text style={styles.subtitle}>Acesse sua conta para continuar.</Text>
        </View>
      </View>
      <View style={styles.form}>
        <CineaInput label="E-mail" placeholder="Digite seu e-mail" value={email} disabled={isSubmitting}
          keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" textContentType="username"
          returnKeyType="next" onSubmitEditing={() => passwordRef.current?.focus()}
          onChangeText={(value) => { setEmail(value); if (error) setError(''); }} />
        <View style={styles.passwordField}>
          <CineaInput ref={passwordRef} label="Senha" placeholder="Digite sua senha" value={password} disabled={isSubmitting}
          secureTextEntry={!showPassword} autoCapitalize="none" autoCorrect={false} autoComplete="current-password" textContentType="password"
          returnKeyType="done" onSubmitEditing={() => void handleLogin()}
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
          <PrimaryButton label="Entrar" variant="primary" fullWidth loading={isSubmitting} onPress={() => void handleLogin()} />
        </View>
      </View>
      <View style={styles.secondary}>
        <Text style={styles.secondaryText}>Não possui uma conta?</Text>
        <PrimaryButton label="Criar conta" variant="ghost" disabled={isSubmitting} onPress={() => navigation.navigate('Register')} />
      </View>
    </CineaScreen>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'center', flexShrink: 0, gap: semanticSpacing.xxl, paddingVertical: semanticSpacing.xxl },
  intro: { gap: semanticSpacing.xl },
  brand: { alignItems: 'center', flexGrow: 0 },
  heading: { gap: semanticSpacing.sm },
  title: { ...semanticTypography.title, fontSize: 24, lineHeight: 30, color: semanticColors.text.primary },
  subtitle: { ...semanticTypography.bodySmall, color: semanticColors.text.secondary },
  form: { gap: semanticSpacing.xl },
  passwordField: { gap: semanticSpacing.xs },
  passwordToggle: { alignSelf: 'flex-end', minHeight: sizes.touchTargetMin, minWidth: sizes.touchTargetMin, justifyContent: 'center', paddingHorizontal: semanticSpacing.sm },
  passwordToggleText: { ...semanticTypography.bodySmall, color: semanticColors.text.secondary, textAlign: 'right' },
  passwordTogglePressed: { color: semanticColors.text.primary, textDecorationLine: 'underline' },
  actions: { gap: semanticSpacing.md },
  error: { ...semanticTypography.bodySmall, color: semanticColors.feedback.danger.text },
  secondary: { alignItems: 'center' },
  secondaryText: { ...semanticTypography.bodySmall, color: semanticColors.text.secondary, textAlign: 'center' },
});
