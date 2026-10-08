import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { CineaScreen } from '../../components/CineaScreen';
import { CineaIcon } from '../../components/CineaIcon';
import { PosterTile } from '../../components/PosterTile';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { TierRow } from '../../components/TierRow';
import { demoMovies } from '../../data/mock/demoContent';
import { deleteTierList, getCurrentUserTierLists, getTierListItems, type TierListItemRecord, type TierListRecord } from '../../services/tierLists';
import type { TierRank } from '../../types/content';
import { colors } from '../../tokens/colors';
import { spacing } from '../../tokens/spacing';
import type { AppTabScreenProps } from '../../types/navigation';

type Props = AppTabScreenProps<'TierLists'>;

export function TierListsScreen({ navigation }: Props) {
  const [tierLists, setTierLists] = useState<TierListRecord[]>([]);
  const [selectedTierListId, setSelectedTierListId] = useState<string | null>(null);
  const [items, setItems] = useState<TierListItemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const boardPosterWidth = 58;
  const boardPosterHeight = 86;

  const loadTierLists = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const userTierLists = await getCurrentUserTierLists();
      setTierLists(userTierLists);

      if (userTierLists.length === 0) {
        setSelectedTierListId(null);
        setItems([]);
        return;
      }

      const nextSelected = userTierLists.find((list) => list.id === selectedTierListId)?.id ?? userTierLists[0].id;
      setSelectedTierListId(nextSelected);

      const tierListItems = await getTierListItems(nextSelected);
      setItems(tierListItems);
    } catch (e) {
      setError('Não foi possível carregar as suas Tier Lists.');
      setTierLists([]);
      setSelectedTierListId(null);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [selectedTierListId]);

  useFocusEffect(useCallback(() => {
    void loadTierLists();
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

  const footer = tierLists.length === 0
    ? (
      <PrimaryButton
        label="+ Nova"
        onPress={() => navigation.navigate('CreateEditTierList', {})}
        containerStyle={styles.footerButton}
      />
    )
    : (
      <View style={styles.footerRow}>
        <PrimaryButton
          label="+ Nova"
          variant="orange"
          onPress={() => navigation.navigate('CreateEditTierList', {})}
          containerStyle={[styles.footerButton, styles.footerPrimary]}
        />
        <PrimaryButton
          label="Exportar"
          onPress={() => void Share.share({ message: selectedTierList?.title ?? 'Minha Tier List' })}
          containerStyle={[styles.footerButton, styles.footerSecondary]}
        />
      </View>
    );

  return (
    <CineaScreen
      contentContainerStyle={styles.content}
      footer={footer}
    >
      <ScreenHeader title="Tier List" onBack={() => navigation.goBack()} />
      {loading ? (
        <Text style={styles.emptyText}>Carregando Tier Lists...</Text>
      ) : error ? (
        <Text style={styles.emptyText}>{error}</Text>
      ) : tierLists.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Você ainda não criou uma Tier List.</Text>
        </View>
      ) : (
        <View style={styles.stack}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {tierLists.map((list) => (
              <Pressable
                key={list.id}
                accessibilityRole="button"
                accessibilityLabel={`Selecionar Tier List ${list.title}`}
                onPress={() => setSelectedTierListId(list.id)}
                style={[styles.chip, list.id === selectedTierListId && styles.chipActive]}
              >
                <Text style={[styles.chipText, list.id === selectedTierListId && styles.chipTextActive]}>{list.title}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.listTitleRow}>
            <Text style={styles.listTitle} numberOfLines={1}>{selectedTierList?.title ?? 'Tier List'}</Text>
            <View style={styles.listTitleActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Editar Tier List"
                onPress={() => selectedTierList && navigation.navigate('CreateEditTierList', { tierListId: selectedTierList.id })}
                style={styles.iconButton}
              >
                <CineaIcon name="edit" size={20} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Excluir Tier List"
                onPress={handleDeleteSelectedTierList}
                disabled={deletingId === selectedTierList?.id}
                style={[styles.iconButton, styles.deleteButton, deletingId === selectedTierList?.id && styles.iconButtonDisabled]}
              >
                <CineaIcon name="trash" size={18} color={deletingId === selectedTierList?.id ? '#9C8C7B' : '#F7F0DF'} />
              </Pressable>
            </View>
          </View>

          <View style={styles.tiers}>
            {(['S', 'A', 'B', 'C', 'D'] as const).map((rank: TierRank, index) => (
              <TierRow key={rank} rank={rank}>
                {boardItems[index].map((item) => {
                  const movie = demoMovies.find((entry) => entry.id === item.movie_id);
                  return (
                    <PosterTile
                      key={`${item.tier_list_id}-${item.movie_id}`}
                      width={boardPosterWidth}
                      height={boardPosterHeight}
                      posterSource={movie?.posterSource ?? require('../../../assets/poster-placeholder.png')}
                      backgroundColor={movie?.posterColor ?? '#5D0000'}
                      showRating={false}
                    />
                  );
                })}
              </TierRow>
            ))}
          </View>
        </View>
      )}
    </CineaScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 14,
    paddingBottom: 24,
  },
  stack: {
    gap: 12,
  },
  chipRow: {
    paddingVertical: 2,
    gap: spacing.xs,
    alignItems: 'center',
    flexGrow: 0,
  },
  chip: {
    minHeight: 36,
    flexShrink: 0,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#3A120E',
    borderWidth: 1,
    borderColor: '#B28B70',
  },
  chipActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  chipText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  chipTextActive: {
    color: colors.primary,
  },
  listTitleRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: 0,
    marginBottom: 0,
  },
  listTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 20,
    fontWeight: '600',
  },
  listTitleActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  iconButton: {
    minWidth: 34,
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    padding: 6,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  deleteButton: {
    backgroundColor: 'rgba(203, 83, 58, 0.18)',
  },
  iconButtonDisabled: {
    opacity: 0.6,
  },
  tiers: {
    gap: 0,
  },
  emptyState: {
    minHeight: 120,
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.text,
    fontSize: 16,
  },
  footerRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: 12,
    paddingBottom: 8,
  },
  footerButton: {
    flex: 1,
    minHeight: 54,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  footerPrimary: {
    minHeight: 54,
  },
  footerSecondary: {
    minHeight: 54,
  },
});


