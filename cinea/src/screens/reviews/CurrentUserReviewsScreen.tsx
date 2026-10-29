import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { StyleSheet, View } from 'react-native';
import { CineaScreen } from '../../components/CineaScreen';
import { ReviewCard } from '../../components/ReviewCard';
import { CineaState } from '../../components/CineaState';
import { ScreenHeader } from '../../components/ScreenHeader';
import { getMovieIdentityKey } from '../../services/movieResolver';
import { useReviewMovies } from '../../hooks/useReviewMovies';
import { semanticSpacing } from '../../tokens/spacing';
import { getCurrentUserReviews, type ReviewRecord } from '../../services/reviews';
import type { RootScreenProps } from '../../types/navigation';

type Props = RootScreenProps<'CurrentUserReviews'>;

export function CurrentUserReviewsScreen({ navigation }: Props) {
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const movies = useReviewMovies(reviews);
  const [retryCount, setRetryCount] = useState(0);
  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    setError(null);
    void getCurrentUserReviews()
      .then((result) => { if (active) setReviews(result); })
      .catch(() => { if (active) setError('Não foi possível carregar suas avaliações.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [retryCount]));

  return (
    <CineaScreen appearance="semantic" maxContentWidth={640} contentContainerStyle={styles.pageContent}>
      <ScreenHeader appearance="semantic" title="Minhas avaliações" titleNumberOfLines={2} onBack={() => navigation.goBack()} />
      {loading ? (
        <CineaState variant="loading" size="screen" message="Carregando avaliações..." />
      ) : error ? (
        <CineaState variant="error" size="screen" title={error} actionLabel="Tentar novamente" onAction={() => setRetryCount((value) => value + 1)} />
      ) : reviews.length === 0 ? (
        <CineaState variant="empty" size="screen" title="Você ainda não publicou nenhuma avaliação." />
      ) : (
        <View style={styles.list}>
          {reviews.map((review) => {
            const movie = movies[getMovieIdentityKey(review.movie_id)];
            const movieTitle = movie?.title?.trim() || review.movie_title || 'Filme';

            return (
              <ReviewCard key={review.id} variant="withMovie" review={review} movieTitle={movieTitle} posterUrl={movie?.posterUrl}
                onMoviePress={() => navigation.navigate('MovieDetails', { movieId: movie?.id ?? review.movie_id, movieTitle })} />
            );
          })}
        </View>
      )}
    </CineaScreen>
  );
}

const styles = StyleSheet.create({
  pageContent: { gap: semanticSpacing.xxl },
  list: { gap: semanticSpacing.xs },
});
