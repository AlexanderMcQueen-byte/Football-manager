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
  planExpiresAt: string | null;
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
      try {
        const adminRes = await fetch(`${BASE}/api/admin/auth/me`, { credentials: "include" });
        const adminData = await adminRes.json().catch(() => ({}));
        if (adminRes.ok && adminData.role === "admin") {
          setRole("admin");
          setUser(null);
          return;
        }
      } catch (adminErr) {
        console.warn("Admin auth check failed:", adminErr);
        // Continue to user check
      }

      // Check user account session
      try {
        const userRes = await fetch(`${BASE}/api/users/me`, { credentials: "include" });
        if (userRes.ok) {
          const userData: UserAccount = await userRes.json();
          setUser(userData);
          setRole("user");
          return;
        } else if (userRes.status === 401) {
          // Explicitly not authenticated - this is expected
          setRole("viewer");
          setUser(null);
          return;
        }
      } catch (userErr) {
        console.warn("User auth check failed:", userErr);
      }
    } catch (err) {
      console.error("Session fetch error:", err);
    }

    // Default to viewer if all checks fail or error
    setRole("viewer");
    setUser(null);
  }

  useEffect(() => {
    let mounted = true;
    fetchMe()
      .catch((err) => {
        console.error("Initial session fetch failed:", err);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    
    return () => {
      mounted = false;
    };
  }, []);

  async function loginAdmin(username: string, password: string): Promise<boolean> {
    try {
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
    } catch (err) {
      console.error("Admin login error:", err);
      return false;
    }
  }

  async function loginUser(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
    try {
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
    } catch (err) {
      console.error("User login error:", err);
      return { ok: false, error: "Could not reach the server" };
    }
  }

  async function logout(): Promise<void> {
    try {
      if (role === "admin") {
        await fetch(`${BASE}/api/admin/auth/logout`, { method: "POST", credentials: "include" });
      } else if (role === "user") {
        await fetch(`${BASE}/api/users/logout`, { method: "POST", credentials: "include" });
      }
    } catch (err) {
      console.warn("Logout error:", err);
    } finally {
      // Always clear local state, even if server logout fails
      setRole("viewer");
      setUser(null);
    }
  }

  async function refreshUser() {
    try {
      await fetchMe();
    } catch (err) {
      console.error("User refresh error:", err);
      // On error, fall back to viewer
      setRole("viewer");
      setUser(null);
    }
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
