import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActivityIndicator, FlatList, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { CineaScreen } from '../../components/CineaScreen';
import { FloatingSearchBar } from '../../components/FloatingSearchBar';
import { MoviePosterCard } from '../../components/MoviePosterCard';
import { SectionTitle } from '../../components/SectionTitle';
import { CineaState } from '../../components/CineaState';
import { UserAvatar } from '../../components/UserAvatar';
import { useMoviePages } from '../../hooks/useMoviePages';
import { getPopularMovies, getNowPlayingMovies } from '../../services/tmdb';
import type { Movie } from '../../types/movie';
import { getCurrentProfile, getSignedAvatarUrl } from '../../services/profile';
import { semanticColors } from '../../tokens/colors';
import { semanticSpacing } from '../../tokens/spacing';
import { semanticTypography } from '../../tokens/typography';
import { sizes } from '../../tokens/sizes';
import type { AppTabScreenProps } from '../../types/navigation';

type Props = AppTabScreenProps<'Home'>;

export function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [searchBarHeight, setSearchBarHeight] = useState<number>(sizes.inputMinHeight);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const { width } = useWindowDimensions();
  const posterWidth = Math.min(160, (width - semanticSpacing.xl * 2) / 3);

  useFocusEffect(useCallback(() => {
    let active = true;
    void getCurrentProfile()
      .then((profile) => {
        if (active) setDisplayName(profile?.display_name?.trim() || profile?.username?.trim() || '');
        return getSignedAvatarUrl(profile?.avatar_url);
      })
      .then((uri) => { if (active) setAvatarUri(uri); })
      .catch(() => { if (active) { setAvatarUri(null); setDisplayName(''); } });
    return () => { active = false; };
  }, []));

  return (
    <View style={styles.root}>
    <CineaScreen
      appearance="semantic"
      safeAreaEdges={['top', 'right', 'left']}
      contentContainerStyle={[styles.content, { paddingBottom: searchBarHeight + insets.bottom + semanticSpacing.lg * 2 }]}
    >
      <View style={styles.topRow}>
        <View style={styles.greeting}>
          <Text style={styles.salutation}>Olá,</Text>
          <Text accessibilityRole="header" numberOfLines={2} style={styles.welcome}>{displayName || 'Boas-vindas ao CINEA'}</Text>
        </View>
        <UserAvatar size={sizes.touchTargetMin} source={avatarUri ? { uri: avatarUri } : null} onPress={() => navigation.navigate('UserMenu')} />
      </View>
      <MovieShelf title="Em alta" kind="popular" width={posterWidth} onSelect={(movie) => navigation.navigate('MovieDetails', { movieId: movie.id, movieTitle: movie.title })} />
      <MovieShelf title="Em cartaz" kind="nowPlaying" width={posterWidth} onSelect={(movie) => navigation.navigate('MovieDetails', { movieId: movie.id, movieTitle: movie.title })} />
      <MovieShelf title="Descobrir" kind="discover" width={posterWidth} onSelect={(movie) => navigation.navigate('MovieDetails', { movieId: movie.id, movieTitle: movie.title })} />
    </CineaScreen>
      <View pointerEvents="box-none" onLayout={(event) => setSearchBarHeight(event.nativeEvent.layout.height)}
        style={[styles.searchOverlay, {
          left: insets.left + semanticSpacing.xl,
          right: insets.right + semanticSpacing.xl,
          bottom: insets.bottom + semanticSpacing.lg,
        }]}>
        <FloatingSearchBar appearance="semantic" flat onPress={() => navigation.navigate('Search', { autoFocus: true })} />
      </View>
    </View>
  );
}

type MovieShelfProps = {
  title: string;
  kind: 'popular' | 'nowPlaying' | 'discover';
  width: number;
  onSelect: (movie: Movie) => void;
};

function MovieShelf({ title, kind, width, onSelect }: MovieShelfProps) {
  const loader = useCallback((page: number, signal: AbortSignal) => kind === 'nowPlaying'
    ? getNowPlayingMovies(page, signal) : getPopularMovies(page, signal), [kind]);
  const { movies, isLoadingInitial, isLoadingMore, error, loadMore, retry } = useMoviePages(loader, kind === 'discover' ? 2 : 1);
  const feedback = (
    <View style={styles.feedback}>
      {isLoadingInitial || isLoadingMore ? <ActivityIndicator accessibilityLabel="Carregando filmes" color={semanticColors.brand.amber} /> : error ? (
        <CineaState variant="error" size="section" title="Não foi possível carregar os filmes." actionLabel="Tentar novamente" onAction={retry} />
      ) : movies.length === 0 ? <CineaState variant="empty" size="section" title="Nenhum filme disponível." /> : null}
    </View>
  );
  return (
    <View style={styles.section}>
      <SectionTitle appearance="semantic" title={title} />
      <FlatList
        horizontal
        data={movies}
        keyExtractor={(movie) => movie.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.movieRow}
        initialNumToRender={5}
        windowSize={5}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={feedback}
        ListFooterComponent={movies.length > 0 && (isLoadingMore || error) ? feedback : null}
        renderItem={({ item }) => (
          <MoviePosterCard width={width} title={item.title} year={item.year} posterUrl={item.posterUrl} onPress={() => onSelect(item)} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  searchOverlay: { position: 'absolute', backgroundColor: 'transparent' },
  feedback: { paddingVertical: semanticSpacing.lg, width: 240, maxWidth: '100%', justifyContent: 'center' },
  content: { gap: semanticSpacing.section, paddingTop: semanticSpacing.xl },
  topRow: { gap: semanticSpacing.lg, minHeight: sizes.headerMinHeight, flexDirection: 'row', alignItems: 'center' },
  greeting: { flex: 1, minWidth: 0, gap: semanticSpacing.xs },
  salutation: { ...semanticTypography.bodySmall, color: semanticColors.text.secondary },
  welcome: { ...semanticTypography.sectionTitle, color: semanticColors.text.primary },
  section: { gap: semanticSpacing.md },
  movieRow: { gap: semanticSpacing.md, paddingRight: semanticSpacing.xs },
});
