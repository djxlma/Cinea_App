import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CineaScreen } from '../../components/CineaScreen';
import { PosterTile } from '../../components/PosterTile';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { TierRow } from '../../components/TierRow';
import { demoMovies } from '../../data/mock/demoContent';
import { createTierList, getTierListById, getTierListItems, saveTierListItems, updateTierList, type TierListItemRecord } from '../../services/tierLists';
import type { TierRank } from '../../types/content';
import { colors } from '../../tokens/colors';
import { spacing } from '../../tokens/spacing';
import type { RootScreenProps } from '../../types/navigation';

type Props = RootScreenProps<'CreateEditTierList'>;

type DraftTierListItem = {
  movieId: string;
  movieTitle: string;
  rank: TierRank;
};

export function CreateEditTierListScreen({ navigation, route }: Props) {
  const tierListId = route.params?.tierListId;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('Tier List da comunidade.');
  const [items, setItems] = useState<DraftTierListItem[]>([]);
  const [selectedRank, setSelectedRank] = useState<TierRank>('S');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const posterWidth = (width * 0.81 - 18) / 3;
  const posterHeight = posterWidth * 1.46;
  const isSubmitDisabled = !title.trim() || isSaving;

  useEffect(() => {
    async function loadExistingTierList() {
      if (!tierListId) {
        return;
      }

      try {
        const existingTierList = await getTierListById(tierListId);
        if (!existingTierList) {
          setError('Tier List não encontrada.');
          return;
        }

        const tierListItems = await getTierListItems(existingTierList.id);
        const mappedItems = tierListItems.map((item) => ({
          movieId: item.movie_id,
          movieTitle: item.movie_title,
          rank: item.tier,
        }));

        setTitle(existingTierList.title);
        setDescription(existingTierList.description ?? 'Tier List da comunidade.');
        setItems(mappedItems);
      } catch (e) {
        setError('Não foi possível carregar esta Tier List.');
      }
    }

    void loadExistingTierList();
  }, [tierListId]);

  function toggleMovie(movieId: string) {
    setItems((current) => {
      const existing = current.find((item) => item.movieId === movieId);
      const movieTitle = demoMovies.find((movie) => movie.id === movieId)?.title ?? 'Filme';

      if (existing?.rank === selectedRank) {
        return current.filter((item) => item.movieId !== movieId);
      }

      if (existing) {
        return current.map((item) => (item.movieId === movieId ? { ...item, rank: selectedRank, movieTitle } : item));
      }

      return [...current, { movieId, movieTitle, rank: selectedRank }];
    });
  }

  async function saveTierList() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Informe um nome para a Tier List.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      let resolvedTierListId = tierListId;

      if (tierListId) {
        await updateTierList(tierListId, {
          title: trimmedTitle,
          description,
        });
      } else {
        const created = await createTierList({
          title: trimmedTitle,
          description,
        });
        resolvedTierListId = created.id;
      }

      if (!resolvedTierListId) {
        throw new Error('Tier List inválida após salvar.');
      }

      const nextItems = items
        .map((item) => ({
          movieId: item.movieId,
          movieTitle: item.movieTitle,
          tier: item.rank,
          position: 0,
        }))
        .sort((left, right) => left.tier.localeCompare(right.tier));

      const payload = nextItems.map((item, index) => ({
        ...item,
        position: index,
      }));

      await saveTierListItems(resolvedTierListId, payload);
      navigation.goBack();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível salvar a Tier List.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <CineaScreen
      contentContainerStyle={styles.content}
      footer={(
        <View style={[styles.footerBar, { paddingBottom: insets.bottom + 8 }]}> 
          <PrimaryButton
            label={isSaving ? (tierListId ? 'SALVAR' : 'CRIAR') : (tierListId ? 'SALVAR' : 'CRIAR')}
            variant={isSubmitDisabled ? 'ivory' : 'orange'}
            onPress={() => void saveTierList()}
            disabled={isSubmitDisabled}
            containerStyle={[styles.saveButton, isSubmitDisabled && styles.saveButtonDisabled]}
          />
        </View>
      )}
    >
      <ScreenHeader title="Tier List" onBack={() => navigation.goBack()} />
      <View style={styles.titleRow}>
        <TextInput accessibilityLabel="Nome da Tier List" onChangeText={(value) => {
          setTitle(value);
          if (error) {
            setError('');
          }
        }} placeholder="Nome da Tier List" placeholderTextColor={colors.textMuted} style={styles.titleInput} value={title} />
        <Text style={styles.editIcon}>✎</Text>
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <View style={styles.tiers}>
        {(['S', 'A', 'B', 'C', 'D'] as const).map((rank) => (
          <TierRow key={rank} rank={rank} active={selectedRank === rank} onPress={() => setSelectedRank(rank)}>
            {items.filter((item) => item.rank === rank).map((item) => {
              const movie = demoMovies.find((entry) => entry.id === item.movieId);
              return (
                <View key={item.movieId} style={styles.rowPoster}>
                  <PosterTile
                    width={34}
                    height={52}
                    posterSource={movie?.posterSource ?? require('../../../assets/poster-placeholder.png')}
                    backgroundColor={movie?.posterColor ?? '#5D0000'}
                    showRating={false}
                  />
                </View>
              );
            })}
          </TierRow>
        ))}
      </View>
      <Text style={styles.sectionTitle}>Filmes disponíveis</Text>
      <View style={styles.posters}>
        {demoMovies.map((movie) => (
          <Pressable
            key={movie.id}
            accessibilityRole="button"
            accessibilityLabel={`Adicionar ${movie.title} no tier ${selectedRank}`}
            onPress={() => toggleMovie(movie.id)}
            style={styles.posterButton}
          >
            <PosterTile
              width={posterWidth}
              height={posterHeight}
              posterSource={movie.posterSource ?? require('../../../assets/poster-placeholder.png')}
              backgroundColor={movie.posterColor}
              showRating={false}
            />
          </Pressable>
        ))}
      </View>
    </CineaScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 14,
    gap: spacing.sm,
    paddingBottom: 170,
  },
  titleRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  titleInput: {
    flex: 1,
    minHeight: 44,
    padding: 0,
    color: colors.text,
    fontSize: 20,
    fontWeight: '600',
  },
  editIcon: {
    color: colors.text,
    fontSize: 25,
  },
  tiers: {
    gap: 0,
  },
  rowPoster: {
    borderWidth: 0,
    borderColor: 'transparent',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  posters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
    columnGap: 8,
    paddingBottom: 36,
  },
  posterButton: {
    marginBottom: 0,
    borderRadius: 8,
    overflow: 'hidden',
  },
  footerBar: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 0,
    backgroundColor: 'transparent',
  },
  saveButton: {
    width: '100%',
    minHeight: 58,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 999,
    alignSelf: 'stretch',
  },
  saveButtonDisabled: {
    opacity: 0.45,
  },
  errorText: {
    color: '#FFB4A2',
    fontSize: 14,
  },
});