import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Keyboard, StyleSheet, Text, View } from 'react-native';
import type { TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { CineaScreen } from '../../components/CineaScreen';
import { FloatingSearchBar } from '../../components/FloatingSearchBar';
import { MoviePosterCard } from '../../components/MoviePosterCard';
import { CineaState } from '../../components/CineaState';
import { ScreenHeader } from '../../components/ScreenHeader';
import { UserAvatar } from '../../components/UserAvatar';
import { getPopularMovies, searchMovies } from '../../services/tmdb';
import { semanticColors } from '../../tokens/colors';
import { semanticSpacing } from '../../tokens/spacing';
import { semanticTypography } from '../../tokens/typography';
import { sizes } from '../../tokens/sizes';
import { useMoviePages } from '../../hooks/useMoviePages';
import type { Movie } from '../../types/movie';
import type { AppTabScreenProps } from '../../types/navigation';

type Props = AppTabScreenProps<'Search'>;

export function SearchScreen({ navigation, route }: Props) {
  const searchInputRef = useRef<TextInput>(null);
  useFocusEffect(useCallback(() => {
    const shouldFocus = route.params?.autoFocus === true;
    // Wait one frame for the reused tab's native input to become visible.
    const frame = shouldFocus ? requestAnimationFrame(() => searchInputRef.current?.focus()) : undefined;
    return () => {
      if (frame !== undefined) cancelAnimationFrame(frame);
      searchInputRef.current?.blur();
      Keyboard.dismiss();
      if (shouldFocus) navigation.setParams({ autoFocus: false });
    };
  }, [navigation, route.params?.autoFocus]));
  const [query, setQuery] = useState('');
  const [gridWidth, setGridWidth] = useState(0);
  const tileWidth = Math.max(0, (gridWidth - semanticSpacing.md * 2) / 3);
  const normalizedQuery = query.trim();
  const listRef = useRef<FlatList<Movie>>(null);
  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [normalizedQuery]);
  const loader = useCallback((page: number, signal: AbortSignal) => normalizedQuery
    ? searchMovies(normalizedQuery, page, signal)
    : getPopularMovies(page, signal), [normalizedQuery]);
  const { movies, isLoadingInitial, isLoadingMore, error, loadMore, retry } = useMoviePages(loader, 1, 400);

  return (
    <CineaScreen appearance="semantic" scrollable={false} contentContainerStyle={styles.screen}>
      <FlatList
        style={styles.list}
        showsVerticalScrollIndicator={false}
        onLayout={(event) => setGridWidth(event.nativeEvent.layout.width)}
        ref={listRef}
        data={movies}
        numColumns={3}
        keyExtractor={(movie) => movie.id}
        contentContainerStyle={styles.content}
        columnWrapperStyle={styles.results}
        keyboardShouldPersistTaps="handled"
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        initialNumToRender={12}
        windowSize={5}
        ListHeaderComponent={
          <View style={styles.header}>
            <ScreenHeader appearance="semantic" title="Explorar filmes" onBack={() => navigation.navigate('Home')}
              rightAction={<UserAvatar size={sizes.touchTargetMin} onPress={() => navigation.navigate('UserMenu')} />} />
            <FloatingSearchBar ref={searchInputRef} appearance="semantic" value={query} onChangeText={setQuery} placeholder="Pesquisar filmes..." />
            <Text style={styles.context}>{normalizedQuery ? 'Resultados da busca' : 'Filmes populares'}</Text>
          </View>
        }
        ListEmptyComponent={
          isLoadingInitial ? <CineaState variant="loading" size="screen" message="Carregando filmes..." />
            : error ? <CineaState variant="error" size="screen" title="Não foi possível carregar os filmes." actionLabel="Tentar novamente" onAction={retry} />
              : <CineaState variant="empty" size="screen" title="Nenhum filme encontrado." />
        }
        renderItem={({ item: movie }) => (
          <View style={styles.movieResult}>
            {gridWidth > 0 ? <MoviePosterCard width={tileWidth} title={movie.title} year={movie.year} posterUrl={movie.posterUrl}
              onPress={() => navigation.navigate('MovieDetails', { movieId: movie.id, movieTitle: movie.title })} /> : null}
          </View>
        )}
        ListFooterComponent={movies.length > 0 ? (
          <View style={styles.statusState}>
            {isLoadingMore ? <ActivityIndicator accessibilityLabel="Carregando mais filmes" color={semanticColors.brand.amber} /> : error ? (
              <CineaState variant="error" size="section" title="Não foi possível carregar mais filmes." actionLabel="Tentar novamente" onAction={retry} />
            ) : null}
          </View>
        ) : null}
      />
    </CineaScreen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, minHeight: 0, paddingTop: 0, paddingBottom: 0 },
  list: { flex: 1 },
  content: { flexGrow: 1, paddingTop: semanticSpacing.md, paddingBottom: semanticSpacing.xxl },
  header: { gap: semanticSpacing.lg, marginBottom: semanticSpacing.xl },
  context: { ...semanticTypography.bodySmall, color: semanticColors.text.secondary },
  results: { justifyContent: 'flex-start', gap: semanticSpacing.md },
  movieResult: { marginBottom: semanticSpacing.xl },
  statusState: { alignItems: 'center', paddingVertical: semanticSpacing.lg },
});
