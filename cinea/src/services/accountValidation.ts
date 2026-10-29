export type ProfileForm = { name: string; username: string; bio: string };

export function validateProfileForm(form: ProfileForm, originalUsername: string | null) {
  const name = form.name.trim();
  const enteredUsername = form.username.trim();
  const unchanged = enteredUsername === (originalUsername ?? '').trim();
  const username = unchanged ? enteredUsername : enteredUsername.toLowerCase();
  const bio = form.bio.trim();
  if (!name || name.length > 60) return { error: 'Informe um nome de até 60 caracteres.' };
  if (!username || (!unchanged && !/^[a-z0-9._]{3,30}$/.test(username))) {
    return { error: 'Use um username de 3 a 30 caracteres: letras, números, ponto ou underscore.' };
  }
  if (bio.length > 160) return { error: 'A bio deve ter no máximo 160 caracteres.' };
  return { value: { display_name: name, username, bio: bio || null } };
}

export function profileSaveError(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
    return 'Este nome de usuário já está em uso.';
  }
  return 'Não foi possível salvar o perfil. Confira sua conexão e tente novamente.';
}

export function validatePassword(password: string, confirmation: string): string | null {
  if (password.length < 8 || !password.trim()) return 'A nova senha deve ter pelo menos 8 caracteres.';
  if (password !== confirmation) return 'As senhas não coincidem.';
  return null;
}
