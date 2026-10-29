// Minimum heights allow controls to grow with text scaling.
export const sizes = {
  touchTargetMin: 48,
  inputMinHeight: 52,
  buttonMinHeight: 48,
  iconButton: 48,
  // Safe-area inset is added separately by the consuming layout.
  headerMinHeight: 56,
} as const;

export type SizeKey = keyof typeof sizes;
