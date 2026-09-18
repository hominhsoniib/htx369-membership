import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { auth, signOut } from "@/lib/auth";
import { AdminNav } from "@/components/admin-nav";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <AdminNav user={session.user} signOutAction={handleSignOut} />
      <main className="flex-1 p-4 md:p-6 overflow-x-hidden min-w-0">{children}</main>
    </div>
  );
}
