import Link from "next/link";
import { listTerritories } from "@/services/territory.service";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { SearchInput } from "@/components/SearchInput";

export default async function TerritoriesPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const territories = await listTerritories(searchParams.q);

  return (
    <div>
      <PageHeader
        title="Địa bàn"
        description="Danh sách địa bàn — đã lọc theo quyền của bạn."
        action={
          <Link
            href="/admin/territories/new"
            className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            + Thêm địa bàn
          </Link>
        }
      />

      <div className="mb-4">
        <SearchInput placeholder="Tìm theo tên hoặc mã..." />
      </div>

      <DataTable
        rows={territories}
        emptyLabel="Chưa có địa bàn nào."
        columns={[
          {
            header: "Tên",
            cell: (t) => (
              <Link href={`/admin/territories/${t.id}`} className="font-medium text-gray-900 hover:underline">
                {t.name}
              </Link>
            ),
          },
          { header: "Mã", cell: (t) => t.code },
          { header: "Chapter", cell: (t) => t._count.chapters },
          { header: "Hội viên", cell: (t) => t._count.members },
          { header: "Trạng thái", cell: (t) => <StatusBadge active={t.isActive} /> },
        ]}
      />
    </div>
  );
}
