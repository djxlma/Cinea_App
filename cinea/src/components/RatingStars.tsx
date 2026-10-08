import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../tokens/colors';

type RatingStarsProps = {
  value: number;
  size?: number;
  interactive?: boolean;
  onChange?: (value: number) => void;
  color?: string;
  empty?: 'outline' | 'solid';
};

export function RatingStars({ value, size = 24, interactive = false, onChange, color = '#FFA424', empty = 'solid' }: RatingStarsProps) {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isSelected = star <= value;
        const symbol = empty === 'outline' ? (isSelected ? '★' : '☆') : '★';
        const starColor = isSelected ? color : empty === 'outline' ? '#D7C3AA' : 'rgba(255,255,255,0.18)';

        return (
          <Pressable
            key={star}
            accessibilityRole={interactive ? 'button' : undefined}
            accessibilityLabel={interactive ? `Nota ${star}` : undefined}
            accessibilityState={interactive ? { selected: isSelected } : undefined}
            disabled={!interactive}
            onPress={() => onChange?.(star)}
            hitSlop={interactive ? 6 : undefined}
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
});