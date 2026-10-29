import { supabase } from '../lib/supabase';

let logoutRequest: Promise<void> | null = null;

export function signOutCurrentUser(): Promise<void> {
  if (logoutRequest) return logoutRequest;
  logoutRequest = (async () => {
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) throw error;
    } catch {
      throw new Error('Não foi possível sair da conta. Confira sua conexão e tente novamente.');
    }
  })().finally(() => { logoutRequest = null; });
  return logoutRequest;
}

export async function changeCurrentPassword(password: string): Promise<void> {
  try {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  } catch (error) {
    const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : null;
    if (code === 'same_password') throw new Error('Escolha uma senha diferente da atual.');
    if (code === 'weak_password') throw new Error('Esta senha não atende aos requisitos de segurança. Escolha uma senha mais forte.');
    if (code === 'reauthentication_needed' || code === 'reauthentication_not_valid') {
      throw new Error('É necessário autenticar novamente. Saia da conta, entre novamente e repita a alteração.');
    }
    throw new Error('Não foi possível alterar a senha. Confira sua conexão e se a sessão continua ativa.');
  }
}
