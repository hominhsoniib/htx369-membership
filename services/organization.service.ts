import { prisma } from "@/lib/prisma";
import { requireScope } from "@/lib/authorize";
import type { OrganizationFormInput } from "@/schemas/organization";

export async function getOrganization() {
  const actor = await requireScope("organization:view");
  return prisma.organization.findUniqueOrThrow({ where: { id: actor.organizationId } });
}

export async function updateOrganization(input: OrganizationFormInput) {
  const actor = await requireScope("organization:update");

  return prisma.$transaction(async (tx) => {
    const existing = await tx.organization.findUniqueOrThrow({ where: { id: actor.organizationId } });
    const updated = await tx.organization.update({
      where: { id: actor.organizationId },
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
        oldValue: existing,
        newValue: updated,
      },
    });
    return updated;
  });
}
