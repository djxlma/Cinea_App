import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CineaIcon } from './CineaIcon';
import { UserAvatar } from './UserAvatar';
import { colors } from '../tokens/colors';

type ScreenHeaderProps = {
  title?: string;
  onBack: () => void;
  showAvatar?: boolean;
  onAvatarPress?: () => void;
};

export function ScreenHeader({ title, onBack, showAvatar = false, onAvatarPress }: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={onBack} style={styles.back}>
        <CineaIcon name="back" size={34} />
      </Pressable>
      {title ? <Text style={styles.title} numberOfLines={1}>{title}</Text> : <View style={styles.spacer} />}
      {showAvatar ? <UserAvatar size={47} onPress={onAvatarPress} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  back: {
    width: 34,
    height: 44,
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 0,
  },
  spacer: {
    flex: 1,
  },
});