import { prisma } from "@/lib/prisma";
import { requireScope } from "@/lib/authorize";
import { territoryRepository } from "@/repositories/territory.repository";
import type { TerritoryFormInput } from "@/schemas/territory";

export async function listTerritories(search?: string) {
  const actor = await requireScope("territory:view");
  const where = actor.territoryId ? { id: actor.territoryId } : {};
  return territoryRepository.findMany({ where, search });
}

export async function getTerritoryById(id: string) {
  const territory = await territoryRepository.findById(id);
  if (!territory) return null;
  await requireScope("territory:view", { territoryId: territory.id });
  return territory;
}

export async function createTerritory(input: TerritoryFormInput) {
  const actor = await requireScope("territory:create");

  const duplicate = await territoryRepository.findByCode(input.code);
  if (duplicate) throw new Error("Mã địa bàn đã tồn tại.");

  return prisma.$transaction(async (tx) => {
    const created = await tx.territory.create({
      data: {
        organizationId: actor.organizationId,
        name: input.name,
        code: input.code,
        description: input.description || null,
        foundedAt: input.foundedAt ? new Date(input.foundedAt) : null,
        isActive: input.isActive,
      },
    });
    await tx.auditLog.create({
      data: { userId: actor.userId, action: "CREATE", entity: "Territory", entityId: created.id, newValue: created },
    });
    return created;
  });
}

export async function updateTerritory(id: string, input: TerritoryFormInput) {
  const existing = await territoryRepository.findById(id);
  if (!existing) throw new Error("Không tìm thấy địa bàn.");

  const actor = await requireScope("territory:update", { territoryId: existing.id });

  if (input.code !== existing.code) {
    const duplicate = await territoryRepository.findByCode(input.code);
    if (duplicate) throw new Error("Mã địa bàn đã tồn tại.");
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.territory.update({
      where: { id },
      data: {
        name: input.name,
        code: input.code,
        description: input.description || null,
        foundedAt: input.foundedAt ? new Date(input.foundedAt) : null,
        isActive: input.isActive,
      },
    });
    await tx.auditLog.create({
      data: {
        userId: actor.userId,
        action: "UPDATE",
        entity: "Territory",
        entityId: id,
        oldValue: existing,
        newValue: updated,
      },
    });
    return updated;
  });
}

/** "Xóa" theo Master Prompt §8 thực chất là vô hiệu hoá (isActive=false) — không xoá cứng dữ liệu quan hệ. */
export async function disableTerritory(id: string) {
  const existing = await territoryRepository.findById(id);
  if (!existing) throw new Error("Không tìm thấy địa bàn.");

  const actor = await requireScope("territory:delete", { territoryId: existing.id });

  return prisma.$transaction(async (tx) => {
    const updated = await tx.territory.update({ where: { id }, data: { isActive: false } });
    await tx.auditLog.create({
      data: { userId: actor.userId, action: "DELETE", entity: "Territory", entityId: id, oldValue: existing },
    });
    return updated;
  });
}
