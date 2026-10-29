import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import { CineaIcon } from './CineaIcon';
import { colors, semanticColors } from '../tokens/colors';
import { radius } from '../tokens/radius';

type PosterTileProps = {
  appearance?: 'legacy' | 'semantic';
  width: number;
  height: number;
  onPress?: () => void;
  rating?: number;
  showRating?: boolean;
  add?: boolean;
  backgroundColor?: string;
  source?: ImageSourcePropType;
  posterSource?: ImageSourcePropType;
  posterUrl?: string | null;
  label?: string;
  showLabel?: boolean;
};

export function PosterTile({ appearance = 'legacy', width, height, onPress, rating, showRating = true, add = false, backgroundColor, source, posterSource, posterUrl, label, showLabel = false }: PosterTileProps) {
  const [failedPosterUrl, setFailedPosterUrl] = useState<string | null>(null);
  useEffect(() => { setFailedPosterUrl(null); }, [posterUrl]);
  const resolvedPosterSource = posterSource
    ?? (posterUrl && posterUrl !== failedPosterUrl ? { uri: posterUrl } : null)
    ?? source
    ?? require('../../assets/poster-placeholder.png');

  const content = (
    <View style={[styles.poster, appearance === 'semantic' && styles.semanticPoster, { width, height, backgroundColor: backgroundColor ?? (appearance === 'semantic' ? semanticColors.surface.subtle : colors.surface) }]}>
      <Image source={resolvedPosterSource} resizeMode="cover" style={styles.image}
        onError={() => { if (!posterSource && posterUrl) setFailedPosterUrl(posterUrl); }} />
      {appearance === 'legacy' ? <View style={styles.overlay} /> : null}
      {showRating && rating !== undefined ? (
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingStar}>★</Text>
          <Text style={styles.ratingText}>{rating}</Text>
        </View>
      ) : null}
      {showLabel && label ? <Text style={styles.label}>{label}</Text> : null}
      {add ? (
        <View style={styles.addCircle}>
          <CineaIcon name="plus" size={42} />
        </View>
      ) : null}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={add ? 'Adicionar filme' : 'Abrir filme'} onPress={onPress}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  semanticPoster: { borderWidth: 0, borderRadius: radius.poster },
  poster: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(215, 195, 170, 0.38)',
    borderRadius: 8,
    position: 'relative',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 0, 0, 0.12)',
  },
  label: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 8,
    color: '#F7F0DF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
    textAlign: 'left',
  },
  ratingBadge: {
    position: 'absolute',
    top: -14,
    right: -7,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingStar: {
    position: 'absolute',
    color: colors.secondary,
    fontSize: 52,
    lineHeight: 54,
  },
  ratingText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  addCircle: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.text,
    borderRadius: 30,
  },
});
