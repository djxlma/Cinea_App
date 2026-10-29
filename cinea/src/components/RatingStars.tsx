import { Pressable, StyleSheet, Text, View } from 'react-native';
import { semanticColors } from '../tokens/colors';
import { semanticSpacing } from '../tokens/spacing';
import { sizes } from '../tokens/sizes';
import { radius } from '../tokens/radius';
import { states } from '../tokens/states';

type RatingStarsProps = {
  appearance?: 'legacy' | 'semantic';
  value: number;
  size?: number;
  interactive?: boolean;
  onChange?: (value: number) => void;
  color?: string;
  empty?: 'outline' | 'solid';
};

export function RatingStars({ appearance = 'legacy', value, size = 24, interactive = false, onChange, color = semanticColors.brand.amber, empty = 'solid' }: RatingStarsProps) {
  const modern = appearance === 'semantic';
  return (
    <View accessible={!interactive} accessibilityLabel={!interactive ? `${value} de 5 estrelas` : undefined}
      style={[styles.row, modern && styles.semanticRow, modern && interactive && styles.interactiveRow]}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isSelected = star <= value;
        const symbol = empty === 'outline' ? (isSelected ? '★' : '☆') : '★';
        const starColor = isSelected ? color : modern ? semanticColors.text.muted : empty === 'outline' ? '#D7C3AA' : 'rgba(255,255,255,0.18)';

        return (
          <Pressable
            key={star}
            accessibilityRole={interactive ? 'button' : undefined}
            accessibilityLabel={interactive ? `Nota ${star} de 5 estrelas` : undefined}
            accessibilityState={interactive ? { selected: isSelected } : undefined}
            disabled={!interactive}
            onPress={() => onChange?.(star)}
            hitSlop={interactive && !modern ? 6 : undefined}
            style={({ pressed }) => modern && interactive ? [styles.starAction, pressed && styles.pressed] : undefined}
          >
            <Text style={{
              color: starColor,
              fontSize: size,
              lineHeight: size * 1.15,
              fontWeight: isSelected ? '700' : '500',
              opacity: isSelected ? 1 : 0.9,
            }}>
              {symbol}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  semanticRow: { flexWrap: 'wrap' },
  interactiveRow: { flexWrap: 'wrap', gap: semanticSpacing.xs },
  starAction: { minWidth: sizes.touchTargetMin, minHeight: sizes.touchTargetMin, alignItems: 'center', justifyContent: 'center', borderRadius: radius.control },
  pressed: { backgroundColor: states.pressed.background },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
});
