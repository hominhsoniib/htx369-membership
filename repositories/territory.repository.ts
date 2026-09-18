import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const territoryRepository = {
  findMany(params: { where?: Prisma.TerritoryWhereInput; search?: string } = {}) {
    const { where = {}, search } = params;
    const searchWhere: Prisma.TerritoryWhereInput = search
      ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { code: { contains: search, mode: "insensitive" } }] }
      : {};

    return prisma.territory.findMany({
      where: { AND: [where, searchWhere] },
      orderBy: { name: "asc" },
      include: { _count: { select: { chapters: true, members: true } } },
    });
  },

  findById(id: string) {
    return prisma.territory.findUnique({
      where: { id },
      include: { _count: { select: { chapters: true, members: true, guests: true, events: true } } },
    });
  },

  findByCode(code: string) {
    return prisma.territory.findUnique({ where: { code } });
  },
};
