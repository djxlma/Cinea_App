import { getMovieIdentityKey, resolveTmdbId } from './movieResolver';
import type { TierListItemInput, TierListItemRecord } from './tierLists';
import type { TierRank } from '../types/content';

export const tierRanks: TierRank[] = ['S', 'A', 'B', 'C', 'D'];

export function containsTierMovie(items: { movieId: string }[], movieId: string): boolean {
  return items.some((item) => getMovieIdentityKey(item.movieId) === getMovieIdentityKey(movieId));
}

export function prepareTierItems(items: TierListItemInput[], existing: TierListItemRecord[]) {
  const claimed = new Set<string>();
  const identities = new Map<string, boolean>();
  return [...items].sort((a, b) => tierRanks.indexOf(a.tier) - tierRanks.indexOf(b.tier) || a.position - b.position)
    .map((item, position) => {
      if (!tierRanks.includes(item.tier) || !Number.isInteger(item.position) || item.position < 0 || !item.movieTitle.trim()) {
        throw new Error('Itens inválidos. Confira os filmes e os tiers antes de salvar.');
      }
      const key = getMovieIdentityKey(item.movieId);
      // Reuse an insertion from an earlier partial save when the user retries.
      const previous = item.id ? existing.find((entry) => entry.id === item.id)
        : existing.find((entry) => !claimed.has(entry.id) && getMovieIdentityKey(entry.movie_id) === key);
      if (item.id && !previous) throw new Error('A lista foi alterada. Reabra o editor antes de salvar.');
      if (previous && (claimed.has(previous.id) || getMovieIdentityKey(previous.movie_id) !== key)) {
        throw new Error('Item inválido nesta Tier List.');
      }
      // Keep pre-existing duplicates intact; never introduce a new duplicate.
      if (identities.has(key) && (!previous || !identities.get(key))) throw new Error('Este filme já está na Tier List.');
      identities.set(key, Boolean(previous));
      if (previous) claimed.add(previous.id);
      const tmdbId = resolveTmdbId(item.movieId);
      if (!previous && tmdbId === null) throw new Error('Filme inválido para adicionar à Tier List.');
      return { ...item, id: previous?.id, movieId: previous?.movie_id ?? String(tmdbId), position };
    });
}
