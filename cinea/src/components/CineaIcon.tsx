import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../tokens/colors';

export type CineaIconName = 'back' | 'search' | 'filter' | 'share' | 'edit' | 'plus' | 'user' | 'star' | 'trash';

type CineaIconProps = {
  name: CineaIconName;
  size?: number;
  color?: string;
};

export function CineaIcon({ name, size = 26, color = colors.text }: CineaIconProps) {
  if (name === 'back') {
    return <View style={[styles.back, { width: size * 0.55, height: size * 0.55, borderColor: color }]} />;
  }

  if (name === 'search') {
    return (
      <View style={{ width: size, height: size }}>
        <View style={[styles.searchLens, { width: size * 0.68, height: size * 0.68, borderColor: color, borderRadius: size }]} />
        <View style={[styles.searchHandle, { width: size * 0.42, backgroundColor: color, right: -size * 0.03, bottom: size * 0.08 }]} />
      </View>
    );
  }

  if (name === 'filter') {
    return (
      <View style={{ width: size, height: size, alignItems: 'center' }}>
        <View style={[styles.filterTop, { width: size * 0.9, borderTopColor: color, borderLeftColor: color, borderRightColor: color }]} />
        <View style={[styles.filterStem, { backgroundColor: color }]} />
      </View>
    );
  }

  if (name === 'share') {
    return (
      <View style={{ width: size, height: size }}>
        <View style={[styles.shareLine, { backgroundColor: color, width: size * 0.55, top: size * 0.3, left: size * 0.2, transform: [{ rotate: '-30deg' }] }]} />
        <View style={[styles.shareLine, { backgroundColor: color, width: size * 0.55, top: size * 0.62, left: size * 0.2, transform: [{ rotate: '30deg' }] }]} />
        <View style={[styles.shareDot, { backgroundColor: color, top: size * 0.05, right: 0, width: size * 0.32, height: size * 0.32 }]} />
        <View style={[styles.shareDot, { backgroundColor: color, bottom: size * 0.05, right: 0, width: size * 0.32, height: size * 0.32 }]} />
        <View style={[styles.shareDot, { backgroundColor: color, top: size * 0.34, left: 0, width: size * 0.32, height: size * 0.32 }]} />
      </View>
    );
  }

  if (name === 'edit') {
    return <Text style={{ color, fontSize: size, lineHeight: size }}>✎</Text>;
  }

  if (name === 'user') {
    return (
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: size * 0.28, height: size * 0.28, borderWidth: 3, borderColor: color, borderRadius: 999, marginBottom: size * 0.02 }} />
        <View style={{ width: size * 0.58, height: size * 0.38, borderWidth: 3, borderColor: color, borderRadius: 999 }} />
      </View>
    );
  }

  if (name === 'star') {
    return <Text style={{ color, fontSize: size, lineHeight: size, fontWeight: '700' }}>★</Text>;
  }

  if (name === 'trash') {
    return (
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <View style={[styles.trashLid, { width: size * 0.7, backgroundColor: color, top: size * 0.12 }]} />
        <View style={[styles.trashBody, { width: size * 0.62, height: size * 0.62, borderColor: color, borderWidth: 2, borderRadius: 3, bottom: size * 0.06 }]} />
        <View style={[styles.trashHandle, { width: size * 0.16, height: size * 0.12, backgroundColor: color, top: size * 0.24 }]} />
      </View>
    );
  }

  return <Text style={{ color, fontSize: size, lineHeight: size, fontWeight: '300' }}>+</Text>;
}

const styles = StyleSheet.create({
  back: {
    borderLeftWidth: 3,
    borderBottomWidth: 3,
    transform: [{ rotate: '45deg' }],
    marginLeft: 8,
  },
  searchLens: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderWidth: 3,
  },
  searchHandle: {
    position: 'absolute',
    height: 3,
    borderRadius: 2,
    transform: [{ rotate: '48deg' }],
  },
  filterTop: {
    height: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderRightWidth: 3,
  },
  filterStem: {
    width: 3,
    height: 13,
  },
  shareLine: {
    position: 'absolute',
    height: 3,
    borderRadius: 2,
  },
  shareDot: {
    position: 'absolute',
    borderRadius: 99,
  },
  trashLid: {
    position: 'absolute',
    height: 2,
    borderRadius: 2,
  },
  trashBody: {
    position: 'absolute',
    borderTopWidth: 0,
  },
  trashHandle: {
    position: 'absolute',
    borderRadius: 2,
  },
});