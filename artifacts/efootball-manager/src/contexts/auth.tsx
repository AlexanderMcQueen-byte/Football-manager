import React, { createContext, useContext, useEffect, useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export type Plan = "free" | "monthly" | "yearly" | "lifetime";

export interface UserAccount {
  id: number;
  email: string;
  displayName: string;
  plan: Plan;
  tournamentsCreated: number;
  planActivatedAt: string | null;
  createdAt: string;
}

type Role = "admin" | "user" | "viewer";

interface AuthState {
  role: Role;
  isAdmin: boolean;
  isLoggedIn: boolean;
  user: UserAccount | null;
  plan: Plan | null;
  isPaid: boolean;
  isLoading: boolean;
}

interface AuthActions {
  loginAdmin: (username: string, password: string) => Promise<boolean>;
  loginUser: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  registerUser: (email: string, password: string, displayName: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

type AuthContextValue = AuthState & AuthActions;

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>("viewer");
  const [user, setUser] = useState<UserAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchMe() {
    try {
      // Check admin session first
      const adminRes = await fetch(`${BASE}/api/admin/auth/me`, { credentials: "include" });
      const adminData = await adminRes.json();
      if (adminData.role === "admin") {
        setRole("admin");
        setUser(null);
        return;
      }
    } catch {}

    // Check user account session
    try {
      const userRes = await fetch(`${BASE}/api/users/me`, { credentials: "include" });
      if (userRes.ok) {
        const userData: UserAccount = await userRes.json();
        setUser(userData);
        setRole("user");
        return;
      }
    } catch {}

    setRole("viewer");
    setUser(null);
  }

  useEffect(() => {
    fetchMe().finally(() => setIsLoading(false));
  }, []);

  async function loginAdmin(username: string, password: string): Promise<boolean> {
    const res = await fetch(`${BASE}/api/admin/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      setRole("admin");
      setUser(null);
      return true;
    }
    return false;
  }

  async function loginUser(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
    const res = await fetch(`${BASE}/api/users/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      const data: UserAccount = await res.json();
      setUser(data);
      setRole("user");
      return { ok: true };
    }
    const err = await res.json().catch(() => ({}));
    return { ok: false, error: err.error ?? "Login failed" };
  }

  async function registerUser(email: string, password: string, displayName: string): Promise<{ ok: boolean; error?: string }> {
    const res = await fetch(`${BASE}/api/users/register`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, displayName }),
    });
    if (res.ok) {
      const data: UserAccount = await res.json();
      setUser(data);
      setRole("user");
      return { ok: true };
    }
    const err = await res.json().catch(() => ({}));
    return { ok: false, error: err.error ?? "Registration failed" };
  }

  async function logout(): Promise<void> {
    if (role === "admin") {
      await fetch(`${BASE}/api/admin/auth/logout`, { method: "POST", credentials: "include" });
    } else {
      await fetch(`${BASE}/api/users/logout`, { method: "POST", credentials: "include" });
    }
    setRole("viewer");
    setUser(null);
  }

  async function refreshUser() {
    await fetchMe();
  }

  const plan: Plan | null = role === "admin" ? null : (user?.plan ?? null);
  const isPaid = role === "admin" || (user?.plan !== "free" && user != null);

  return (
    <AuthContext.Provider
      value={{
        role,
        isAdmin: role === "admin",
        isLoggedIn: role === "admin" || role === "user",
        user,
        plan,
        isPaid,
        isLoading,
        loginAdmin,
        loginUser,
        registerUser,
        logout,
        refreshUser,
      }}
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
