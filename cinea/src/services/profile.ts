import type { ImagePickerAsset } from 'expo-image-picker';
import { supabase } from '../lib/supabase';

export type ProfileRecord = {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type ProfileUpdateInput = {
  username?: string | null;
  display_name?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
};

async function getCurrentAuthUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    throw new Error('Você precisa estar autenticado para acessar o perfil.');
  }

  return data.user;
}

export async function getCurrentProfile(): Promise<ProfileRecord | null> {
  const user = await getCurrentAuthUser();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data ?? null) as ProfileRecord | null;
}

export async function getSignedAvatarUrl(avatarUrl?: string | null): Promise<string | null> {
  if (!avatarUrl) {
    return null;
  }

  if (/^https?:\/\//i.test(avatarUrl)) {
    return avatarUrl;
  }

  const { data, error } = await supabase.storage
    .from('avatars')
    .createSignedUrl(avatarUrl, 60 * 60);

  if (error || !data?.signedUrl) {
    return null;
  }

  return data.signedUrl;
}

export async function getCurrentSignedAvatarUri(): Promise<string | null> {
  const profile = await getCurrentProfile();
  return getSignedAvatarUrl(profile?.avatar_url ?? null);
}

export async function uploadCurrentUserAvatar(file: ImagePickerAsset): Promise<string> {
  const user = await getCurrentAuthUser();
  const path = `${user.id}/avatar.jpg`;

  try {
    if (!file.uri) {
      throw new Error('URI da imagem ausente.');
    }

    const response = await fetch(file.uri);

    if (!response.ok) {
      const responseError = new Error(`Falha ao carregar imagem para upload (${response.status}).`);
      (responseError as Error & { status?: number }).status = response.status;
      throw responseError;
    }

    const arrayBuffer = await response.arrayBuffer();
    const fileContent = new Uint8Array(arrayBuffer);

    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, fileContent, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.mimeType ?? 'image/jpeg',
      });

    if (error) {
      throw error;
    }

    return path;
  } catch (error) {
    const typedError = error as Error & { status?: number; statusCode?: number };

    if (__DEV__) {
      console.error('[CINEA][avatarUpload]', {
        etapa: 'upload-avatar',
        message: typedError.message,
        status: typedError.status,
        statusCode: typedError.statusCode,
      });
    }

    throw error;
  }
}

export async function updateCurrentProfile(input: ProfileUpdateInput): Promise<ProfileRecord> {
  const user = await getCurrentAuthUser();

  const nextValues: Record<string, string | null> = {};

  if (input.username !== undefined) {
    const normalizedUsername = input.username?.trim();
    nextValues.username = normalizedUsername ? normalizedUsername : null;
  }

  if (input.display_name !== undefined) {
    const normalizedDisplayName = input.display_name?.trim();
    nextValues.display_name = normalizedDisplayName ? normalizedDisplayName : null;
  }

  if (input.bio !== undefined) {
    const normalizedBio = input.bio?.trim();
    nextValues.bio = normalizedBio ? normalizedBio : null;
  }

  if (input.avatar_url !== undefined) {
    nextValues.avatar_url = input.avatar_url?.trim() || null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(nextValues)
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as ProfileRecord;
}
