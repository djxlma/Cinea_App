import type { ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '../tokens/colors';
import { spacing } from '../tokens/spacing';
import { typography } from '../tokens/typography';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'ivory' | 'orange' | 'text';
  disabled?: boolean;
  icon?: ReactNode;
  iconOnly?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

export function PrimaryButton({ label, onPress, variant = 'ivory', disabled = false, icon, iconOnly = false, containerStyle }: PrimaryButtonProps) {
  const isIvory = variant === 'ivory';
  const isText = variant === 'text';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        containerStyle,
        isIvory ? styles.ivory : isText ? styles.textButton : styles.orange,
        iconOnly && styles.iconOnly,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      {label ? <Text style={isIvory ? styles.ivoryLabel : isText ? styles.textLabel : styles.orangeLabel}>{label}</Text> : null}
    </Pressable>
  );
}

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