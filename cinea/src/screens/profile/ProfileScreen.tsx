import { useCallback, useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { ScrollView, Share, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { CineaScreen } from '../../components/CineaScreen';
import { CineaIcon } from '../../components/CineaIcon';
import { PosterTile } from '../../components/PosterTile';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { UserAvatar } from '../../components/UserAvatar';
import { demoMovies } from '../../data/mock/demoContent';
import { getCurrentProfile, getSignedAvatarUrl, type ProfileRecord, updateCurrentProfile, uploadCurrentUserAvatar } from '../../services/profile';
import { getCurrentUserReviews, type ReviewRecord } from '../../services/reviews';
import { supabase } from '../../lib/supabase';
import { colors } from '../../tokens/colors';
import { spacing } from '../../tokens/spacing';
import type { AppTabScreenProps } from '../../types/navigation';

type Props = AppTabScreenProps<'Profile'>;

export function ProfileScreen({ navigation }: Props) {
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [reviewedMovies, setReviewedMovies] = useState<typeof demoMovies>([]);
  const { width } = useWindowDimensions();
  const posterWidth = width * 0.37;
  const posterHeight = posterWidth * 1.52;

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [currentProfile, currentReviews] = await Promise.all([
        getCurrentProfile(),
        getCurrentUserReviews(),
      ]);

      const uniqueMovieIds = [...new Set(currentReviews.map((review) => review.movie_id))];
      const nextReviewedMovies = uniqueMovieIds
        .map((movieId) => demoMovies.find((movie) => movie.id === movieId))
        .filter((movie): movie is (typeof demoMovies)[number] => Boolean(movie));

      setProfile(currentProfile);
      setReviewedMovies(nextReviewedMovies);
      setAvatarUri(await getSignedAvatarUrl(currentProfile?.avatar_url ?? null));
    } catch (e) {
      setError('Não foi possível carregar seu perfil.');
      setProfile(null);
      setAvatarUri(null);
      setReviewedMovies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function loadAuthEmail() {
      const { data } = await supabase.auth.getUser();
      setAuthEmail(data.user?.email ?? '');
    }

    void loadAuthEmail();
  }, []);

  useFocusEffect(useCallback(() => {
    void loadProfile();
  }, [loadProfile]));

  const normalizedUsername = profile?.username?.trim().replace(/^@/, '') ?? '';
  const emailUser = authEmail.split('@')[0]?.replace(/[^a-zA-Z0-9._-]/g, '') || 'usuario';
  const username = normalizedUsername || emailUser || 'usuario';
  const displayName = profile?.display_name?.trim() || 'Usuário';
  const bio = profile?.bio?.trim() || 'Sem bio por enquanto.';

  const shareMessage = `@${username}`;

  const handlePickAvatar = useCallback(async () => {
    try {
      setUploadingAvatar(true);
      setError(null);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      const asset = result.assets[0];
      const avatarPath = await uploadCurrentUserAvatar(asset);
      const nextProfile = await updateCurrentProfile({ avatar_url: avatarPath });
      const nextAvatarUrl = await getSignedAvatarUrl(nextProfile.avatar_url ?? null);

      setProfile(nextProfile);
      setAvatarUri(nextAvatarUrl);
    } catch (e) {
      const typedError = e as Error & { status?: number; statusCode?: number };

      if (__DEV__) {
        console.error('[CINEA][profileAvatar]', {
          etapa: 'atualizar-avatar',
          message: typedError.message,
          status: typedError.status,
          statusCode: typedError.statusCode,
        });
      }

      setError('Não foi possível atualizar sua foto de perfil.');
    } finally {
      setUploadingAvatar(false);
    }
  }, []);

  return (
    <CineaScreen
      contentContainerStyle={styles.content}
      footer={(
        <View style={styles.footerRow}>
          <PrimaryButton label="Solicitar conexão" variant="orange" onPress={() => {}} containerStyle={styles.connectionButton} />
          <PrimaryButton label="" variant="orange" iconOnly icon={<CineaIcon name="share" size={31} />} onPress={() => void Share.share({ message: shareMessage })} />
        </View>
      )}
    >
      <ScreenHeader onBack={() => navigation.navigate('Home')} showAvatar onAvatarPress={() => navigation.navigate('UserMenu')} />
      {loading ? (
        <Text style={styles.statusText}>Carregando perfil...</Text>
      ) : error ? (
        <Text style={styles.statusText}>{error}</Text>
      ) : (
        <>
          <View style={styles.profile}>
            <UserAvatar size={180} source={avatarUri ? { uri: avatarUri } : null} onPress={() => void handlePickAvatar()} />
            {uploadingAvatar ? <Text style={styles.uploadingText}>Enviando foto...</Text> : null}
            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.username}>@{username}</Text>
            <Text style={styles.bio}>{bio}</Text>
          </View>
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Avaliados</Text>
          {reviewedMovies.length === 0 ? (
            <Text style={styles.emptyText}>Você ainda não avaliou nenhum filme.</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.movieRow}>
              {reviewedMovies.map((movie) => (
                <PosterTile
                  key={movie.id}
                  width={posterWidth}
                  height={posterHeight}
                  posterSource={movie.posterSource}
                  backgroundColor={movie.posterColor}
                  showRating={false}
                  onPress={() => navigation.navigate('MovieDetails', { movieTitle: movie.title })}
                />
              ))}
            </ScrollView>
          )}
        </>
      )}
    </CineaScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 16,
    gap: spacing.md,
  },
  profile: {
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    marginBottom: 4,
  },
  name: {
    color: colors.text,
    fontSize: 42,
    fontWeight: '700',
    textAlign: 'center',
  },
  username: {
    color: colors.secondary,
    fontSize: 22,
    fontWeight: '600',
  },
  bio: {
    color: colors.text,
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'left',
    marginTop: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: '#B28B70',
    marginBottom: 4,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '600',
  },
  movieRow: {
    gap: spacing.md,
    paddingRight: 16,
  },
  footerRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  connectionButton: {
    flex: 1,
  },
  statusText: {
    color: colors.text,
    fontSize: 16,
    marginTop: spacing.md,
  },
  emptyText: {
    color: colors.text,
    fontSize: 16,
    marginTop: spacing.sm,
  },
  uploadingText: {
    color: colors.secondary,
    fontSize: 13,
    marginTop: -4,
  },
});