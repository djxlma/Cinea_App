import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import type { PressableProps } from 'react-native';
import { colors, semanticColors } from '../tokens/colors';
import { spacing, semanticSpacing } from '../tokens/spacing';
import { typography, semanticTypography } from '../tokens/typography';
import { radius } from '../tokens/radius';
import { sizes } from '../tokens/sizes';
import { states } from '../tokens/states';

export type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'ivory' | 'orange' | 'text' | 'primary' | 'secondary' | 'ghost' | 'danger';
  secondaryTone?: 'default' | 'wine';
  disabled?: boolean;
  icon?: ReactNode;
  iconOnly?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  loading?: boolean;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  hitSlop?: PressableProps['hitSlop'];
  testID?: string;
};

export function PrimaryButton({ label, onPress, variant = 'ivory', secondaryTone = 'default', disabled = false, icon, iconOnly = false, containerStyle, loading = false, fullWidth = false, accessibilityLabel, hitSlop, testID }: PrimaryButtonProps) {
  const isIvory = variant === 'ivory';
  const isText = variant === 'text';
  const modern = variant === 'primary' || variant === 'secondary' || variant === 'ghost' || variant === 'danger';
  const blocked = disabled || loading;
  const palette = modern ? (variant === 'secondary' && secondaryTone === 'wine' ? palettes.secondaryWine : palettes[variant]) : null;
  const foreground = disabled ? states.disabled.text : palette?.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: blocked, busy: loading }}
      disabled={blocked}
      onPress={() => { if (!blocked) onPress(); }}
      hitSlop={hitSlop}
      testID={testID}
      style={({ pressed }) => [
        modern ? semanticStyles.button : styles.button,
        containerStyle,
        fullWidth && semanticStyles.fullWidth,
        modern && palette ? {
          backgroundColor: disabled ? states.disabled.background : pressed && !blocked ? palette.pressed : palette.background,
          borderColor: disabled ? states.disabled.border : palette.border,
        } : isIvory ? styles.ivory : isText ? styles.textButton : styles.orange,
        iconOnly && (modern ? semanticStyles.iconOnly : styles.iconOnly),
        !modern && disabled && styles.disabled,
        !modern && pressed && !blocked && styles.pressed,
      ]}
    >
      {icon ? <View style={[modern ? semanticStyles.icon : styles.icon, modern && !iconOnly && semanticStyles.iconGap, loading && semanticStyles.hidden]}>{icon}</View> : null}
      {label ? <Text style={[modern ? [semanticStyles.label, { color: foreground }] : isIvory ? styles.ivoryLabel : isText ? styles.textLabel : styles.orangeLabel, loading && semanticStyles.hidden]}>{label}</Text> : null}
      {loading ? <View pointerEvents="none" style={semanticStyles.spinner}>
        <ActivityIndicator color={modern ? foreground : isIvory ? colors.primary : colors.text} />
      </View> : null}
    </Pressable>
  );
}

const palettes = {
  primary: { background: semanticColors.brand.amber, pressed: states.pressed.accentBackground, text: semanticColors.text.onAccent, border: 'transparent' },
  secondary: { background: semanticColors.surface.subtle, pressed: states.pressed.background, text: semanticColors.text.primary, border: semanticColors.border.subtle },
  secondaryWine: { background: semanticColors.surface.sunken, pressed: semanticColors.surface.default, text: semanticColors.text.primary, border: semanticColors.brand.amber },
  ghost: { background: 'transparent', pressed: states.pressed.background, text: semanticColors.text.primary, border: 'transparent' },
  danger: { background: states.danger.surface, pressed: states.pressed.background, text: states.danger.text, border: states.danger.border },
} as const;

const semanticStyles = StyleSheet.create({
  button: { minHeight: sizes.buttonMinHeight, borderRadius: radius.control, borderWidth: 1, paddingHorizontal: semanticSpacing.lg, paddingVertical: semanticSpacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  label: { ...semanticTypography.button, textAlign: 'center', flexShrink: 1 },
  icon: { alignItems: 'center', justifyContent: 'center' },
  iconGap: { marginRight: semanticSpacing.sm },
  iconOnly: { width: sizes.iconButton, height: sizes.iconButton, minWidth: sizes.touchTargetMin, paddingHorizontal: 0, paddingVertical: 0 },
  fullWidth: { alignSelf: 'stretch' },
  hidden: { opacity: 0 },
  spinner: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
});

const styles = StyleSheet.create({
  button: {
    minHeight: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 40,
  },
  ivory: {
    backgroundColor: colors.text,
  },
  orange: {
    backgroundColor: colors.secondary,
  },
  textButton: {
    minHeight: 40,
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: 'transparent',
  },
  ivoryLabel: {
    ...typography.bodySemiBold,
    fontSize: 30,
    letterSpacing: 0,
    color: colors.primary,
  },
  orangeLabel: {
    ...typography.bodySemiBold,
    fontSize: 24,
    letterSpacing: 0,
    color: colors.text,
  },
  textLabel: {
    ...typography.body,
    letterSpacing: 0,
    color: colors.text,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  iconOnly: {
    width: 60,
    paddingHorizontal: 0,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.75,
  },
});
