"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { loginSchema } from "@/schemas/auth";
import { loginAction } from "./actions";

type FormValues = z.infer<typeof loginSchema>;

const DEMO_ACCOUNTS = [
  { role: "Super Admin", email: "superadmin@demo.local", badge: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  { role: "Admin", email: "admin@demo.local", badge: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" },
  { role: "Leader Vùng", email: "regional.leader@demo.local", badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
  { role: "Leader Chapter", email: "chapter.leader@demo.local", badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  { role: "Hội Viên", email: "member@demo.local", badge: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
];

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "superadmin@demo.local",
      password: "Demo@12345",
    },
  });

  const onSubmit = (values: FormValues) => {
    setError(null);
    startTransition(async () => {
      const result = await loginAction(values);
      if (result?.error) setError(result.error);
    });
  };

  const handleQuickLogin = (email: string) => {
    setValue("email", email);
    setValue("password", "Demo@12345");
    onSubmit({ email, password: "Demo@12345" });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="mb-1 block text-xs font-semibold text-slate-300">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
            className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
          />
          {errors.email && <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-xs font-semibold text-slate-300">
            Mật khẩu
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              {...register("password")}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-4 pr-11 py-2.5 text-sm text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 transition"
              title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.025 10.025 0 013.896-.863c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3l18 18" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-rose-400">{errors.password.message}</p>}
        </div>

        {error && (
          <p role="alert" className="text-xs text-rose-400 bg-rose-950/40 p-3 rounded-xl border border-rose-500/30">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-4 py-3 text-sm font-bold text-white shadow-lg transition transform active:scale-95 disabled:opacity-50"
        >
          {isPending ? "Đang đăng nhập..." : "Đăng Nhập Quản Trị"}
        </button>
      </form>

      {/* Quick Demo Login Buttons */}
      <div className="pt-4 border-t border-slate-800 space-y-3">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
          ⚡ Đăng Nhập Nhanh Demo Accounts (Dev/Staging)
        </div>
        <div className="grid grid-cols-1 gap-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              type="button"
              onClick={() => handleQuickLogin(acc.email)}
              disabled={isPending}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs border transition hover:brightness-125 ${acc.badge}`}
            >
              <span className="font-semibold">{acc.role}</span>
              <span className="font-mono text-[11px] opacity-80">{acc.email}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
