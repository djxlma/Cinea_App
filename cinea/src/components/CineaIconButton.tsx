import type { PressableProps } from 'react-native';
import { CineaIcon, type CineaIconName } from './CineaIcon';
import { PrimaryButton } from './PrimaryButton';
import { semanticColors } from '../tokens/colors';
import { states } from '../tokens/states';

type Props = {
  icon: CineaIconName;
  iconSize?: number;
  accessibilityLabel: string;
  onPress: () => void;
  variant?: 'default' | 'subtle' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  hitSlop?: PressableProps['hitSlop'];
};

export function CineaIconButton({ icon, iconSize = 24, accessibilityLabel, onPress, variant = 'subtle', disabled = false, loading = false, hitSlop }: Props) {
  const color = disabled ? states.disabled.text : variant === 'default' ? semanticColors.text.onAccent : variant === 'danger' ? states.danger.text : semanticColors.text.primary;
  return <PrimaryButton label="" accessibilityLabel={accessibilityLabel} onPress={onPress}
    variant={variant === 'default' ? 'primary' : variant === 'danger' ? 'danger' : 'ghost'}
    iconOnly icon={<CineaIcon name={icon} size={iconSize} color={color} />} disabled={disabled} loading={loading} hitSlop={hitSlop} />;
}
