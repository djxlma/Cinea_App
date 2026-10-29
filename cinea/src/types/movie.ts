export type Movie = {
  /** Existing local IDs remain slugs; TMDB-backed IDs use String(tmdbId). */
  id: string;
  tmdbId: number;
  title: string;
  originalTitle?: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseDate: string;
  year: string;
  voteAverage: number;
  genreIds: number[];
  genres: string[];
  runtime?: number;
};

export type MoviePage = {
  page: number;
  movies: Movie[];
  totalPages: number;
  totalResults: number;
};