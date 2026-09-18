"use client";

import { useState } from "react";
import { registerEventAction } from "./actions";

export default function PublicRegisterForm({ eventId }: { eventId: string }) {
  const [loading, setLoading] = useState(false);
  const [successCode, setSuccessCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.append("eventId", eventId);

    const res = await registerEventAction(null, formData);
    setLoading(false);

    if (res.success && res.code) {
      setSuccessCode(res.code);
    } else {
      setError(res.error || "Đăng ký không thành công.");
    }
  };

  if (successCode) {
    return (
      <div className="p-8 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl text-center space-y-4 animate-in fade-in duration-300">
        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-3xl mx-auto border border-emerald-500/30">
          ✓
        </div>
        <h3 className="text-xl font-bold text-emerald-300">Đăng Ký Thành Công!</h3>
        <p className="text-xs text-slate-300">Mã tham dự sự kiện chính thức của bạn là:</p>
        <div className="inline-block px-6 py-3 bg-slate-900 border border-emerald-500/50 rounded-xl font-mono text-2xl font-black text-emerald-400 tracking-widest shadow-inner">
          {successCode}
        </div>
        <p className="text-xs text-slate-400">Vui lòng lưu lại mã này hoặc xuất trình mã này khi tới sự kiện để điểm danh check-in.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
        <span>✍️ Đăng Ký Tham Dự Cho Khách Mời</span>
      </h3>

      {error && (
        <div className="p-3 text-xs text-rose-300 bg-rose-950/40 border border-rose-500/30 rounded-xl">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Họ và tên *</label>
          <input
            type="text"
            name="fullName"
            required
            placeholder="Nguyễn Văn A"
            className="w-full px-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Số điện thoại *</label>
          <input
            type="text"
            name="phone"
            required
            placeholder="0912 345 678"
            className="w-full px-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Email liên hệ</label>
          <input
            type="email"
            name="email"
            placeholder="example@gmail.com"
            className="w-full px-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Tên doanh nghiệp / Công ty</label>
          <input
            type="text"
            name="company"
            placeholder="Công ty TNHH ABC"
            className="w-full px-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Chức vụ</label>
          <input
            type="text"
            name="position"
            placeholder="Giám đốc / Quản lý"
            className="w-full px-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Ngành nghề kinh doanh</label>
          <input
            type="text"
            name="industry"
            placeholder="Bất động sản, IT, F&B..."
            className="w-full px-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">Người giới thiệu (nếu có)</label>
        <input
          type="text"
          name="referrer"
          placeholder="Họ tên hội viên giới thiệu..."
          className="w-full px-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl shadow-lg transition transform active:scale-95 disabled:opacity-50"
      >
        {loading ? "Đang gửi đăng ký..." : "Xác Nhận Đăng Ký Tham Dự"}
      </button>
    </form>
  );
}
