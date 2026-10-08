import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { CineaIcon } from '../../components/CineaIcon';
import { CineaScreen } from '../../components/CineaScreen';
import { FloatingSearchBar } from '../../components/FloatingSearchBar';
import { PosterTile } from '../../components/PosterTile';
import { UserAvatar } from '../../components/UserAvatar';
import { demoMovies } from '../../data/mock/demoContent';
import { colors } from '../../tokens/colors';
import { spacing } from '../../tokens/spacing';
import type { DemoMovie } from '../../types/content';
import type { AppTabScreenProps } from '../../types/navigation';

type Props = AppTabScreenProps<'Search'>;

export function SearchScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'Título' | 'Gênero' | 'Ano' | 'Duração'>('Título');
  const { width } = useWindowDimensions();
  const tileWidth = (width * 0.811 - 16) / 3;
  const tileHeight = tileWidth * 1.46;

  function searchableValue(movie: DemoMovie) {
    if (filter === 'Gênero') return movie.genres.join(' ');
    if (filter === 'Ano') return String(movie.year);
    if (filter === 'Duração') return String(movie.duration);
    return movie.title;
  }

  const filteredMovies = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR');

    if (!normalizedQuery) {
      return demoMovies;
    }

    return demoMovies.filter((movie) =>
      searchableValue(movie).toLocaleLowerCase('pt-BR').includes(normalizedQuery),
    );
  }, [filter, query]);

  const cycleFilter = () => setFilter((current) => current === 'Título' ? 'Gênero' : current === 'Gênero' ? 'Ano' : current === 'Ano' ? 'Duração' : 'Título');

  return (
    <CineaScreen contentContainerStyle={styles.content}>
      <View style={styles.searchHeader}>
        <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => navigation.navigate('Home')} style={styles.backButton}>
          <CineaIcon name="back" size={34} />
        </Pressable>

        <Text numberOfLines={1} adjustsFontSizeToFit style={styles.searchTitle}>O que você quer ver hoje?</Text>

        <UserAvatar size={47} onPress={() => navigation.navigate('UserMenu')} />
      </View>

      <FloatingSearchBar value={query} onChangeText={setQuery} onFilter={cycleFilter} placeholder="Digite aqui..." />
      <View style={styles.chips}>
        {(['Gênero', 'Ano', 'Duração'] as const).map((label) => (
          <Pressable key={label} onPress={() => setFilter(label)} style={styles.chip}>
            <Text style={styles.chipText}>{label}</Text>
          </Pressable>
        ))}
      </View>
      {filteredMovies.length === 0 ? (
        <Text style={styles.emptyState}>Nenhum filme encontrado.</Text>
      ) : (
        <View style={styles.results}>
          {filteredMovies.map((movie) => (
            <PosterTile
              key={movie.id}
              width={tileWidth}
              height={tileHeight}
              backgroundColor={movie.posterColor}
              posterSource={movie.posterSource}
              onPress={() => navigation.navigate('MovieDetails', { movieTitle: movie.title })}
            />
          ))}
        </View>
      )}
    </CineaScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 22,
    gap: spacing.md,
  },
  searchHeader: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 34,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchTitle: {
    flex: 1,
    minWidth: 0,
    color: colors.text,
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 0,
    textAlign: 'center',
  },
  chips: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    minHeight: 28,
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRadius: 18,
    backgroundColor: colors.secondary,
  },
  chipText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  results: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },
  emptyState: {
    color: colors.text,
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
});