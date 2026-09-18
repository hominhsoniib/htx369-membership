import { prisma } from "@/lib/prisma";
import { getActor, type Actor } from "@/lib/session";
import { assertCan, canActOnScope, ForbiddenError } from "@/lib/rbac";
import { requireScope } from "@/lib/authorize";
import { memberRepository } from "@/repositories/member.repository";
import type { MemberFormInput } from "@/schemas/member";
import type { Prisma } from "@prisma/client";

/**
 * QUAN TRỌNG: member:view scope "own" có ý nghĩa KHÁC nhau theo role —
 * Leader (Regional/Chapter) "own" = toàn bộ hội viên trong territory/chapter của họ,
 * còn MEMBER "own" = chỉ hồ sơ của chính họ (không phải mọi người cùng chapter).
 * canActOnScope() dùng chung cho territory/chapter KHÔNG đủ để diễn tả khác biệt này
 * — nên member.service.ts tự xử lý riêng thay vì chỉ gọi requireScope().
 */
function listWhere(actor: Actor): Prisma.MemberWhereInput {
  if (actor.role === "MEMBER") return { userId: actor.userId };
  if (actor.role === "CHAPTER_LEADER" && actor.chapterId) return { chapterId: actor.chapterId };
  if (actor.role === "REGIONAL_LEADER" && actor.territoryId) return { territoryId: actor.territoryId };
  return {}; // ADMIN/SUPER_ADMIN — toàn hệ thống
}

export async function listMembers(params: {
  search?: string;
  status?: "ACTIVE" | "SUSPENDED" | "LEFT";
  chapterId?: string;
  page?: number;
} = {}) {
  const actor = await getActor();
  assertCan(actor.role, "member:view");

  const conditions: Prisma.MemberWhereInput[] = [listWhere(actor)];
  if (params.status) conditions.push({ status: params.status });
  // AND thay vì overwrite: nếu actor đã bị giới hạn chapterId (CHAPTER_LEADER/MEMBER),
  // filter chapterId từ URL không thể MỞ RỘNG phạm vi — chỉ có thể thu hẹp thêm hoặc ra rỗng.
  if (params.chapterId) conditions.push({ chapterId: params.chapterId });

  const page = Math.max(1, params.page ?? 1);
  const pageSize = 20;

  const { rows, total } = await memberRepository.findMany({
    where: { AND: conditions },
    search: params.search,
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return { rows, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getMemberById(id: string) {
  const member = await memberRepository.findById(id);
  if (!member) return null;

  const actor = await getActor();
  assertCan(actor.role, "member:view");

  if (actor.role === "MEMBER") {
    if (member.userId !== actor.userId) throw new ForbiddenError("member:view");
  } else if (!canActOnScope(actor.role, "member:view", actor, member)) {
    throw new ForbiddenError("member:view");
  }

  return member;
}

/** Sinh mã hội viên tuần tự — ASSUMPTION: chưa có rule chính thức từ nghiệp vụ, dùng HV-000001 tăng dần. */
async function generateMemberCode() {
  const count = await memberRepository.count();
  return `HV-${String(count + 1).padStart(6, "0")}`;
}

export async function createMember(input: MemberFormInput) {
  const actor = await requireScope("member:create", { territoryId: input.territoryId, chapterId: input.chapterId });

  const duplicate = await memberRepository.findByEmailOrPhone(input.email, input.phone);
  if (duplicate) throw new Error("Email hoặc số điện thoại đã được dùng bởi hội viên khác.");

  const memberCode = await generateMemberCode();

  return prisma.$transaction(async (tx) => {
    const created = await tx.member.create({
      data: {
        territoryId: input.territoryId,
        chapterId: input.chapterId,
        industryId: input.industryId || null,
        memberCode,
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        company: input.company || null,
        position: input.position || null,
        joinedAt: input.joinedAt ? new Date(input.joinedAt) : new Date(),
        status: input.status,
        referrerId: input.referrerId || null,
      },
    });
    await tx.auditLog.create({
      data: { userId: actor.userId, action: "CREATE", entity: "Member", entityId: created.id, newValue: created },
    });
    return created;
  });
}

export async function updateMember(id: string, input: MemberFormInput) {
  const existing = await memberRepository.findById(id);
  if (!existing) throw new Error("Không tìm thấy hội viên.");

  const actor = await requireScope("member:update", {
    territoryId: existing.territoryId,
    chapterId: existing.chapterId,
  });

  if (input.email !== existing.email || input.phone !== existing.phone) {
    const duplicate = await memberRepository.findByEmailOrPhone(input.email, input.phone);
    if (duplicate && duplicate.id !== id) throw new Error("Email hoặc số điện thoại đã được dùng bởi hội viên khác.");
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.member.update({
      where: { id },
      data: {
        // Cho đổi territoryId/chapterId ở đây (chuyển hội viên sang chapter khác) —
        // khác Chapter (không cho đổi Territory) vì đây là thao tác quản trị hội viên phổ biến.
        territoryId: input.territoryId,
        chapterId: input.chapterId,
        industryId: input.industryId || null,
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        company: input.company || null,
        position: input.position || null,
        joinedAt: input.joinedAt ? new Date(input.joinedAt) : existing.joinedAt,
        status: input.status,
        referrerId: input.referrerId || null,
      },
    });
    await tx.auditLog.create({
      data: {
        userId: actor.userId,
        action: "UPDATE",
        entity: "Member",
        entityId: id,
        oldValue: existing,
        newValue: updated,
      },
    });
    return updated;
  });
}

/** "Xoá" hội viên = chuyển status LEFT + soft-delete (deletedAt) — không xoá cứng, giữ lịch sử referral/AuditLog. */
export async function removeMember(id: string) {
  const existing = await memberRepository.findById(id);
  if (!existing) throw new Error("Không tìm thấy hội viên.");

  const actor = await requireScope("member:delete", {
    territoryId: existing.territoryId,
    chapterId: existing.chapterId,
  });

  return prisma.$transaction(async (tx) => {
    const updated = await tx.member.update({
      where: { id },
      data: { status: "LEFT", deletedAt: new Date() },
    });
    await tx.auditLog.create({
      data: { userId: actor.userId, action: "DELETE", entity: "Member", entityId: id, oldValue: existing },
    });
    return updated;
  });
}
