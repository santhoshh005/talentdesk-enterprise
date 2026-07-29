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
  rememberMe: boolean;
  setRememberMe: (val: boolean) => void;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationName?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const isClient = typeof window !== "undefined";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(isClient);
  const [rememberMe, setRememberMe] = useState<boolean>(() => {
    if (!isClient) return true;
    return localStorage.getItem("rememberMe") !== "false";
  });

  useEffect(() => {
    if (!isClient) return;
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    const savedUser = localStorage.getItem("user") || sessionStorage.getItem("user");

    let hasCachedUser = false;
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        hasCachedUser = true;
      } catch (e) {
        console.error("Failed to parse saved user", e);
      }
    }

    if (!token) {
      setIsLoading(false);
      return;
    }

    if (hasCachedUser) {
      setIsLoading(false);
    }

    api
      .me()
      .then((res: any) => {
        if (res.data?.user) {
          setUser(res.data.user);
          const storage =
            localStorage.getItem("rememberMe") === "false" ? sessionStorage : localStorage;
          storage.setItem("user", JSON.stringify(res.data.user));
        }
      })
      .catch(() => {
        localStorage.removeItem("accessToken");
        sessionStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        sessionStorage.removeItem("user");
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string, remember: boolean = true) => {
    const res = await api.login({ email, password });
    if (res.data?.accessToken) {
      setRememberMe(remember);
      const storage = remember ? localStorage : sessionStorage;
      localStorage.setItem("rememberMe", remember ? "true" : "false");

      storage.setItem("accessToken", res.data.accessToken);
      if (res.data.refreshToken) {
        storage.setItem("refreshToken", res.data.refreshToken);
      }
      if (res.data.user) {
        storage.setItem("user", JSON.stringify(res.data.user));
        setUser(res.data.user);
      }
    }
  }, []);

  const register = useCallback(
    async (data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      organizationName?: string;
    }) => {
      const res = await api.register(data);
      if (res.data?.accessToken) {
        localStorage.setItem("accessToken", res.data.accessToken);
        if (res.data.refreshToken) {
          localStorage.setItem("refreshToken", res.data.refreshToken);
        }
        if (res.data.user) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
          setUser(res.data.user);
        }
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      /* ignore */
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        rememberMe,
        setRememberMe,
        login,
        register,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
