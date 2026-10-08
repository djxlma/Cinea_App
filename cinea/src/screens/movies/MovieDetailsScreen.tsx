import { Alert, Share, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { CineaScreen } from '../../components/CineaScreen';
import { CineaIcon } from '../../components/CineaIcon';
import { PosterTile } from '../../components/PosterTile';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { demoMovies } from '../../data/mock/demoContent';
import { colors } from '../../tokens/colors';
import { spacing } from '../../tokens/spacing';
import { typography } from '../../tokens/typography';
import type { RootScreenProps } from '../../types/navigation';

type Props = RootScreenProps<'MovieDetails'>;

export function MovieDetailsScreen({ navigation, route }: Props) {
  const { movieTitle } = route.params;
  const movie = demoMovies.find((item) => item.title === movieTitle) ?? demoMovies[0];
  const { width } = useWindowDimensions();
  const posterWidth = width * 0.69;

  function shareMovie() {
    void Share.share({ message: `${movie.title} • CINEA` });
  }

  return (
    <CineaScreen
      contentContainerStyle={styles.content}
      footer={(
        <View style={styles.actionRow}>
          <PrimaryButton
            label="Avaliações"
            variant="orange"
            onPress={() => navigation.navigate('Reviews', { movieTitle: movie.title })}
            containerStyle={styles.reviewButton}
          />
          <PrimaryButton
            label=""
            variant="orange"
            iconOnly
            icon={<CineaIcon name="share" size={31} />}
            onPress={shareMovie}
          />
        </View>
      )}
    >
      <ScreenHeader onBack={() => navigation.goBack()} />
      <View style={styles.posterStage}>
        <View pointerEvents="none" style={[styles.spotlight, { left: width * 0.21 }]} />
        <PosterTile width={posterWidth} height={posterWidth * 1.5} posterSource={movie.posterSource ?? require('../../../assets/poster-placeholder.png')} />
      </View>
      <View style={styles.titleRow}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{movie.title}</Text>
          <Text style={styles.meta}>{movie.year}  ·  {movie.genres.join(' / ')}</Text>
        </View>
        <View style={styles.ratingBadge}>
          <CineaIcon name="star" size={26} color={colors.secondary} />
          <Text style={styles.ratingValue}>{movie.rating.toFixed(1)}</Text>
        </View>
      </View>
      <Text style={styles.synopsis}>{movie.synopsis}</Text>
      <PrimaryButton
        label="Assistir agora"
        onPress={() => Alert.alert('Onde assistir', movie.streamingServices.join('  ·  '))}
      />
    </CineaScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 8,
    gap: 24,
  },
  posterStage: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  spotlight: {
    position: 'absolute',
    top: -42,
    width: 0,
    height: 0,
    borderLeftWidth: 100,
    borderRightWidth: 100,
    borderBottomWidth: 414,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(255, 225, 186, 0.14)',
  },
  titleRow: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  titleBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
  },
  meta: {
    color: colors.textMuted,
    fontSize: 13,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 32,
  },
  ratingValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    includeFontPadding: false,
  },
  synopsis: {
    ...typography.body,
    fontSize: 17,
    lineHeight: 26,
    letterSpacing: 0,
    color: colors.text,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  reviewButton: {
    flex: 1,
  },
});