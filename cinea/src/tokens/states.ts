import { semanticColors } from './colors';

// Explicit state colors avoid fading the entire control and its text.
export const states = {
  disabled: {
    background: '#42231E',
    text: semanticColors.text.muted,
    border: semanticColors.border.subtle,
  },
  pressed: {
    background: semanticColors.surface.raised,
    text: semanticColors.text.primary,
    accentBackground: '#E99216',
    textOnAccent: semanticColors.text.onAccent,
  },
  focus: {
    border: semanticColors.border.focus,
    borderWidth: 2,
  },
  danger: semanticColors.feedback.danger,
  success: semanticColors.feedback.success,
  warning: semanticColors.feedback.warning,
} as const;

export type StateKey = keyof typeof states;
