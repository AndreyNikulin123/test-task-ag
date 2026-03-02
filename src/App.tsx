import React, { useEffect, useState } from "react";
import { AuthView } from "./auth/AuthView";
import { ProductsView } from "./products/ProductsView";
import { AuthSession, LoginPayload } from "./types";
import { readStoredSession, storeSession, clearStoredSession } from "./storage";

export const App: React.FC = () => {
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    const existing = readStoredSession();
    if (existing) {
      setSession(existing);
    }
  }, []);

  useEffect(() => {
    if (!session) {
      document.body.className = "auth-page";
    } else {
      document.body.className = "products-page";
    }
  }, [session]);

  const handleLoginSuccess = (payload: LoginPayload) => {
    const stored = storeSession(payload);
    setSession(stored);
  };

  const handleLogout = () => {
    clearStoredSession();
    setSession(null);
  };

  if (!session) {
    return <AuthView onLoginSuccess={handleLoginSuccess} />;
  }

  return <ProductsView token={session.token} onLogout={handleLogout} />;
};

