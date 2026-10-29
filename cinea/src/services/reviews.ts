import { supabase } from '../lib/supabase';
import { getEquivalentMovieIds, resolveTmdbId } from './movieResolver';

export type ReviewRecord = {
  id: string;
  user_id: string;
  movie_id: string;
  movie_title: string;
  rating: number;
  content: string;
  created_at: string;
};

export type ReviewInput = {
  movieId: string;
  movieTitle: string;
  rating: number;
  content: string;
};

export type ReviewUpdateInput = {
  rating?: number;
  content?: string;
};

async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  return data.user.id;
}

export async function getReviewsByMovie(movieId: string): Promise<ReviewRecord[]> {
  return getReviewsByMovieIds([movieId]);
}

export function deduplicateReviews(reviews: ReviewRecord[]): ReviewRecord[] {
  return [...new Map(reviews.map((review) => [review.id, review])).values()]
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
}

export async function getReviewsByMovieIds(movieIds: string[]): Promise<ReviewRecord[]> {
  const ids = [...new Set(movieIds.flatMap(getEquivalentMovieIds))];
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .in('movie_id', ids)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return deduplicateReviews((data ?? []) as ReviewRecord[]);
}

export async function createReview(input: ReviewInput): Promise<ReviewRecord> {
  const tmdbId = resolveTmdbId(input.movieId);
  if (tmdbId === null || !input.movieTitle.trim()) {
    throw new Error('Filme inválido para avaliação.');
  }
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error('Você precisa estar autenticado para publicar uma avaliação.');
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert([
      {
        user_id: userId,
        movie_id: String(tmdbId),
        movie_title: input.movieTitle.trim(),
        rating: input.rating,
        content: input.content,
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as ReviewRecord;
}

export async function updateReview(reviewId: string, input: ReviewUpdateInput): Promise<ReviewRecord> {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error('Você precisa estar autenticado para editar esta avaliação.');
  }

  const { data, error } = await supabase
    .from('reviews')
    .update({
      rating: input.rating,
      content: input.content,
    })
    .eq('id', reviewId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as ReviewRecord;
}

export async function deleteReview(reviewId: string): Promise<void> {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error('Você precisa estar autenticado para remover esta avaliação.');
  }

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId)
    .eq('user_id', userId);

  if (error) {
    throw error;
  }
}

export async function getCurrentUserReviews(): Promise<ReviewRecord[]> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as ReviewRecord[];
}
