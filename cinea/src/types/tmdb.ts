export type TmdbMovieSummary = {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  adult: boolean;
};

export type TmdbGenre = {
  id: number;
  name: string;
};

export type TmdbMovieDetails = Omit<TmdbMovieSummary, 'genre_ids' | 'popularity' | 'adult'> & {
  runtime: number | null;
  genres: TmdbGenre[];
};

export type TmdbPagedResponse<T> = {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
};