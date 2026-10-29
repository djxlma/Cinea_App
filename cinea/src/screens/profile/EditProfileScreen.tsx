import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import type { TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { CineaScreen } from '../../components/CineaScreen';
import { CineaInput } from '../../components/CineaInput';
import { CineaState } from '../../components/CineaState';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { UserAvatar } from '../../components/UserAvatar';
import { getCurrentProfile, getSignedAvatarUrl, updateCurrentProfile, uploadCurrentUserAvatar, type ProfileRecord } from '../../services/profile';
import { profileSaveError, validateProfileForm } from '../../services/accountValidation';
import { semanticColors } from '../../tokens/colors';
import { semanticSpacing } from '../../tokens/spacing';
import { semanticTypography } from '../../tokens/typography';
import { sizes } from '../../tokens/sizes';
import { states } from '../../tokens/states';
import { radius } from '../../tokens/radius';
import type { RootScreenProps } from '../../types/navigation';

export function EditProfileScreen({ navigation }: RootScreenProps<'EditProfile'>) {
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [retry, setRetry] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [avatarError, setAvatarError] = useState('');
  const [textSaved, setTextSaved] = useState(false);
  const [avatarSaved, setAvatarSaved] = useState(false);
  const busy = useRef(false);
  const active = useRef(true);
  const usernameRef = useRef<TextInput>(null);
  const bioRef = useRef<TextInput>(null);

  useEffect(() => {
    active.current = true;
    return () => { active.current = false; };
  }, []);
  useEffect(() => {
    let current = true;
    setLoading(true);
    setLoadError('');
    void (async () => {
      try {
        const result = await getCurrentProfile();
        if (!result) throw new Error('Profile unavailable');
        if (!current) return;
        setProfile(result);
        setName(result.display_name ?? '');
        setUsername(result.username ?? '');
        setBio(result.bio ?? '');
        const uri = await getSignedAvatarUrl(result.avatar_url).catch(() => null);
        if (current) setAvatarUri(uri);
      } catch {
        if (current) setLoadError('Não foi possível carregar seu perfil. Tente novamente.');
      } finally {
        if (current) setLoading(false);
      }
    })();
    return () => { current = false; };
  }, [retry]);

  async function save() {
    if (busy.current || !profile) return;
    const validation = validateProfileForm({ name, username, bio }, profile.username);
    if (!validation.value) { setSaveError(validation.error ?? 'Confira os campos.'); return; }
    busy.current = true;
    Keyboard.dismiss();
    setSaving(true);
    setSaveError('');
    setTextSaved(false);
    try {
      const result = await updateCurrentProfile(validation.value);
      if (!active.current) return;
      setProfile(result);
      setName(result.display_name ?? '');
      setUsername(result.username ?? '');
      setBio(result.bio ?? '');
      setTextSaved(true);
    } catch (error) {
      if (active.current) setSaveError(`${avatarSaved ? 'A foto já foi salva. ' : ''}${profileSaveError(error)}`);
    } finally {
      busy.current = false;
      if (active.current) setSaving(false);
    }
  }

  async function pickAvatar() {
    if (busy.current || !profile) return;
    busy.current = true;
    setUploading(true);
    setAvatarError('');
    try {
      const selection = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', allowsEditing: true, aspect: [1, 1], quality: 0.8 });
      if (selection.canceled || !selection.assets?.[0]) return;
      const asset = selection.assets[0];
      const path = await uploadCurrentUserAvatar(asset);
      const result = await updateCurrentProfile({ avatar_url: path });
      const uri = await getSignedAvatarUrl(result.avatar_url).catch(() => null);
      if (!active.current) return;
      setProfile((previous) => previous ? { ...previous, avatar_url: result.avatar_url } : result);
      setAvatarUri(uri ?? asset.uri);
      setAvatarSaved(true);
    } catch {
      if (active.current) setAvatarError(`${textSaved ? 'Os dados do perfil já foram salvos. ' : ''}Não foi possível concluir a atualização da foto. Tente novamente.`);
    } finally {
      busy.current = false;
      if (active.current) setUploading(false);
    }
  }

  const editable = !saving && !uploading;
  return (
    <CineaScreen appearance="semantic" keyboardAvoiding keyboardShouldPersistTaps="handled" maxContentWidth={560} contentContainerStyle={styles.content}>
      <ScreenHeader appearance="semantic" title="Editar perfil" onBack={() => navigation.goBack()} />
      {loading ? <CineaState variant="loading" size="screen" message="Carregando perfil..." />
        : loadError ? <CineaState variant="error" size="screen" title={loadError} actionLabel="Tentar novamente" onAction={() => setRetry((value) => value + 1)} /> : <>
          <View style={styles.avatarSection}>
            <Pressable accessibilityRole="button" accessibilityLabel="Alterar foto do perfil" accessibilityState={{ disabled: !editable, busy: uploading }} disabled={!editable}
              onPress={() => void pickAvatar()} style={({ pressed }) => [styles.avatarButton, pressed && styles.avatarPressed]}>
              <UserAvatar size={104} source={avatarUri} />
              <Text style={[styles.avatarLabel, !editable && styles.disabledText]}>{uploading ? 'Enviando foto...' : 'Alterar foto'}</Text>
            </Pressable>
            {uploading ? <ActivityIndicator accessibilityLabel="Enviando foto" color={semanticColors.brand.amber} /> : null}
            {avatarError ? <Text accessibilityRole="alert" style={styles.error}>{avatarError}</Text> : null}
            {avatarSaved ? <Text accessibilityLiveRegion="polite" style={styles.success}>Foto atualizada. Os campos de texto são salvos separadamente.</Text> : null}
          </View>
          <View style={styles.form}>
            <CineaInput label="Nome" helperText="Obrigatório · até 60 caracteres" editable={editable} value={name}
              onChangeText={(value) => { setName(value); setTextSaved(false); setSaveError(''); }}
              returnKeyType="next" onSubmitEditing={() => usernameRef.current?.focus()} />
            <CineaInput ref={usernameRef} label="Username" accessibilityLabel="Nome de usuário" editable={editable} value={username}
              helperText="Ao alterar: 3–30 caracteres, letras minúsculas, números, ponto ou underscore. Seu username atual é preservado se não for alterado."
              onChangeText={(value) => { setUsername(value); setTextSaved(false); setSaveError(''); }} autoCapitalize="none" autoCorrect={false}
              returnKeyType="next" onSubmitEditing={() => bioRef.current?.focus()} />
            <View style={styles.bioField}>
              <CineaInput ref={bioRef} label="Bio" accessibilityLabel="Bio, até 160 caracteres" helperText="Opcional" editable={editable} value={bio}
                onChangeText={(value) => { setBio(value); setTextSaved(false); setSaveError(''); }} multiline textAlignVertical="top" />
              <Text style={styles.counter}>{bio.length} / 160</Text>
            </View>
          </View>
          <View style={styles.feedback}>
            {saveError ? <Text accessibilityRole="alert" style={styles.error}>{saveError}</Text> : null}
            {textSaved ? <Text accessibilityLiveRegion="polite" style={styles.success}>Perfil atualizado com sucesso.</Text> : null}
            <PrimaryButton label="Salvar alterações" variant="primary" fullWidth loading={saving} disabled={!editable} onPress={() => void save()} />
          </View>
        </>}
    </CineaScreen>
  );
}

const styles = StyleSheet.create({
  content: { gap: semanticSpacing.xxl },
  avatarSection: { alignItems: 'center', gap: semanticSpacing.md },
  avatarButton: { alignItems: 'center', gap: semanticSpacing.md, padding: semanticSpacing.sm, minHeight: sizes.touchTargetMin, borderRadius: radius.surface },
  avatarPressed: { backgroundColor: states.pressed.background },
  avatarLabel: { ...semanticTypography.label, color: semanticColors.brand.amber },
  disabledText: { color: states.disabled.text },
  form: { gap: semanticSpacing.xl },
  bioField: { gap: semanticSpacing.sm },
  counter: { ...semanticTypography.caption, color: semanticColors.text.secondary, textAlign: 'right' },
  feedback: { gap: semanticSpacing.md },
  error: { ...semanticTypography.bodySmall, color: states.danger.text },
  success: { ...semanticTypography.bodySmall, color: states.success.text },
});
