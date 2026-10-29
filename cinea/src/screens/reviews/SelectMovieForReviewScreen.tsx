import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { CineaScreen } from '../../components/CineaScreen';
import { FloatingSearchBar } from '../../components/FloatingSearchBar';
import { MoviePosterCard } from '../../components/MoviePosterCard';
import { CineaState } from '../../components/CineaState';
import { ScreenHeader } from '../../components/ScreenHeader';
import { useMoviePages } from '../../hooks/useMoviePages';
import { getPopularMovies, searchMovies } from '../../services/tmdb';
import { semanticColors } from '../../tokens/colors';
import { semanticSpacing } from '../../tokens/spacing';
import { semanticTypography } from '../../tokens/typography';
import type { Movie } from '../../types/movie';
import type { RootScreenProps } from '../../types/navigation';

type Props = RootScreenProps<'SelectMovieForReview'>;

export function SelectMovieForReviewScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim();
  const [gridWidth, setGridWidth] = useState(0);
  const tileWidth = Math.max(0, (gridWidth - semanticSpacing.md * 2) / 3);
  const listRef = useRef<FlatList<Movie>>(null);
  const loader = useCallback((page: number, signal: AbortSignal) => normalizedQuery
    ? searchMovies(normalizedQuery, page, signal) : getPopularMovies(page, signal), [normalizedQuery]);
  const { movies, isLoadingInitial, isLoadingMore, error, loadMore, retry } = useMoviePages(loader, 1, 400);
  useEffect(() => { listRef.current?.scrollToOffset({ offset: 0, animated: false }); }, [normalizedQuery]);

  const retryState = (
    <CineaState variant="error" size="section" title="Não foi possível carregar os filmes." actionLabel="Tentar novamente" onAction={retry} />
  );

  return (
    <CineaScreen appearance="semantic" scrollable={false} contentContainerStyle={styles.screen}>
      <FlatList
        style={styles.list}
        showsVerticalScrollIndicator={false}
        onLayout={(event) => setGridWidth(event.nativeEvent.layout.width)}
        ref={listRef}
        data={movies}
        keyExtractor={(movie) => movie.id}
        numColumns={3}
        contentContainerStyle={styles.content}
        columnWrapperStyle={styles.row}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={12}
        windowSize={5}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          <View style={styles.header}>
            <ScreenHeader appearance="semantic" title="Fazer uma avaliação" titleNumberOfLines={2} onBack={() => navigation.goBack()} />
            <Text style={styles.text}>Escolha um filme para avaliar.</Text>
            <FloatingSearchBar appearance="semantic" value={query} onChangeText={setQuery} placeholder="Pesquisar filmes..." />
          </View>
        }
        ListEmptyComponent={isLoadingInitial ? <CineaState variant="loading" size="screen" message="Carregando filmes..." />
          : error ? retryState : <CineaState variant="empty" size="screen" title="Nenhum filme encontrado." />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {gridWidth > 0 ? <MoviePosterCard width={tileWidth} title={item.title} year={item.year} posterUrl={item.posterUrl}
              accessibilityLabel={`Avaliar ${item.title}${item.year ? `, ${item.year}` : ''}`}
              onPress={() => navigation.navigate('CreateReview', { movieId: item.id, movieTitle: item.title })} /> : null}
          </View>
        )}
        ListFooterComponent={movies.length > 0 ? isLoadingMore
          ? <ActivityIndicator accessibilityLabel="Carregando mais filmes" style={styles.status} color={semanticColors.brand.amber} /> : error ? retryState : null : null}
      />
    </CineaScreen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, minHeight: 0, paddingTop: 0, paddingBottom: 0 },
  list: { flex: 1 },
  content: { flexGrow: 1, paddingTop: semanticSpacing.md, paddingBottom: semanticSpacing.xxl },
  header: { gap: semanticSpacing.lg, marginBottom: semanticSpacing.xl },
  row: { justifyContent: 'flex-start', gap: semanticSpacing.md },
  card: { marginBottom: semanticSpacing.xl },
  text: { ...semanticTypography.bodySmall, color: semanticColors.text.secondary },
  status: { paddingVertical: semanticSpacing.lg, alignItems: 'center' },
});
