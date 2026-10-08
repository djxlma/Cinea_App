import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { CineaIcon } from './CineaIcon';
import { colors } from '../tokens/colors';
import { typography } from '../tokens/typography';

type FloatingSearchBarProps = {
  value?: string;
  onChangeText?: (value: string) => void;
  onPress?: () => void;
  onFilter?: () => void;
  placeholder?: string;
};

export function FloatingSearchBar({ value, onChangeText, onPress, onFilter, placeholder = 'Pesquisar título' }: FloatingSearchBarProps) {
  return (
    <View style={styles.bar}>
      {onPress ? (
        <Pressable accessibilityRole="button" onPress={onPress} style={styles.pressable}>
          <Text style={styles.placeholder}>{placeholder}</Text>
          <CineaIcon name="search" size={30} />
        </Pressable>
      ) : (
        <TextInput
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
}

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