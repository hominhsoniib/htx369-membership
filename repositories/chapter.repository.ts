import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const chapterRepository = {
  findMany(params: { where?: Prisma.ChapterWhereInput; search?: string } = {}) {
    const { where = {}, search } = params;
    const searchWhere: Prisma.ChapterWhereInput = search
      ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { code: { contains: search, mode: "insensitive" } }] }
      : {};

    return prisma.chapter.findMany({
      where: { AND: [where, searchWhere] },
      orderBy: { name: "asc" },
      include: {
        territory: { select: { id: true, name: true } },
        _count: { select: { members: true } },
      },
    });
  },

  findById(id: string) {
    return prisma.chapter.findUnique({
      where: { id },
      include: {
        territory: { select: { id: true, name: true } },
        _count: { select: { members: true, guests: true, events: true } },
      },
    });
  },

  findByCode(code: string) {
    return prisma.chapter.findUnique({ where: { code } });
  },
};
