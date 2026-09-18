"use client";

import { useState } from "react";
import { createEventAction, updateEventAction } from "./actions";

interface EventItem {
  id: string;
  title: string;
  description: string | null;
  startAt: Date | string;
  endAt: Date | string;
  location: string | null;
  capacity: number | null;
  status: string;
  registrationEnabled: boolean;
  territoryId: string | null;
  chapterId: string | null;
}

export default function EventForm({
  event,
  territories,
  chapters,
  onClose,
}: {
  event: EventItem | null;
  territories: { id: string; name: string }[];
  chapters: { id: string; name: string; territoryId: string }[];
  onClose: () => void;
}) {
  const [selectedTerritory, setSelectedTerritory] = useState(event?.territoryId || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredChapters = selectedTerritory
    ? chapters.filter((c) => c.territoryId === selectedTerritory)
    : chapters;

  const formatDateForInput = (d?: Date | string) => {
    if (!d) return "";
    const date = new Date(d);
    return date.toISOString().slice(0, 16);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = event
      ? await updateEventAction(event.id, null, formData)
      : await createEventAction(null, formData);

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
            {event ? "Chỉnh Sửa Sự Kiện" : "Tạo Sự Kiện Mới"}
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

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Tên sự kiện *</label>
            <input
              type="text"
              name="title"
              required
              defaultValue={event?.title || ""}
              placeholder="VD: Họp Networking Hàng Tuần Chapter Saigon 1"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Thời gian bắt đầu *</label>
              <input
                type="datetime-local"
                name="startAt"
                required
                defaultValue={formatDateForInput(event?.startAt)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Thời gian kết thúc *</label>
              <input
                type="datetime-local"
                name="endAt"
                required
                defaultValue={formatDateForInput(event?.endAt)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Địa điểm tổ chức</label>
              <input
                type="text"
                name="location"
                defaultValue={event?.location || ""}
                placeholder="VD: Khách sạn Rex, 141 Nguyễn Huệ, Q.1"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Sức chứa tối đa (Capacity)</label>
              <input
                type="number"
                name="capacity"
                min={1}
                defaultValue={event?.capacity || ""}
                placeholder="VD: 50"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Trạng thái sự kiện</label>
              <select
                name="status"
                defaultValue={event?.status || "UPCOMING"}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="DRAFT">Nháp</option>
                <option value="UPCOMING">Sắp diễn ra</option>
                <option value="ONGOING">Đang diễn ra</option>
                <option value="COMPLETED">Đã hoàn thành</option>
                <option value="CANCELLED">Đã hủy</option>
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
                <option value="">-- Toàn quốc --</option>
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
                defaultValue={event?.chapterId || ""}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">-- Toàn vùng --</option>
                {filteredChapters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="relative flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
                <input
                  type="checkbox"
                  name="registrationEnabled"
                  defaultChecked={event?.registrationEnabled ?? true}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
                Mở cổng đăng ký trực tuyến
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Mô tả sự kiện</label>
            <textarea
              name="description"
              rows={3}
              defaultValue={event?.description || ""}
              placeholder="Chương trình họp mặt networking, trao đổi cơ hội kinh doanh..."
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
              {loading ? "Đang lưu..." : event ? "Cập Nhật" : "Tạo Sự Kiện"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
