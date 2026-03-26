import React, { createContext, useContext, useEffect, useState } from "react";

type Role = "admin" | "viewer";

interface AuthState {
  role: Role;
  isAdmin: boolean;
  isLoading: boolean;
}

interface AuthActions {
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

type AuthContextValue = AuthState & AuthActions;

const AuthContext = createContext<AuthContextValue | null>(null);

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>("viewer");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE}/api/auth/me`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setRole(data.role ?? "viewer"))
      .catch(() => setRole("viewer"))
      .finally(() => setIsLoading(false));
  }, []);

  async function login(username: string, password: string): Promise<boolean> {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      const data = await res.json();
      setRole(data.role ?? "admin");
      return true;
    }
    return false;
  }

  async function logout(): Promise<void> {
    await fetch(`${BASE}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    setRole("viewer");
  }

  return (
    <AuthContext.Provider
      value={{ role, isAdmin: role === "admin", isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
