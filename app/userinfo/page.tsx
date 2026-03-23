"use client";
import { useEffect, useState } from "react";
import {
  Edit2,
  LogOut,
  MapPin,
  Calendar,
  Bell,
  ShieldCheck,
  Languages,
  ChevronRight,
  Menu,
  Loader2,
} from "lucide-react";
import Sidebar from "../component/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useHandleAuthError } from "../hook/useHandleAuthError";

const BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://silvatek.vn:8080";

const UserInfo = () => {
  const { token, logout } = useAuth();
  const { handleAuthError } = useHandleAuthError();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /*Lấy thông tin người dùng hiện tại từ Directus*/
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();

        if (handleAuthError(result)) return;

        if (res.ok) {
          setUser(result.data);
        }
      } catch (error) {
        console.error("Fetch User Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [token, handleAuthError]);

  const handleLogoutClick = () => {
    logout();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("vi-VN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Chưa cập nhật";

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen font-sans flex">
      {/* Sidebar */}
      <Sidebar currentPath="/userinfo" />

      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 w-full z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200">
          <div className="flex items-center justify-between px-6 py-4 h-16 w-full max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <button className="lg:hidden p-2 rounded-lg hover:bg-slate-200">
                <Menu size={20} />
              </button>
              <h2 className="font-bold text-slate-800 text-lg">
                Hồ sơ cá nhân
              </h2>
            </div>
          </div>
        </header>

        <main className="p-6 lg:p-10 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Profile Hero Section */}
            <section className="lg:col-span-5 xl:col-span-4">
              <div className="relative bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden ring-4 ring-blue-50 shadow-xl bg-slate-100 flex items-center justify-center">
                    {user?.avatar ? (
                      <img
                        alt="Avatar"
                        className="w-full h-full object-cover"
                        src={`${BASE_URL}/assets/${user.avatar}`}
                      />
                    ) : (
                      <span className="text-4xl font-black text-slate-300">
                        {user?.first_name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    )}
                  </div>
                  <button className="absolute -bottom-2 -right-2 bg-blue-600 text-white w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg border-4 border-white hover:scale-110 transition-transform">
                    <Edit2 size={16} strokeWidth={3} />
                  </button>
                </div>

                <h2 className="font-extrabold text-2xl text-slate-800 tracking-tight">
                  {user
                    ? `${user.first_name} ${user.last_name || ""}`
                    : "Khách"}
                </h2>
                <p className="text-slate-500 text-base mt-1">
                  {user?.email || "Chưa có email"}
                </p>

                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  <Badge
                    label={user?.role ? "Thành viên" : "Quản trị viên"}
                    variant="secondary"
                  />
                  <Badge label="Đã xác minh" variant="primary" />
                </div>

                <button
                  onClick={handleLogoutClick}
                  className="mt-8 flex items-center justify-center gap-2 w-full py-3 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-colors lg:hidden"
                >
                  <LogOut size={18} /> Đăng xuất
                </button>
              </div>
            </section>

            {/* Details & Settings */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DetailCard
                  Icon={MapPin}
                  title="Vị trí"
                  value={user?.location || "Việt Nam"}
                />
                <DetailCard
                  Icon={Calendar}
                  title="Ngày tham gia"
                  value={joinDate}
                />
              </div>

              <div className="bg-white rounded-[2.5rem] p-6 flex flex-col gap-3 border border-slate-200">
                <h3 className="px-6 py-2 text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
                  Tùy chọn tài khoản
                </h3>

                <SettingItem
                  Icon={Bell}
                  title="Thông báo"
                  description="Quản lý tùy chọn email và thông báo đẩy"
                />
                <SettingItem
                  Icon={ShieldCheck}
                  title="Bảo mật"
                  description="2FA, quản lý mật khẩu và quyền riêng tư"
                />
                <SettingItem
                  Icon={Languages}
                  title="Ngôn ngữ hiển thị"
                  description={
                    user?.language === "vi-VN" ? "Tiếng Việt" : "Tiếng Anh (US)"
                  }
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const Badge = ({ label, variant }: any) => {
  const styles =
    variant === "primary"
      ? "bg-blue-100 text-blue-700"
      : "bg-slate-100 text-slate-600";
  return (
    <span
      className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${styles}`}
    >
      {label}
    </span>
  );
};

const DetailCard = ({ Icon, title, value }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm flex flex-col gap-4 border border-slate-200">
    <div className="flex items-center gap-3 text-blue-600">
      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
        <Icon size={20} strokeWidth={2.5} />
      </div>
      <span className="font-bold text-lg">{title}</span>
    </div>
    <p className="text-slate-700 font-medium text-xl">{value}</p>
  </div>
);

const SettingItem = ({ Icon, title, description }: any) => (
  <button className="flex items-center justify-between w-full p-5 rounded-3xl bg-white hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100 shadow-sm">
    <div className="flex items-center gap-5">
      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
        <Icon size={22} strokeWidth={2} />
      </div>
      <div className="text-left">
        <p className="font-bold text-slate-800 text-lg">{title}</p>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
    </div>
    <ChevronRight
      className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform"
      size={20}
    />
  </button>
);

export default UserInfo;
