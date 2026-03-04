import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { queryClient } from "@/lib/queryClient";

export type User = {
  id: number;
  name: string;
  username: string;
  isAdmin: boolean;
  guardianEmail: string | null;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (name: string, username: string, password: string) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Login failed");
    }
    const data = await res.json();
    setUser(data.user);
  };

  const register = async (
    name: string,
    username: string,
    password: string
  ) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, username, password }),
      credentials: "include",
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Registration failed");
    }
    const data = await res.json();
    setUser(data.user);
  };

  const googleLogin = async (credential: string) => {
    const res = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential }),
      credentials: "include",
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Google login failed");
    }
    const data = await res.json();
    setUser(data.user);
  };

  const logout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    queryClient.clear();
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin: user?.isAdmin ?? false, login, register, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
