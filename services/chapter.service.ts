import { prisma } from "@/lib/prisma";
import { requireScope } from "@/lib/authorize";
import { chapterRepository } from "@/repositories/chapter.repository";
import type { ChapterFormInput } from "@/schemas/chapter";

export async function listChapters(search?: string) {
  const actor = await requireScope("chapter:view");
  const where = actor.chapterId
    ? { id: actor.chapterId }
    : actor.territoryId
      ? { territoryId: actor.territoryId }
      : {};
  return chapterRepository.findMany({ where, search });
}

export async function getChapterById(id: string) {
  const chapter = await chapterRepository.findById(id);
  if (!chapter) return null;
  await requireScope("chapter:view", { territoryId: chapter.territoryId, chapterId: chapter.id });
  return chapter;
}

export async function createChapter(input: ChapterFormInput) {
  // Rule 1: một Chapter thuộc một Territory — quyền tạo kiểm tra theo territoryId người dùng chọn.
  const actor = await requireScope("chapter:create", { territoryId: input.territoryId });

  const duplicate = await chapterRepository.findByCode(input.code);
  if (duplicate) throw new Error("Mã chapter đã tồn tại.");

  return prisma.$transaction(async (tx) => {
    const created = await tx.chapter.create({
      data: {
        territoryId: input.territoryId,
        name: input.name,
        code: input.code,
        description: input.description || null,
        meetingLocation: input.meetingLocation || null,
        meetingSchedule: input.meetingSchedule || null,
        foundedAt: input.foundedAt ? new Date(input.foundedAt) : null,
        isActive: input.isActive,
      },
    });
    await tx.auditLog.create({
      data: { userId: actor.userId, action: "CREATE", entity: "Chapter", entityId: created.id, newValue: created },
    });
    return created;
  });
}

export async function updateChapter(id: string, input: ChapterFormInput) {
  const existing = await chapterRepository.findById(id);
  if (!existing) throw new Error("Không tìm thấy chapter.");

  const actor = await requireScope("chapter:update", {
    territoryId: existing.territoryId,
    chapterId: existing.id,
  });

  if (input.code !== existing.code) {
    const duplicate = await chapterRepository.findByCode(input.code);
    if (duplicate) throw new Error("Mã chapter đã tồn tại.");
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.chapter.update({
      where: { id },
      data: {
        // territoryId cố ý KHÔNG cho đổi ở form update thường — chuyển chapter sang
        // territory khác là thao tác nhạy cảm (ảnh hưởng Rule 1), để riêng cho thao tác quản trị khác nếu cần.
        name: input.name,
        code: input.code,
        description: input.description || null,
        meetingLocation: input.meetingLocation || null,
        meetingSchedule: input.meetingSchedule || null,
        foundedAt: input.foundedAt ? new Date(input.foundedAt) : null,
        isActive: input.isActive,
      },
    });
    await tx.auditLog.create({
      data: {
        userId: actor.userId,
        action: "UPDATE",
        entity: "Chapter",
        entityId: id,
        oldValue: existing,
        newValue: updated,
      },
    });
    return updated;
  });
}

export async function disableChapter(id: string) {
  const existing = await chapterRepository.findById(id);
  if (!existing) throw new Error("Không tìm thấy chapter.");

  // chapter:delete chỉ REGIONAL_LEADER trở lên (khớp docs/RBAC.md) — CHAPTER_LEADER
  // chỉ có chapter:update, requireScope sẽ tự chặn qua assertCan().
  const actor = await requireScope("chapter:delete", {
    territoryId: existing.territoryId,
    chapterId: existing.id,
  });

  return prisma.$transaction(async (tx) => {
    const updated = await tx.chapter.update({ where: { id }, data: { isActive: false } });
    await tx.auditLog.create({
      data: { userId: actor.userId, action: "DELETE", entity: "Chapter", entityId: id, oldValue: existing },
    });
    return updated;
  });
}
