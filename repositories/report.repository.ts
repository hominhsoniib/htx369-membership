import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const reportRepository = {
  async getKPIs(whereMember: Prisma.MemberWhereInput = {}, whereGuest: Prisma.GuestWhereInput = {}, whereEvent: Prisma.EventWhereInput = {}) {
    const [totalMembers, totalChapters, totalGuests, totalEvents, totalCheckIns, totalRegistrations] = await Promise.all([
      prisma.member.count({ where: { AND: [whereMember, { deletedAt: null, status: "ACTIVE" }] } }),
      prisma.chapter.count({ where: { isActive: true } }),
      prisma.guest.count({ where: whereGuest }),
      prisma.event.count({ where: whereEvent }),
      prisma.eventCheckIn.count(),
      prisma.eventRegistration.count(),
    ]);

    const attendanceRate = totalRegistrations > 0 ? Math.round((totalCheckIns / totalRegistrations) * 100) : 0;

    return {
      totalMembers,
      totalChapters,
      totalGuests,
      totalEvents,
      attendanceRate,
    };
  },

  async getMemberGrowth(where: Prisma.MemberWhereInput = {}) {
    const members = await prisma.member.findMany({
      where: { AND: [where, { deletedAt: null }] },
      select: { joinedAt: true },
      orderBy: { joinedAt: "asc" },
    });

    const monthsMap: Record<string, number> = {};
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getMonth() + 1}/${d.getFullYear()}`;
      monthsMap[key] = 0;
    }

    members.forEach((m) => {
      const d = new Date(m.joinedAt);
      const key = `${d.getMonth() + 1}/${d.getFullYear()}`;
      if (monthsMap[key] !== undefined) {
        monthsMap[key]++;
      }
    });

    return Object.entries(monthsMap).map(([month, count]) => ({
      month,
      count,
    }));
  },

  async getGuestFunnel(where: Prisma.GuestWhereInput = {}) {
    const groups = await prisma.guest.groupBy({
      by: ["status"],
      where,
      _count: { status: true },
    });

    const counts: Record<string, number> = {
      REGISTERED: 0,
      CONFIRMED: 0,
      ATTENDED: 0,
      NO_SHOW: 0,
      FOLLOW_UP: 0,
      JOINED: 0,
    };

    groups.forEach((g) => {
      counts[g.status] = g._count.status;
    });

    return [
      { status: "Đã đăng ký", count: counts.REGISTERED },
      { status: "Đã xác nhận", count: counts.CONFIRMED },
      { status: "Đã tham dự", count: counts.ATTENDED },
      { status: "Vắng mặt", count: counts.NO_SHOW },
      { status: "Cần chăm sóc", count: counts.FOLLOW_UP },
      { status: "Đã gia nhập", count: counts.JOINED },
    ];
  },

  async getEventAttendance(where: Prisma.EventWhereInput = {}) {
    const events = await prisma.event.findMany({
      where,
      take: 6,
      orderBy: { startAt: "desc" },
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            registrations: true,
            checkIns: true,
          },
        },
      },
    });

    return events.map((e) => ({
      name: e.title.length > 20 ? e.title.slice(0, 20) + "..." : e.title,
      registrations: e._count.registrations,
      checkIns: e._count.checkIns,
      rate: e._count.registrations > 0 ? Math.round((e._count.checkIns / e._count.registrations) * 100) : 0,
    }));
  },

  async getIndustryDistribution(where: Prisma.MemberWhereInput = {}) {
    const members = await prisma.member.findMany({
      where: { AND: [where, { deletedAt: null }] },
      select: {
        industry: { select: { name: true } },
      },
    });

    const counts: Record<string, number> = {};
    members.forEach((m) => {
      const name = m.industry?.name || "Khác";
      counts[name] = (counts[name] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7);
  },

  async getRecentAuditLogs(take: number = 10) {
    return prisma.auditLog.findMany({
      take,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { fullName: true, role: true, email: true } },
      },
    });
  },
};
