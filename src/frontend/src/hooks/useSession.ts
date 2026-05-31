import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "wanderassist-session";
const SESSION_CHANGED_EVENT = "wanderassist-session-changed";

export interface Session {
  userId: string;
  userName: string;
  userEmail: string;
  loggedIn: boolean;
}

function loadSession(): Session | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as Session;
  } catch {
    // ignore
  }
  return null;
}

function saveSession(session: Session | null): void {
  try {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    // Broadcast to all other useSession instances in the same tab
    window.dispatchEvent(new CustomEvent(SESSION_CHANGED_EVENT));
  } catch {
    // ignore
  }
}

export function useSession() {
  const [session, setSession] = useState<Session | null>(loadSession);

  // Listen for session changes broadcast from other useSession instances
  useEffect(() => {
    function onSessionChanged() {
      setSession(loadSession());
    }
    window.addEventListener(SESSION_CHANGED_EVENT, onSessionChanged);
    return () =>
      window.removeEventListener(SESSION_CHANGED_EVENT, onSessionChanged);
  }, []);

  const login = useCallback(
    (userId: string, userName: string, userEmail: string) => {
      const newSession: Session = {
        userId,
        userName,
        userEmail,
        loggedIn: true,
      };
      setSession(newSession);
      saveSession(newSession);
    },
    [],
  );

  const logout = useCallback(() => {
    setSession(null);
    saveSession(null);
  }, []);

  const isLoggedIn = session?.loggedIn === true;

  return { session, login, logout, isLoggedIn };
}
