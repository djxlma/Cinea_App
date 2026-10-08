import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppTabParamList = {
  Home: undefined;
  Search: undefined;
  TierLists: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  App: NavigatorScreenParams<AppTabParamList> | undefined;
  UserMenu: undefined;
  MovieDetails: { movieTitle: string };
  Reviews: { movieTitle: string };
  CurrentUserReviews: undefined;
  SelectMovieForReview: undefined;
  CreateReview: { movieTitle: string };
  CreateEditTierList: { tierListId?: string };
};

export type AuthScreenProps<RouteName extends keyof AuthStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<AuthStackParamList, RouteName>,
    NativeStackScreenProps<RootStackParamList>
  >;

export type AppTabScreenProps<RouteName extends keyof AppTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<AppTabParamList, RouteName>,
    NativeStackScreenProps<RootStackParamList>
  >;

export type RootScreenProps<RouteName extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, RouteName>;