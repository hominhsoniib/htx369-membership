import { prisma } from "@/lib/prisma";
import { requireScope } from "@/lib/authorize";
import type { OrganizationFormInput } from "@/schemas/organization";

export async function getOrganization() {
  const actor = await requireScope("organization:view");
  if (actor.organizationId) {
    const org = await prisma.organization.findUnique({ where: { id: actor.organizationId } });
    if (org) return org;
  }
  return prisma.organization.findFirst();
}

export async function updateOrganization(input: OrganizationFormInput) {
  const actor = await requireScope("organization:update");

  return prisma.$transaction(async (tx) => {
    const existing = await prisma.organization.findFirst();
    const orgId = actor.organizationId || existing?.id;
    if (!orgId) throw new Error("Không tìm thấy tổ chức.");

    const updated = await tx.organization.update({
      where: { id: orgId },
      data: {
        name: input.name,
        logoUrl: input.logoUrl || null,
        description: input.description || null,
        email: input.email || null,
        phone: input.phone || null,
        website: input.website || null,
        isActive: input.isActive,
      },
    });
    await tx.auditLog.create({
      data: {
        userId: actor.userId,
        action: "UPDATE",
        entity: "Organization",
        entityId: updated.id,
        oldValue: existing || {},
        newValue: updated,
      },
    });
    return updated;
  });
}
