"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext<any>(null);

const isTokenExpired = (token: string) => {
  try {
    const decoded: any = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const logout = () => {
    localStorage.removeItem("directus_token");
    setToken(null);
    router.push("/login");
  };

  // Logic kiểm tra Auth
  useEffect(() => {
    const storedToken = localStorage.getItem("directus_token");

    // 1. Kiểm tra hết hạn
    if (storedToken && isTokenExpired(storedToken)) {
      logout();
      setLoading(false);
      return;
    }

    setToken(storedToken);

    // 2. Private Route Logic
    if (!storedToken && pathname !== "/login") {
      const callback = encodeURIComponent(pathname);
      router.push(`/login?callbackUrl=${callback}`);
    } else if (storedToken && pathname === "/login") {
      router.push("/userinfo");
    }

    setLoading(false);
  }, [pathname]);

  // Logic Đồng bộ tab (Chỉ cần chạy 1 lần duy nhất khi mount)
  useEffect(() => {
    const syncAuth = (e: StorageEvent) => {
      if (e.key === "directus_token") {
        if (!e.newValue) {
          setToken(null);
          router.push("/login");
        } else {
          setToken(e.newValue);
          if (pathname === "/login") router.push("/userinfo");
        }
      }
    };
    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, [router, pathname]);

  return (
    <AuthContext.Provider value={{ token, setToken, logout, loading }}>
      {!loading ? (
        children
      ) : (
        <div className="h-screen flex items-center justify-center">
          Đang kiểm tra quyền truy cập...
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
