import { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, PixelRatio, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { captureRef, releaseCapture } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { TierListExportView, type TierListExportData } from '../components/TierListExportView';
import { PrimaryButton } from '../components/PrimaryButton';
import { CineaState } from '../components/CineaState';
import { getMovieIdentityKey, resolveMovieById } from '../services/movieResolver';
import type { TierListItemInput } from '../services/tierLists';
import type { Movie } from '../types/movie';
import { semanticColors } from '../tokens/colors';
import { semanticSpacing } from '../tokens/spacing';
import { semanticTypography } from '../tokens/typography';

type Input = { title: string; description?: string | null; items: TierListItemInput[]; movies: Record<string, Movie> };

export function useTierListExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState('');
  const [request, setRequest] = useState<TierListExportData | null>(null);
  const busy = useRef(false);
  const active = useRef(true);
  const generation = useRef(0);
  useEffect(() => { active.current = true; return () => { active.current = false; generation.current++; }; }, []);
  const finish = useCallback((message = '') => {
    generation.current++;
    busy.current = false;
    if (active.current) { setRequest(null); setError(message); setIsExporting(false); }
  }, []);
  const exportTierList = useCallback(async (input: Input) => {
    if (busy.current) return;
    busy.current = true;
    const current = ++generation.current;
    setIsExporting(true);
    setError('');
    try {
      if (!await Sharing.isAvailableAsync()) {
        if (active.current && current === generation.current) finish('O compartilhamento de imagens não está disponível neste dispositivo.');
        return;
      }
      const resolved = { ...input.movies };
      const ids = [...new Set(input.items.map((item) => getMovieIdentityKey(item.movieId)))];
      let index = 0;
      await Promise.all(Array.from({ length: Math.min(4, ids.length) }, async () => {
        while (active.current && current === generation.current && index < ids.length) {
          const id = ids[index++];
          if (!resolved[id]) { const movie = await resolveMovieById(id); if (movie) resolved[id] = movie; }
        }
      }));
      if (!active.current || current !== generation.current) return;
      setRequest({ title: input.title.trim() || 'Minha Tier List', description: input.description?.trim() || '',
        movies: [...input.items].sort((a, b) => a.position - b.position).map((item) => {
          const movie = resolved[getMovieIdentityKey(item.movieId)];
          return { title: movie?.title?.trim() || item.movieTitle, posterUrl: movie?.posterUrl ?? null, tier: item.tier, position: item.position };
        }) });
    } catch {
      if (active.current && current === generation.current) finish('Não foi possível preparar a imagem da Tier List. Tente novamente.');
    }
  }, [finish]);
  return { isExporting, error, exportTierList,
    exportView: request ? <ExportModal data={request} onFinish={finish} /> : null };
}

function ExportModal({ data, onFinish }: { data: TierListExportData; onFinish: (message?: string) => void }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const previewWidth = Math.min(360, width - insets.left - insets.right - semanticSpacing.xl * 2);
  // Render at least 1080 physical pixels before capture, avoiding bitmap upscaling.
  const canvasWidth = Math.max(previewWidth, 1080 / PixelRatio.get());
  const captureView = useRef<View>(null);
  const [shown, setShown] = useState(false);
  const [height, setHeight] = useState(0);
  const onReady = useCallback((value: number) => setHeight(value), []);
  const onImageError = useCallback(() => onFinish('Não foi possível preparar os posters. Tente exportar novamente.'), [onFinish]);
  useEffect(() => {
    if (!shown || height <= 0) return;
    let active = true;
    let uri: string | null = null;
    // Images and layout are ready; wait one paint before reading the native view.
    const frame = requestAnimationFrame(() => {
      void (async () => {
        try {
          uri = await captureRef(captureView, { format: 'png', quality: 1, result: 'tmpfile', width: 1080, height: Math.ceil(height / canvasWidth * 1080) });
          if (!active) return;
          await Sharing.shareAsync(uri, { mimeType: 'image/png', UTI: 'public.png', dialogTitle: 'Compartilhar Tier List' });
          if (active) onFinish();
        } catch {
          if (active) onFinish('Não foi possível gerar ou compartilhar a imagem. Tente novamente.');
        } finally {
          if (uri) releaseCapture(uri);
        }
      })();
    });
    return () => { active = false; cancelAnimationFrame(frame); };
  }, [shown, height, canvasWidth, onFinish]);
  return <Modal visible animationType="none" onShow={() => setShown(true)} onRequestClose={() => onFinish()}>
    <View style={[styles.modal, { paddingTop: insets.top + semanticSpacing.md, paddingBottom: insets.bottom + semanticSpacing.md }]}>
      <Text accessibilityRole="header" style={styles.title}>Exportar Tier List</Text>
      <CineaState variant="loading" size="section" message="Preparando imagem para compartilhar..." />
      <ScrollView style={styles.preview} contentContainerStyle={styles.previewContent} removeClippedSubviews={false}>
        <ScrollView horizontal style={{ width: previewWidth }} removeClippedSubviews={false}>
          <TierListExportView data={data} width={canvasWidth} captureView={captureView} onReady={onReady} onError={onImageError} />
        </ScrollView>
      </ScrollView>
      <PrimaryButton label="Cancelar" variant="ghost" onPress={() => onFinish()} />
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  modal: { flex: 1, backgroundColor: semanticColors.background.primary, paddingHorizontal: semanticSpacing.xl },
  title: { ...semanticTypography.sectionTitle, color: semanticColors.text.primary },
  preview: { flex: 1 },
  previewContent: { alignItems: 'center' },
});
