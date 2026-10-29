import { supabase } from '../lib/supabase';
import type { TierRank } from '../types/content';
import { prepareTierItems } from './tierListItems';

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
  id?: string;
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

  const existing = await getTierListItems(tierListId);
  const prepared = prepareTierItems(items, existing);
  const payload = prepared.map((item) => ({
    ...(item.id ? { id: item.id } : {}),
    tier_list_id: tierListId,
    movie_id: item.movieId,
    movie_title: item.movieTitle.trim(),
    tier: item.tier,
    position: item.position,
  }));
  const additions = payload.filter((item) => !item.id);
  const retained = payload.filter((item) => item.id);
  const retainedIds = new Set(retained.map((item) => item.id));
  const removedIds = existing.filter((item) => !retainedIds.has(item.id)).map((item) => item.id);
  const saved: TierListItemRecord[] = [];

  // No delete-all/reinsert: persist additions first, and remove only explicit omissions last.
  if (additions.length) {
    const { data, error } = await supabase.from('tier_list_items').insert(additions).select();
    if (error) throw new Error('Não foi possível adicionar os filmes. Os itens anteriores não foram removidos. Tente salvar novamente.');
    if (!data || data.length !== additions.length) throw new Error('Não foi possível confirmar os novos itens. Reabra a lista para conferir.');
    saved.push(...data as TierListItemRecord[]);
  }
  if (retained.length) {
    const { data, error } = await supabase.from('tier_list_items').upsert(retained, { onConflict: 'id' }).select();
    if (error || !data || data.length !== retained.length) throw new Error('Não foi possível atualizar todos os itens. Nenhum item antigo foi removido. Tente salvar novamente.');
    saved.push(...data as TierListItemRecord[]);
  }
  if (removedIds.length) {
    const { error } = await supabase.from('tier_list_items').delete().eq('tier_list_id', tierListId).in('id', removedIds);
    if (error) throw new Error('As alterações foram gravadas parcialmente, mas não foi possível remover todos os itens retirados. Tente salvar novamente.');
  }
  return saved.sort((a, b) => a.position - b.position);
}
