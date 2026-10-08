import { supabase } from '../lib/supabase';

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
  if (!movieId) {
    return [];
  }

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('movie_id', movieId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as ReviewRecord[];
}

export async function createReview(input: ReviewInput): Promise<ReviewRecord> {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error('Você precisa estar autenticado para publicar uma avaliação.');
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert([
      {
        user_id: userId,
        movie_id: input.movieId,
        movie_title: input.movieTitle,
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
