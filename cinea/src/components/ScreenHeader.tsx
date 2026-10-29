import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { CineaIcon } from './CineaIcon';
import { CineaIconButton } from './CineaIconButton';
import { UserAvatar } from './UserAvatar';
import { colors } from '../tokens/colors';
import { semanticColors } from '../tokens/colors';
import { semanticSpacing } from '../tokens/spacing';
import { semanticTypography } from '../tokens/typography';
import { sizes } from '../tokens/sizes';

type ScreenHeaderProps = {
  title?: string;
  onBack?: () => void;
  showAvatar?: boolean;
  onAvatarPress?: () => void;
  appearance?: 'legacy' | 'semantic';
  rightAction?: ReactNode;
  showBackButton?: boolean;
  titleNumberOfLines?: number;
  titleAlign?: 'left' | 'center';
};

// Safe area belongs to the screen container, never to this header.
export function ScreenHeader({ title, onBack, showAvatar = false, onAvatarPress, appearance = 'legacy', rightAction,
  showBackButton = true, titleNumberOfLines = 1, titleAlign = 'left',
}: ScreenHeaderProps) {
  const modern = appearance === 'semantic';
  const action = rightAction ?? (showAvatar ? <UserAvatar size={47} onPress={onAvatarPress} /> : null);
  const hasBack = showBackButton && Boolean(onBack);
  if (modern) {
    const centered = titleAlign === 'center';
    return <View style={semanticStyles.header}>
      {centered ? <View style={semanticStyles.side}>
        {hasBack ? <CineaIconButton icon="back" accessibilityLabel="Voltar" onPress={() => onBack?.()} /> : null}
      </View> : hasBack ? <CineaIconButton icon="back" accessibilityLabel="Voltar" onPress={() => onBack?.()} /> : null}
      {title ? <Text accessibilityRole="header" style={[semanticStyles.title, centered && semanticStyles.centerTitle]} numberOfLines={titleNumberOfLines} ellipsizeMode="tail">{title}</Text> : <View style={styles.spacer} />}
      {centered ? <View style={semanticStyles.side}>{action}</View> : action ? <View style={semanticStyles.action}>{action}</View> : null}
    </View>;
  }
  return (
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={onBack} style={styles.back}>
        <CineaIcon name="back" size={34} />
      </Pressable>
      {title ? <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">{title}</Text> : <View style={styles.spacer} />}
      {action}
    </View>
  );
}

const semanticStyles = StyleSheet.create({
  header: { minHeight: sizes.headerMinHeight, flexDirection: 'row', alignItems: 'center', gap: semanticSpacing.sm },
  title: { ...semanticTypography.sectionTitle, color: semanticColors.text.primary, flex: 1, minWidth: 0 },
  centerTitle: { textAlign: 'center' },
  side: { width: sizes.iconButton, minHeight: sizes.touchTargetMin, flexShrink: 0, alignItems: 'center', justifyContent: 'center' },
  action: { flexShrink: 0, justifyContent: 'center' },
});

const styles = StyleSheet.create({
  header: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  back: {
    width: 34,
    height: 44,
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 0,
  },
  spacer: {
    flex: 1,
  },
});
