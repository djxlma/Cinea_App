export const colors = {
  primary: '#911911',
  secondary: '#FFA424',
  text: '#FFFCD9',
  textDark: '#911911',
  textMuted: '#FFFCD980',         // Original: #FFFCD9 com 50% de alpha
  border: '#FFFCD980',            // Original: #FFFCD9 com 50% de alpha
  surface: '#5D0000',
  surfaceHighlight: '#A20000',
  surfaceInverted: '#FFFCD9',
  background: '#2B0705',
  backgroundOverlay: '#FFF2931F', // Original: #FFF293 com ~12% de alpha
  success: '#43A047',
  error: '#E53935',
  tierS: '#FD7D7C',
  tierA: '#FEBE7D',
  tierB: '#FDDD7F',
  tierC: '#FCFE7D',
  tierD: '#BCFE7D'
} as const;

export type ColorKey = keyof typeof colors;

// Additive semantic API; keep the flat legacy API and its values unchanged.
export const semanticColors = {
  brand: {
    wine: colors.primary,
    amber: colors.secondary,
  },
  background: {
    primary: colors.background,
    secondary: '#3A120E',
  },
  surface: {
    default: colors.surface,
    sunken: '#3A0A08',
    raised: '#6B160F',
    subtle: '#3A120E',
  },
  text: {
    primary: colors.text,
    secondary: '#D7C3AA',
    muted: '#B9A18E',
    // Dark text over amber avoids the low contrast of cream over amber.
    onAccent: colors.background,
    onLight: colors.primary,
  },
  border: {
    subtle: '#5D3028',
    strong: '#B28B70',
    focus: colors.secondary,
  },
  feedback: {
    danger: { text: '#FFB4A2', surface: colors.surface, border: '#CB533A' },
    success: { text: '#A8D9AA', surface: '#183323', border: '#43774E' },
    warning: { text: '#FFD58A', surface: '#432B10', border: '#A5762B' },
  },
  overlay: {
    scrim: 'rgba(0, 0, 0, 0.72)',
  },
  tier: {
    s: colors.tierS,
    a: colors.tierA,
    b: colors.tierB,
    c: colors.tierC,
    d: colors.tierD,
  },
} as const;
