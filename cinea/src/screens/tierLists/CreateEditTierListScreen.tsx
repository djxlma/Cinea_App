import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { CineaScreen } from '../../components/CineaScreen';
import { FloatingSearchBar } from '../../components/FloatingSearchBar';
import { PosterTile } from '../../components/PosterTile';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { TierItemActionSheet } from '../../components/TierItemActionSheet';
import { TierRow } from '../../components/TierRow';
import { useMoviePages } from '../../hooks/useMoviePages';
import { useReviewMovies as useItemMovies } from '../../hooks/useReviewMovies';
import { containsTierMovie } from '../../services/tierListItems';
import { getMovieIdentityKey } from '../../services/movieResolver';
import { getPopularMovies, searchMovies } from '../../services/tmdb';
import { createTierList, getTierListById, getTierListItems, saveTierListItems, updateTierList, type TierListItemInput } from '../../services/tierLists';
import type { Movie } from '../../types/movie';
import type { TierRank } from '../../types/content';
import { semanticColors } from '../../tokens/colors';
import { CineaInput } from '../../components/CineaInput';
import { CineaState } from '../../components/CineaState';
import { useTierListExport } from '../../hooks/useTierListExport';
import { semanticTypography } from '../../tokens/typography';
import { radius } from '../../tokens/radius';
import { semanticSpacing } from '../../tokens/spacing';
import type { RootScreenProps } from '../../types/navigation';

type Props = RootScreenProps<'CreateEditTierList'>;

export function CreateEditTierListScreen({ navigation, route }: Props) {
  const tierListId = route.params?.tierListId;
  const savedId = useRef(tierListId);
  const saving = useRef(false);
  const mounted = useRef(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('Tier List da comunidade.');
  const [items, setItems] = useState<TierListItemInput[]>([]);
  const [selectedItem, setSelectedItem] = useState<TierListItemInput | null>(null);
  const [selectedRank, setSelectedRank] = useState<TierRank>('S');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(Boolean(tierListId));
  const [loadFailed, setLoadFailed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim();
  const [gridWidth, setGridWidth] = useState(0);
  const exporter = useTierListExport();
  const posterWidth = Math.max(48, (gridWidth - semanticSpacing.md * 2) / 3);
  const posterHeight = posterWidth * 1.46;
  const isSubmitDisabled = !title.trim() || isSaving || loading || loadFailed;
  const loader = useCallback((page: number, signal: AbortSignal) => normalizedQuery
    ? searchMovies(normalizedQuery, page, signal) : getPopularMovies(page, signal), [normalizedQuery]);
  const catalog = useMoviePages(loader, 1, 400);
  const references = useMemo(() => items.map((item) => ({ movie_id: item.movieId })), [items]);
  const movies = useItemMovies(references);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    if (!tierListId) return;
    let active = true;
    setLoading(true);
    setLoadFailed(false);
    setError('');
    void (async () => {
      try {
        const list = await getTierListById(tierListId);
        if (!list) throw new Error('not found');
        const records = await getTierListItems(tierListId);
        if (!active) return;
        setTitle(list.title);
        setDescription(list.description ?? '');
        setItems(records.map((item) => ({ id: item.id, movieId: item.movie_id, movieTitle: item.movie_title, tier: item.tier, position: item.position })));
      } catch {
        if (active) { setLoadFailed(true); setError('Não foi possível carregar esta Tier List.'); }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [tierListId, retryCount]);

  function toggleMovie(movie: Movie) {
    if (loading || loadFailed || saving.current) return;
    setItems((current) => {
      const key = getMovieIdentityKey(movie.id);
      const existing = current.find((item) => getMovieIdentityKey(item.movieId) === key);
      if (existing?.tier === selectedRank) return current.filter((item) => item !== existing).map((item, position) => ({ ...item, position }));
      if (existing) return current.map((item) => item === existing ? { ...item, tier: selectedRank } : item);
      return [...current, { movieId: String(movie.tmdbId), movieTitle: movie.title, tier: selectedRank, position: current.length }];
    });
  }

  function editItem(index: number) {
    if (saving.current) return;
    Keyboard.dismiss();
    setSelectedItem(items[index] ?? null);
  }

  function moveSelected(tier: TierRank) {
    if (saving.current || !selectedItem) return;
    setItems((current) => current.map((entry) => entry === selectedItem ? { ...entry, tier } : entry));
    setSelectedItem(null);
  }

  function orderSelected(direction: number) {
    if (saving.current || !selectedItem) return;
    setItems((current) => {
      const index = current.indexOf(selectedItem);
      if (index < 0) return current;
      const next = [...current];
      const sameTier = next.map((entry, i) => entry.tier === selectedItem.tier ? i : -1).filter((i) => i >= 0);
      const target = sameTier[sameTier.indexOf(index) + direction];
      if (target === undefined) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((entry, position) => ({ ...entry, position }));
    });
    setSelectedItem(null);
  }

  function removeSelected() {
    if (saving.current || !selectedItem) return;
    setItems((current) => current.filter((entry) => entry !== selectedItem).map((entry, position) => ({ ...entry, position })));
    setSelectedItem(null);
  }

  const selectedMovie = selectedItem ? movies[getMovieIdentityKey(selectedItem.movieId)] : null;
  const tierItems = selectedItem ? items.filter((item) => item.tier === selectedItem.tier) : [];
  const tierIndex = selectedItem ? tierItems.indexOf(selectedItem) : -1;
  useEffect(() => {
    if (selectedItem && !items.includes(selectedItem)) setSelectedItem(null);
  }, [items, selectedItem]);

  async function saveTierList() {
    if (saving.current || isSubmitDisabled) return;
    saving.current = true;
    setIsSaving(true);
    setError('');
    try {
      if (!savedId.current) {
        const created = await createTierList({ title: title.trim(), description });
        savedId.current = created.id;
      }
      await saveTierListItems(savedId.current, items.map((item, position) => ({ ...item, position })));
      await updateTierList(savedId.current, { title: title.trim(), description });
      if (mounted.current) navigation.goBack();
    } catch (failure) {
      if (mounted.current) setError(failure instanceof Error ? failure.message : 'Não foi possível salvar. Confira a lista e tente novamente.');
    } finally {
      saving.current = false;
      if (mounted.current) setIsSaving(false);
    }
  }

  const catalogError = <CineaState variant="error" message="Não foi possível carregar os filmes da TMDB." actionLabel="Tentar novamente" onAction={catalog.retry} />;
  return <>
    <CineaScreen appearance="semantic" scrollable={false} keyboardAvoiding contentContainerStyle={styles.screen} bottomContent={
      <View style={styles.actions}>
        <PrimaryButton label={tierListId ? 'Salvar' : 'Criar'} variant="primary" loading={isSaving}
          onPress={() => void saveTierList()} disabled={isSubmitDisabled || exporter.isExporting} containerStyle={styles.action} />
        <PrimaryButton label="Exportar" variant="secondary" secondaryTone="wine" loading={exporter.isExporting}
          disabled={isSubmitDisabled} onPress={() => void exporter.exportTierList({ title, description, items, movies })} containerStyle={styles.action} />
      </View>
    }>
      <FlatList
        style={styles.list}
        onLayout={(event) => setGridWidth(event.nativeEvent.layout.width)}
        data={catalog.movies}
        numColumns={3}
        keyExtractor={(movie) => movie.id}
        contentContainerStyle={styles.content}
        columnWrapperStyle={styles.posters}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={12}
        windowSize={5}
        onEndReached={catalog.loadMore}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={<View style={styles.header}>
          <ScreenHeader appearance="semantic" title={tierListId ? 'Editar Tier List' : 'Nova Tier List'} onBack={() => navigation.goBack()} />
          <CineaInput label="Nome da Tier List" editable={!loading && !loadFailed && !isSaving} onChangeText={setTitle} placeholder="Nome da Tier List" value={title} />
          <CineaInput label="Descrição" editable={!loading && !loadFailed && !isSaving} multiline onChangeText={setDescription} placeholder="Descrição" value={description} />
          {error ? <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text> : null}
          {exporter.error ? <Text accessibilityRole="alert" style={styles.errorText}>{exporter.error}</Text> : null}
          {loading ? <CineaState variant="loading" message="Carregando Tier List..." /> : loadFailed ? <PrimaryButton label="Tentar novamente" variant="secondary" onPress={() => setRetryCount((n) => n + 1)} /> : <>
            <Text style={styles.help}>Escolha um tier e toque no catálogo para adicionar ou mover. Toque em um item do board para organizar.</Text>
            <View style={styles.tiers}>
              {(['S', 'A', 'B', 'C', 'D'] as const).map((rank) => <TierRow appearance="semantic" key={rank} rank={rank} active={selectedRank === rank} onPress={() => { if (!isSaving) setSelectedRank(rank); }}>
                {items.map((item, index) => ({ item, index })).filter(({ item }) => item.tier === rank).map(({ item, index }) => {
                  const movie = movies[getMovieIdentityKey(item.movieId)];
                  return <Pressable key={item.id ?? item.movieId} accessibilityRole="button" accessibilityLabel={`Organizar ${movie?.title || item.movieTitle}`} onPress={() => editItem(index)} style={styles.rowPoster}>
                    <PosterTile appearance="semantic" width={48} height={72} posterUrl={movie?.posterUrl} showRating={false} />
                  </Pressable>;
                })}
              </TierRow>)}
            </View>
          </>}
          <Text accessibilityRole="header" style={styles.sectionTitle}>Adicionar filmes</Text>
          <Text style={styles.help}>Adicionando ao tier {selectedRank}</Text>
          <FloatingSearchBar appearance="semantic" value={query} onChangeText={setQuery} placeholder="Pesquisar filme..." />
        </View>}
        ListEmptyComponent={catalog.isLoadingInitial ? <CineaState variant="loading" message="Carregando filmes..." /> : catalog.error ? catalogError : <CineaState variant="empty" title="Nenhum filme encontrado" />}
        renderItem={({ item: movie }) => {
          const selected = containsTierMovie(items, movie.id);
          return <Pressable accessibilityRole="button" accessibilityState={{ selected, disabled: loading || loadFailed || isSaving }} accessibilityLabel={`${selected ? 'Mover ou remover' : 'Adicionar'} ${movie.title} no tier ${selectedRank}`} disabled={loading || loadFailed || isSaving} onPress={() => toggleMovie(movie)} style={[styles.posterButton, { width: posterWidth }, selected && styles.selectedPoster]}>
            <PosterTile appearance="semantic" width={posterWidth} height={posterHeight} posterUrl={movie.posterUrl} showRating={false} />
            <Text numberOfLines={2} style={styles.catalogTitle}>{movie.title}</Text>
            <Text style={styles.help}>{movie.year}{selected ? ' · Na lista' : ''}</Text>
          </Pressable>;
        }}
        ListFooterComponent={catalog.movies.length ? catalog.isLoadingMore ? <CineaState variant="loading" message="Carregando mais filmes..." /> : catalog.error ? catalogError : null : null}
      />
      <TierItemActionSheet
        movie={selectedItem ? { title: selectedMovie?.title?.trim() || selectedItem.movieTitle, posterUrl: selectedMovie?.posterUrl, tier: selectedItem.tier } : null}
        canMovePrevious={tierIndex > 0}
        canMoveNext={tierIndex >= 0 && tierIndex < tierItems.length - 1}
        onMove={moveSelected}
        onOrder={orderSelected}
        onRemove={removeSelected}
        onClose={() => setSelectedItem(null)}
      />
    </CineaScreen>
    {exporter.exportView}
  </>;
}

const styles = StyleSheet.create({
  screen: { paddingBottom: 0, flex: 1 },
  list: { flex: 1 },
  header: { gap: semanticSpacing.lg, marginBottom: semanticSpacing.lg },
  help: { ...semanticTypography.caption, color: semanticColors.text.secondary },
  catalogTitle: { ...semanticTypography.bodySmall, color: semanticColors.text.primary, marginTop: semanticSpacing.sm },
  selectedPoster: { backgroundColor: semanticColors.surface.sunken, borderColor: semanticColors.brand.amber },
  content: { paddingBottom: semanticSpacing.xxl },
  tiers: { gap: semanticSpacing.sm },
  rowPoster: { width: 48, minHeight: 72 },
  sectionTitle: { ...semanticTypography.sectionTitle, color: semanticColors.text.primary, marginTop: semanticSpacing.sm },
  posters: { justifyContent: 'flex-start', gap: semanticSpacing.md },
  posterButton: { marginBottom: semanticSpacing.lg, borderRadius: radius.poster, borderWidth: 1, borderColor: 'transparent', overflow: 'hidden' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: semanticSpacing.sm },
  action: { flex: 1, minWidth: 120 },
  errorText: { ...semanticTypography.bodySmall, color: semanticColors.feedback.danger.text },
});
