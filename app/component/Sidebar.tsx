"use client";

import { User, Database, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

const SidebarItem = ({ Icon, label, href, active = false }: any) => (
  <a
    href={href}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
      active
        ? "bg-blue-600 text-white shadow-md shadow-blue-200"
        : "text-slate-600 hover:bg-slate-100 hover:text-blue-600"
    }`}
  >
    <Icon size={20} strokeWidth={active ? 2.5 : 2} />
    <span>{label}</span>
  </a>
);

const Sidebar = ({ currentPath = "/userinfo" }) => {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const menuItems = [
    { id: "profile", label: "Người dùng", href: "/userinfo", icon: User },
    { id: "data", label: "Dữ liệu", href: "/data", icon: Database },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col z-50">
      {/* Logo Section */}
      <div className="p-6">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Database size={18} />
          </div>
          <span className="font-black text-lg text-blue-900 tracking-tight">
            ArchAdmin
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1.5 mt-4">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.id}
            Icon={item.icon}
            label={item.label}
            href={item.href}
            active={currentPath === item.href}
          />
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all group"
        >
          <LogOut
            size={20}
            className="group-hover:translate-x-1 transition-transform"
          />
          <span className="font-semibold text-sm">Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
