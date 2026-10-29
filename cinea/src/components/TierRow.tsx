import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Children } from 'react';
import type { ReactNode } from 'react';
import type { TierRank } from '../types/content';
import { colors, semanticColors } from '../tokens/colors';
import { semanticSpacing } from '../tokens/spacing';
import { semanticTypography } from '../tokens/typography';
import { radius } from '../tokens/radius';

type TierRowProps = {
  rank: TierRank;
  children?: ReactNode;
  active?: boolean;
  onPress?: () => void;
  appearance?: 'legacy' | 'semantic';
};

const rankColors: Record<TierRank, string> = {
  S: colors.tierS,
  A: colors.tierA,
  B: colors.tierB,
  C: colors.tierC,
  D: colors.tierD,
};

export function TierRow({ rank, children, active = false, onPress, appearance = 'legacy' }: TierRowProps) {
  if (appearance === 'semantic') return <View style={[semanticStyles.row, active && semanticStyles.active]}>
    <Pressable accessibilityRole={onPress ? 'button' : 'header'} accessibilityLabel={onPress ? `Selecionar tier ${rank}` : `Tier ${rank}`}
      accessibilityState={onPress ? { selected: active } : undefined} onPress={onPress}
      style={[semanticStyles.rank, { backgroundColor: rankColors[rank] }]}>
      <Text style={semanticStyles.rankText}>{rank}</Text>
    </Pressable>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={semanticStyles.content}>
      {Children.count(children) ? children : <Text style={semanticStyles.empty}>Tier vazio</Text>}
    </ScrollView>
  </View>;
  return (
    <Pressable accessibilityRole={onPress ? 'button' : undefined} onPress={onPress} style={[styles.row, active && styles.active]}>
      <View style={[styles.rankStrip, { backgroundColor: rankColors[rank] }]}>
        <Text style={styles.rankLabel}>{rank}</Text>
      </View>
      <View style={styles.content}>{children}</View>
    </Pressable>
  );
}

const semanticStyles = StyleSheet.create({
  row: { flexDirection: 'row', minHeight: 88, borderRadius: radius.control, overflow: 'hidden', backgroundColor: semanticColors.background.primary, borderWidth: 1, borderColor: semanticColors.border.subtle },
  active: { borderColor: semanticColors.brand.amber },
  rank: { width: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  rankText: { ...semanticTypography.sectionTitle, color: semanticColors.text.onAccent },
  content: { alignItems: 'center', gap: semanticSpacing.sm, padding: semanticSpacing.sm },
  empty: { ...semanticTypography.caption, color: semanticColors.text.secondary },
});

const styles = StyleSheet.create({
  row: {
    minHeight: 84,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#A28A6E',
    borderRadius: 7,
    backgroundColor: '#2B0705',
  },
  rankStrip: {
    width: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankLabel: {
    color: colors.background,
    fontSize: 15,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    padding: 4,
  },
  active: {
    borderColor: colors.secondary,
  },
});
