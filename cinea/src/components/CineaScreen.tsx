import type { ReactNode } from 'react';
import { ImageBackground, ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { spacing } from '../tokens/spacing';

type CineaScreenProps = {
  children?: ReactNode;
  footer?: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export function CineaScreen({ children, footer, contentContainerStyle }: CineaScreenProps) {
  return (
    <ImageBackground source={require('../../assets/cinea-gradient.png')} resizeMode="stretch" style={styles.background}>
      <View style={styles.root}>
        <ScrollView
          contentContainerStyle={[styles.content, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  root: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: '9.45%',
    paddingTop: spacing.lg,
    paddingBottom: 150,
  },
  footer: {
    position: 'absolute',
    left: '9.45%',
    right: '9.45%',
    bottom: 50,
  },
});