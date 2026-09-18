import Link from "next/link";
import { listChapters } from "@/services/chapter.service";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { SearchInput } from "@/components/SearchInput";

export default async function ChaptersPage({ searchParams }: { searchParams: { q?: string } }) {
  const chapters = await listChapters(searchParams.q);

  return (
    <div>
      <PageHeader
        title="Chapter"
        description="Danh sách chapter — đã lọc theo quyền của bạn."
        action={
          <Link
            href="/admin/chapters/new"
            className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            + Thêm chapter
          </Link>
        }
      />

      <div className="mb-4">
        <SearchInput placeholder="Tìm theo tên hoặc mã..." />
      </div>

      <DataTable
        rows={chapters}
        emptyLabel="Chưa có chapter nào."
        columns={[
          {
            header: "Tên",
            cell: (c) => (
              <Link href={`/admin/chapters/${c.id}`} className="font-medium text-gray-900 hover:underline">
                {c.name}
              </Link>
            ),
          },
          { header: "Mã", cell: (c) => c.code },
          { header: "Địa bàn", cell: (c) => c.territory.name },
          { header: "Hội viên", cell: (c) => c._count.members },
          { header: "Trạng thái", cell: (c) => <StatusBadge active={c.isActive} /> },
        ]}
      />
    </div>
  );
}
