// Validated on 2026-10-29 through TMDB title search and movie details (pt-BR).
// Compatibility for navigation and review queries; persisted CP5 IDs are unchanged.
export const legacyMovies = [
  { slug: 'dune-2', title: 'Duna: Parte Dois', year: 2024, tmdbId: 693134 },
  { slug: 'oppenheimer', title: 'Oppenheimer', year: 2023, tmdbId: 872585 },
  { slug: 'spirited-away', title: 'A Viagem de Chihiro', year: 2001, tmdbId: 129 },
  { slug: 'parasite', title: 'Parasita', year: 2019, tmdbId: 496243 },
] as const;

export function resolveMovieTmdbId(movieId?: string, movieTitle?: string): number | null {
  if (movieId && /^\d+$/.test(movieId) && Number.isSafeInteger(Number(movieId)) && Number(movieId) > 0) {
    return Number(movieId);
  }
  return legacyMovies.find((movie) => movieId ? movie.slug === movieId : movie.title === movieTitle)?.tmdbId ?? null;
}

export function getLegacySlugForTmdbId(tmdbId: number): string | null {
  return legacyMovies.find((movie) => movie.tmdbId === tmdbId)?.slug ?? null;
}
