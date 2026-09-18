import { listEvents } from "@/services/event.service";
import { getLookupData } from "@/services/lookup.service";
import EventTable from "@/features/events/event-table";

export default async function EventsPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: any; chapterId?: string; page?: string };
}) {
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const { rows, total, totalPages } = await listEvents({
    search: searchParams.search,
    status: searchParams.status,
    chapterId: searchParams.chapterId,
    page,
  });

  const { territories, chapters } = await getLookupData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Quản Lý Sự Kiện &amp; Điểm Danh</h1>
        <p className="text-xs text-gray-500 mt-1">
          Tạo và quản lý các sự kiện họp mặt, theo dõi cổng đăng ký trực tuyến và thực hiện QR Check-in.
        </p>
      </div>

      <EventTable
        events={rows as any}
        total={total}
        page={page}
        totalPages={totalPages}
        territories={territories}
        chapters={chapters}
      />
    </div>
  );
}
