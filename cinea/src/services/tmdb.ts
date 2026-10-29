import {
  TMDB_API_BASE_URL,
  TMDB_LANGUAGE,
} from '../config/tmdb';
import type { Movie, MoviePage } from '../types/movie';
import type { TmdbMovieDetails, TmdbMovieSummary, TmdbPagedResponse } from '../types/tmdb';
import { mapTmdbDetailsToMovie, mapTmdbSummaryToMovie } from './movieMapper';

type RequestParams = Record<string, string | number | boolean>;

function buildQuery(params: RequestParams): string {
  return Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
}

function readErrorMessage(payload: unknown, token: string): string {
  let message = 'Unknown error';

  if (typeof payload === 'string' && payload.trim()) {
    message = payload.trim();
  } else if (typeof payload === 'object' && payload !== null && 'status_message' in payload) {
    const statusMessage = payload.status_message;
    if (typeof statusMessage === 'string' && statusMessage.trim()) {
      message = statusMessage.trim();
    }
  }

  return token ? message.split(token).join('[redacted]') : message;
}

async function requestTmdb<T>(path: string, params: RequestParams = {}, signal?: AbortSignal): Promise<T> {
  const token = process.env.EXPO_PUBLIC_TMDB_READ_TOKEN;

  if (!token?.trim()) {
    throw new Error('TMDB não configurado. Defina EXPO_PUBLIC_TMDB_READ_TOKEN.');
  }

  const query = buildQuery(params);
  const url = `${TMDB_API_BASE_URL}${path}${query ? `?${query}` : ''}`;
  const response = await fetch(url, {
    signal,
    headers: {
      Authorization: `Bearer ${token}`,
      accept: 'application/json',
    },
  });
  const body = await response.text();
  let payload: unknown = null;

  if (body) {
    try {
      payload = JSON.parse(body) as unknown;
    } catch {
      payload = body;
    }
  }

  if (!response.ok) {
    throw new Error(`TMDB request failed (${response.status}): ${readErrorMessage(payload, token)}`);
  }

  if (payload === null) {
    throw new Error(`TMDB request failed (${response.status}): Empty response`);
  }

  return payload as T;
}

function toMoviePage(response: TmdbPagedResponse<TmdbMovieSummary>): MoviePage {
  return {
    page: response.page,
    movies: response.results.map(mapTmdbSummaryToMovie),
    totalPages: response.total_pages,
    totalResults: response.total_results,
  };
}

export async function searchMovies(query: string, page = 1, signal?: AbortSignal): Promise<MoviePage> {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return { page, movies: [], totalPages: 0, totalResults: 0 };
  }

  const response = await requestTmdb<TmdbPagedResponse<TmdbMovieSummary>>('/search/movie', {
    query: normalizedQuery,
    page,
    language: TMDB_LANGUAGE,
    include_adult: false,
  }, signal);

  return toMoviePage(response);
}

export async function getPopularMovies(page = 1, signal?: AbortSignal): Promise<MoviePage> {
  const response = await requestTmdb<TmdbPagedResponse<TmdbMovieSummary>>('/movie/popular', {
    page,
    language: TMDB_LANGUAGE,
  }, signal);

  return toMoviePage(response);
}

export async function getNowPlayingMovies(page = 1, signal?: AbortSignal): Promise<MoviePage> {
  const response = await requestTmdb<TmdbPagedResponse<TmdbMovieSummary>>('/movie/now_playing', {
    page,
    language: TMDB_LANGUAGE,
  }, signal);

  return toMoviePage(response);
}

export async function getMovieDetails(tmdbId: number, signal?: AbortSignal): Promise<Movie> {
  const response = await requestTmdb<TmdbMovieDetails>(`/movie/${encodeURIComponent(String(tmdbId))}`, {
    language: TMDB_LANGUAGE,
  }, signal);

  return mapTmdbDetailsToMovie(response);
}
