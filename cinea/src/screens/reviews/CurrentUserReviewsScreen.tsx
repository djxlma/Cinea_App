import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { CineaScreen } from '../../components/CineaScreen';
import { PosterTile } from '../../components/PosterTile';
import { RatingStars } from '../../components/RatingStars';
import { ScreenHeader } from '../../components/ScreenHeader';
import { demoMovies } from '../../data/mock/demoContent';
import { colors } from '../../tokens/colors';
import { spacing } from '../../tokens/spacing';
import { getCurrentUserReviews, type ReviewRecord } from '../../services/reviews';
import type { RootScreenProps } from '../../types/navigation';

type Props = RootScreenProps<'CurrentUserReviews'>;

export function CurrentUserReviewsScreen({ navigation }: Props) {
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const nextReviews = await getCurrentUserReviews();
      setReviews(nextReviews);
    } catch (e) {
      setError('Não foi possível carregar suas avaliações.');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    void loadReviews();
  }, [loadReviews]));

  return (
    <CineaScreen contentContainerStyle={styles.pageContent}>
      <ScreenHeader title="Minhas avaliações" onBack={() => navigation.goBack()} />
      {loading ? (
        <Text style={styles.status}>Carregando avaliações...</Text>
      ) : error ? (
        <Text style={styles.status}>{error}</Text>
      ) : reviews.length === 0 ? (
        <Text style={styles.status}>Você ainda não publicou nenhuma avaliação.</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {reviews.map((review) => {
            const movie = demoMovies.find((item) => item.id === review.movie_id);
            const movieTitle = review.movie_title || movie?.title || 'Filme';

            return (
              <View key={review.id} style={styles.reviewRow}>
                <PosterTile
                  width={78}
                  height={110}
                  posterSource={movie?.posterSource ?? require('../../../assets/poster-placeholder.png')}
                  backgroundColor={movie?.posterColor}
                  showRating={false}
                  onPress={() => navigation.navigate('MovieDetails', { movieTitle })}
                />
                <View style={styles.reviewInfo}>
                  <Text style={styles.title}>{movieTitle}</Text>
                  <RatingStars value={review.rating} size={18} />
                  <Text style={styles.reviewText}>{review.content}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </CineaScreen>
  );
}

const styles = StyleSheet.create({
  pageContent: {
    paddingTop: 20,
    gap: spacing.md,
  },
  list: {
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  reviewRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#B28B70',
  },
  reviewInfo: {
    flex: 1,
    gap: 6,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  reviewText: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 22,
  },
  status: {
    marginTop: spacing.md,
    color: colors.text,
    fontSize: 16,
  },
});
