import { forwardRef, useId, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';
import { semanticColors } from '../tokens/colors';
import { semanticSpacing } from '../tokens/spacing';
import { semanticTypography } from '../tokens/typography';
import { radius } from '../tokens/radius';
import { sizes } from '../tokens/sizes';
import { states } from '../tokens/states';

export type CineaInputProps = TextInputProps & {
  label: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  showCounter?: boolean;
  trailingAction?: { label: string; onPress: () => void; disabled?: boolean };
};

export const CineaInput = forwardRef<TextInput, CineaInputProps>(function CineaInput({ label, error, helperText, disabled = false, showCounter = false, trailingAction, editable = true, multiline = false, maxLength, value, defaultValue, onChangeText, onFocus, onBlur, style, accessibilityLabel, accessibilityHint, accessibilityState, placeholderTextColor = semanticColors.text.muted, ...props }, ref) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? '');
  const blocked = disabled || !editable;
  const hint = [accessibilityHint, error || helperText].filter(Boolean).join('. ');
  return (
    <View style={styles.field}>
      <Text nativeID={`${id}-label`} style={styles.label}>{label}</Text>
      <View style={[styles.control, focused && !blocked && styles.focused, Boolean(error) && styles.invalid, blocked && styles.disabled]}>
        <TextInput {...props} ref={ref} value={value} defaultValue={defaultValue} maxLength={maxLength} multiline={multiline} editable={!blocked}
          accessibilityLabel={accessibilityLabel ?? label} accessibilityLabelledBy={props.accessibilityLabelledBy ?? (accessibilityLabel ? undefined : `${id}-label`)} accessibilityHint={hint || undefined}
          accessibilityState={{ ...accessibilityState, disabled: blocked }}
          placeholderTextColor={placeholderTextColor}
          onFocus={(event) => { setFocused(true); onFocus?.(event); }}
          onBlur={(event) => { setFocused(false); onBlur?.(event); }}
          onChangeText={(text) => { setUncontrolledValue(text); onChangeText?.(text); }}
          style={[styles.input, multiline && styles.multiline, blocked && styles.disabledText, style]}
          textAlignVertical={multiline ? 'top' : props.textAlignVertical}
        />
        {trailingAction ? <Pressable accessibilityRole="button" accessibilityLabel={trailingAction.label}
          accessibilityState={{ disabled: blocked || trailingAction.disabled === true }} disabled={blocked || trailingAction.disabled}
          onPress={trailingAction.onPress} style={({ pressed }) => [styles.trailing, pressed && styles.trailingPressed]}>
          <Text style={[styles.trailingText, (blocked || trailingAction.disabled) && styles.disabledText]}>{trailingAction.label}</Text>
        </Pressable> : null}
      </View>
      {error ? <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>
        : helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
      {showCounter && maxLength !== undefined ? <Text style={styles.counter}>{(value ?? uncontrolledValue).length} / {maxLength}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  field: { gap: semanticSpacing.sm },
  label: { ...semanticTypography.label, color: semanticColors.text.primary },
  control: { flexDirection: 'row', alignItems: 'center', borderWidth: states.focus.borderWidth, borderColor: semanticColors.border.subtle, borderRadius: radius.control, backgroundColor: semanticColors.surface.default },
  input: { ...semanticTypography.body, color: semanticColors.text.primary, minHeight: sizes.inputMinHeight, paddingHorizontal: semanticSpacing.md, paddingVertical: semanticSpacing.md, flex: 1, minWidth: 0 },
  multiline: { minHeight: sizes.inputMinHeight * 2 },
  focused: { borderColor: states.focus.border },
  invalid: { borderColor: states.danger.border },
  disabled: { backgroundColor: states.disabled.background, borderColor: states.disabled.border },
  disabledText: { color: states.disabled.text },
  error: { ...semanticTypography.bodySmall, color: states.danger.text },
  helper: { ...semanticTypography.caption, color: semanticColors.text.secondary },
  counter: { ...semanticTypography.caption, color: semanticColors.text.secondary, textAlign: 'right' },
  trailing: { minHeight: sizes.touchTargetMin, minWidth: sizes.touchTargetMin, padding: semanticSpacing.sm, alignItems: 'center', justifyContent: 'center', borderRadius: radius.control, flexShrink: 1 },
  trailingPressed: { backgroundColor: states.pressed.background },
  trailingText: { ...semanticTypography.label, color: semanticColors.text.primary },
});
