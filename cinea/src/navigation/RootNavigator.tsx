import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
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
import { colors } from '../tokens/colors';
import type { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

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
        key={session ? 'app' : 'auth'}
        initialRouteName={session ? 'App' : 'Auth'}
        screenOptions={{
          headerShown: false,
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerTitleStyle: { color: colors.text, fontWeight: '600' },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        {session ? (
          <>
            <Stack.Screen name="App" component={AppNavigator} />
            <Stack.Screen name="UserMenu" options={{
              presentation: 'transparentModal',
              animation: 'fade',
              contentStyle: { backgroundColor: 'transparent' },
              gestureEnabled: true,
            }}>
              {(props) => <UserMenuScreen {...props} onLogout={() => void supabase.auth.signOut()} />}
            </Stack.Screen>
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