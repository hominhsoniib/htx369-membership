import { getOrganization } from "@/services/organization.service";
import { getAuditLogs } from "@/services/report.service";

export default async function SettingsPage() {
  const [org, auditLogs] = await Promise.all([getOrganization(), getAuditLogs(30)]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Cấu Hình Tổ Chức &amp; Nhật Ký Hệ Thống</h1>
        <p className="text-xs text-gray-500 mt-1">
          Quản lý thông tin chung của hợp tác xã và xem lịch sử các hoạt động quan trọng.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Organization Info Form */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <span>🏢 Thông Tin Tổ Chức</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-gray-500 mb-1 font-medium">Tên tổ chức / HTX</label>
              <div className="p-2.5 bg-gray-50 rounded-lg text-gray-900 font-semibold border border-gray-200">
                {org?.name || "Vietnam Business Networking Alliance"}
              </div>
            </div>

            <div>
              <label className="block text-gray-500 mb-1 font-medium">Email liên hệ</label>
              <div className="p-2.5 bg-gray-50 rounded-lg text-gray-900 font-medium border border-gray-200">
                {org?.email || "contact@example-org.vn"}
              </div>
            </div>

            <div>
              <label className="block text-gray-500 mb-1 font-medium">Trạng thái</label>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                ● Đang hoạt động
              </span>
            </div>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <span>🛡️ Lịch Sử Thao Tác Hệ Thống (Audit Log)</span>
          </h2>

          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 font-semibold text-gray-500 sticky top-0">
                <tr>
                  <th className="px-3 py-2">Thời gian</th>
                  <th className="px-3 py-2">Người dùng</th>
                  <th className="px-3 py-2">Hành động</th>
                  <th className="px-3 py-2">Entity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-400">{new Date(log.createdAt).toLocaleString("vi-VN")}</td>
                    <td className="px-3 py-2 font-medium text-gray-900">
                      {log.user ? `${log.user.fullName} (${log.user.role})` : "Hệ thống"}
                    </td>
                    <td className="px-3 py-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-medium text-gray-700">
                      {log.entity} #{log.entityId}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
