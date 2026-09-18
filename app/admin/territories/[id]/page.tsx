import Link from "next/link";
import { notFound } from "next/navigation";
import { getTerritoryById } from "@/services/territory.service";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { DisableTerritoryButton } from "@/features/territories/disable-button";

export default async function TerritoryDetailPage({ params }: { params: { id: string } }) {
  const territory = await getTerritoryById(params.id);
  if (!territory) notFound();

  return (
    <div>
      <PageHeader
        title={territory.name}
        description={`Mã: ${territory.code}`}
        action={
          <div className="flex gap-2">
            <Link
              href={`/admin/territories/${territory.id}/edit`}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Sửa
            </Link>
            <DisableTerritoryButton territoryId={territory.id} isActive={territory.isActive} />
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Trạng thái" value={<StatusBadge active={territory.isActive} />} />
        <StatCard label="Chapter" value={territory._count.chapters} />
        <StatCard label="Hội viên" value={territory._count.members} />
        <StatCard label="Khách mời" value={territory._count.guests} />
      </div>

      {territory.description && <p className="mt-6 max-w-2xl text-sm text-gray-600">{territory.description}</p>}

      <p className="mt-8 text-sm text-gray-400">
        Tab Lãnh đạo / Chapter / Hội viên / Khách mời / Sự kiện / Báo cáo sẽ hiển thị đầy đủ khi các module tương
        ứng hoàn thiện (Phase 6–12). KPI ở trên đã lấy dữ liệu thật từ database.
      </p>
    </div>
  );
}
