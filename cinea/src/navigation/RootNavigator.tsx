import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { AppNavigator } from './AppNavigator';
import { AuthNavigator } from './AuthNavigator';
import { CreateReviewScreen } from '../screens/reviews/CreateReviewScreen';
import { CurrentUserReviewsScreen } from '../screens/reviews/CurrentUserReviewsScreen';
import { SelectMovieForReviewScreen } from '../screens/reviews/SelectMovieForReviewScreen';
import { MovieDetailsScreen } from '../screens/movies/MovieDetailsScreen';
import { ReviewsScreen } from '../screens/reviews/ReviewsScreen';
import { CreateEditTierListScreen } from '../screens/tierLists/CreateEditTierListScreen';
import { UserMenuScreen } from '../screens/profile/UserMenuScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { colors, semanticColors } from '../tokens/colors';
import type { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: semanticColors.background.primary },
});

function renderNavigationLayout({ children }: { children: ReactNode }) {
  return <View style={navigationStyles.root}>{children}</View>;
}

const accountScreenOptions = {
  presentation: 'card',
  animation: 'fade',
  // iOS supports this override; Android's native fade preset already uses 150 ms.
  animationDuration: 180,
  contentStyle: { backgroundColor: semanticColors.background.primary },
} satisfies NativeStackNavigationOptions;

const cineaTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    border: colors.border,
    card: colors.surface,
    notification: colors.secondary,
    primary: colors.secondary,
    text: colors.text,
  },
};

export function RootNavigator() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function initializeSession() {
      const { data: { session: initialSession } } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      setSession(initialSession);
      setLoading(false);
    }

    void initializeSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) {
        return;
      }

      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer theme={cineaTheme}>
      <Stack.Navigator
        layout={renderNavigationLayout}
        key={session ? 'app' : 'auth'}
        initialRouteName={session ? 'App' : 'Auth'}
        screenOptions={{
          headerShown: false,
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerTitleStyle: { color: colors.text, fontWeight: '600' },
          contentStyle: { backgroundColor: semanticColors.background.primary },
        }}
      >
        {session ? (
          <>
            <Stack.Screen name="App" component={AppNavigator} />
            <Stack.Screen name="AccountProfile" component={ProfileScreen} options={accountScreenOptions} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} options={accountScreenOptions} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={accountScreenOptions} />
            <Stack.Screen name="UserMenu" component={UserMenuScreen} options={{
              ...accountScreenOptions,
              gestureEnabled: true,
            }} />
          </>
        ) : (
          <Stack.Screen name="Auth" options={{ headerShown: false }}>
            {() => <AuthNavigator onLogin={() => undefined} />}
          </Stack.Screen>
        )}
        <Stack.Screen name="MovieDetails" component={MovieDetailsScreen} options={{ title: 'Filme' }} />
        <Stack.Screen name="Reviews" component={ReviewsScreen} options={{ title: 'Avaliacoes' }} />
        <Stack.Screen name="CurrentUserReviews" component={CurrentUserReviewsScreen} options={{ title: 'Minhas avaliacoes' }} />
        <Stack.Screen name="SelectMovieForReview" component={SelectMovieForReviewScreen} options={{ title: 'Escolher filme' }} />
        <Stack.Screen name="CreateReview" component={CreateReviewScreen} options={{ title: 'Nova avaliacao' }} />
        <Stack.Screen name="CreateEditTierList" component={CreateEditTierListScreen} options={{ title: 'Tier List' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
