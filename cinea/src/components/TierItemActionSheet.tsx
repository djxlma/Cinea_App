import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PosterTile } from './PosterTile';
import { colors } from '../tokens/colors';
import { spacing } from '../tokens/spacing';
import type { TierRank } from '../types/content';

type Props = {
  movie: { title: string; posterUrl?: string | null; tier: TierRank } | null;
  canMovePrevious: boolean;
  canMoveNext: boolean;
  onMove: (tier: TierRank) => void;
  onOrder: (direction: number) => void;
  onRemove: () => void;
  onClose: () => void;
};

const tiers: { rank: TierRank; color: string }[] = [
  { rank: 'S', color: colors.tierS },
  { rank: 'A', color: colors.tierA },
  { rank: 'B', color: colors.tierB },
  { rank: 'C', color: colors.tierC },
  { rank: 'D', color: colors.tierD },
];

export function TierItemActionSheet({ movie, canMovePrevious, canMoveNext, onMove, onOrder, onRemove, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  return (
    <Modal
      visible={movie !== null}
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable style={styles.overlay} accessibilityRole="button" accessibilityLabel="Fechar menu de organização" onPress={onClose} />
        <View
          accessibilityViewIsModal
          onAccessibilityEscape={onClose}
          style={[styles.sheet, { maxHeight: height - insets.top - 24, paddingLeft: Math.max(spacing.lg, insets.left), paddingRight: Math.max(spacing.lg, insets.right) }]}
        >
          <View style={styles.handle} accessible={false} />
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.sm }]}>
            <View style={styles.header}>
              <PosterTile width={52} height={78} posterUrl={movie?.posterUrl} showRating={false} />
              <View style={styles.heading}>
                <Text accessibilityRole="header" style={styles.title}>{movie?.title}</Text>
                <Text style={styles.subtitle}>Organizar filme</Text>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="Fechar" onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeText}>×</Text>
              </Pressable>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mover para</Text>
              <View style={styles.tierRow}>
                {tiers.map(({ rank, color }) => {
                  const current = rank === movie?.tier;
                  return (
                    <Pressable key={rank} accessibilityRole="button" accessibilityLabel={current ? `Tier ${rank}, atual` : `Mover para tier ${rank}`}
                      accessibilityState={{ disabled: current, selected: current }} disabled={current}
                      onPress={() => onMove(rank)}
                      style={({ pressed }) => [styles.tierChip, { backgroundColor: color }, current && styles.currentTier, pressed && styles.pressed]}>
                      <Text style={styles.tierLabel}>{rank}</Text>
                      {current ? <Text style={styles.currentLabel}>Atual</Text> : null}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ordem no tier</Text>
              <View style={styles.orderRow}>
                {([{ label: 'Anterior', direction: -1, enabled: canMovePrevious }, { label: 'Próximo', direction: 1, enabled: canMoveNext }]).map(({ label, direction, enabled }) => (
                  <Pressable key={label} accessibilityRole="button" accessibilityLabel={`Mover para ${label.toLowerCase()}`} accessibilityState={{ disabled: !enabled }}
                    disabled={!enabled} onPress={() => onOrder(direction)}
                    style={({ pressed }) => [styles.orderButton, !enabled && styles.disabled, pressed && styles.pressed]}>
                    <Text style={styles.actionText}>{label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Pressable accessibilityRole="button" onPress={onRemove} style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}>
              <Text style={styles.removeText}>Remover da Tier List</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={onClose} style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.72)' },
  sheet: { backgroundColor: colors.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, borderColor: colors.surfaceHighlight },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginTop: 12, marginBottom: 20 },
  content: { gap: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  heading: { flex: 1, gap: 6 },
  title: { color: colors.text, fontSize: 20, lineHeight: 26, fontWeight: '700' },
  subtitle: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
  closeButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' },
  closeText: { color: colors.text, fontSize: 30 },
  section: { gap: 12 },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: '600' },
  tierRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tierChip: { minWidth: 48, minHeight: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, paddingVertical: 8, borderWidth: 2, borderColor: 'transparent' },
  tierLabel: { color: colors.background, fontSize: 22, fontWeight: '700' },
  currentTier: { borderColor: colors.text, opacity: 0.7 },
  currentLabel: { color: colors.background, fontSize: 10, fontWeight: '700' },
  orderRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  orderButton: { flexGrow: 1, minHeight: 48, borderRadius: 14, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  actionText: { color: colors.text, fontSize: 16, fontWeight: '600' },
  removeButton: { minHeight: 52, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: '#CB533A', paddingHorizontal: 16, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  removeText: { color: '#FFB4A2', fontSize: 16, lineHeight: 22, fontWeight: '600', textAlign: 'center' },
  cancelButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  cancelText: { color: colors.secondary, fontSize: 16, fontWeight: '600' },
  disabled: { opacity: 0.35 },
  pressed: { opacity: 0.75 },
});
