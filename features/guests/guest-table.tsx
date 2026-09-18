"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import GuestForm from "./guest-form";
import ConvertModal from "./convert-modal";

const STATUS_MAP: Record<string, { label: string; badge: string }> = {
  REGISTERED: { label: "Mới đăng ký", badge: "bg-blue-50 text-blue-700 ring-blue-600/20" },
  CONFIRMED: { label: "Đã xác nhận", badge: "bg-cyan-50 text-cyan-700 ring-cyan-600/20" },
  ATTENDED: { label: "Đã tham dự", badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
  NO_SHOW: { label: "Vắng mặt", badge: "bg-rose-50 text-rose-700 ring-rose-600/20" },
  FOLLOW_UP: { label: "Cần chăm sóc", badge: "bg-amber-50 text-amber-700 ring-amber-600/20" },
  JOINED: { label: "Đã gia nhập (Hội viên)", badge: "bg-purple-50 text-purple-700 ring-purple-600/20 font-semibold" },
};

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
  convertedMemberId: string | null;
  territory?: { id: string; name: string } | null;
  chapter?: { id: string; name: string } | null;
  industry?: { id: string; name: string } | null;
  referrerMember?: { id: string; fullName: string; memberCode: string } | null;
  convertedMember?: { id: string; fullName: string; memberCode: string } | null;
}

export default function GuestTable({
  guests,
  total,
  page,
  totalPages,
  territories,
  chapters,
  industries,
  members,
}: {
  guests: GuestItem[];
  total: number;
  page: number;
  totalPages: number;
  territories: { id: string; name: string }[];
  chapters: { id: string; name: string; territoryId: string }[];
  industries: { id: string; name: string }[];
  members: { id: string; fullName: string; memberCode: string }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get("status") || "");
  const [selectedChapter, setSelectedChapter] = useState(searchParams.get("chapterId") || "");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<GuestItem | null>(null);

  const [convertingGuest, setConvertingGuest] = useState<GuestItem | null>(null);

  const handleFilter = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (selectedStatus) params.set("status", selectedStatus);
    if (selectedChapter) params.set("chapterId", selectedChapter);
    params.set("page", "1");
    router.push(`/admin/guests?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Header & Filter Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <input
            type="text"
            placeholder="Tìm theo tên, email, sđt, công ty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFilter()}
            className="w-full sm:w-64 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              handleFilter();
            }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="REGISTERED">Mới đăng ký</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="ATTENDED">Đã tham dự</option>
            <option value="NO_SHOW">Vắng mặt</option>
            <option value="FOLLOW_UP">Cần chăm sóc</option>
            <option value="JOINED">Đã gia nhập (Hội viên)</option>
          </select>

          <select
            value={selectedChapter}
            onChange={(e) => {
              setSelectedChapter(e.target.value);
              handleFilter();
            }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          >
            <option value="">Tất cả Chapter</option>
            {chapters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
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
            setEditingGuest(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm Khách Mời
        </button>
      </div>

      {/* Guest Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3">Họ & Tên</th>
                <th className="px-4 py-3">Liên Hệ</th>
                <th className="px-4 py-3">Công Ty / Chức Vụ</th>
                <th className="px-4 py-3">Chapter / Địa Bàn</th>
                <th className="px-4 py-3">Người Giới Thiệu</th>
                <th className="px-4 py-3">Trạng Thái</th>
                <th className="px-4 py-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {guests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    Chưa có khách mời nào phù hợp.
                  </td>
                </tr>
              ) : (
                guests.map((guest) => {
                  const statusInfo = STATUS_MAP[guest.status] || { label: guest.status, badge: "bg-gray-100 text-gray-700" };
                  return (
                    <tr key={guest.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {guest.fullName}
                        {guest.convertedMember && (
                          <div className="text-xs text-purple-600 font-normal">
                            Đã thành HV: {guest.convertedMember.fullName} ({guest.convertedMember.memberCode})
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        <div>{guest.phone}</div>
                        {guest.email && <div className="text-xs text-gray-400">{guest.email}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <div>{guest.company || "—"}</div>
                        {guest.position && <div className="text-xs text-gray-400">{guest.position}</div>}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        <div>{guest.chapter?.name || "Chưa gán"}</div>
                        {guest.territory && <div className="text-xs text-gray-400">{guest.territory.name}</div>}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {guest.referrerMember ? (
                          <span className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                            {guest.referrerMember.fullName} ({guest.referrerMember.memberCode})
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${statusInfo.badge}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingGuest(guest);
                              setIsFormOpen(true);
                            }}
                            className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                          >
                            Sửa
                          </button>

                          {guest.status !== "JOINED" && !guest.convertedMemberId && (
                            <button
                              onClick={() => setConvertingGuest(guest)}
                              className="px-2.5 py-1 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded transition"
                            >
                              Gia nhập HV
                            </button>
                          )}
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
              Hiển thị trang {page} / {totalPages} (Tổng {total} khách mời)
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set("page", String(page - 1));
                  router.push(`/admin/guests?${params.toString()}`);
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
                  router.push(`/admin/guests?${params.toString()}`);
                }}
                className="px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Form Drawer / Modal */}
      {isFormOpen && (
        <GuestForm
          guest={editingGuest}
          territories={territories}
          chapters={chapters}
          industries={industries}
          members={members}
          onClose={() => setIsFormOpen(false)}
        />
      )}

      {/* Convert Guest to Member Modal */}
      {convertingGuest && (
        <ConvertModal
          guest={convertingGuest}
          territories={territories}
          chapters={chapters}
          industries={industries}
          members={members}
          onClose={() => setConvertingGuest(null)}
        />
      )}
    </div>
  );
}
