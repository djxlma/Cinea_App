import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { CineaScreen } from '../../components/CineaScreen';
import { ScreenHeader } from '../../components/ScreenHeader';
import { SectionTitle } from '../../components/SectionTitle';
import { AccountMenuRow } from '../../components/AccountMenuRow';
import { UserAvatar } from '../../components/UserAvatar';
import { getCurrentProfile, getSignedAvatarUrl, type ProfileRecord } from '../../services/profile';
import { supabase } from '../../lib/supabase';
import { semanticColors } from '../../tokens/colors';
import { semanticSpacing } from '../../tokens/spacing';
import { semanticTypography } from '../../tokens/typography';
import { states } from '../../tokens/states';
import { radius } from '../../tokens/radius';
import { useAccountLogout } from '../../hooks/useAccountLogout';
import type { RootScreenProps } from '../../types/navigation';

type Props = RootScreenProps<'UserMenu'>;

export function UserMenuScreen({ navigation }: Props) {
  const { logout, isLoggingOut, logoutError } = useAccountLogout();
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [email, setEmail] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const loadProfile = useCallback(async (isActive: () => boolean) => {
    try {
      const currentProfile = await getCurrentProfile();
      if (!isActive()) return;
      setProfile(currentProfile);
      const uri = await getSignedAvatarUrl(currentProfile?.avatar_url ?? null);
      if (isActive()) setAvatarUri(uri);
    } catch (error) {
      if (!isActive()) return;
      setProfile(null);
      setAvatarUri(null);
    }
  }, []);

  useEffect(() => {
    let active = true;
    async function loadAuthEmail() {
      const { data } = await supabase.auth.getUser();
      if (active) setEmail(data.user?.email ?? '');
    }

    void loadAuthEmail().catch(() => {});
    return () => { active = false; };
  }, []);

  useFocusEffect(useCallback(() => {
    let active = true;
    void loadProfile(() => active);
    return () => { active = false; };
  }, [loadProfile]));

  const goToProfile = () => navigation.navigate('AccountProfile');
  const goToTierLists = () => navigation.navigate('App', { screen: 'TierLists' });
  const displayName = profile?.display_name?.trim() || 'Usuário';
  const username = profile?.username?.trim() || email.split('@')[0]?.replace(/[^a-zA-Z0-9._-]/g, '') || 'usuario';

  return (
    <CineaScreen appearance="semantic" maxContentWidth={560} contentContainerStyle={styles.content}>
      <ScreenHeader appearance="semantic" title="Minha conta" onBack={() => navigation.goBack()} />
      <Pressable accessibilityRole="button" accessibilityLabel={`Meu Perfil, ${displayName}, @${username}`} onPress={goToProfile}
        style={({ pressed }) => [styles.identity, pressed && styles.pressed]}>
        <UserAvatar size={64} source={avatarUri ? { uri: avatarUri } : null} />
        <View style={styles.identityText}>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.username}>@{username}</Text>
        </View>
      </Pressable>
      <View style={styles.group}>
        <SectionTitle appearance="semantic" title="Conta" />
        <View>
          <AccountMenuRow icon="user" label="Meu Perfil" onPress={goToProfile} />
          <AccountMenuRow icon="filter" label="Configurações do aplicativo" onPress={() => navigation.navigate('Settings')} />
        </View>
      </View>
      <View style={styles.group}>
        <SectionTitle appearance="semantic" title="Atividade" />
        <View>
          <AccountMenuRow icon="star" label="Avaliações publicadas" onPress={() => navigation.navigate('CurrentUserReviews')} />
          <AccountMenuRow icon="edit" label="Fazer uma avaliação" onPress={() => navigation.navigate('SelectMovieForReview')} />
          <AccountMenuRow icon="plus" label="Fazer Tier List" onPress={goToTierLists} />
        </View>
      </View>
      <View style={styles.group}>
        <SectionTitle appearance="semantic" title="Social" />
        <AccountMenuRow icon="user" label="Conexões" description="Em breve" disabled />
      </View>
      <View style={styles.group}>
        <SectionTitle appearance="semantic" title="Sessão" />
        <AccountMenuRow icon="back" danger showChevron={false} label={isLoggingOut ? 'Saindo...' : 'Sair'} loading={isLoggingOut} disabled={isLoggingOut} onPress={() => void logout()} />
        {logoutError ? <Text accessibilityRole="alert" style={styles.error}>{logoutError}</Text> : null}
      </View>
    </CineaScreen>
  );
}

const styles = StyleSheet.create({
  content: { gap: semanticSpacing.section },
  identity: { flexDirection: 'row', alignItems: 'center', gap: semanticSpacing.lg, paddingVertical: semanticSpacing.sm, borderRadius: radius.control },
  identityText: { flex: 1, minWidth: 0, gap: semanticSpacing.xs },
  name: { ...semanticTypography.sectionTitle, color: semanticColors.text.primary },
  username: { ...semanticTypography.bodySmall, color: semanticColors.text.secondary },
  group: { gap: semanticSpacing.sm },
  pressed: { backgroundColor: states.pressed.background },
  error: { ...semanticTypography.bodySmall, color: states.danger.text },
});
