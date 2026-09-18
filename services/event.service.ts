import { prisma } from "@/lib/prisma";
import { getActor, type Actor } from "@/lib/session";
import { assertCan, canActOnScope, ForbiddenError } from "@/lib/rbac";
import { requireScope } from "@/lib/authorize";
import { eventRepository } from "@/repositories/event.repository";
import type { EventFormInput, PublicRegistrationInput, CheckInInput } from "@/schemas/event";
import type { Prisma } from "@prisma/client";

function listWhere(actor: Actor): Prisma.EventWhereInput {
  if (actor.role === "CHAPTER_LEADER" && actor.chapterId) return { chapterId: actor.chapterId };
  if (actor.role === "REGIONAL_LEADER" && actor.territoryId) return { territoryId: actor.territoryId };
  return {};
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export async function listEvents(params: {
  search?: string;
  status?: "DRAFT" | "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";
  chapterId?: string;
  page?: number;
} = {}) {
  const actor = await getActor();
  assertCan(actor.role, "event:view");

  const conditions: Prisma.EventWhereInput[] = [listWhere(actor)];
  if (params.status) conditions.push({ status: params.status });
  if (params.chapterId) conditions.push({ chapterId: params.chapterId });

  const page = Math.max(1, params.page ?? 1);
  const pageSize = 20;

  const { rows, total } = await eventRepository.findMany({
    where: { AND: conditions },
    search: params.search,
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return { rows, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getEventById(id: string) {
  const event = await eventRepository.findById(id);
  if (!event) return null;

  const actor = await getActor();
  assertCan(actor.role, "event:view");

  if (!canActOnScope(actor.role, "event:view", actor, { territoryId: event.territoryId ?? undefined, chapterId: event.chapterId ?? undefined })) {
    throw new ForbiddenError("event:view");
  }

  return event;
}

export async function getEventBySlug(slug: string) {
  // Public access — no auth required for viewing event info to register
  return eventRepository.findBySlug(slug);
}

export async function createEvent(input: EventFormInput) {
  const actor = await requireScope("event:create", {
    territoryId: input.territoryId || undefined,
    chapterId: input.chapterId || undefined,
  });

  let baseSlug = slugify(input.title);
  let slug = baseSlug;
  let count = 1;
  while (await prisma.event.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${count++}`;
  }

  return prisma.$transaction(async (tx) => {
    const created = await tx.event.create({
      data: {
        organizationId: actor.organizationId,
        territoryId: input.territoryId || null,
        chapterId: input.chapterId || null,
        title: input.title,
        slug,
        description: input.description || null,
        startAt: new Date(input.startAt),
        endAt: new Date(input.endAt),
        location: input.location || null,
        capacity: input.capacity && !isNaN(input.capacity) ? input.capacity : null,
        status: input.status,
        registrationEnabled: input.registrationEnabled,
        organizerUserId: actor.userId,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: actor.userId,
        action: "CREATE",
        entity: "Event",
        entityId: created.id,
        newValue: created,
      },
    });

    return created;
  });
}

export async function updateEvent(id: string, input: EventFormInput) {
  const existing = await eventRepository.findById(id);
  if (!existing) throw new Error("Không tìm thấy sự kiện.");

  const actor = await requireScope("event:update", {
    territoryId: existing.territoryId ?? undefined,
    chapterId: existing.chapterId ?? undefined,
  });

  return prisma.$transaction(async (tx) => {
    const updated = await tx.event.update({
      where: { id },
      data: {
        territoryId: input.territoryId || null,
        chapterId: input.chapterId || null,
        title: input.title,
        description: input.description || null,
        startAt: new Date(input.startAt),
        endAt: new Date(input.endAt),
        location: input.location || null,
        capacity: input.capacity && !isNaN(input.capacity) ? input.capacity : null,
        status: input.status,
        registrationEnabled: input.registrationEnabled,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: actor.userId,
        action: "UPDATE",
        entity: "Event",
        entityId: id,
        oldValue: existing,
        newValue: updated,
      },
    });

    return updated;
  });
}

export async function deleteEvent(id: string) {
  const existing = await eventRepository.findById(id);
  if (!existing) throw new Error("Không tìm thấy sự kiện.");

  const actor = await requireScope("event:delete", {
    territoryId: existing.territoryId ?? undefined,
    chapterId: existing.chapterId ?? undefined,
  });

  return prisma.$transaction(async (tx) => {
    const deleted = await tx.event.delete({ where: { id } });

    await tx.auditLog.create({
      data: {
        userId: actor.userId,
        action: "DELETE",
        entity: "Event",
        entityId: id,
        oldValue: existing,
      },
    });

    return deleted;
  });
}

/** Đăng ký tham dự sự kiện (Công khai dành cho Khách mời / Hội viên) */
export async function registerForEvent(input: PublicRegistrationInput) {
  const event = await prisma.event.findUnique({ where: { id: input.eventId } });
  if (!event) throw new Error("Sự kiện không tồn tại.");
  if (!event.registrationEnabled) throw new Error("Sự kiện đã đóng cổng đăng ký.");
  if (event.status === "CANCELLED" || event.status === "COMPLETED") throw new Error("Sự kiện đã kết thúc hoặc bị hủy.");

  // Kiểm tra giới hạn số lượng nếu có
  if (event.capacity) {
    const currentRegs = await prisma.eventRegistration.count({ where: { eventId: input.eventId } });
    if (currentRegs >= event.capacity) {
      throw new Error("Sự kiện đã đạt giới hạn số lượng tham dự.");
    }
  }

  // Tự động sinh registration code: REG-XXXXXX
  const regCount = await prisma.eventRegistration.count();
  const code = `REG-${String(regCount + 1001).padStart(6, "0")}`;

  return prisma.$transaction(async (tx) => {
    // 1. Tự động tìm hoặc tạo Guest record nếu chưa có
    let guestId: string | undefined;
    if (input.phone) {
      const existingGuest = await tx.guest.findFirst({ where: { phone: input.phone } });
      if (existingGuest) {
        guestId = existingGuest.id;
      } else {
        const newGuest = await tx.guest.create({
          data: {
            territoryId: event.territoryId,
            chapterId: event.chapterId,
            fullName: input.fullName,
            phone: input.phone,
            email: input.email || null,
            company: input.company || null,
            position: input.position || null,
            source: "event_registration",
            status: "REGISTERED",
          },
        });
        guestId = newGuest.id;
      }
    }

    // 2. Tạo đăng ký
    const registration = await tx.eventRegistration.create({
      data: {
        eventId: input.eventId,
        guestId: guestId || null,
        fullName: input.fullName,
        phone: input.phone,
        email: input.email || null,
        company: input.company || null,
        position: input.position || null,
        industry: input.industry || null,
        referrer: input.referrer || null,
        code,
      },
    });

    return registration;
  });
}

/** Điểm danh sự kiện bằng Mã đăng ký (Check-in) */
export async function checkInRegistration(input: CheckInInput) {
  const actor = await getActor();
  assertCan(actor.role, "event:checkin");

  const registration = await eventRepository.findRegistrationByCode(input.eventId, input.registrationCode);
  if (!registration) {
    throw new Error("Không tìm thấy thông tin đăng ký với mã này trong sự kiện.");
  }

  if (registration.checkIn) {
    throw new Error(`Mã đăng ký ${registration.code} (${registration.fullName}) đã điểm danh lúc ${new Date(registration.checkIn.checkedInAt).toLocaleTimeString("vi-VN")}.`);
  }

  return prisma.$transaction(async (tx) => {
    const checkIn = await tx.eventCheckIn.create({
      data: {
        eventId: input.eventId,
        registrationId: registration.id,
      },
    });

    // Cập nhật trạng thái Guest sang ATTENDED nếu có
    if (registration.guestId) {
      await tx.guest.update({
        where: { id: registration.guestId },
        data: { status: "ATTENDED" },
      });
    }

    await tx.auditLog.create({
      data: {
        userId: actor.userId,
        action: "CHECK_IN",
        entity: "EventRegistration",
        entityId: registration.id,
        newValue: { checkIn, registration },
      },
    });

    return { checkIn, registration };
  });
}
