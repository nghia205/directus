import { useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

export const useHandleAuthError = () => {
  const router = useRouter();
  const { logout } = useAuth();

  const handleAuthError = useCallback(
    (result: any) => {
      if (
        result.errors &&
        result.errors.some((e: any) => e.extensions?.code === "TOKEN_EXPIRED")
      ) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        logout();
        router.push("/login");
        return true;
      }
      return false;
    },
    [logout, router],
  );

  return { handleAuthError };
};
