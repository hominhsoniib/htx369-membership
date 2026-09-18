"use client";

import { useState } from "react";
import { checkInAction } from "@/features/events/actions";

interface RegistrationItem {
  id: string;
  code: string;
  fullName: string;
  phone: string;
  email: string | null;
  company: string | null;
  position: string | null;
  checkIn: { id: string; checkedInAt: Date | string } | null;
}

interface EventDetail {
  id: string;
  title: string;
  startAt: Date | string;
  endAt: Date | string;
  location: string | null;
  registrations: RegistrationItem[];
  _count: {
    registrations: number;
    checkIns: number;
  };
}

export default function CheckInView({ event }: { event: EventDetail }) {
  const [inputCode, setInputCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [filterQuery, setFilterQuery] = useState("");

  const totalRegs = event.registrations.length;
  const totalCheckedIn = event.registrations.filter((r) => r.checkIn).length;
  const attendanceRate = totalRegs > 0 ? Math.round((totalCheckedIn / totalRegs) * 100) : 0;

  const handleManualCheckIn = async (code: string) => {
    if (!code.trim()) return;
    setLoading(true);
    setFeedback(null);

    const formData = new FormData();
    formData.append("eventId", event.id);
    formData.append("registrationCode", code.trim());

    const res = await checkInAction(null, formData);
    setLoading(false);

    if (res.success) {
      setFeedback({ type: "success", message: res.message || "Điểm danh thành công." });
      setInputCode("");
    } else {
      setFeedback({ type: "error", message: res.error || "Điểm danh không thành công." });
    }
  };

  const filteredRegistrations = event.registrations.filter(
    (r) =>
      (r.fullName && r.fullName.toLowerCase().includes(filterQuery.toLowerCase())) ||
      (r.code && r.code.toLowerCase().includes(filterQuery.toLowerCase())) ||
      (r.phone ? r.phone.includes(filterQuery) : false)
  );

  return (
    <div className="space-y-6">
      {/* Event Header Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 text-white rounded-2xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold bg-white/20 px-3 py-1 rounded-full mb-2 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Sự Kiện - Điểm Danh Thời Gian Thực
            </div>
            <h1 className="text-xl sm:text-2xl font-bold">{event.title}</h1>
            <p className="text-xs text-indigo-100 mt-1">
              📍 {event.location || "Chưa xác định"} | ⏰ {new Date(event.startAt).toLocaleString("vi-VN")}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 p-3 rounded-xl backdrop-blur-md border border-white/10">
            <div className="text-center px-3 border-r border-white/20">
              <div className="text-2xl font-black text-white">{totalRegs}</div>
              <div className="text-[10px] uppercase tracking-wider text-indigo-200">Đăng ký</div>
            </div>
            <div className="text-center px-3 border-r border-white/20">
              <div className="text-2xl font-black text-emerald-300">{totalCheckedIn}</div>
              <div className="text-[10px] uppercase tracking-wider text-indigo-200">Đã điểm danh</div>
            </div>
            <div className="text-center px-3">
              <div className="text-2xl font-black text-amber-300">{attendanceRate}%</div>
              <div className="text-[10px] uppercase tracking-wider text-indigo-200">Tỉ lệ tham dự</div>
            </div>
          </div>
        </div>
      </div>

      {/* Check-in Input & Simulator Bar */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <span>📷 Quét QR / Nhập Mã Đăng Ký Trực Tiếp</span>
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleManualCheckIn(inputCode);
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
            placeholder="Nhập mã ví dụ: REG-001001"
            className="flex-1 px-4 py-3 text-base font-mono uppercase tracking-wider border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={loading || !inputCode.trim()}
            className="px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm disabled:opacity-50 transition"
          >
            {loading ? "Đang điểm danh..." : "Xác Nhận Điểm Danh"}
          </button>
        </form>

        {feedback && (
          <div
            className={`p-4 rounded-xl text-sm font-medium border flex items-center justify-between ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            <span>{feedback.message}</span>
            <button onClick={() => setFeedback(null)} className="text-xs underline opacity-70 hover:opacity-100">
              Đóng
            </button>
          </div>
        )}
      </div>

      {/* Attendance List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-gray-900">
            Danh Sách Đăng Ký ({filteredRegistrations.length})
          </h3>
          <input
            type="text"
            placeholder="Lọc tên, SĐT, mã đăng ký..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3">Mã</th>
                <th className="px-4 py-3">Họ và tên</th>
                <th className="px-4 py-3">Số điện thoại</th>
                <th className="px-4 py-3">Công ty / Chức vụ</th>
                <th className="px-4 py-3">Trạng thái điểm danh</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    Không tìm thấy thông tin đăng ký nào.
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-4 py-3 font-mono font-bold text-indigo-600">{reg.code}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{reg.fullName}</td>
                    <td className="px-4 py-3 text-gray-600">{reg.phone}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      <div>{reg.company || "—"}</div>
                      {reg.position && <div className="text-gray-400">{reg.position}</div>}
                    </td>
                    <td className="px-4 py-3">
                      {reg.checkIn ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Đã điểm danh ({new Date(reg.checkIn.checkedInAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Chưa điểm danh
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!reg.checkIn && (
                        <button
                          onClick={() => handleManualCheckIn(reg.code)}
                          disabled={loading}
                          className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
                        >
                          Điểm danh
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
