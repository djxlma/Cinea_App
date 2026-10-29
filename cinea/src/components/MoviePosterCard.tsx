import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { PosterTile } from './PosterTile';
import { semanticColors } from '../tokens/colors';
import { semanticSpacing } from '../tokens/spacing';
import { semanticTypography } from '../tokens/typography';

type MoviePosterCardProps = {
  width: number;
  title: string;
  year?: string | number | null;
  posterUrl?: string | null;
  onPress: () => void;
  accessibilityLabel?: string;
};

export function MoviePosterCard({ width, title, year, posterUrl, onPress, accessibilityLabel }: MoviePosterCardProps) {
  const { fontScale } = useWindowDimensions();
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? `Abrir ${title}${year ? `, ${year}` : ''}`}
    onPress={onPress} style={[styles.card, { width }]}>
    {({ pressed }) => <>
      <PosterTile appearance="semantic" width={width} height={width * 1.5} posterUrl={posterUrl} showRating={false} />
      <Text numberOfLines={2} style={[styles.title, { minHeight: semanticTypography.label.lineHeight * 2 * fontScale }, pressed && styles.pressedTitle]}>{title}</Text>
      <View style={{ minHeight: semanticTypography.caption.lineHeight * fontScale }}>{year ? <Text style={styles.year}>{year}</Text> : null}</View>
    </>}
  </Pressable>;
}

const styles = StyleSheet.create({
  card: { gap: semanticSpacing.xs },
  title: { ...semanticTypography.label, color: semanticColors.text.primary, marginTop: semanticSpacing.xs },
  pressedTitle: { color: semanticColors.brand.amber },
  year: { ...semanticTypography.caption, color: semanticColors.text.secondary },
});
