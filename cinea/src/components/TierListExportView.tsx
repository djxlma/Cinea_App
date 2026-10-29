import { useCallback, useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { RefObject } from 'react';
import type { TierRank } from '../types/content';
import { semanticColors } from '../tokens/colors';
import { semanticSpacing } from '../tokens/spacing';
import { semanticTypography } from '../tokens/typography';
import { radius } from '../tokens/radius';

export type ExportMovie = { title: string; posterUrl: string | null; tier: TierRank; position: number };
export type TierListExportData = { title: string; description: string; movies: ExportMovie[] };
const ranks: TierRank[] = ['S', 'A', 'B', 'C', 'D'];

type Props = {
  data: TierListExportData;
  width: number;
  captureView: RefObject<View | null>;
  onReady: (height: number) => void;
  onError: () => void;
};

export function TierListExportView({ data, width, captureView, onReady, onError }: Props) {
  const [height, setHeight] = useState(0);
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set());
  const settled = useCallback((index: number) => setLoaded((previous) => new Set(previous).add(index)), []);
  useEffect(() => {
    if (height > 0 && loaded.size === data.movies.length) onReady(height);
  }, [height, loaded, data.movies.length, onReady]);
  const posterWidth = Math.min(40, (width - 96) / 5);
  return <View ref={captureView} collapsable={false} onLayout={(event) => setHeight(event.nativeEvent.layout.height)}
    style={[styles.canvas, { width, minHeight: width * 1.25 }]}>
    <View style={styles.heading}>
      <Text allowFontScaling={false} style={styles.brand}>CINEA</Text>
      <Text allowFontScaling={false} style={styles.title}>{data.title}</Text>
      {data.description ? <Text allowFontScaling={false} style={styles.description}>{data.description}</Text> : null}
    </View>
    <View style={styles.board}>
      {ranks.map((rank) => <View key={rank} style={styles.row}>
        <View style={[styles.rank, { backgroundColor: semanticColors.tier[rank.toLowerCase() as Lowercase<TierRank>] }]}>
          <Text allowFontScaling={false} style={styles.rankText}>{rank}</Text>
        </View>
        <View style={styles.posters}>
          {data.movies.map((movie, index) => movie.tier === rank ? <ExportPoster key={index} movie={movie} width={posterWidth}
            onLoaded={() => settled(index)} onError={onError} /> : null)}
          {!data.movies.some((movie) => movie.tier === rank) ? <Text allowFontScaling={false} style={styles.empty}>—</Text> : null}
        </View>
      </View>)}
    </View>
    <Text allowFontScaling={false} style={styles.footer}>Feito no CINEA</Text>
  </View>;
}

function ExportPoster({ movie, width, onLoaded, onError }: { movie: ExportMovie; width: number; onLoaded: () => void; onError: () => void }) {
  const [failed, setFailed] = useState(false);
  const fallback = !movie.posterUrl || failed;
  const completed = useRef(false);
  return <Image accessibilityLabel={`Poster de ${movie.title}`} resizeMode="contain"
    source={fallback ? require('../../assets/poster-placeholder.png') : { uri: movie.posterUrl! }}
    style={{ width, height: width * 1.5, borderRadius: radius.poster, backgroundColor: semanticColors.surface.default }}
    onLoad={() => { if (!completed.current) { completed.current = true; onLoaded(); } }}
    onError={() => { if (!fallback) setFailed(true); else onError(); }} />;
}

const styles = StyleSheet.create({
  canvas: { backgroundColor: semanticColors.background.primary, padding: semanticSpacing.lg, gap: semanticSpacing.lg },
  heading: { gap: semanticSpacing.sm },
  brand: { ...semanticTypography.label, color: semanticColors.brand.amber, letterSpacing: 2 },
  title: { ...semanticTypography.sectionTitle, color: semanticColors.text.primary },
  description: { ...semanticTypography.caption, color: semanticColors.text.secondary },
  board: { gap: semanticSpacing.xs, flexGrow: 1 },
  row: { flexDirection: 'row', minHeight: 48, backgroundColor: semanticColors.surface.sunken, borderRadius: radius.poster, overflow: 'hidden' },
  rank: { width: 32, justifyContent: 'center', alignItems: 'center' },
  rankText: { ...semanticTypography.label, color: semanticColors.text.onAccent },
  posters: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', padding: semanticSpacing.sm, gap: semanticSpacing.xs },
  empty: { ...semanticTypography.caption, color: semanticColors.text.muted },
  footer: { ...semanticTypography.caption, color: semanticColors.text.secondary, textAlign: 'right' },
});
