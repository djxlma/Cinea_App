import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import { CineaIcon } from './CineaIcon';
import { colors } from '../tokens/colors';

type PosterTileProps = {
  width: number;
  height: number;
  onPress?: () => void;
  rating?: number;
  showRating?: boolean;
  add?: boolean;
  backgroundColor?: string;
  source?: ImageSourcePropType;
  posterSource?: ImageSourcePropType;
  label?: string;
  showLabel?: boolean;
};

export function PosterTile({ width, height, onPress, rating, showRating = true, add = false, backgroundColor, source, posterSource, label, showLabel = false }: PosterTileProps) {
  const resolvedPosterSource = posterSource ?? source ?? require('../../assets/poster-placeholder.png');

  const content = (
    <View style={[styles.poster, { width, height, backgroundColor: backgroundColor ?? colors.surface }]}> 
      <Image source={resolvedPosterSource} resizeMode="cover" style={styles.image} />
      <View style={styles.overlay} />
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