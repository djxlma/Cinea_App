import { StyleSheet, Text, View } from 'react-native';
import { colors, semanticColors } from '../tokens/colors';
import { spacing } from '../tokens/spacing';
import { typography, semanticTypography } from '../tokens/typography';

type SectionTitleProps = {
  appearance?: 'legacy' | 'semantic';
  title: string;
  subtitle?: string;
  size?: 'large' | 'medium' | 'small';
  align?: 'left' | 'center';
};

export function SectionTitle({ appearance = 'legacy', title, subtitle, size = 'medium', align = 'left' }: SectionTitleProps) {
  return (
    <View style={[styles.container, align === 'center' && styles.center]}>
      <Text style={appearance === 'semantic' ? styles.semanticTitle : [styles.title, styles[size]]} accessibilityRole="header">{title}</Text>
      {subtitle ? <Text style={[appearance === 'semantic' ? styles.semanticSubtitle : styles.subtitle, align === 'center' && styles.centerText]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  semanticTitle: { ...semanticTypography.sectionTitle, color: semanticColors.text.primary },
  semanticSubtitle: { ...semanticTypography.bodySmall, color: semanticColors.text.secondary },
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
