export const radius = {
  poster: 8,
  control: 12,
  surface: 16,
  sheet: 24,
  pill: 999,
} as const;

// For circles use size / 2. Surfaces remain flat; no decorative shadow scale.
export type RadiusKey = keyof typeof radius;
