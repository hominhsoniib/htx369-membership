import Link from "next/link";
import { notFound } from "next/navigation";
import { getChapterById } from "@/services/chapter.service";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { DisableChapterButton } from "@/features/chapters/disable-button";

export default async function ChapterDetailPage({ params }: { params: { id: string } }) {
  const chapter = await getChapterById(params.id);
  if (!chapter) notFound();

  return (
    <div>
      <PageHeader
        title={chapter.name}
        description={`Mã: ${chapter.code} · Địa bàn: ${chapter.territory.name}`}
        action={
          <div className="flex gap-2">
            <Link
              href={`/admin/chapters/${chapter.id}/edit`}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Sửa
            </Link>
            <DisableChapterButton chapterId={chapter.id} isActive={chapter.isActive} />
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Trạng thái" value={<StatusBadge active={chapter.isActive} />} />
        <StatCard label="Hội viên" value={chapter._count.members} />
        <StatCard label="Khách mời" value={chapter._count.guests} />
        <StatCard label="Sự kiện" value={chapter._count.events} />
      </div>

      {(chapter.meetingLocation || chapter.meetingSchedule) && (
        <div className="mt-6 space-y-1 text-sm text-gray-600">
          {chapter.meetingLocation && <p>Địa điểm họp: {chapter.meetingLocation}</p>}
          {chapter.meetingSchedule && <p>Lịch họp: {chapter.meetingSchedule}</p>}
        </div>
      )}

      {chapter.description && <p className="mt-4 max-w-2xl text-sm text-gray-600">{chapter.description}</p>}

      <p className="mt-8 text-sm text-gray-400">
        Tab Tổng quan / Hội viên / Lãnh đạo / Khách mời / Sự kiện / Báo cáo sẽ hiển thị đầy đủ khi các module
        tương ứng hoàn thiện (Phase 6–12). KPI ở trên đã lấy dữ liệu thật từ database.
      </p>
    </div>
  );
}
