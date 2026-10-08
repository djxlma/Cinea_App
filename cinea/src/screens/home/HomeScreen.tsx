import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { CineaScreen } from '../../components/CineaScreen';
import { FloatingSearchBar } from '../../components/FloatingSearchBar';
import { PosterTile } from '../../components/PosterTile';
import { UserAvatar } from '../../components/UserAvatar';
import { demoMovies, demoUser } from '../../data/mock/demoContent';
import { getCurrentSignedAvatarUri } from '../../services/profile';
import { colors } from '../../tokens/colors';
import { spacing } from '../../tokens/spacing';
import type { AppTabScreenProps } from '../../types/navigation';

type Props = AppTabScreenProps<'Home'>;

export function HomeScreen({ navigation }: Props) {
  const [, setRefresh] = useState(0);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const posterWidth = width * 0.29;
  const posterHeight = posterWidth * 1.49;

  const loadAvatar = useCallback(async () => {
    try {
      const nextAvatarUri = await getCurrentSignedAvatarUri();
      setAvatarUri(nextAvatarUri);
    } catch {
      setAvatarUri(null);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    void loadAvatar();
    setRefresh((value) => value + 1);
  }, [loadAvatar]));

  return (
    <CineaScreen
      footer={<FloatingSearchBar onPress={() => navigation.navigate('Search')} />}
      contentContainerStyle={styles.content}
    >
      <View style={styles.topRow}>
        <Text style={styles.welcome}>Bem-vindo(a)!</Text>
        <UserAvatar size={47} source={avatarUri ? { uri: avatarUri } : null} onPress={() => navigation.navigate('UserMenu')} />
      </View>
      <MovieShelf title="Em alta" movies={demoMovies} width={posterWidth} height={posterHeight} onSelect={(movieTitle) => navigation.navigate('MovieDetails', { movieTitle })} />
      <MovieShelf title="Para você" movies={demoMovies.filter((movie) => demoUser.favoriteMovieIds.includes(movie.id))} width={posterWidth} height={posterHeight} onSelect={(movieTitle) => navigation.navigate('MovieDetails', { movieTitle })} />
      <MovieShelf title="Visitados recentemente" movies={demoMovies.slice(1)} width={posterWidth} height={posterHeight} onSelect={(movieTitle) => navigation.navigate('MovieDetails', { movieTitle })} />
    </CineaScreen>
  );
}

type MovieShelfProps = {
  title: string;
  movies: typeof demoMovies;
  width: number;
  height: number;
  onSelect: (movieTitle: string) => void;
};

function MovieShelf({ title, movies, width, height, onSelect }: MovieShelfProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.movieRow}>
        {movies.map((movie) => (
          <PosterTile key={movie.id} width={width} height={height} posterSource={movie.posterSource} backgroundColor={movie.posterColor} onPress={() => onSelect(movie.title)} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 18,
    paddingBottom: 20,
    gap: 22,
  },
  topRow: {
    minHeight: 52,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  welcome: {
    color: colors.text,
    fontSize: 38,
    lineHeight: 46,
    fontWeight: '700',
    letterSpacing: 0,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 0,
  },
  movieRow: {
    gap: 14,
    paddingRight: 18,
  },
});