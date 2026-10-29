import { useEffect, useState } from 'react';
import { Image, Alert, Share, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { CineaScreen } from '../../components/CineaScreen';
import { CineaIcon } from '../../components/CineaIcon';
import { CineaIconButton } from '../../components/CineaIconButton';
import { CineaState } from '../../components/CineaState';
import { SectionTitle } from '../../components/SectionTitle';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { resolveMovieTmdbId } from '../../data/legacyMovieTmdbMap';
import { getMovieDetails } from '../../services/tmdb';
import type { Movie } from '../../types/movie';
import { semanticColors } from '../../tokens/colors';
import { semanticSpacing } from '../../tokens/spacing';
import { semanticTypography } from '../../tokens/typography';
import { radius } from '../../tokens/radius';
import type { RootScreenProps } from '../../types/navigation';

type Props = RootScreenProps<'MovieDetails'>;

export function MovieDetailsScreen({ navigation, route }: Props) {
  const { movieId, movieTitle } = route.params;
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const availableWidth = Math.max(0, width - insets.left - insets.right - semanticSpacing.xl * 2);
  const posterWidth = Math.min(240, availableWidth * 0.72, Math.max(210, (height - insets.top - insets.bottom) * 0.44) / 1.5);
  const [posterFailed, setPosterFailed] = useState(false);
  const tmdbId = resolveMovieTmdbId(movieId, movieTitle);
  const [details, setDetails] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(tmdbId !== null);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (tmdbId === null) return;
    let active = true;
    const controller = new AbortController();
    setIsLoading(true);
    setHasError(false);
    setDetails(null);
    setPosterFailed(false);
    void getMovieDetails(tmdbId, controller.signal)
      .then((result) => { if (active) setDetails(result); })
      .catch(() => { if (active) setHasError(true); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => {
      active = false;
      controller.abort();
    };
  }, [tmdbId, retryCount]);

  // Never render details belonging to a previous route ID.
  const remoteMovie = tmdbId !== null && details?.tmdbId === tmdbId ? details : null;
  const movie = remoteMovie;

  if (!movie || (tmdbId !== null && (isLoading || hasError))) {
    const loading = tmdbId !== null && !hasError;
    return (
      <CineaScreen appearance="semantic" maxContentWidth={640} contentContainerStyle={styles.content}>
        <ScreenHeader appearance="semantic" onBack={() => navigation.goBack()} />
        <Text accessibilityRole="header" style={styles.title}>{movieTitle || 'Filme'}</Text>
        {loading ? <CineaState variant="loading" size="screen" message="Carregando detalhes..." />
          : tmdbId !== null ? <CineaState variant="error" size="screen" title="Não foi possível carregar os detalhes do filme."
            actionLabel="Tentar novamente" onAction={() => {
              setIsLoading(true);
              setHasError(false);
              setRetryCount((count) => count + 1);
            }} /> : <CineaState variant="error" size="screen" title="Não foi possível carregar os detalhes do filme." />}
      </CineaScreen>
    );
  }

  const title = movie.title?.trim() || movieTitle || 'Filme';
  const originalTitle = movie.originalTitle?.trim();
  const metadata = [
    movie.year,
    typeof movie.runtime === 'number' && Number.isFinite(movie.runtime) && movie.runtime > 0 ? `${movie.runtime} min` : null,
    (movie.genres ?? []).filter(Boolean).join(', '),
  ].filter(Boolean).join(' · ');
  const shareMovie = () => {
    void Share.share({ message: `${title} • CINEA` });
  };

  return (
    <CineaScreen appearance="semantic" maxContentWidth={640} contentContainerStyle={styles.content}>
      <ScreenHeader appearance="semantic" onBack={() => navigation.goBack()}
        rightAction={<CineaIconButton icon="share" accessibilityLabel="Compartilhar filme" onPress={shareMovie} />} />
      <View style={styles.posterStage}>
        <View style={[styles.posterFrame, { width: posterWidth, height: posterWidth * 1.5 }]}>
          <Image
            key={movie.id}
            accessible
            accessibilityRole="image"
            accessibilityLabel={`Poster de ${title}`}
            source={movie.posterUrl && !posterFailed ? { uri: movie.posterUrl } : require('../../../assets/poster-placeholder.png')}
            resizeMode="contain"
            style={styles.poster}
            onError={() => setPosterFailed(true)}
          />
        </View>
      </View>
      <View style={styles.movieInfo}>
        <View style={styles.titleBlock}>
          <Text accessibilityRole="header" style={styles.title}>{title}</Text>
          {originalTitle && originalTitle.toLocaleLowerCase() !== title.toLocaleLowerCase()
            ? <Text style={styles.originalTitle}>Título original: {originalTitle}</Text> : null}
          {metadata ? <Text style={styles.meta}>{metadata}</Text> : null}
        </View>
        {Number.isFinite(movie.voteAverage) && movie.voteAverage > 0 && movie.voteAverage <= 10 ? <View style={styles.ratingBadge}>
          <CineaIcon name="star" size={20} color={semanticColors.brand.amber} />
          <Text style={styles.ratingValue}>{movie.voteAverage.toFixed(1)} TMDB</Text>
        </View> : null}
      </View>
      <View style={styles.actions}>
        <View style={styles.reviewAction}>
          <PrimaryButton
            label="Avaliações"
            variant="primary"
            fullWidth
            onPress={() => navigation.navigate('Reviews', { movieId: movie.id, movieTitle: title })}
          />
        </View>
        <PrimaryButton
          label="Assistir agora"
          variant="secondary"
          secondaryTone="wine"
          fullWidth
          onPress={() => Alert.alert('Onde assistir', 'Disponibilidade em streaming será adicionada em breve.')}
        />
      </View>
      <View style={styles.synopsisSection}>
        <SectionTitle appearance="semantic" title="Sinopse" />
        <Text style={[styles.synopsis, !movie.overview?.trim() && styles.unavailableSynopsis]}>{movie.overview?.trim() || 'Sinopse indisponível.'}</Text>
      </View>
    </CineaScreen>
  );
}

const styles = StyleSheet.create({
  content: { gap: semanticSpacing.xxl, paddingBottom: semanticSpacing.section },
  posterStage: { alignItems: 'center' },
  posterFrame: { borderRadius: radius.poster, overflow: 'hidden', backgroundColor: semanticColors.surface.subtle },
  poster: { width: '100%', height: '100%' },
  movieInfo: { gap: semanticSpacing.md },
  titleBlock: { gap: semanticSpacing.sm },
  title: { ...semanticTypography.title, color: semanticColors.text.primary },
  originalTitle: { ...semanticTypography.bodySmall, color: semanticColors.text.secondary },
  meta: { ...semanticTypography.bodySmall, color: semanticColors.text.secondary },
  ratingBadge: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', alignSelf: 'flex-start', gap: semanticSpacing.sm },
  ratingValue: { ...semanticTypography.label, color: semanticColors.text.primary, flexShrink: 1 },
  actions: { gap: semanticSpacing.sm },
  reviewAction: { backgroundColor: semanticColors.brand.amber, borderColor: semanticColors.text.onAccent, borderWidth: 1, borderRadius: radius.control, overflow: 'hidden' },
  synopsisSection: { gap: semanticSpacing.md, marginTop: semanticSpacing.sm },
  synopsis: { ...semanticTypography.body, color: semanticColors.text.primary },
  unavailableSynopsis: { color: semanticColors.text.secondary },
});
