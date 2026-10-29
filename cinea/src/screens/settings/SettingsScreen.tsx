import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Keyboard, StyleSheet, Text, View } from 'react-native';
import type { TextInput } from 'react-native';
import appConfig from '../../../app.json';
import { CineaScreen } from '../../components/CineaScreen';
import { ScreenHeader } from '../../components/ScreenHeader';
import { CineaInput } from '../../components/CineaInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SectionTitle } from '../../components/SectionTitle';
import { AccountMenuRow } from '../../components/AccountMenuRow';
import { useAccountLogout } from '../../hooks/useAccountLogout';
import { changeCurrentPassword } from '../../services/account';
import { validatePassword } from '../../services/accountValidation';
import { semanticColors } from '../../tokens/colors';
import { semanticSpacing } from '../../tokens/spacing';
import { semanticTypography } from '../../tokens/typography';
import { states } from '../../tokens/states';
import type { RootScreenProps } from '../../types/navigation';

export function SettingsScreen({ navigation }: RootScreenProps<'Settings'>) {
  const { logout, isLoggingOut, logoutError } = useAccountLogout();
  const [passwordForm, setPasswordForm] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const busy = useRef(false);
  const active = useRef(true);
  const confirmationRef = useRef<TextInput>(null);
  useEffect(() => {
    active.current = true;
    return () => { active.current = false; };
  }, []);
  useFocusEffect(useCallback(() => () => {
    setPassword('');
    setConfirmation('');
    setPasswordForm(false);
  }, []));

  async function changePassword() {
    if (busy.current || isLoggingOut) return;
    const error = validatePassword(password, confirmation);
    if (error) { setPasswordError(error); return; }
    busy.current = true;
    setChangingPassword(true);
    setPasswordError('');
    setPasswordSuccess(false);
    Keyboard.dismiss();
    try {
      await changeCurrentPassword(password);
      if (active.current) {
        setPassword('');
        setConfirmation('');
        setPasswordForm(false);
        setPasswordSuccess(true);
      }
    } catch (failure) {
      if (active.current) setPasswordError(failure instanceof Error ? failure.message : 'Não foi possível alterar a senha.');
    } finally {
      busy.current = false;
      if (active.current) setChangingPassword(false);
    }
  }

  const disabled = changingPassword || isLoggingOut;
  async function handleLogout() {
    if (busy.current) return;
    busy.current = true;
    try { await logout(); } finally { busy.current = false; }
  }
  return (
    <CineaScreen appearance="semantic" keyboardAvoiding keyboardShouldPersistTaps="handled" maxContentWidth={560} contentContainerStyle={styles.content}>
      <ScreenHeader appearance="semantic" title="Configurações" titleNumberOfLines={2} onBack={() => navigation.goBack()} />
      <View style={styles.group}>
        <SectionTitle appearance="semantic" title="Conta" />
        <View>
          <AccountMenuRow icon="edit" label="Editar perfil e avatar" disabled={disabled} onPress={() => navigation.navigate('EditProfile')} />
          <AccountMenuRow icon="filter" label={passwordForm ? 'Fechar alteração de senha' : 'Alterar senha'} disabled={disabled} onPress={() => {
            setPasswordForm((value) => !value);
            setPassword(''); setConfirmation(''); setPasswordError(''); setPasswordSuccess(false);
          }} />
        </View>
        {passwordForm ? <View style={styles.form}>
          <Text style={styles.text}>Defina uma nova senha com pelo menos 8 caracteres.</Text>
          <CineaInput label="Nova senha" secureTextEntry autoCapitalize="none" autoCorrect={false} textContentType="newPassword"
            editable={!disabled} value={password} onChangeText={(value) => { setPassword(value); setPasswordError(''); }}
            placeholder="Nova senha" returnKeyType="next" onSubmitEditing={() => confirmationRef.current?.focus()} />
          <CineaInput ref={confirmationRef} label="Confirmar nova senha" secureTextEntry autoCapitalize="none" autoCorrect={false} textContentType="newPassword"
            editable={!disabled} value={confirmation} onChangeText={(value) => { setConfirmation(value); setPasswordError(''); }}
            placeholder="Confirmar nova senha" returnKeyType="done" onSubmitEditing={() => void changePassword()} />
          {passwordError ? <Text accessibilityRole="alert" style={styles.error}>{passwordError}</Text> : null}
          <PrimaryButton label={changingPassword ? 'Alterando...' : 'Salvar nova senha'} variant="primary" fullWidth disabled={disabled} loading={changingPassword} onPress={() => void changePassword()} />
        </View> : null}
        {passwordSuccess ? <Text accessibilityLiveRegion="polite" style={styles.success}>Senha alterada com sucesso.</Text> : null}
      </View>
      <View style={styles.group}>
        <SectionTitle appearance="semantic" title="Sessão" />
        <AccountMenuRow icon="back" danger showChevron={false} label={isLoggingOut ? 'Saindo...' : 'Sair da conta'} disabled={disabled} loading={isLoggingOut} onPress={() => void handleLogout()} />
        {logoutError ? <Text accessibilityRole="alert" style={styles.error}>{logoutError}</Text> : null}
      </View>
      <View style={styles.group}>
        <SectionTitle appearance="semantic" title="Sobre" />
        <View style={styles.appIdentity}>
          <Text style={styles.appName}>CINEA</Text>
          <Text style={styles.caption}>Versão {appConfig.expo.version}</Text>
        </View>
        <View style={styles.information}>
          <Text accessibilityRole="header" style={styles.label}>Créditos TMDB</Text>
          <Text style={styles.text}>Os dados e as imagens do catálogo de filmes são fornecidos pelo TMDB.</Text>
          <Text style={styles.text}>Este produto utiliza a API do TMDB, mas não é endossado ou certificado pelo TMDB.</Text>
          <Text style={styles.caption}>This product uses the TMDB API but is not endorsed or certified by TMDB.</Text>
        </View>
        <View style={styles.information}>
          <Text accessibilityRole="header" style={styles.label}>Informações sobre seus dados</Text>
          <Text style={styles.text}>Seus dados são armazenados com medidas de segurança e controles de acesso para proteger as informações da sua conta.</Text>
          <Text style={styles.text}>As informações do perfil, avaliações e Tier Lists são utilizadas apenas para o funcionamento dos recursos do CINEA. O acesso aos dados é limitado de acordo com as permissões da sua conta.</Text>
        </View>
      </View>
    </CineaScreen>
  );
}

const styles = StyleSheet.create({
  content: { gap: semanticSpacing.section },
  group: { gap: semanticSpacing.lg },
  form: { gap: semanticSpacing.lg },
  information: { gap: semanticSpacing.sm, marginTop: semanticSpacing.sm },
  appIdentity: { gap: semanticSpacing.xs },
  label: { ...semanticTypography.label, color: semanticColors.text.primary },
  appName: { ...semanticTypography.sectionTitle, color: semanticColors.text.primary },
  text: { ...semanticTypography.bodySmall, color: semanticColors.text.secondary },
  caption: { ...semanticTypography.caption, color: semanticColors.text.secondary },
  error: { ...semanticTypography.bodySmall, color: states.danger.text },
  success: { ...semanticTypography.bodySmall, color: states.success.text },
});
