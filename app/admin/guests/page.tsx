import { listGuests } from "@/services/guest.service";
import { getLookupData } from "@/services/lookup.service";
import { memberRepository } from "@/repositories/member.repository";
import GuestTable from "@/features/guests/guest-table";

export default async function GuestsPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: any; chapterId?: string; page?: string };
}) {
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const { rows, total, totalPages } = await listGuests({
    search: searchParams.search,
    status: searchParams.status,
    chapterId: searchParams.chapterId,
    page,
  });

  const { territories, chapters, industries } = await getLookupData();
  const members = await memberRepository.findAllForSelect();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Quản Lý Khách Mời</h1>
        <p className="text-xs text-gray-500 mt-1">
          Quản lý thông tin khách mời, theo dõi quá trình chăm sóc và kết nạp hội viên chính thức.
        </p>
      </div>

      <GuestTable
        guests={rows as any}
        total={total}
        page={page}
        totalPages={totalPages}
        territories={territories}
        chapters={chapters}
        industries={industries}
        members={members}
      />
    </div>
  );
}
