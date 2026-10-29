import { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { CineaIcon } from './CineaIcon';
import { colors, semanticColors } from '../tokens/colors';
import { typography, semanticTypography } from '../tokens/typography';
import { semanticSpacing } from '../tokens/spacing';
import { radius } from '../tokens/radius';
import { sizes } from '../tokens/sizes';
import { states } from '../tokens/states';

type FloatingSearchBarProps = {
  appearance?: 'legacy' | 'semantic';
  transparentBackground?: boolean;
  flat?: boolean;
  value?: string;
  onChangeText?: (value: string) => void;
  onPress?: () => void;
  onFilter?: () => void;
  placeholder?: string;
};

export const FloatingSearchBar = forwardRef<TextInput, FloatingSearchBarProps>(function FloatingSearchBar({ appearance = 'legacy', transparentBackground = false, flat = false, value, onChangeText, onPress, onFilter, placeholder = 'Pesquisar título' }, ref) {
  if (appearance === 'semantic') return <SemanticSearchBar ref={ref} flat={flat} transparentBackground={transparentBackground} value={value} onChangeText={onChangeText} onPress={onPress} onFilter={onFilter} placeholder={placeholder} />;
  return (
    <View style={styles.bar}>
      {onPress ? (
        <Pressable accessibilityRole="button" onPress={onPress} style={styles.pressable}>
          <Text style={styles.placeholder}>{placeholder}</Text>
          <CineaIcon name="search" size={30} />
        </Pressable>
      ) : (
        <TextInput
          ref={ref}
          accessibilityLabel="Pesquisar títulos"
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          value={value}
        />
      )}
      {onFilter ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Filtros" onPress={onFilter} style={styles.filter}>
          <CineaIcon name="filter" size={30} />
        </Pressable>
      ) : null}
    </View>
  );
});

const SemanticSearchBar = forwardRef<TextInput, FloatingSearchBarProps>(function SemanticSearchBar({ transparentBackground = false, flat = false, value, onChangeText, onPress, onFilter, placeholder }, ref) {
  const [focused, setFocused] = useState(false);
  const contents = <>
    <CineaIcon name="search" size={20} color={semanticColors.text.secondary} />
    <Text style={semanticStyles.placeholder}>{placeholder}</Text>
  </>;
  if (onPress) return <Pressable accessibilityRole="button" accessibilityLabel="Pesquisar filmes" onPress={onPress}
    style={({ pressed }) => [semanticStyles.bar, semanticStyles.trigger, flat && semanticStyles.flatBar, transparentBackground && semanticStyles.transparentBar,
      pressed && (transparentBackground || flat ? semanticStyles.transparentPressed : semanticStyles.pressed)]}>{contents}</Pressable>;
  return <View style={[semanticStyles.bar, transparentBackground && semanticStyles.transparentBar, focused && semanticStyles.focused]}>
    <View accessible={false} pointerEvents="none" style={semanticStyles.searchIcon}><CineaIcon name="search" size={20} color={semanticColors.text.secondary} /></View>
    <TextInput ref={ref} accessibilityLabel="Pesquisar filmes" value={value} onChangeText={onChangeText} placeholder={placeholder}
      placeholderTextColor={semanticColors.text.muted} autoCorrect={false} returnKeyType="search"
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={semanticStyles.input} />
    {value && onChangeText ? <Pressable accessibilityRole="button" accessibilityLabel="Limpar pesquisa" onPress={() => onChangeText('')}
      style={({ pressed }) => [semanticStyles.iconAction, pressed && semanticStyles.pressed]}>
      <Text style={semanticStyles.clear}>×</Text>
    </Pressable> : null}
    {onFilter ? <Pressable accessibilityRole="button" accessibilityLabel="Filtros" onPress={onFilter}
      style={({ pressed }) => [semanticStyles.iconAction, pressed && semanticStyles.pressed]}><CineaIcon name="filter" size={20} /></Pressable> : null}
  </View>;
});

const semanticStyles = StyleSheet.create({
  bar: { minHeight: sizes.inputMinHeight, flexDirection: 'row', alignItems: 'center', backgroundColor: semanticColors.surface.default, borderWidth: states.focus.borderWidth, borderColor: semanticColors.border.subtle, borderRadius: radius.control },
  trigger: { gap: semanticSpacing.md, paddingHorizontal: semanticSpacing.lg, paddingVertical: semanticSpacing.md },
  placeholder: { ...semanticTypography.body, color: semanticColors.text.secondary, flex: 1 },
  searchIcon: { marginLeft: semanticSpacing.md },
  input: { ...semanticTypography.body, color: semanticColors.text.primary, flex: 1, minWidth: 0, minHeight: sizes.inputMinHeight, paddingHorizontal: semanticSpacing.md, paddingVertical: semanticSpacing.md },
  focused: { borderColor: semanticColors.border.focus },
  transparentBar: { backgroundColor: 'transparent' },
  flatBar: { borderWidth: 1, borderRadius: radius.control, overflow: 'hidden', elevation: 0, shadowOpacity: 0 },
  transparentPressed: { borderColor: semanticColors.border.strong },
  iconAction: { minWidth: sizes.touchTargetMin, minHeight: sizes.touchTargetMin, alignItems: 'center', justifyContent: 'center', borderRadius: radius.control },
  clear: { ...semanticTypography.sectionTitle, color: semanticColors.text.secondary },
  pressed: { backgroundColor: states.pressed.background },
});

const styles = StyleSheet.create({
  bar: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#B28B70',
    borderRadius: 40,
    backgroundColor: colors.surface,
  },
  pressable: {
    minHeight: 60,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  placeholder: {
    ...typography.h3,
    fontSize: 22,
    letterSpacing: 0,
    color: colors.textMuted,
  },
  input: {
    minHeight: 60,
    flex: 1,
    paddingHorizontal: 16,
    color: colors.text,
    fontSize: 22,
  },
  filter: {
    width: 58,
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
