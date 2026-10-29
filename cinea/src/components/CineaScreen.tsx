import type { ReactNode } from 'react';
import { ImageBackground, KeyboardAvoidingView, Platform, ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import type { ScrollViewProps } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { spacing, semanticSpacing } from '../tokens/spacing';
import { semanticColors } from '../tokens/colors';

export type CineaScreenProps = {
  children?: ReactNode;
  footer?: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  scrollable?: boolean;
  appearance?: 'legacy' | 'semantic';
  safeAreaEdges?: readonly Edge[];
  gutter?: number;
  // Includes horizontal gutters. Opt-in; no tablet constraint on legacy screens.
  maxContentWidth?: number;
  bottomContent?: ReactNode;
  bottomContentTransparent?: boolean;
  keyboardAvoiding?: boolean;
  keyboardVerticalOffset?: number;
  keyboardShouldPersistTaps?: ScrollViewProps['keyboardShouldPersistTaps'];
  showsVerticalScrollIndicator?: boolean;
};

export function CineaScreen(props: CineaScreenProps) {
  if (props.appearance === 'semantic') return <SemanticScreen {...props} />;
  const { children, footer, contentContainerStyle, scrollable = true } = props;
  return (
    <ImageBackground source={require('../../assets/cinea-gradient.png')} resizeMode="stretch" style={styles.background}>
      <View style={styles.root}>
        {scrollable ? (
          <ScrollView
            contentContainerStyle={[styles.content, contentContainerStyle]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : <View style={styles.root}>{children}</View>}
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </View>
    </ImageBackground>
  );
}

// Container owns safe area; children and ScreenHeader must not add it again.
function SemanticScreen({ children, footer, bottomContent, bottomContentTransparent = false, contentContainerStyle, scrollable = true,
  safeAreaEdges = ['top', 'right', 'bottom', 'left'], gutter = semanticSpacing.xl, maxContentWidth,
  keyboardAvoiding = false, keyboardVerticalOffset = 0, keyboardShouldPersistTaps = 'handled', showsVerticalScrollIndicator = false,
}: CineaScreenProps) {
  const bounded = maxContentWidth === undefined ? undefined : { maxWidth: maxContentWidth };
  const content = <View style={[semanticStyles.content, { paddingHorizontal: gutter }, bounded, contentContainerStyle]}>{children}</View>;
  // Footer is a non-shrinking sibling, not an overlay. Its real height reserves space.
  const bottom = bottomContent ?? footer;
  const layout = <SafeAreaView edges={safeAreaEdges} style={styles.root}>
    <View style={semanticStyles.main}>
      {scrollable ? <ScrollView style={styles.root} contentContainerStyle={semanticStyles.scrollContent}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps} showsVerticalScrollIndicator={showsVerticalScrollIndicator}>
        {content}
      </ScrollView> : content}
    </View>
    {bottom ? <View style={[semanticStyles.bottom, bottomContentTransparent && semanticStyles.transparentBottom]}>
      <View style={[semanticStyles.bottomContent, { paddingHorizontal: gutter }, bounded]}>{bottom}</View>
    </View> : null}
  </SafeAreaView>;
  return <ImageBackground source={require('../../assets/cinea-gradient.png')} resizeMode="stretch" style={styles.background}>
    {keyboardAvoiding ? <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={keyboardVerticalOffset}>
      {layout}
    </KeyboardAvoidingView> : layout}
  </ImageBackground>;
}

const semanticStyles = StyleSheet.create({
  main: { flex: 1, minHeight: 0 },
  scrollContent: { flexGrow: 1 },
  content: { flexGrow: 1, flexShrink: 1, width: '100%', alignSelf: 'center', paddingTop: semanticSpacing.md, paddingBottom: semanticSpacing.xxl },
  bottom: { flexShrink: 0, backgroundColor: semanticColors.background.primary },
  transparentBottom: { backgroundColor: 'transparent' },
  bottomContent: { width: '100%', alignSelf: 'center', paddingVertical: semanticSpacing.md },
});

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
