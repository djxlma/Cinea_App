import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { CineaIcon, type CineaIconName } from './CineaIcon';
import { semanticColors } from '../tokens/colors';
import { semanticSpacing } from '../tokens/spacing';
import { semanticTypography } from '../tokens/typography';
import { sizes } from '../tokens/sizes';
import { radius } from '../tokens/radius';
import { states } from '../tokens/states';

type AccountMenuRowProps = {
  label: string;
  icon: CineaIconName;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  description?: string;
  danger?: boolean;
  showChevron?: boolean;
};

export function AccountMenuRow({ label, icon, onPress, disabled = false, loading = false, description, danger = false, showChevron = true }: AccountMenuRowProps) {
  const blocked = disabled || loading || !onPress;
  const color = blocked ? states.disabled.text : danger ? states.danger.text : semanticColors.text.primary;
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityHint={description}
    accessibilityState={{ disabled: blocked, busy: loading }} disabled={blocked} onPress={onPress}
    style={({ pressed }) => [styles.row, pressed && !blocked && styles.pressed]}>
    <View accessible={false}><CineaIcon name={icon} size={20} color={color} /></View>
    <View style={styles.content}>
      <Text style={[styles.label, { color }]}>{label}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
    {loading ? <ActivityIndicator color={color} /> : showChevron && !blocked ? <Text accessible={false} style={styles.chevron}>›</Text> : null}
  </Pressable>;
}

const styles = StyleSheet.create({
  row: { minHeight: sizes.touchTargetMin, paddingVertical: semanticSpacing.md, paddingHorizontal: semanticSpacing.sm, flexDirection: 'row', alignItems: 'center', gap: semanticSpacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: semanticColors.border.subtle, borderRadius: radius.control },
  content: { flex: 1, minWidth: 0, gap: semanticSpacing.xs },
  label: { ...semanticTypography.body },
  description: { ...semanticTypography.caption, color: semanticColors.text.muted },
  chevron: { ...semanticTypography.sectionTitle, color: semanticColors.text.secondary },
  pressed: { backgroundColor: states.pressed.background },
});
