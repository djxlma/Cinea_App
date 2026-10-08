import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../tokens/colors';
import { spacing } from '../tokens/spacing';
import { typography } from '../tokens/typography';

type SectionTitleProps = {
  title: string;
  subtitle?: string;
  size?: 'large' | 'medium' | 'small';
  align?: 'left' | 'center';
};

export function SectionTitle({ title, subtitle, size = 'medium', align = 'left' }: SectionTitleProps) {
  return (
    <View style={[styles.container, align === 'center' && styles.center]}>
      <Text style={[styles.title, styles[size]]} accessibilityRole="header">{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, align === 'center' && styles.centerText]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  title: {
    color: colors.text,
  },
  large: {
    ...typography.h1,
    fontSize: 38,
    letterSpacing: 0,
  },
  medium: {
    ...typography.h2,
    fontSize: 28,
    letterSpacing: 0,
  },
  small: {
    ...typography.h3,
    fontSize: 20,
    letterSpacing: 0,
  },
  subtitle: {
    ...typography.body,
    letterSpacing: 0,
    color: colors.textMuted,
  },
  center: {
    alignItems: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
});