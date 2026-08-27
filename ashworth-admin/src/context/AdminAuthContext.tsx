"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ADMIN_ACCOUNT_STORAGE_KEY,
  ADMIN_TOKEN_STORAGE_KEY,
  adminCheckAuth,
  adminLogout as adminLogoutRequest,
} from "@/lib/api/adminClient";
import type { AdminAccount, PermissionAction, PermissionPage } from "@/types/admin";

interface AdminAuthContextValue {
  admin: AdminAccount | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, admin: AdminAccount) => void;
  logout: () => Promise<void>;
  hasPermission: (page: PermissionPage, action: PermissionAction) => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminAccount | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    setAdmin(null);
    setToken(null);
    window.localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(ADMIN_ACCOUNT_STORAGE_KEY);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const storedToken = window.localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      // Show the cached account immediately (avoids a blank shell flash), then
      // confirm it against the server.
      const cachedAccountRaw = window.localStorage.getItem(ADMIN_ACCOUNT_STORAGE_KEY);
      if (cachedAccountRaw) {
        try {
          setAdmin(JSON.parse(cachedAccountRaw));
          setToken(storedToken);
        } catch {
          // ignore malformed cache, fall through to server check
        }
      }

      try {
        const { admin: verifiedAdmin } = await adminCheckAuth();
        if (cancelled) return;
        setAdmin(verifiedAdmin);
        setToken(storedToken);
        window.localStorage.setItem(ADMIN_ACCOUNT_STORAGE_KEY, JSON.stringify(verifiedAdmin));
      } catch {
        if (cancelled) return;
        clearSession();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [clearSession]);

  const login = useCallback((newToken: string, newAdmin: AdminAccount) => {
    window.localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, newToken);
    window.localStorage.setItem(ADMIN_ACCOUNT_STORAGE_KEY, JSON.stringify(newAdmin));
    setToken(newToken);
    setAdmin(newAdmin);
  }, []);

  const logout = useCallback(async () => {
    try {
      await adminLogoutRequest();
    } catch {
      // Clear locally regardless of API result — a failed blacklist call
      // shouldn't trap the admin in a logged-in UI.
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const hasPermission = useCallback(
    (page: PermissionPage, action: PermissionAction) => {
      if (!admin) return false;
      if (admin.type === "admin") return true; // super admin — unrestricted

      const pagePermissions = admin.roleId?.permissions?.[page] as
        | Partial<Record<PermissionAction, boolean>>
        | undefined;
      return Boolean(pagePermissions?.[action]);
    },
    [admin]
  );

  const value = useMemo(
    () => ({
      admin,
      token,
      isLoading,
      isAuthenticated: Boolean(admin && token),
      login,
      logout,
      hasPermission,
    }),
    [admin, token, isLoading, login, logout, hasPermission]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  return ctx;
}
