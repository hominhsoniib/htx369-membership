"use client";

import { useState } from "react";
import { convertGuestAction } from "./actions";

interface GuestItem {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  company: string | null;
  position: string | null;
  territoryId: string | null;
  chapterId: string | null;
  industryId: string | null;
  referrerMemberId: string | null;
}

export default function ConvertModal({
  guest,
  territories,
  chapters,
  industries,
  members,
  onClose,
}: {
  guest: GuestItem;
  territories: { id: string; name: string }[];
  chapters: { id: string; name: string; territoryId: string }[];
  industries: { id: string; name: string }[];
  members: { id: string; fullName: string; memberCode: string }[];
  onClose: () => void;
}) {
  const [selectedTerritory, setSelectedTerritory] = useState(guest.territoryId || (territories[0]?.id ?? ""));
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
    formData.append("guestId", guest.id);

    const res = await convertGuestAction(null, formData);

    setLoading(false);
    if (res.success) {
      onClose();
    } else {
      setError(res.error || "Chuyển đổi thất bại.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 bg-purple-50 border-b border-purple-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-purple-100 text-purple-700 rounded-lg text-lg">✨</span>
            <div>
              <h2 className="text-sm font-semibold text-purple-900">Gia Nhập Hội Viên Chính Thức</h2>
              <p className="text-xs text-purple-600">Chuyển đổi Khách mời {guest.fullName} sang trạng thái Hội viên</p>
            </div>
          </div>
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

          <div className="space-y-3 text-sm">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Họ và tên hội viên *</label>
              <input
                type="text"
                name="fullName"
                required
                defaultValue={guest.fullName}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Số điện thoại *</label>
                <input
                  type="text"
                  name="phone"
                  required
                  defaultValue={guest.phone}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email chính thức *</label>
                <input
                  type="email"
                  name="email"
                  required
                  defaultValue={guest.email || `${guest.phone}@member.local`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Địa bàn / Vùng *</label>
                <select
                  name="territoryId"
                  required
                  value={selectedTerritory}
                  onChange={(e) => setSelectedTerritory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
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
                <label className="block text-xs font-medium text-gray-700 mb-1">Chapter sinh hoạt *</label>
                <select
                  name="chapterId"
                  required
                  defaultValue={guest.chapterId || (filteredChapters[0]?.id ?? "")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  <option value="">-- Chọn chapter --</option>
                  {filteredChapters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tên công ty</label>
                <input
                  type="text"
                  name="company"
                  defaultValue={guest.company || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Chức vụ</label>
                <input
                  type="text"
                  name="position"
                  defaultValue={guest.position || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Ngành nghề kinh doanh</label>
              <select
                name="industryId"
                defaultValue={guest.industryId || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
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
              <label className="block text-xs font-medium text-gray-700 mb-1">Người bảo trợ / Giới thiệu</label>
              <select
                name="referrerId"
                defaultValue={guest.referrerMemberId || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
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

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
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
              className="px-5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : "Xác Nhận Kết Nạp"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
