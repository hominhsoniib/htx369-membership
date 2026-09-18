import { notFound } from "next/navigation";
import { getEventBySlug } from "@/services/event.service";
import PublicRegisterForm from "@/features/events/public-register-form";

export default async function PublicEventPage({ params }: { params: { slug: string } }) {
  const event = await getEventBySlug(params.slug);
  if (!event) return notFound();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Container */}
      <div className="max-w-4xl mx-auto w-full my-auto py-8">
        {/* Event Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 backdrop-blur-xl">
          {/* Organization Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-lg shadow-lg">
                369
              </div>
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                  {event.organization.name}
                </h2>
                <p className="text-xs text-slate-400">Trang Đăng Ký Sự Kiện Chính Thức</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ● {event.status === "UPCOMING" ? "Sắp diễn ra" : event.status === "ONGOING" ? "Đang diễn ra" : event.status}
            </span>
          </div>

          {/* Event Info */}
          <div className="space-y-4">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {event.title}
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">{event.description || "Hội thảo networking, kết nối giao thương và nâng cao năng lực doanh nghiệp."}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                <span className="text-2xl">⏰</span>
                <div>
                  <div className="text-xs font-semibold text-slate-400">Thời gian</div>
                  <div className="text-sm font-semibold text-slate-100">
                    {new Date(event.startAt).toLocaleString("vi-VN", {
                      weekday: "long",
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                <span className="text-2xl">📍</span>
                <div>
                  <div className="text-xs font-semibold text-slate-400">Địa điểm</div>
                  <div className="text-sm font-semibold text-slate-100">
                    {event.location || "Trực tuyến / Chưa xác định"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Registration Form Section */}
          <div className="pt-6 border-t border-slate-800">
            {event.registrationEnabled && event.status !== "CANCELLED" && event.status !== "COMPLETED" ? (
              <PublicRegisterForm eventId={event.id} />
            ) : (
              <div className="p-6 text-center bg-slate-800/40 rounded-2xl border border-slate-700 text-slate-400 text-sm">
                Sự kiện này đã đóng cổng đăng ký trực tuyến.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 py-4">
        © 2026 {event.organization.name} — HTX 369 Membership Platform.
      </footer>
    </div>
  );
}
