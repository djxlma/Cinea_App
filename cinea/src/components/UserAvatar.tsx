import { Image, Pressable, StyleSheet, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import { CineaIcon } from './CineaIcon';
import { colors } from '../tokens/colors';

type UserAvatarProps = {
  size: number;
  onPress?: () => void;
  source?: ImageSourcePropType | string | null;
};

export function UserAvatar({ size, onPress, source }: UserAvatarProps) {
  const avatar = source ? (
    <Image
      source={typeof source === 'string' ? { uri: source } : source}
      resizeMode="cover"
      style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
    />
  ) : (
    <View style={[styles.guestAvatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <CineaIcon name="user" size={Math.max(18, size * 0.42)} color={colors.secondary} />
    </View>
  );

  if (!onPress) return avatar;

  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Menu do usuário" onPress={onPress}>
      {avatar}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: '#D7C3AA',
    overflow: 'hidden',
  },
  guestAvatar: {
    backgroundColor: '#5D0000',
    borderWidth: 2,
    borderColor: '#D7C3AA',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});