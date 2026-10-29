import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { DemoReview } from '../types/content';
import type { ReviewRecord } from '../services/reviews';
import { RatingStars } from './RatingStars';
import { UserAvatar } from './UserAvatar';
import { PosterTile } from './PosterTile';
import { semanticColors } from '../tokens/colors';
import { semanticSpacing } from '../tokens/spacing';
import { semanticTypography } from '../tokens/typography';

type ReviewCardProps = {
  review: DemoReview | ReviewRecord;
  movieTitle: string;
  currentUserId?: string | null;
  variant?: 'author' | 'withMovie';
  posterUrl?: string | null;
  onMoviePress?: () => void;
};

export function ReviewCard({ review, movieTitle, currentUserId, variant = 'author', posterUrl, onMoviePress }: ReviewCardProps) {
  const reviewText = 'text' in review ? review.text : review.content;
  const author = 'authorId' in review
    ? review.authorId === 'cinefilo-demo'
      ? 'Você'
      : 'Usuário'
    : review.user_id === currentUserId
      ? 'Você'
      : 'Usuário';
  const timestamp = 'created_at' in review ? review.created_at : review.createdAt;
  const date = new Date(timestamp);
  const formattedDate = Number.isFinite(date.getTime())
    ? date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : null;
  const withMovie = variant === 'withMovie';

  return <View style={styles.review}>
    <View style={styles.header}>
      {withMovie ? <Pressable accessibilityRole="button" accessibilityLabel={`Abrir ${movieTitle}`} disabled={!onMoviePress} onPress={onMoviePress}>
        <PosterTile appearance="semantic" width={64} height={96} posterUrl={posterUrl} showRating={false} />
      </Pressable> : <UserAvatar size={40} />}
      <View style={styles.identity}>
        <Text style={withMovie ? styles.movieTitle : styles.author}>{withMovie ? movieTitle : author}</Text>
        <RatingStars appearance="semantic" value={review.rating} size={18} empty="outline" />
        {formattedDate ? <Text style={styles.date}>{formattedDate}</Text> : null}
      </View>
    </View>
    <Text style={styles.body}>{reviewText}</Text>
  </View>;
}

const styles = StyleSheet.create({
  review: { gap: semanticSpacing.md, paddingVertical: semanticSpacing.lg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: semanticColors.border.subtle },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: semanticSpacing.md },
  identity: { flex: 1, minWidth: 0, gap: semanticSpacing.xs },
  author: { ...semanticTypography.label, color: semanticColors.text.primary },
  movieTitle: { ...semanticTypography.sectionTitle, color: semanticColors.text.primary },
  date: { ...semanticTypography.caption, color: semanticColors.text.secondary },
  body: { ...semanticTypography.body, color: semanticColors.text.primary },
});
