import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from './PrimaryButton';
import { semanticColors } from '../tokens/colors';
import { semanticSpacing } from '../tokens/spacing';
import { semanticTypography } from '../tokens/typography';

type Action = { actionLabel: string; onAction: () => void } | { actionLabel?: never; onAction?: never };
export type CineaStateProps = Action & {
  variant: 'loading' | 'empty' | 'error' | 'offline';
  size?: 'screen' | 'section';
  title?: string;
  message?: string;
};

export function CineaState({ variant, size = 'section', title, message, actionLabel, onAction }: CineaStateProps) {
  const loading = variant === 'loading';
  const important = variant === 'error' || variant === 'offline';
  const heading = title ?? (variant === 'empty' ? 'Nada por aqui ainda' : variant === 'error' ? 'Não foi possível carregar' : variant === 'offline' ? 'Sem conexão' : undefined);
  return (
    <View accessibilityLiveRegion={important ? 'polite' : 'none'} accessibilityState={{ busy: loading }} style={[styles.container, size === 'screen' ? styles.screen : styles.section]}>
      {loading ? <ActivityIndicator accessibilityLabel={message ?? 'Carregando'} color={semanticColors.brand.amber} size={size === 'screen' ? 'large' : 'small'} /> : null}
      {heading ? <Text accessibilityRole="header" style={styles.title}>{heading}</Text> : null}
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {!loading && onAction ? <PrimaryButton label={actionLabel} onPress={onAction} variant="secondary" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', gap: semanticSpacing.md },
  screen: { flexGrow: 1, padding: semanticSpacing.xxl },
  section: { paddingVertical: semanticSpacing.lg, paddingHorizontal: semanticSpacing.md },
  title: { ...semanticTypography.sectionTitle, color: semanticColors.text.primary, textAlign: 'center' },
  message: { ...semanticTypography.bodySmall, color: semanticColors.text.secondary, textAlign: 'center' },
});
