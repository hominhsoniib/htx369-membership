import { getDashboardData } from "@/services/report.service";
import DashboardView from "@/features/dashboard/dashboard-view";

export default async function ReportsPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Báo Cáo &amp; Thống Kê Chuyên Sâu</h1>
          <p className="text-xs text-gray-500 mt-1">
            Phân tích số liệu tăng trưởng hội viên, hiệu quả chuyển đổi khách mời và chất lượng các sự kiện.
          </p>
        </div>
      </div>

      <DashboardView {...data} />
    </div>
  );
}
