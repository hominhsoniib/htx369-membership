import { prisma } from "@/lib/prisma";
import { getActor, type Actor } from "@/lib/session";
import { assertCan, canActOnScope, ForbiddenError } from "@/lib/rbac";
import { requireScope } from "@/lib/authorize";
import { guestRepository } from "@/repositories/guest.repository";
import type { GuestFormInput, ConvertGuestInput } from "@/schemas/guest";
import type { Prisma } from "@prisma/client";

function listWhere(actor: Actor): Prisma.GuestWhereInput {
  if (actor.role === "CHAPTER_LEADER" && actor.chapterId) return { chapterId: actor.chapterId };
  if (actor.role === "REGIONAL_LEADER" && actor.territoryId) return { territoryId: actor.territoryId };
  return {};
}

export async function listGuests(params: {
  search?: string;
  status?: "REGISTERED" | "CONFIRMED" | "ATTENDED" | "NO_SHOW" | "FOLLOW_UP" | "JOINED";
  chapterId?: string;
  page?: number;
} = {}) {
  const actor = await getActor();
  assertCan(actor.role, "guest:view");

  const conditions: Prisma.GuestWhereInput[] = [listWhere(actor)];
  if (params.status) conditions.push({ status: params.status });
  if (params.chapterId) conditions.push({ chapterId: params.chapterId });

  const page = Math.max(1, params.page ?? 1);
  const pageSize = 20;

  const { rows, total } = await guestRepository.findMany({
    where: { AND: conditions },
    search: params.search,
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return { rows, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getGuestById(id: string) {
  const guest = await guestRepository.findById(id);
  if (!guest) return null;

  const actor = await getActor();
  assertCan(actor.role, "guest:view");

  if (!canActOnScope(actor.role, "guest:view", actor, { territoryId: guest.territoryId ?? undefined, chapterId: guest.chapterId ?? undefined })) {
    throw new ForbiddenError("guest:view");
  }

  return guest;
}

export async function createGuest(input: GuestFormInput) {
  const actor = await requireScope("guest:create", {
    territoryId: input.territoryId || undefined,
    chapterId: input.chapterId || undefined,
  });

  return prisma.$transaction(async (tx) => {
    const created = await tx.guest.create({
      data: {
        territoryId: input.territoryId || null,
        chapterId: input.chapterId || null,
        industryId: input.industryId || null,
        fullName: input.fullName,
        phone: input.phone,
        email: input.email || null,
        company: input.company || null,
        position: input.position || null,
        source: input.source || "member_referral",
        notes: input.notes || null,
        status: input.status,
        referrerMemberId: input.referrerMemberId || null,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: actor.userId,
        action: "CREATE",
        entity: "Guest",
        entityId: created.id,
        newValue: created,
      },
    });

    return created;
  });
}

export async function updateGuest(id: string, input: GuestFormInput) {
  const existing = await guestRepository.findById(id);
  if (!existing) throw new Error("Không tìm thấy thông tin khách mời.");

  const actor = await requireScope("guest:update", {
    territoryId: existing.territoryId ?? undefined,
    chapterId: existing.chapterId ?? undefined,
  });

  return prisma.$transaction(async (tx) => {
    const updated = await tx.guest.update({
      where: { id },
      data: {
        territoryId: input.territoryId || null,
        chapterId: input.chapterId || null,
        industryId: input.industryId || null,
        fullName: input.fullName,
        phone: input.phone,
        email: input.email || null,
        company: input.company || null,
        position: input.position || null,
        source: input.source || existing.source,
        notes: input.notes || null,
        status: input.status,
        referrerMemberId: input.referrerMemberId || null,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: actor.userId,
        action: "UPDATE",
        entity: "Guest",
        entityId: id,
        oldValue: existing,
        newValue: updated,
      },
    });

    return updated;
  });
}

/** Chuyển đổi Khách mời -> Hội viên chính thức */
export async function convertGuestToMember(input: ConvertGuestInput) {
  const guest = await guestRepository.findById(input.guestId);
  if (!guest) throw new Error("Không tìm thấy thông tin khách mời.");

  if (guest.status === "JOINED" || guest.convertedMemberId) {
    throw new Error("Khách mời này đã được chuyển đổi thành hội viên trước đó.");
  }

  const actor = await requireScope("member:create", {
    territoryId: input.territoryId,
    chapterId: input.chapterId,
  });

  const memberCount = await prisma.member.count();
  const memberCode = `HV-${String(memberCount + 1).padStart(6, "0")}`;

  return prisma.$transaction(async (tx) => {
    // 1. Tạo hội viên mới
    const newMember = await tx.member.create({
      data: {
        territoryId: input.territoryId,
        chapterId: input.chapterId,
        industryId: input.industryId || guest.industryId || null,
        memberCode,
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        company: input.company || guest.company || null,
        position: input.position || guest.position || null,
        status: "ACTIVE",
        referrerId: input.referrerId || guest.referrerMemberId || null,
      },
    });

    // 2. Cập nhật Guest sang JOINED và gắn convertedMemberId
    const updatedGuest = await tx.guest.update({
      where: { id: input.guestId },
      data: {
        status: "JOINED",
        convertedMemberId: newMember.id,
      },
    });

    // 3. Ghi nhận AuditLog CONVERT_GUEST
    await tx.auditLog.create({
      data: {
        userId: actor.userId,
        action: "CONVERT_GUEST",
        entity: "Guest",
        entityId: guest.id,
        oldValue: guest,
        newValue: { guest: updatedGuest, createdMember: newMember },
      },
    });

    return newMember;
  });
}
