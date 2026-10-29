// Legacy styles retain Inter for compatibility; the app does not load this font.
export const typography = {
  h1: { 
    fontFamily: 'Inter', 
    fontSize: 36, 
    fontWeight: '700' as const, 
    letterSpacing: -2.16 
  },
  h2: { 
    fontFamily: 'Inter', 
    fontSize: 32, 
    fontWeight: '700' as const, 
    letterSpacing: -1.92 
  },
  h3: { 
    fontFamily: 'Inter', 
    fontSize: 24, 
    fontWeight: '700' as const, 
    letterSpacing: -1.44 
  },
  h4: { 
    fontFamily: 'Inter', 
    fontSize: 20, 
    fontWeight: '600' as const, 
    letterSpacing: -1.2 
  },
  h4Regular: { 
    fontFamily: 'Inter', 
    fontSize: 20, 
    fontWeight: '500' as const, 
    letterSpacing: -1.2 
  },
  body: { 
    fontFamily: 'Inter', 
    fontSize: 17, 
    fontWeight: '400' as const, 
    letterSpacing: -1.02 
  },
  bodySemiBold: { 
    fontFamily: 'Inter', 
    fontSize: 17, 
    fontWeight: '600' as const, 
    letterSpacing: -1.02 
  }
};

// Intentionally omit fontFamily to use the platform's system font.
// These styles are opt-in; they do not replace the legacy typography export.
export const semanticTypography = {
  display: { fontSize: 32, lineHeight: 38, fontWeight: '700', letterSpacing: 0 },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '700', letterSpacing: 0 },
  sectionTitle: { fontSize: 20, lineHeight: 26, fontWeight: '600', letterSpacing: 0 },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400', letterSpacing: 0 },
  bodySmall: { fontSize: 14, lineHeight: 20, fontWeight: '400', letterSpacing: 0 },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '600', letterSpacing: 0 },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400', letterSpacing: 0 },
  button: { fontSize: 16, lineHeight: 22, fontWeight: '600', letterSpacing: 0 },
} as const;

export type SemanticTypographyKey = keyof typeof semanticTypography;
