import { supabase } from '../lib/supabase';
import type { TierRank } from '../types/content';

export type TierListRecord = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type TierListItemRecord = {
  id: string;
  tier_list_id: string;
  movie_id: string;
  movie_title: string;
  tier: TierRank;
  position: number;
  created_at?: string;
};

export type TierListInput = {
  title: string;
  description?: string | null;
};

export type TierListItemInput = {
  movieId: string;
  movieTitle: string;
  tier: TierRank;
  position: number;
};

async function getCurrentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    throw new Error('Você precisa estar autenticado para acessar esta Tier List.');
  }

  return data.user.id;
}

export async function getCurrentUserTierLists(): Promise<TierListRecord[]> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('tier_lists')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as TierListRecord[];
}

export async function getTierListById(id: string): Promise<TierListRecord | null> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('tier_lists')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data ?? null) as TierListRecord | null;
}

export async function createTierList(input: TierListInput): Promise<TierListRecord> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('tier_lists')
    .insert([
      {
        user_id: userId,
        title: input.title.trim(),
        description: input.description ?? null,
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as TierListRecord;
}

export async function updateTierList(id: string, input: TierListInput): Promise<TierListRecord> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('tier_lists')
    .update({
      title: input.title.trim(),
      description: input.description ?? null,
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as TierListRecord;
}

export async function deleteTierList(id: string): Promise<void> {
  const userId = await getCurrentUserId();

  const { error } = await supabase
    .from('tier_lists')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    throw error;
  }
}

export async function getTierListItems(tierListId: string): Promise<TierListItemRecord[]> {
  if (!tierListId) {
    return [];
  }

  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('tier_list_items')
    .select('*')
    .eq('tier_list_id', tierListId)
    .order('position', { ascending: true });

  if (error) {
    throw error;
  }

  const items = (data ?? []) as TierListItemRecord[];

  if (!items.length) {
    return [];
  }

  const { data: ownerData, error: ownerError } = await supabase
    .from('tier_lists')
    .select('id')
    .eq('id', tierListId)
    .eq('user_id', userId)
    .maybeSingle();

  if (ownerError) {
    throw ownerError;
  }

  if (!ownerData) {
    throw new Error('Você não tem permissão para acessar os itens desta Tier List.');
  }

  return items;
}

export async function saveTierListItems(tierListId: string, items: TierListItemInput[]): Promise<TierListItemRecord[]> {
  if (!tierListId) {
    throw new Error('Tier List inválida para salvar os itens.');
  }

  const userId = await getCurrentUserId();

  const { data: ownerData, error: ownerError } = await supabase
    .from('tier_lists')
    .select('id')
    .eq('id', tierListId)
    .eq('user_id', userId)
    .maybeSingle();

  if (ownerError) {
    throw ownerError;
  }

  if (!ownerData) {
    throw new Error('Você não tem permissão para alterar esta Tier List.');
  }

  const { error: deleteError } = await supabase
    .from('tier_list_items')
    .delete()
    .eq('tier_list_id', tierListId);

  if (deleteError) {
    throw deleteError;
  }

  if (!items.length) {
    return [];
  }

  const payload = items
    .map((item) => ({
      tier_list_id: tierListId,
      movie_id: item.movieId,
      movie_title: item.movieTitle,
      tier: item.tier,
      position: item.position,
    }))
    .sort((a, b) => a.position - b.position);

  const { data, error } = await supabase
    .from('tier_list_items')
    .insert(payload)
    .select();

  if (error) {
    throw error;
  }

  return (data ?? []) as TierListItemRecord[];
}
