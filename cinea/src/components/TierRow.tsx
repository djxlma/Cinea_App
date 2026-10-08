import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import type { TierRank } from '../types/content';
import { colors } from '../tokens/colors';

type TierRowProps = {
  rank: TierRank;
  children?: ReactNode;
  active?: boolean;
  onPress?: () => void;
};

const rankColors: Record<TierRank, string> = {
  S: colors.tierS,
  A: colors.tierA,
  B: colors.tierB,
  C: colors.tierC,
  D: colors.tierD,
};

export function TierRow({ rank, children, active = false, onPress }: TierRowProps) {
  return (
    <Pressable accessibilityRole={onPress ? 'button' : undefined} onPress={onPress} style={[styles.row, active && styles.active]}>
      <View style={[styles.rankStrip, { backgroundColor: rankColors[rank] }]}>
        <Text style={styles.rankLabel}>{rank}</Text>
      </View>
      <View style={styles.content}>{children}</View>
    </Pressable>
  );
}

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
    gap: 4,
    padding: 4,
  },
  active: {
    borderColor: colors.secondary,
  },
});