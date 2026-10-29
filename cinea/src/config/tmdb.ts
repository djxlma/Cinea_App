export const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';
export const TMDB_LANGUAGE = 'pt-BR';

export const TMDB_IMAGE_SIZES = {
  poster: {
    small: 'w342',
    large: 'w500',
  },
  backdrop: {
    medium: 'w780',
    original: 'original',
  },
} as const;

type PosterSize = (typeof TMDB_IMAGE_SIZES.poster)[keyof typeof TMDB_IMAGE_SIZES.poster];
type BackdropSize = (typeof TMDB_IMAGE_SIZES.backdrop)[keyof typeof TMDB_IMAGE_SIZES.backdrop];

function getImageUrl(path: string | null | undefined, size: string): string | null {
  const normalizedPath = path?.trim().replace(/^\/+/, '');

  if (!normalizedPath) {
    return null;
  }

  return `${TMDB_IMAGE_BASE_URL}/${size}/${normalizedPath}`;
}

export function getTmdbPosterUrl(
  path: string | null | undefined,
  size: PosterSize = TMDB_IMAGE_SIZES.poster.large,
): string | null {
  return getImageUrl(path, size);
}

export function getTmdbBackdropUrl(
  path: string | null | undefined,
  size: BackdropSize = TMDB_IMAGE_SIZES.backdrop.medium,
): string | null {
  return getImageUrl(path, size);
}