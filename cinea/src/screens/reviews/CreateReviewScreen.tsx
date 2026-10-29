import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CineaScreen } from '../../components/CineaScreen';
import { CineaInput } from '../../components/CineaInput';
import { PosterTile } from '../../components/PosterTile';
import { PrimaryButton } from '../../components/PrimaryButton';
import { RatingStars } from '../../components/RatingStars';
import { ScreenHeader } from '../../components/ScreenHeader';
import { useReviewMovies } from '../../hooks/useReviewMovies';
import { resolveMovieTmdbId } from '../../data/legacyMovieTmdbMap';
import { supabase } from '../../lib/supabase';
import { createReview } from '../../services/reviews';
import { semanticColors } from '../../tokens/colors';
import { semanticSpacing } from '../../tokens/spacing';
import { semanticTypography } from '../../tokens/typography';
import { sizes } from '../../tokens/sizes';
import type { RootScreenProps } from '../../types/navigation';

type Props = RootScreenProps<'CreateReview'>;

export function CreateReviewScreen({ navigation, route }: Props) {
  const { movieId: routeMovieId, movieTitle } = route.params;
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [currentUserName, setCurrentUserName] = useState('Usuário');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const tmdbId = resolveMovieTmdbId(routeMovieId, movieTitle);
  const movieId = tmdbId === null ? null : String(tmdbId);
  const movieReferences = useMemo(() => movieId ? [{ movie_id: movieId }] : [], [movieId]);
  const movies = useReviewMovies(movieReferences);
  const movie = movieId ? movies[movieId] : undefined;
  const submitting = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      if (mounted.current) setCurrentUserName(data.user?.email?.split('@')[0] ?? 'Usuário');
    }

    void loadUser().catch(() => {});
    return () => { mounted.current = false; };
  }, []);

  async function saveReview() {
    if (submitting.current) return;
    if (!movieId || !movieTitle) {
      setError('Filme inválido para avaliação.');
      return;
    }

    if (rating < 1 || rating > 5) {
      setError('Selecione uma avaliação de 1 a 5 estrelas.');
      return;
    }

    const trimmedText = text.trim();
    if (!trimmedText) {
      setError('Escreva uma avaliação antes de publicar.');
      return;
    }

    submitting.current = true;
    setIsSubmitting(true);
    setError('');

    try {
      await createReview({
        movieId,
        movieTitle,
        rating,
        content: trimmedText,
      });
      if (mounted.current) navigation.popTo('CurrentUserReviews');
    } catch (e) {
      if (mounted.current) setError('Não foi possível publicar a avaliação.');
    } finally {
      submitting.current = false;
      if (mounted.current) setIsSubmitting(false);
    }
  }

  return (
    <CineaScreen
      appearance="semantic"
      keyboardAvoiding
      keyboardShouldPersistTaps="handled"
      maxContentWidth={640}
      contentContainerStyle={styles.content}
    >
      <ScreenHeader appearance="semantic" title="Nova avaliação" onBack={() => navigation.goBack()} />
      <View style={styles.movieContext}>
        <View accessible accessibilityRole="image" accessibilityLabel={`Poster de ${movieTitle}`}>
          <PosterTile appearance="semantic" width={64} height={96} posterUrl={movie?.posterUrl} showRating={false} />
        </View>
        <View style={styles.movieIdentity}>
          <Text accessibilityRole="header" style={styles.movieTitle}>{movie?.title?.trim() || movieTitle}</Text>
          {movie?.year ? <Text style={styles.metadata}>{movie.year}</Text> : null}
          <Text style={styles.metadata}>Por {currentUserName}</Text>
        </View>
      </View>
      <View style={styles.form}>
        <View style={styles.ratingSection}>
          <Text style={styles.label}>Sua nota</Text>
          <RatingStars appearance="semantic" value={rating} size={28} interactive onChange={setRating} color={semanticColors.brand.amber} empty="outline" />
        </View>
        <CineaInput
          label="Comentário"
          accessibilityLabel="Comentário da avaliação"
          multiline
          onChangeText={(value) => {
            setText(value);
            if (error) {
              setError('');
            }
          }}
          placeholder="Escreva sua avaliação"
          style={styles.input}
          textAlignVertical="top"
          value={text}
        />
        {error || !movieId ? <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.errorText}>{error || 'Filme inválido para avaliação.'}</Text> : null}
        <PrimaryButton label={isSubmitting ? 'Publicando...' : 'Publicar'} variant="primary" fullWidth loading={isSubmitting}
          onPress={() => void saveReview()} disabled={isSubmitting || !movieId} />
      </View>
    </CineaScreen>
  );
}

const styles = StyleSheet.create({
  content: { gap: semanticSpacing.xxl },
  movieContext: { flexDirection: 'row', alignItems: 'flex-start', gap: semanticSpacing.md },
  movieIdentity: { flex: 1, minWidth: 0, gap: semanticSpacing.xs },
  movieTitle: { ...semanticTypography.sectionTitle, color: semanticColors.text.primary },
  metadata: { ...semanticTypography.caption, color: semanticColors.text.secondary },
  form: { gap: semanticSpacing.xl },
  ratingSection: { gap: semanticSpacing.sm },
  label: { ...semanticTypography.label, color: semanticColors.text.primary },
  input: { minHeight: sizes.inputMinHeight * 3 },
  errorText: { ...semanticTypography.bodySmall, color: semanticColors.feedback.danger.text },
});
