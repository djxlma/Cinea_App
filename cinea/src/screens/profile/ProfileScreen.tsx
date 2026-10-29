import { useCallback, useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { FlatList, Share, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { CineaScreen } from '../../components/CineaScreen';
import { CineaIconButton } from '../../components/CineaIconButton';
import { CineaState } from '../../components/CineaState';
import { MoviePosterCard } from '../../components/MoviePosterCard';
import { SectionTitle } from '../../components/SectionTitle';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { UserAvatar } from '../../components/UserAvatar';
import { getReviewedMovieCards } from '../../services/movieResolver';
import { useReviewMovies } from '../../hooks/useReviewMovies';
import { getCurrentProfile, getSignedAvatarUrl, type ProfileRecord, updateCurrentProfile, uploadCurrentUserAvatar } from '../../services/profile';
import { getCurrentUserReviews, type ReviewRecord } from '../../services/reviews';
import { supabase } from '../../lib/supabase';
import { semanticColors } from '../../tokens/colors';
import { semanticSpacing } from '../../tokens/spacing';
import { semanticTypography } from '../../tokens/typography';
import { sizes } from '../../tokens/sizes';
import type { RootScreenProps } from '../../types/navigation';

type Props = {
  navigation: Pick<RootScreenProps<'AccountProfile'>['navigation'], 'navigate' | 'goBack' | 'canGoBack'>;
};

export function ProfileScreen({ navigation }: Props) {
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const resolvedMovies = useReviewMovies(reviews);
  const reviewedMovies = getReviewedMovieCards(reviews, resolvedMovies);
  const [retryCount, setRetryCount] = useState(0);
  const { width } = useWindowDimensions();
  const posterWidth = Math.min(160, (width - semanticSpacing.xl * 2) * 0.38);

  const loadProfile = useCallback(async (isActive: () => boolean) => {
    try {
      setLoading(true);
      setError(null);

      const [currentProfile, currentReviews] = await Promise.all([
        getCurrentProfile(),
        getCurrentUserReviews(),
      ]);

      if (!isActive()) return;
      setProfile(currentProfile);
      setReviews(currentReviews);
      setLoading(false);
      const uri = await getSignedAvatarUrl(currentProfile?.avatar_url ?? null).catch(() => null);
      if (isActive()) setAvatarUri(uri);
    } catch (e) {
      if (!isActive()) return;
      setError('Não foi possível carregar seu perfil.');
      setProfile(null);
      setAvatarUri(null);
      setReviews([]);
    } finally {
      if (isActive()) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    async function loadAuthEmail() {
      const { data } = await supabase.auth.getUser();
      if (active) setAuthEmail(data.user?.email ?? '');
    }

    void loadAuthEmail().catch(() => {});
    return () => { active = false; };
  }, []);

  useFocusEffect(useCallback(() => {
    let active = true;
    void loadProfile(() => active);
    return () => { active = false; };
  }, [loadProfile, retryCount]));

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
    <CineaScreen appearance="semantic" maxContentWidth={640} contentContainerStyle={styles.content}>
      <ScreenHeader appearance="semantic" title="Meu Perfil" onBack={() => {
        if (navigation.canGoBack()) navigation.goBack();
        else navigation.navigate('App', { screen: 'Home' });
      }}
        rightAction={<View style={styles.headerActions}>
          <CineaIconButton icon="share" accessibilityLabel="Compartilhar perfil" onPress={() => void Share.share({ message: shareMessage })} />
          <UserAvatar size={sizes.touchTargetMin} source={avatarUri ? { uri: avatarUri } : null} onPress={() => navigation.navigate('UserMenu')} />
        </View>} />
      {loading ? <CineaState variant="loading" size="screen" message="Carregando perfil..." />
        : error ? <CineaState variant="error" size="screen" title={error} actionLabel="Tentar novamente" onAction={() => setRetryCount((value) => value + 1)} /> : <>
          <View style={styles.profile}>
            <UserAvatar size={104} accessibilityLabel="Alterar foto do perfil" source={avatarUri ? { uri: avatarUri } : null} onPress={() => void handlePickAvatar()} />
            {uploadingAvatar ? <Text accessibilityLiveRegion="polite" style={styles.uploadingText}>Enviando foto...</Text> : null}
            <View style={styles.identity}>
              <Text accessibilityRole="header" style={styles.name}>{displayName}</Text>
              <Text style={styles.username}>@{username}</Text>
            </View>
            <Text style={styles.bio}>{bio}</Text>
            <PrimaryButton label="Editar perfil" variant="secondary" secondaryTone="wine" onPress={() => navigation.navigate('EditProfile')} />
          </View>
          <View style={styles.reviewedSection}>
            <SectionTitle appearance="semantic" title="Avaliados" />
            {reviewedMovies.length === 0 ? <CineaState variant="empty" size="section" title="Você ainda não avaliou nenhum filme." /> : (
              <FlatList horizontal data={reviewedMovies} keyExtractor={(movie) => movie.id} showsHorizontalScrollIndicator={false}
                initialNumToRender={5} windowSize={5} contentContainerStyle={styles.movieRow}
                renderItem={({ item: movie }) => <MoviePosterCard width={posterWidth} title={movie.title} posterUrl={movie.posterUrl}
                  onPress={() => navigation.navigate('MovieDetails', { movieId: movie.id, movieTitle: movie.title })} />} />
            )}
          </View>
        </>}
    </CineaScreen>
  );
}

const styles = StyleSheet.create({
  content: { gap: semanticSpacing.section },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: semanticSpacing.xs },
  profile: { alignItems: 'center', gap: semanticSpacing.lg },
  identity: { alignSelf: 'stretch', gap: semanticSpacing.xs },
  name: { ...semanticTypography.title, color: semanticColors.text.primary, textAlign: 'center' },
  username: { ...semanticTypography.bodySmall, color: semanticColors.text.secondary, textAlign: 'center' },
  bio: { ...semanticTypography.body, color: semanticColors.text.primary, textAlign: 'center', alignSelf: 'stretch' },
  reviewedSection: { gap: semanticSpacing.lg },
  movieRow: { gap: semanticSpacing.md, paddingRight: semanticSpacing.xs },
  uploadingText: { ...semanticTypography.bodySmall, color: semanticColors.text.secondary },
});
