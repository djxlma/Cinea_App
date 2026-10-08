import { useCallback, useEffect, useState } from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { CineaIcon } from '../../components/CineaIcon';
import { UserAvatar } from '../../components/UserAvatar';
import { getCurrentProfile, getSignedAvatarUrl, type ProfileRecord } from '../../services/profile';
import { supabase } from '../../lib/supabase';
import { colors } from '../../tokens/colors';
import { spacing } from '../../tokens/spacing';
import type { RootScreenProps } from '../../types/navigation';

type Props = RootScreenProps<'UserMenu'> & { onLogout: () => Promise<void> | void };

export function UserMenuScreen({ navigation, onLogout }: Props) {
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [email, setEmail] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      const currentProfile = await getCurrentProfile();
      setProfile(currentProfile);
      setAvatarUri(await getSignedAvatarUrl(currentProfile?.avatar_url ?? null));
    } catch (error) {
      setProfile(null);
      setAvatarUri(null);
    }
  }, []);

  useEffect(() => {
    async function loadAuthEmail() {
      const { data } = await supabase.auth.getUser();
      setEmail(data.user?.email ?? '');
    }

    void loadAuthEmail();
  }, []);

  useFocusEffect(useCallback(() => {
    void loadProfile();
  }, [loadProfile]));

  const goToProfile = () => navigation.navigate('App', { screen: 'Profile' });
  const goToTierLists = () => navigation.navigate('App', { screen: 'TierLists' });
  const displayName = profile?.display_name?.trim() || 'Usuário';
  const username = profile?.username?.trim() || email.split('@')[0]?.replace(/[^a-zA-Z0-9._-]/g, '') || 'usuario';

  return (
    <ImageBackground
      source={require('../../../design-reference/Tela Inicial.png')}
      blurRadius={12}
      resizeMode="cover"
      style={styles.background}
    >
      <View style={styles.dim}>
        <View style={styles.topRow}>
          <Pressable accessibilityRole="button" accessibilityLabel="Fechar menu" onPress={() => navigation.goBack()} style={styles.back}>
            <CineaIcon name="back" size={34} />
          </Pressable>
          <UserAvatar size={47} source={avatarUri ? { uri: avatarUri } : null} onPress={() => navigation.goBack()} />
        </View>
        <Text style={styles.name}>{displayName}</Text>
        <View style={styles.menu}>
          <MenuItem label="Editar perfil" onPress={goToProfile} />
          <MenuItem label="Avaliações publicadas" onPress={() => navigation.navigate('CurrentUserReviews')} />
          <MenuItem label="Fazer uma avaliação" onPress={() => navigation.navigate('SelectMovieForReview')} />
          <MenuItem label="Fazer Tier List" onPress={goToTierLists} />
          <MenuItem label="Conexões" inactive />
          <MenuItem label="Configurações do aplicativo" inactive />
          <MenuItem label="Sair" onPress={() => void onLogout()} />
        </View>
      </View>
    </ImageBackground>
  );
}

type MenuItemProps = {
  label: string;
  onPress?: () => void;
  inactive?: boolean;
};

function MenuItem({ label, onPress, inactive = false }: MenuItemProps) {
  return (
    <Pressable accessibilityRole="button" disabled={inactive} onPress={onPress} style={styles.menuItem}>
      <Text style={styles.menuLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  dim: {
    flex: 1,
    paddingHorizontal: '9.45%',
    paddingTop: 22,
    backgroundColor: 'rgba(43, 7, 5, 0.52)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  back: {
    width: 40,
    height: 48,
    justifyContent: 'center',
  },
  name: {
    marginTop: 8,
    color: colors.text,
    fontSize: 34,
    fontWeight: '700',
    textAlign: 'right',
  },
  menu: {
    alignItems: 'flex-end',
    gap: spacing.sm,
    marginTop: 26,
  },
  menuItem: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  menuLabel: {
    color: colors.text,
    fontSize: 20,
    textAlign: 'right',
  },
});