export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32
} as const;

export type SpacingKey = keyof typeof spacing;

// Independent scale: semanticSpacing.md is 12; legacy spacing.md stays 16.
export const semanticSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  section: 32,
  hero: 48,
} as const;

export type SemanticSpacingKey = keyof typeof semanticSpacing;
