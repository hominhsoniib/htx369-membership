import Link from "next/link";
import { listMembers } from "@/services/member.service";
import { listChapters } from "@/services/chapter.service";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { SearchInput } from "@/components/SearchInput";
import { SelectFilter } from "@/components/SelectFilter";
import { Pagination } from "@/components/Pagination";

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Đang hoạt động",
  SUSPENDED: "Tạm ngưng",
  LEFT: "Đã rời",
};

export default async function MembersPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; chapterId?: string; page?: string };
}) {
  const page = Number(searchParams.page ?? "1") || 1;
  const [{ rows, total, totalPages }, chapters] = await Promise.all([
    listMembers({
      search: searchParams.q,
      status: searchParams.status as "ACTIVE" | "SUSPENDED" | "LEFT" | undefined,
      chapterId: searchParams.chapterId,
      page,
    }),
    listChapters(),
  ]);

  return (
    <div>
      <PageHeader
        title="Hội viên"
        description={`${total} hội viên — đã lọc theo quyền của bạn.`}
        action={
          <Link
            href="/admin/members/new"
            className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            + Thêm hội viên
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <SearchInput placeholder="Tìm theo tên, email, SĐT, mã hội viên..." />
        <SelectFilter
          paramKey="status"
          placeholder="Tất cả trạng thái"
          options={[
            { value: "ACTIVE", label: "Đang hoạt động" },
            { value: "SUSPENDED", label: "Tạm ngưng" },
            { value: "LEFT", label: "Đã rời" },
          ]}
        />
        <SelectFilter
          paramKey="chapterId"
          placeholder="Tất cả chapter"
          options={chapters.map((c) => ({ value: c.id, label: c.name }))}
        />
      </div>

      <DataTable
        rows={rows}
        emptyLabel="Chưa có hội viên nào."
        columns={[
          {
            header: "Họ tên",
            cell: (m) => (
              <Link href={`/admin/members/${m.id}`} className="font-medium text-gray-900 hover:underline">
                {m.fullName}
              </Link>
            ),
          },
          { header: "Mã HV", cell: (m) => m.memberCode },
          { header: "Chapter", cell: (m) => m.chapter.name },
          { header: "Email", cell: (m) => m.email },
          { header: "SĐT", cell: (m) => m.phone },
          { header: "Trạng thái", cell: (m) => <StatusBadge active={m.status === "ACTIVE"} activeLabel="Đang hoạt động" inactiveLabel={STATUS_LABEL[m.status]} /> },
        ]}
      />

      <Pagination page={page} totalPages={totalPages} basePath="/admin/members" searchParams={searchParams} />
    </div>
  );
}
