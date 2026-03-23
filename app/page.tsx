"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const callbackUrl = searchParams.get("callbackUrl");
    const decodedPath = callbackUrl ? decodeURIComponent(callbackUrl) : "";

    if (!decodedPath || decodedPath === "/") {
      router.push("/userinfo");
    } else {
      router.push(decodedPath);
    }
  }, [router, searchParams]);

  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-sm font-medium text-slate-500 animate-pulse">
          Đang chuyển hướng...
        </p>
      </div>
    </div>
  );
}
