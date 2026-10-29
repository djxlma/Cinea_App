import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { CineaScreen } from '../../components/CineaScreen';
import { PosterTile } from '../../components/PosterTile';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { TierRow } from '../../components/TierRow';
import { useReviewMovies as useItemMovies } from '../../hooks/useReviewMovies';
import { getMovieIdentityKey } from '../../services/movieResolver';
import { deleteTierList, getCurrentUserTierLists, getTierListItems, type TierListItemRecord, type TierListRecord } from '../../services/tierLists';
import type { TierRank } from '../../types/content';
import { semanticColors } from '../../tokens/colors';
import { CineaIconButton } from '../../components/CineaIconButton';
import { CineaState } from '../../components/CineaState';
import { useTierListExport } from '../../hooks/useTierListExport';
import { semanticTypography } from '../../tokens/typography';
import { semanticSpacing } from '../../tokens/spacing';
import type { AppTabScreenProps } from '../../types/navigation';

type Props = AppTabScreenProps<'TierLists'>;

export function TierListsScreen({ navigation }: Props) {
  const [tierLists, setTierLists] = useState<TierListRecord[]>([]);
  const [selectedTierListId, setSelectedTierListId] = useState<string | null>(null);
  const [items, setItems] = useState<TierListItemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const movies = useItemMovies(items);
  const selectedRef = useRef<string | null>(null);
  const requestId = useRef(0);
  const exporter = useTierListExport();
  const boardPosterWidth = 58;
  const boardPosterHeight = 86;

  const loadTierLists = useCallback(async () => {
    const currentRequest = ++requestId.current;
    try {
      setLoading(true);
      setError(null);
      const userTierLists = await getCurrentUserTierLists();
      if (currentRequest !== requestId.current) return;
      setTierLists(userTierLists);

      if (userTierLists.length === 0) {
        setSelectedTierListId(null);
        setItems([]);
        return;
      }

      const nextSelected = userTierLists.find((list) => list.id === selectedRef.current)?.id ?? userTierLists[0].id;
      selectedRef.current = nextSelected;
      setSelectedTierListId(nextSelected);

      const tierListItems = await getTierListItems(nextSelected);
      if (currentRequest === requestId.current) setItems(tierListItems);
    } catch (e) {
      if (currentRequest !== requestId.current) return;
      setError('Não foi possível carregar as suas Tier Lists.');
      setTierLists([]);
      setSelectedTierListId(null);
      setItems([]);
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    void loadTierLists();
    return () => { requestId.current++; };
  }, [loadTierLists]));

  const selectedTierList = tierLists.find((list) => list.id === selectedTierListId) ?? null;
  const boardItems = (['S', 'A', 'B', 'C', 'D'] as const).map((rank: TierRank) =>
    items.filter((item) => item.tier === rank).sort((a, b) => a.position - b.position),
  );

  const handleDeleteSelectedTierList = useCallback(() => {
    if (!selectedTierList) {
      return;
    }

    Alert.alert(
      'Excluir Tier List?',
      'Essa ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingId(selectedTierList.id);
              await deleteTierList(selectedTierList.id);
              await loadTierLists();
            } catch (deleteError) {
              setError('Não foi possível excluir esta Tier List.');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ],
    );
  }, [loadTierLists, selectedTierList]);

  const exportSelected = () => {
    if (!selectedTierList) return;
    void exporter.exportTierList({ title: selectedTierList.title, description: selectedTierList.description, movies,
      items: items.map((item) => ({ id: item.id, movieId: item.movie_id, movieTitle: item.movie_title, tier: item.tier, position: item.position })) });
  };

  return <>
    <CineaScreen appearance="semantic" contentContainerStyle={styles.content} bottomContent={tierLists.length && !loading && !error ? (
      <View style={styles.actions}>
        <PrimaryButton label="+ Nova" variant="primary" onPress={() => navigation.navigate('CreateEditTierList', {})} containerStyle={styles.action} />
        <PrimaryButton label="Exportar" variant="secondary" secondaryTone="wine" loading={exporter.isExporting}
          disabled={!selectedTierList || Boolean(deletingId)} onPress={exportSelected} containerStyle={styles.action} />
      </View>
    ) : undefined}>
      <ScreenHeader appearance="semantic" title="Tier Lists" onBack={() => navigation.goBack()} />
      {loading ? <CineaState variant="loading" message="Carregando Tier Lists..." />
        : error ? <CineaState variant="error" message={error} actionLabel="Tentar novamente" onAction={() => void loadTierLists()} />
        : !tierLists.length ? <CineaState variant="empty" size="screen" title="Nenhuma Tier List ainda" actionLabel="Criar Tier List" onAction={() => navigation.navigate('CreateEditTierList', {})} />
        : <View style={styles.stack}>
          <Text style={styles.label}>Suas listas</Text>
          <View>
            {tierLists.map((list) => <Pressable key={list.id} accessibilityRole="button"
              accessibilityLabel={`Abrir Tier List ${list.title}`} accessibilityState={{ selected: list.id === selectedTierListId }}
              onPress={() => { selectedRef.current = list.id; void loadTierLists(); }}
              style={({ pressed }) => [styles.listRow, pressed && styles.pressed]}>
              <View style={styles.listInfo}>
                <Text style={[styles.listName, list.id === selectedTierListId && styles.selectedName]}>{list.title}</Text>
                {list.description ? <Text style={styles.metadata} numberOfLines={2}>{list.description}</Text> : null}
                {list.id === selectedTierListId ? <Text style={styles.metadata}>{items.length} {items.length === 1 ? 'filme' : 'filmes'} · Selecionada</Text> : null}
              </View>
              <Text accessible={false} style={styles.metadata}>›</Text>
            </Pressable>)}
          </View>
          <View>
            <View style={styles.heading}>
              <Text accessibilityRole="header" style={styles.title}>{selectedTierList?.title}</Text>
              <CineaIconButton icon="edit" accessibilityLabel="Editar Tier List" onPress={() => selectedTierList && navigation.navigate('CreateEditTierList', { tierListId: selectedTierList.id })} />
              <CineaIconButton icon="trash" variant="danger" accessibilityLabel="Excluir Tier List" loading={deletingId === selectedTierList?.id} onPress={handleDeleteSelectedTierList} />
            </View>
            {selectedTierList?.description ? <Text style={styles.metadata}>{selectedTierList.description}</Text> : null}
          </View>
          <View style={styles.tiers}>
            {(['S', 'A', 'B', 'C', 'D'] as const).map((rank, index) => <TierRow appearance="semantic" key={rank} rank={rank}>
              {boardItems[index].map((item) => {
                const movie = movies[getMovieIdentityKey(item.movie_id)];
                return <View key={item.id} style={{ width: boardPosterWidth }}>
                  <PosterTile appearance="semantic" width={boardPosterWidth} height={boardPosterHeight} posterUrl={movie?.posterUrl} showRating={false} />
                  <Text numberOfLines={2} style={styles.itemTitle}>{movie?.title?.trim() || item.movie_title}</Text>
                </View>;
              })}
            </TierRow>)}
          </View>
        </View>}
      {exporter.error ? <Text accessibilityRole="alert" style={styles.error}>{exporter.error}</Text> : null}
    </CineaScreen>
    {exporter.exportView}
  </>;
}

const styles = StyleSheet.create({
  content: { gap: semanticSpacing.xl },
  stack: { gap: semanticSpacing.xl },
  label: { ...semanticTypography.label, color: semanticColors.text.secondary },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: semanticSpacing.md, minHeight: 64, paddingVertical: semanticSpacing.md, borderBottomWidth: 1, borderColor: semanticColors.border.subtle },
  listInfo: { flex: 1, gap: semanticSpacing.xs },
  listName: { ...semanticTypography.label, color: semanticColors.text.primary },
  selectedName: { color: semanticColors.brand.amber },
  metadata: { ...semanticTypography.bodySmall, color: semanticColors.text.secondary },
  heading: { flexDirection: 'row', alignItems: 'center', gap: semanticSpacing.xs },
  title: { ...semanticTypography.sectionTitle, color: semanticColors.text.primary, flex: 1 },
  tiers: { gap: semanticSpacing.sm },
  itemTitle: { ...semanticTypography.caption, color: semanticColors.text.primary, marginTop: semanticSpacing.xs },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: semanticSpacing.sm },
  action: { flex: 1, minWidth: 120 },
  pressed: { backgroundColor: semanticColors.surface.sunken },
  error: { ...semanticTypography.bodySmall, color: semanticColors.feedback.danger.text },
});
