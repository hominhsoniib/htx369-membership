"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EC4899", "#8B5CF6", "#06B6D4", "#6366F1"];

interface DashboardProps {
  actor: {
    fullName: string;
    role: string;
  };
  kpis: {
    totalMembers: number;
    totalChapters: number;
    totalGuests: number;
    totalEvents: number;
    attendanceRate: number;
  };
  charts: {
    memberGrowth: { month: string; count: number }[];
    guestFunnel: { status: string; count: number }[];
    eventAttendance: { name: string; registrations: number; checkIns: number; rate: number }[];
    industryDistribution: { name: string; value: number }[];
  };
  recentAuditLogs: {
    id: string;
    action: string;
    entity: string;
    entityId: string;
    createdAt: Date | string;
    user?: { fullName: string; role: string } | null;
  }[];
}

export default function DashboardView({ actor, kpis, charts, recentAuditLogs }: DashboardProps) {
  return (
    <div className="space-y-6">
      {/* Welcome & Role Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-lg border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full mb-2 border border-indigo-500/30">
              ⚡ Hệ thống Quản lý HTX 369
            </div>
            <h1 className="text-2xl font-bold">Xin chào, {actor.fullName}!</h1>
            <p className="text-sm text-slate-300 mt-1">
              Vai trò: <span className="font-semibold text-indigo-400">{actor.role}</span> — Tổng quan số liệu toàn hệ thống được cập nhật theo thời gian thực.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/admin/members"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition shadow-sm"
            >
              Quản lý Hội viên
            </a>
            <a
              href="/admin/events"
              className="px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition"
            >
              Quản lý Sự kiện
            </a>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Hội viên chính thức</span>
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl text-lg">👥</span>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-gray-900">{kpis.totalMembers}</div>
          <div className="mt-1 text-xs text-emerald-600 font-medium flex items-center gap-1">
            <span>↑ Tăng trưởng liên tục</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Chapter hoạt động</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl text-lg">🏛️</span>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-gray-900">{kpis.totalChapters}</div>
          <div className="mt-1 text-xs text-gray-500">Toàn bộ địa bàn</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Khách mời tiềm năng</span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl text-lg">🎯</span>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-gray-900">{kpis.totalGuests}</div>
          <div className="mt-1 text-xs text-amber-600 font-medium">Trong phễu chăm sóc</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tỉ lệ tham dự sự kiện</span>
            <span className="p-2 bg-purple-50 text-purple-600 rounded-xl text-lg">📊</span>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-indigo-600">{kpis.attendanceRate}%</div>
          <div className="mt-1 text-xs text-purple-600 font-medium">Dựa trên {kpis.totalEvents} sự kiện</div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Member Growth Trend */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Xu Hướng Tăng Trưởng Hội Viên (12 Tháng)</h3>
            <p className="text-xs text-gray-500">Số lượng hội viên mới gia nhập hàng tháng</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.memberGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="count" name="Hội viên mới" stroke="#4F46E5" fillOpacity={1} fill="url(#colorGrowth)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Guest Conversion Funnel */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Phễu Chuyển Đổi Khách Mời</h3>
            <p className="text-xs text-gray-500">Số lượng khách mời theo từng giai đoạn phễu</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.guestFunnel} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="Khách mời" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Event Attendance Rate */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Thống Kê Tham Dự Sự Kiện Gần Nhất</h3>
            <p className="text-xs text-gray-500">So sánh số lượng Đăng ký vs Thực tế Điểm danh</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.eventAttendance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="registrations" name="Đăng ký" fill="#93C5FD" radius={[4, 4, 0, 0]} />
                <Bar dataKey="checkIns" name="Điểm danh" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Industry Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Cơ Cấu Ngành Nghề Hội Viên</h3>
            <p className="text-xs text-gray-500">Tỉ lệ ngành nghề đăng ký trong hệ thống</p>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={charts.industryDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {charts.industryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Audit Log Activity */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Nhật Ký Thao Tác Hệ Thống Gần Đây (Audit Log)</h3>
            <p className="text-xs text-gray-500">Giám sát bảo mật &amp; các hành động thay đổi dữ liệu</p>
          </div>
          <a href="/admin/settings" className="text-xs font-semibold text-indigo-600 hover:underline">
            Xem toàn bộ ↗
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-4 py-2.5">Thời Gian</th>
                <th className="px-4 py-2.5">Người Thao Tác</th>
                <th className="px-4 py-2.5">Hành Động</th>
                <th className="px-4 py-2.5">Đối Tượng</th>
                <th className="px-4 py-2.5">Entity ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentAuditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 text-xs">
                  <td className="px-4 py-2 text-gray-500">{new Date(log.createdAt).toLocaleString("vi-VN")}</td>
                  <td className="px-4 py-2 font-medium text-gray-900">
                    {log.user ? `${log.user.fullName} (${log.user.role})` : "Hệ thống"}
                  </td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-2 font-semibold text-gray-800">{log.entity}</td>
                  <td className="px-4 py-2 text-gray-400 font-mono text-[11px]">{log.entityId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
