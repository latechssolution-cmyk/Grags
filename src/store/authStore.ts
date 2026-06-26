import { useState, useEffect, useCallback } from "react";

export interface SessionUser {
  username: string;
  email?: string;
}

let session: SessionUser | null = null;
const listeners = new Set<() => void>();
function notify() { listeners.forEach((l) => l()); }

export function useAuth() {
  const [user, setUser] = useState<SessionUser | null>(session);

  useEffect(() => {
    const handler = () => setUser(session);
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, []);

  const login = useCallback((u: SessionUser) => {
    session = u;
    setUser(u);
    notify();
  }, []);

  const logout = useCallback(() => {
    session = null;
    setUser(null);
    notify();
  }, []);

  return { user, login, logout };
}
