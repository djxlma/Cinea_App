import { useEffect, useState } from 'react';
import { getMovieIdentityKey, resolveMovieById } from '../services/movieResolver';
import type { Movie } from '../types/movie';

// Persisted reviews render immediately; TMDB enrichment never blocks them.
export function useReviewMovies(reviews: { movie_id: string }[]) {
  const [movies, setMovies] = useState<Record<string, Movie>>({});
  useEffect(() => {
    let active = true;
    const ids = [...new Set(reviews.map((review) => getMovieIdentityKey(review.movie_id)))];
    let index = 0;
    async function worker() {
      while (active && index < ids.length) {
        const id = ids[index++];
        const movie = await resolveMovieById(id);
        if (active && movie) setMovies((previous) => ({ ...previous, [id]: movie }));
      }
    }
    void Promise.all(Array.from({ length: Math.min(4, ids.length) }, worker));
    return () => { active = false; };
  }, [reviews]);
  return movies;
}
