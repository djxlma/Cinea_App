import { getLegacySlugForTmdbId, resolveMovieTmdbId } from '../data/legacyMovieTmdbMap';
import type { Movie } from '../types/movie';
import { getMovieDetails } from './tmdb';

export function resolveTmdbId(movieId: string): number | null {
  return resolveMovieTmdbId(movieId);
}

export function getMovieIdentityKey(movieId: string): string {
  const id = resolveTmdbId(movieId);
  return id === null ? movieId : String(id);
}

export function getEquivalentMovieIds(movieId: string): string[] {
  const id = resolveTmdbId(movieId);
  if (id === null) return [];
  const slug = getLegacySlugForTmdbId(id);
  return slug ? [String(id), slug] : [String(id)];
}

const cache = new Map<number, { movie: Movie; expires: number }>();
const pending = new Map<number, Promise<Movie | null>>();

export async function resolveMovieById(movieId: string): Promise<Movie | null> {
  const id = resolveTmdbId(movieId);
  if (id === null) return null;
  const cached = cache.get(id);
  if (cached && cached.expires > Date.now()) return cached.movie;
  const existing = pending.get(id);
  if (existing) return existing;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  const request = getMovieDetails(id, controller.signal)
    .then((movie) => {
      if (cache.size >= 200) cache.delete(cache.keys().next().value!);
      cache.set(id, { movie, expires: Date.now() + 5 * 60 * 1000 });
      return movie;
    })
    .catch(() => null)
    .finally(() => {
      clearTimeout(timeout);
      pending.delete(id);
    });
  pending.set(id, request);
  return request;
}

type MovieReference = { movie_id: string; movie_title: string };
export type ReviewedMovieCard = { id: string; title: string; posterUrl: string | null };

export function getReviewedMovieCards(reviews: MovieReference[], movies: Record<string, Movie>): ReviewedMovieCard[] {
  const seen = new Set<string>();
  return reviews.flatMap((review) => {
    const key = getMovieIdentityKey(review.movie_id);
    if (seen.has(key)) return [];
    seen.add(key);
    const movie = movies[key];
    return [{ id: movie?.id ?? review.movie_id, title: movie?.title?.trim() || review.movie_title || 'Filme', posterUrl: movie?.posterUrl ?? null }];
  });
}
