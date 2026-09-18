"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EventForm from "./event-form";
import { deleteEventAction } from "./actions";

const STATUS_MAP: Record<string, { label: string; badge: string }> = {
  DRAFT: { label: "Nháp", badge: "bg-gray-100 text-gray-700 ring-gray-600/20" },
  UPCOMING: { label: "Sắp diễn ra", badge: "bg-blue-50 text-blue-700 ring-blue-600/20" },
  ONGOING: { label: "Đang diễn ra", badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 font-semibold" },
  COMPLETED: { label: "Đã hoàn thành", badge: "bg-purple-50 text-purple-700 ring-purple-600/20" },
  CANCELLED: { label: "Đã hủy", badge: "bg-rose-50 text-rose-700 ring-rose-600/20" },
};

interface EventItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  startAt: Date | string;
  endAt: Date | string;
  location: string | null;
  capacity: number | null;
  status: string;
  registrationEnabled: boolean;
  territoryId: string | null;
  chapterId: string | null;
  territory?: { id: string; name: string } | null;
  chapter?: { id: string; name: string } | null;
  _count?: {
    registrations: number;
    checkIns: number;
  };
}

export default function EventTable({
  events,
  total,
  page,
  totalPages,
  territories,
  chapters,
}: {
  events: EventItem[];
  total: number;
  page: number;
  totalPages: number;
  territories: { id: string; name: string }[];
  chapters: { id: string; name: string; territoryId: string }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get("status") || "");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  const handleFilter = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (selectedStatus) params.set("status", selectedStatus);
    params.set("page", "1");
    router.push(`/admin/events?${params.toString()}`);
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa sự kiện "${title}" không?`)) {
      const res = await deleteEventAction(id);
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error || "Không thể xóa sự kiện.");
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Filter Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <input
            type="text"
            placeholder="Tìm tên sự kiện, địa điểm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFilter()}
            className="w-full sm:w-64 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              handleFilter();
            }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="DRAFT">Nháp</option>
            <option value="UPCOMING">Sắp diễn ra</option>
            <option value="ONGOING">Đang diễn ra</option>
            <option value="COMPLETED">Đã hoàn thành</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>

          <button
            onClick={handleFilter}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
          >
            Lọc
          </button>
        </div>

        <button
          onClick={() => {
            setEditingEvent(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tạo Sự Kiện Mới
        </button>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3">Tên Sự Kiện</th>
                <th className="px-4 py-3">Thời Gian</th>
                <th className="px-4 py-3">Địa Điểm</th>
                <th className="px-4 py-3">Chapter / Vùng</th>
                <th className="px-4 py-3 text-center">Đăng Ký / Điểm Danh</th>
                <th className="px-4 py-3">Trạng Thái</th>
                <th className="px-4 py-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    Chưa có sự kiện nào.
                  </td>
                </tr>
              ) : (
                events.map((evt) => {
                  const statusInfo = STATUS_MAP[evt.status] || { label: evt.status, badge: "bg-gray-100 text-gray-700" };
                  const regCount = evt._count?.registrations || 0;
                  const checkInCount = evt._count?.checkIns || 0;

                  return (
                    <tr key={evt.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        <div>{evt.title}</div>
                        <a
                          href={`/events/${evt.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-indigo-600 hover:underline inline-flex items-center gap-1 mt-0.5"
                        >
                          Trang đăng ký công khai ↗
                        </a>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        <div>{new Date(evt.startAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                        <div className="text-gray-400">Đến {new Date(evt.endAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {evt.location || "Chưa xác định"}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        <div>{evt.chapter?.name || "Toàn tổ chức"}</div>
                        {evt.territory && <div className="text-gray-400">{evt.territory.name}</div>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 text-xs font-semibold text-gray-700">
                          <span className="text-emerald-600 font-bold">{checkInCount}</span> / <span>{regCount}</span>
                          {evt.capacity && <span className="text-gray-400">(Max {evt.capacity})</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${statusInfo.badge}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`/admin/events/${evt.id}/checkin`}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition"
                          >
                            QR Check-in
                          </a>
                          <button
                            onClick={() => {
                              setEditingEvent(evt);
                              setIsFormOpen(true);
                            }}
                            className="text-xs font-medium text-gray-600 hover:text-gray-900"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(evt.id, evt.title)}
                            className="text-xs font-medium text-rose-600 hover:text-rose-800"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <div>
              Hiển thị trang {page} / {totalPages} (Tổng {total} sự kiện)
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set("page", String(page - 1));
                  router.push(`/admin/events?${params.toString()}`);
                }}
                className="px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Trước
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set("page", String(page + 1));
                  router.push(`/admin/events?${params.toString()}`);
                }}
                className="px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Event Form Modal */}
      {isFormOpen && (
        <EventForm
          event={editingEvent}
          territories={territories}
          chapters={chapters}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
}
