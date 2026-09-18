import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { auth, signOut } from "@/lib/auth";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/territories", label: "Địa bàn" },
  { href: "/admin/chapters", label: "Chapter" },
  { href: "/admin/members", label: "Hội viên" },
  { href: "/admin/guests", label: "Khách mời" },
  { href: "/admin/events", label: "Sự kiện" },
  { href: "/admin/reports", label: "Báo cáo" },
  { href: "/admin/settings", label: "Cài đặt", adminOnly: true },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Middleware đã chặn ở edge, nhưng vẫn double-check ở server component
  // (defense in depth — không tin tưởng tuyệt đối một lớp bảo vệ duy nhất).
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-60 shrink-0 border-r border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-4 py-4">
          <p className="text-sm font-semibold text-gray-900">{session.user.name}</p>
          <p className="text-xs text-gray-500">{session.user.role}</p>
        </div>
        <nav className="space-y-0.5 p-2 text-sm">
          {NAV_ITEMS.filter(
            (item) => !item.adminOnly || session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN"
          ).map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
          className="p-2"
        >
          <button
            type="submit"
            className="w-full rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            Đăng xuất
          </button>
        </form>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
