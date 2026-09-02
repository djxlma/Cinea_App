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