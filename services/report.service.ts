import { getActor } from "@/lib/session";
import { assertCan } from "@/lib/rbac";
import { reportRepository } from "@/repositories/report.repository";
import type { Prisma } from "@prisma/client";

export async function getDashboardData() {
  const actor = await getActor();
  assertCan(actor.role, "report:view");

  const whereMember: Prisma.MemberWhereInput =
    actor.role === "CHAPTER_LEADER" && actor.chapterId
      ? { chapterId: actor.chapterId }
      : actor.role === "REGIONAL_LEADER" && actor.territoryId
      ? { territoryId: actor.territoryId }
      : {};

  const whereGuest: Prisma.GuestWhereInput =
    actor.role === "CHAPTER_LEADER" && actor.chapterId
      ? { chapterId: actor.chapterId }
      : actor.role === "REGIONAL_LEADER" && actor.territoryId
      ? { territoryId: actor.territoryId }
      : {};

  const whereEvent: Prisma.EventWhereInput =
    actor.role === "CHAPTER_LEADER" && actor.chapterId
      ? { chapterId: actor.chapterId }
      : actor.role === "REGIONAL_LEADER" && actor.territoryId
      ? { territoryId: actor.territoryId }
      : {};

  const [kpis, memberGrowth, guestFunnel, eventAttendance, industryDistribution, recentAuditLogs] =
    await Promise.all([
      reportRepository.getKPIs(whereMember, whereGuest, whereEvent),
      reportRepository.getMemberGrowth(whereMember),
      reportRepository.getGuestFunnel(whereGuest),
      reportRepository.getEventAttendance(whereEvent),
      reportRepository.getIndustryDistribution(whereMember),
      reportRepository.getRecentAuditLogs(8),
    ]);

  return {
    actor,
    kpis,
    charts: {
      memberGrowth,
      guestFunnel,
      eventAttendance,
      industryDistribution,
    },
    recentAuditLogs,
  };
}

export async function getAuditLogs(take: number = 50) {
  const actor = await getActor();
  assertCan(actor.role, "report:view");

  return reportRepository.getRecentAuditLogs(take);
}
