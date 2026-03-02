import { AuthSession, LoginPayload } from "./types";

const LOCAL_KEY = "ag_auth_local";
const SESSION_KEY = "ag_auth_session";

const parseSession = (raw: string | null): AuthSession | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed.token || !parsed.username) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const readStoredSession = (): AuthSession | null => {
  const sessionRaw = typeof window !== "undefined" ? sessionStorage.getItem(SESSION_KEY) : null;
  const localRaw = typeof window !== "undefined" ? localStorage.getItem(LOCAL_KEY) : null;

  return parseSession(sessionRaw) ?? parseSession(localRaw);
};

export const storeSession = (payload: LoginPayload): AuthSession => {
  const base: AuthSession = {
    token: payload.response.accessToken ?? payload.response.token ?? "",
    username: payload.response.username,
    remember: payload.remember
  };

  if (payload.remember) {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(base));
    sessionStorage.removeItem(SESSION_KEY);
  } else {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(base));
    localStorage.removeItem(LOCAL_KEY);
  }

  return base;
};

export const clearStoredSession = (): void => {
  localStorage.removeItem(LOCAL_KEY);
  sessionStorage.removeItem(SESSION_KEY);
};

