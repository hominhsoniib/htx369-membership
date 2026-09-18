"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type User = {
  name?: string | null;
  email?: string | null;
  role: string;
};

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/admin/territories", label: "Địa bàn", icon: "🗺️" },
  { href: "/admin/chapters", label: "Chapter", icon: "🏛️" },
  { href: "/admin/members", label: "Hội viên", icon: "👥" },
  { href: "/admin/guests", label: "Khách mời", icon: "🤝" },
  { href: "/admin/events", label: "Sự kiện", icon: "📅" },
  { href: "/admin/reports", label: "Báo cáo", icon: "📈" },
  { href: "/admin/settings", label: "Cài đặt", icon: "⚙️", adminOnly: true },
  { href: "/admin/change-password", label: "Đổi mật khẩu", icon: "🔑" },
];

export function AdminNav({
  user,
  signOutAction,
}: {
  user: User;
  signOutAction: () => Promise<void>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Đóng drawer khi chuyển route trên di động
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const filteredNavItems = NAV_ITEMS.filter(
    (item) => !item.adminOnly || user.role === "ADMIN" || user.role === "SUPER_ADMIN"
  );

  return (
    <>
      {/* Top Mobile Bar (hiện trên màn hình < 768px) */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-sm font-black text-white shadow-sm">
            369
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 leading-none">HTX 369</h1>
            <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider">{user.role}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 active:scale-95 transition"
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </header>

      {/* Backdrop overlay cho Mobile Drawer */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs transition-opacity md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Navigation Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out md:static md:w-64 md:translate-x-0 md:shrink-0 flex flex-col justify-between ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Header trong Sidebar */}
          <div className="border-b border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 font-extrabold text-white text-base shadow-sm">
                369
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-gray-900">{user.name || "User"}</p>
                <span className="inline-block rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          {/* Danh sách Menu */}
          <nav className="space-y-1 p-3">
            {filteredNavItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 shadow-xs border-r-4 border-indigo-600"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Nút Đăng xuất ở chân Sidebar */}
        <div className="p-3 border-t border-gray-100">
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition active:scale-95"
            >
              <span className="text-base">🚪</span>
              <span>Đăng xuất tài khoản</span>
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
