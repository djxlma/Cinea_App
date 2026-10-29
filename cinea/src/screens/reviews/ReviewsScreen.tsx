import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet, Text } from 'react-native';
import { CineaScreen } from '../../components/CineaScreen';
import { CineaState } from '../../components/CineaState';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ReviewCard } from '../../components/ReviewCard';
import { ScreenHeader } from '../../components/ScreenHeader';
import { resolveMovieTmdbId } from '../../data/legacyMovieTmdbMap';
import { supabase } from '../../lib/supabase';
import { getReviewsByMovie, type ReviewRecord } from '../../services/reviews';
import { semanticColors } from '../../tokens/colors';
import { semanticSpacing } from '../../tokens/spacing';
import { semanticTypography } from '../../tokens/typography';
import type { RootScreenProps } from '../../types/navigation';

type Props = RootScreenProps<'Reviews'>;

export function ReviewsScreen({ navigation, route }: Props) {
  const { movieId, movieTitle } = route.params;
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const tmdbId = resolveMovieTmdbId(movieId, movieTitle);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (active) setCurrentUserId(data.user?.id ?? null);
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setReviews([]);
    if (tmdbId === null) {
      setError('Filme inválido para avaliação.');
      setLoading(false);
    } else {
      void getReviewsByMovie(String(tmdbId))
        .then((result) => { if (active) setReviews(result); })
        .catch(() => { if (active) setError('Não foi possível carregar as avaliações.'); })
        .finally(() => { if (active) setLoading(false); });
    }
    return () => { active = false; };
  }, [tmdbId, retryCount]));

  return (
    <CineaScreen
      appearance="semantic"
      maxContentWidth={640}
      contentContainerStyle={styles.content}
    >
      <ScreenHeader appearance="semantic" title="Avaliações" onBack={() => navigation.goBack()} />
      <Text accessibilityRole="header" style={styles.movieTitle}>{movieTitle}</Text>
      {loading ? (
        <CineaState variant="loading" size="screen" message="Carregando avaliações..." />
      ) : error ? (
        <CineaState variant="error" size="screen" title={error} actionLabel="Tentar novamente" onAction={() => setRetryCount((value) => value + 1)} />
      ) : reviews.length === 0 ? (
        <CineaState variant="empty" size="screen" title="Nenhuma avaliação ainda" message="Ainda não há avaliações para este filme." />
      ) : (
        <View style={styles.reviews}>
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} movieTitle={movieTitle} currentUserId={currentUserId} />
          ))}
        </View>
      )}
      <PrimaryButton label="Fazer uma avaliação" variant="primary" fullWidth onPress={() => navigation.navigate('CreateReview', { movieId: tmdbId === null ? undefined : String(tmdbId), movieTitle })} disabled={tmdbId === null} />
    </CineaScreen>
  );
}

const styles = StyleSheet.create({
  content: { gap: semanticSpacing.xxl },
  reviews: { gap: semanticSpacing.xs },
  movieTitle: { ...semanticTypography.title, color: semanticColors.text.primary },
});
