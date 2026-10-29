import { useCallback, useEffect, useRef, useState } from 'react';
import type { Movie, MoviePage } from '../types/movie';

type Loader = (page: number, signal: AbortSignal) => Promise<MoviePage>;
type PageState = {
  movies: Movie[];
  page: number;
  totalPages: number;
  isLoadingInitial: boolean;
  isLoadingMore: boolean;
  error: boolean;
};

export function useMoviePages(loader: Loader, firstPage = 1, debounceMs = 0) {
  const [state, setState] = useState<PageState>({ movies: [], page: firstPage - 1, totalPages: 0, isLoadingInitial: true, isLoadingMore: false, error: false });
  const session = useRef<{
    controller: AbortController;
    busy: boolean;
    page: number;
    totalPages: number;
    failed: boolean;
  } | null>(null);

  const requestPage = useCallback(async (page: number, current: NonNullable<typeof session.current>) => {
    if (current.busy || current.controller.signal.aborted) return;
    current.busy = true;
    current.failed = false;
    const initial = page === firstPage;
    setState((previous) => ({ ...previous, error: false, isLoadingInitial: initial, isLoadingMore: !initial }));
    try {
      const result = await loader(page, current.controller.signal);
      if (session.current !== current || current.controller.signal.aborted) return;
      current.page = page;
      // TMDB endpoints accept at most 500 pages even when total_pages is larger.
      current.totalPages = Math.min(result.totalPages, 500);
      setState((previous) => {
        const seen = new Set<string>();
        const movies = [...(initial ? [] : previous.movies), ...result.movies].filter((movie) => {
          if (seen.has(movie.id)) return false;
          seen.add(movie.id);
          return true;
        });
        return { movies, page, totalPages: current.totalPages, isLoadingInitial: false, isLoadingMore: false, error: false };
      });
    } catch {
      if (session.current !== current || current.controller.signal.aborted) return;
      current.failed = true;
      setState((previous) => ({ ...previous, error: true, isLoadingInitial: false, isLoadingMore: false }));
    } finally {
      current.busy = false;
    }
  }, [loader, firstPage]);

  useEffect(() => {
    const current = { controller: new AbortController(), busy: false, page: firstPage - 1, totalPages: 0, failed: false };
    session.current = current;
    setState({ movies: [], page: firstPage - 1, totalPages: 0, isLoadingInitial: true, isLoadingMore: false, error: false });
    const timer = setTimeout(() => { void requestPage(firstPage, current); }, debounceMs);
    return () => {
      clearTimeout(timer);
      current.controller.abort();
      if (session.current === current) session.current = null;
    };
  }, [firstPage, debounceMs, requestPage]);

  const loadMore = useCallback(() => {
    const current = session.current;
    if (!current || current.failed || current.page < firstPage || current.page >= current.totalPages) return;
    void requestPage(current.page + 1, current);
  }, [firstPage, requestPage]);

  const retry = useCallback(() => {
    const current = session.current;
    if (current?.failed) void requestPage(current.page + 1, current);
  }, [requestPage]);

  return { ...state, loadMore, retry };
}
