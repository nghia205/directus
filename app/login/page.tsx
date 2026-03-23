"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Component,
  ShieldCheck,
  FileCode,
  LifeBuoy,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

// 1. Định nghĩa Schema validate bằng Zod
const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email không được để trống" })
    .email({ message: "Email không đúng định dạng" }),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
});

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  const { setToken } = useAuth();
  const router = useRouter();

  // 2. Khởi tạo React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // 3. Hàm xử lý khi submit thành công
  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        const accessToken = result.data.access_token;

        localStorage.setItem("directus_token", accessToken);

        setToken(accessToken);

        const params = new URLSearchParams(window.location.search);
        const callbackUrl = params.get("callbackUrl");
        const decodedPath = callbackUrl ? decodeURIComponent(callbackUrl) : "";
        if (!decodedPath || decodedPath === "/") {
          router.push("/userinfo");
        } else {
          router.push(decodedPath);
        }
      } else {
        alert(result.errors?.[0]?.message || "Đăng nhập thất bại");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col overflow-x-hidden font-sans">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-100">
        <div className="flex items-center justify-between px-8 py-4 h-16 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              {/* architecture icon -> Component */}
              <Component className="text-white w-5 h-5" strokeWidth={2.5} />
            </div>
            <h1 className="font-bold text-xl tracking-tight text-blue-900">
              Quản trị Kiến trúc
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <span className="text-slate-500 text-sm font-medium">
              Cổng Directus v4.0
            </span>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 md:px-6 pt-24">
        <div className="w-full max-w-[440px] relative">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-60 hidden md:block"></div>
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-blue-50 rounded-full blur-[80px] opacity-40 hidden md:block"></div>

          <div className="relative bg-white rounded-[2rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-extrabold text-slate-800 mb-3 tracking-tight">
                Chào mừng trở lại
              </h2>
              <p className="text-slate-500 leading-relaxed text-sm md:text-base">
                Nhập thông tin xác thực của bạn để quản lý dữ liệu qua Directus.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Email */}
              <div className="space-y-2">
                <label className="block text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
                  Email công việc
                </label>
                <div className="relative group">
                  <div
                    className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.email ? "text-red-500" : "text-slate-400 group-focus-within:text-blue-600"}`}
                  >
                    <Mail size={20} strokeWidth={2} />
                  </div>
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="ten@congty.com"
                    className={`w-full pl-12 pr-4 py-3.5 md:py-4 bg-slate-50 border border-transparent rounded-2xl text-slate-900 focus:ring-4 transition-all duration-300 outline-none ${errors.email ? "ring-red-100 border-red-200" : "focus:ring-blue-50 focus:bg-white focus:border-blue-200"}`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-[11px] ml-1 font-medium italic">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="block text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400">
                    Mật khẩu
                  </label>
                  <a
                    href="#"
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Quên mật khẩu?
                  </a>
                </div>
                <div className="relative group">
                  <div
                    className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.password ? "text-red-500" : "text-slate-400 group-focus-within:text-blue-600"}`}
                  >
                    <Lock size={20} strokeWidth={2} />
                  </div>
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`w-full pl-12 pr-12 py-3.5 md:py-4 bg-slate-50 border border-transparent rounded-2xl text-slate-900 focus:ring-4 transition-all duration-300 outline-none ${errors.password ? "ring-red-100 border-red-200" : "focus:ring-blue-50 focus:bg-white focus:border-blue-200"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-[11px] ml-1 font-medium italic">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  disabled={isSubmitting}
                  className="group relative w-full py-4 bg-blue-600 text-white font-bold text-lg rounded-2xl shadow-xl shadow-blue-200 active:scale-[0.98] hover:bg-blue-700 transition-all duration-200 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
                >
                  <span className="relative z-10 inline-flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                    {isSubmitting ? "Đang xử lý..." : "Đăng Nhập"}
                    {!isSubmitting && <ArrowRight size={20} />}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <footer className="p-8 text-center pb-12 text-slate-400">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-widest">
            <a
              href="#"
              className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
            >
              <ShieldCheck size={14} /> Bảo mật
            </a>
            <a
              href="#"
              className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
            >
              <FileCode size={14} /> API Docs
            </a>
            <a
              href="#"
              className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
            >
              <LifeBuoy size={14} /> Hỗ trợ
            </a>
          </div>
          <p className="text-[10px] opacity-60 mt-2 font-medium tracking-wide">
            © 2026 HỆ SINH THÁI QUẢN TRỊ KIẾN TRÚC. BẢO LƯU MỌI QUYỀN.
          </p>
        </div>
      </footer>
    </div>
  );
}
