import { LoginForm } from "@/features/auth/login-form";

export const metadata = {
  title: "Đăng nhập — Membership Platform",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-950 to-slate-950 pointer-events-none" />

      <div className="relative w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-6 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xl mx-auto shadow-lg shadow-indigo-500/30">
            369
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">HTX 369 Membership</h1>
          <p className="text-xs text-slate-400">Nền Tảng Quản Lý Hội Viên &amp; Mạng Lưới Doanh Nghiệp</p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
