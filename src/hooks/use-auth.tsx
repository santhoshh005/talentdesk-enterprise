import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { api } from "@/lib/api-client";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  organizationId: string;
  organization?: { name: string };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string; organizationName?: string }) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const isClient = typeof window !== "undefined";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(isClient);

  useEffect(() => {
    if (!isClient) return;
    const token = localStorage.getItem("accessToken");
    if (!token || token === "demo-jwt-token") {
      setIsLoading(false);
      return;
    }
    api.me()
      .then((res: any) => {
        if (res.data?.user) {
          setUser(res.data.user);
        }
      })
      .catch(() => {
        localStorage.removeItem("accessToken");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login({ email, password });
    if (res.data?.accessToken) {
      localStorage.setItem("accessToken", res.data.accessToken);
      if (res.data.refreshToken) {
        localStorage.setItem("refreshToken", res.data.refreshToken);
      }
      setUser(res.data.user);
    }
  }, []);

  const register = useCallback(async (data: { email: string; password: string; firstName: string; lastName: string; organizationName?: string }) => {
    const res = await api.register(data);
    if (res.data?.accessToken) {
      localStorage.setItem("accessToken", res.data.accessToken);
      if (res.data.refreshToken) {
        localStorage.setItem("refreshToken", res.data.refreshToken);
      }
      setUser(res.data.user);
    }
  }, []);

  const logout = useCallback(async () => {
    try { await api.logout(); } catch { /* ignore */ }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // Return a safe default during SSR or when outside AuthProvider
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: async () => {},
      register: async () => {},
      logout: async () => {},
      setUser: () => {},
    } as AuthContextType;
  }
  return ctx;
}
