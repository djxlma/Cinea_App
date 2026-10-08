import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { SearchScreen } from '../screens/movies/SearchScreen';
import { TierListsScreen } from '../screens/tierLists/TierListsScreen';
import { colors } from '../tokens/colors';
import type { AppTabParamList } from '../types/navigation';

const Tabs = createBottomTabNavigator<AppTabParamList>();

export function AppNavigator() {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text, fontWeight: '600' },
        sceneStyle: { backgroundColor: colors.background },
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          display: 'none',
        },
      }}
    >
      <Tabs.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio' }} />
      <Tabs.Screen name="Search" component={SearchScreen} options={{ title: 'Pesquisar' }} />
      <Tabs.Screen name="TierLists" component={TierListsScreen} options={{ title: 'Tier Lists' }} />
      <Tabs.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </Tabs.Navigator>
  );
}