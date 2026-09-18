import { notFound } from "next/navigation";
import { getEventById } from "@/services/event.service";
import CheckInView from "@/features/checkin/checkin-view";

export default async function EventCheckInPage({ params }: { params: { id: string } }) {
  const event = await getEventById(params.id);
  if (!event) return notFound();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <a href="/admin/events" className="hover:underline">
          Sự kiện
        </a>
        <span>/</span>
        <span className="font-semibold text-gray-900">QR Check-in ({event.title})</span>
      </div>

      <CheckInView event={event as any} />
    </div>
  );
}
