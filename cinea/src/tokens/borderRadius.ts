export const borderRadius = {
  sm: 6,
  md: 20,
  lg: 30
} as const;

export type BorderRadiusKey = keyof typeof borderRadius;