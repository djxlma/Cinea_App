import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet, Text } from 'react-native';
import { CineaScreen } from '../../components/CineaScreen';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ReviewCard } from '../../components/ReviewCard';
import { ScreenHeader } from '../../components/ScreenHeader';
import { demoMovies } from '../../data/mock/demoContent';
import { supabase } from '../../lib/supabase';
import { getReviewsByMovie, type ReviewRecord } from '../../services/reviews';
import { colors } from '../../tokens/colors';
import { spacing } from '../../tokens/spacing';
import type { RootScreenProps } from '../../types/navigation';

type Props = RootScreenProps<'Reviews'>;

export function ReviewsScreen({ navigation, route }: Props) {
  const { movieTitle } = route.params;
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const movie = demoMovies.find((item) => item.title === movieTitle);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setCurrentUserId(data.user?.id ?? null);
    }

    void loadUser();
  }, []);

  const loadReviews = useCallback(async () => {
    if (!movie?.id) {
      setReviews([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const nextReviews = await getReviewsByMovie(movie.id);
      setReviews(nextReviews);
    } catch (e) {
      setError('Não foi possível carregar as avaliações.');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [movie?.id]);

  useFocusEffect(useCallback(() => {
    void loadReviews();
  }, [loadReviews]));

  return (
    <CineaScreen
      contentContainerStyle={styles.content}
      footer={<PrimaryButton label="Fazer uma avaliação" onPress={() => navigation.navigate('CreateReview', { movieTitle })} />}
    >
      <ScreenHeader title="Avaliações" onBack={() => navigation.goBack()} />
      {loading ? (
        <Text style={styles.status}>Carregando avaliações...</Text>
      ) : error ? (
        <Text style={styles.status}>{error}</Text>
      ) : reviews.length === 0 ? (
        <Text style={styles.status}>Ainda não há avaliações para este filme.</Text>
      ) : (
        <View style={styles.reviews}>
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} movieTitle={movieTitle} currentUserId={currentUserId} />
          ))}
        </View>
      )}
    </CineaScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 20,
  },
  reviews: {
    gap: spacing.sm,
  },
  status: {
    marginTop: spacing.md,
    color: colors.text,
    fontSize: 16,
  },
});