import { StyleSheet, Text, View } from 'react-native';
import type { DemoReview } from '../types/content';
import type { ReviewRecord } from '../services/reviews';
import { RatingStars } from './RatingStars';
import { UserAvatar } from './UserAvatar';
import { colors } from '../tokens/colors';
import { spacing } from '../tokens/spacing';
import { typography } from '../tokens/typography';

type ReviewCardProps = {
  review: DemoReview | ReviewRecord;
  movieTitle: string;
  currentUserId?: string | null;
};

export function ReviewCard({ review, currentUserId }: ReviewCardProps) {
  const reviewText = 'text' in review ? review.text : review.content;
  const author = 'authorId' in review
    ? review.authorId === 'cinefilo-demo'
      ? 'Você'
      : 'Usuário'
    : review.user_id === currentUserId
      ? 'Você'
      : 'Usuário';

  return (
    <View style={styles.row}>
      <UserAvatar size={52} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.author}>{author}</Text>
          <RatingStars value={review.rating} size={20} />
        </View>
        <Text style={styles.body}>{reviewText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 135,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#B28B70',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 6,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  author: {
    ...typography.h4,
    fontSize: 24,
    letterSpacing: 0,
    color: colors.text,
  },
  body: {
    ...typography.body,
    fontSize: 18,
    letterSpacing: 0,
    color: colors.text,
    lineHeight: 24,
  },
});