import type { ImageSourcePropType } from 'react-native';

export type DemoMovie = {
  id: string;
  title: string;
  synopsis: string;
  year: number;
  duration: number;
  genres: string[];
  rating: number;
  posterSource?: ImageSourcePropType;
  posterUrl?: string;
  posterColor: string;
  streamingServices: string[];
};

export type TierRank = 'S' | 'A' | 'B' | 'C' | 'D';

export type DemoReview = {
  id: string;
  movieId: string;
  authorId: string;
  rating: number;
  text: string;
  createdAt: string;
};