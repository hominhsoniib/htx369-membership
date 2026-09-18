"use client";

import { useState } from "react";
import { createGuestAction, updateGuestAction } from "./actions";

interface GuestItem {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  company: string | null;
  position: string | null;
  status: string;
  source: string | null;
  notes: string | null;
  territoryId: string | null;
  chapterId: string | null;
  industryId: string | null;
  referrerMemberId: string | null;
}

export default function GuestForm({
  guest,
  territories,
  chapters,
  industries,
  members,
  onClose,
}: {
  guest: GuestItem | null;
  territories: { id: string; name: string }[];
  chapters: { id: string; name: string; territoryId: string }[];
  industries: { id: string; name: string }[];
  members: { id: string; fullName: string; memberCode: string }[];
  onClose: () => void;
}) {
  const [selectedTerritory, setSelectedTerritory] = useState(guest?.territoryId || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredChapters = selectedTerritory
    ? chapters.filter((c) => c.territoryId === selectedTerritory)
    : chapters;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = guest
      ? await updateGuestAction(guest.id, null, formData)
      : await createGuestAction(null, formData);

    setLoading(false);
    if (res.success) {
      onClose();
    } else {
      setError(res.error || "Có lỗi xảy ra.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            {guest ? "Chỉnh Sửa Thông Tin Khách Mời" : "Thêm Khách Mời Mới"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Họ và tên *</label>
              <input
                type="text"
                name="fullName"
                required
                defaultValue={guest?.fullName || ""}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Số điện thoại *</label>
              <input
                type="text"
                name="phone"
                required
                defaultValue={guest?.phone || ""}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                defaultValue={guest?.email || ""}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Trạng thái</label>
              <select
                name="status"
                defaultValue={guest?.status || "REGISTERED"}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="REGISTERED">Mới đăng ký</option>
                <option value="CONFIRMED">Đã xác nhận</option>
                <option value="ATTENDED">Đã tham dự</option>
                <option value="NO_SHOW">Vắng mặt</option>
                <option value="FOLLOW_UP">Cần chăm sóc</option>
                <option value="JOINED">Đã gia nhập (Hội viên)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Địa bàn / Vùng</label>
              <select
                name="territoryId"
                value={selectedTerritory}
                onChange={(e) => setSelectedTerritory(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">-- Chọn địa bàn --</option>
                {territories.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Chapter</label>
              <select
                name="chapterId"
                defaultValue={guest?.chapterId || ""}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">-- Chọn chapter --</option>
                {filteredChapters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Tên công ty</label>
              <input
                type="text"
                name="company"
                defaultValue={guest?.company || ""}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Chức vụ</label>
              <input
                type="text"
                name="position"
                defaultValue={guest?.position || ""}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Ngành nghề</label>
              <select
                name="industryId"
                defaultValue={guest?.industryId || ""}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">-- Chọn ngành nghề --</option>
                {industries.map((ind) => (
                  <option key={ind.id} value={ind.id}>
                    {ind.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Hội viên giới thiệu</label>
              <select
                name="referrerMemberId"
                defaultValue={guest?.referrerMemberId || ""}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">-- Không có --</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} ({m.memberCode})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Ghi chú chăm sóc</label>
            <textarea
              name="notes"
              rows={2}
              defaultValue={guest?.notes || ""}
              placeholder="Nhu cầu, trao đổi gần nhất..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Đang lưu..." : guest ? "Cập Nhật" : "Tạo Mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
