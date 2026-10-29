import { useEffect, useRef, useState } from 'react';
import { signOutCurrentUser } from '../services/account';

export function useAccountLogout() {
  const busy = useRef(false);
  const active = useRef(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  useEffect(() => {
    active.current = true;
    return () => { active.current = false; };
  }, []);
  async function logout() {
    if (busy.current) return;
    busy.current = true;
    setIsLoggingOut(true);
    setLogoutError('');
    try {
      await signOutCurrentUser();
      // RootNavigator responds to SIGNED_OUT; never fake navigation on failure.
    } catch (error) {
      if (active.current) setLogoutError(error instanceof Error ? error.message : 'Não foi possível sair da conta.');
    } finally {
      busy.current = false;
      if (active.current) setIsLoggingOut(false);
    }
  }
  return { logout, isLoggingOut, logoutError };
}
