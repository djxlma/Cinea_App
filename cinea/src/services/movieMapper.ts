import { getTmdbBackdropUrl, getTmdbPosterUrl } from '../config/tmdb';
import type { Movie } from '../types/movie';
import type { TmdbMovieDetails, TmdbMovieSummary } from '../types/tmdb';

type TmdbMovieFields = Pick<
  TmdbMovieSummary,
  | 'id'
  | 'title'
  | 'original_title'
  | 'overview'
  | 'poster_path'
  | 'backdrop_path'
  | 'release_date'
  | 'vote_average'
>;

function getYear(releaseDate: string): string {
  const match = releaseDate?.match(/^\d{4}/);
  return match?.[0] ?? '';
}

function mapCommonFields(movie: TmdbMovieFields, genreIds: number[]): Omit<Movie, 'genres' | 'runtime'> {
  return {
    id: String(movie.id),
    tmdbId: movie.id,
    title: movie.title,
    originalTitle: movie.original_title,
    overview: movie.overview,
    posterPath: movie.poster_path,
    backdropPath: movie.backdrop_path,
    posterUrl: getTmdbPosterUrl(movie.poster_path),
    backdropUrl: getTmdbBackdropUrl(movie.backdrop_path),
    releaseDate: movie.release_date,
    year: getYear(movie.release_date),
    voteAverage: movie.vote_average,
    genreIds,
  };
}

export function mapTmdbSummaryToMovie(movie: TmdbMovieSummary): Movie {
  return {
    ...mapCommonFields(movie, movie.genre_ids),
    genres: [],
  };
}

export function mapTmdbDetailsToMovie(movie: TmdbMovieDetails): Movie {
  const genres = movie.genres ?? [];
  const genreIds = genres.map((genre) => genre.id);

  return {
    ...mapCommonFields(movie, genreIds),
    genres: genres.map((genre) => genre.name).filter(Boolean),
    ...(movie.runtime === null ? {} : { runtime: movie.runtime }),
  };
}
