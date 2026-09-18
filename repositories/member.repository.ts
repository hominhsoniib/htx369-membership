import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const memberRepository = {
  async findMany(params: {
    where?: Prisma.MemberWhereInput;
    search?: string;
    skip?: number;
    take?: number;
  } = {}) {
    const { where = {}, search, skip = 0, take = 20 } = params;

    const searchWhere: Prisma.MemberWhereInput = search
      ? {
          OR: [
            { fullName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
            { memberCode: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const finalWhere: Prisma.MemberWhereInput = { AND: [where, searchWhere, { deletedAt: null }] };

    const [rows, total] = await Promise.all([
      prisma.member.findMany({
        where: finalWhere,
        orderBy: { createdAt: "desc" },
        skip,
        take,
        include: {
          territory: { select: { id: true, name: true } },
          chapter: { select: { id: true, name: true } },
          industry: { select: { id: true, name: true } },
        },
      }),
      prisma.member.count({ where: finalWhere }),
    ]);

    return { rows, total };
  },

  findById(id: string) {
    return prisma.member.findFirst({
      where: { id, deletedAt: null },
      include: {
        territory: { select: { id: true, name: true } },
        chapter: { select: { id: true, name: true } },
        industry: { select: { id: true, name: true } },
        referrer: { select: { id: true, fullName: true, memberCode: true } },
        referrals: { select: { id: true, fullName: true, memberCode: true } },
      },
    });
  },

  findByEmailOrPhone(email: string, phone: string) {
    return prisma.member.findFirst({ where: { OR: [{ email }, { phone }], deletedAt: null } });
  },

  /** Danh sách rút gọn cho dropdown referrer/select — không phân trang vì chỉ dùng nội bộ form. */
  findAllForSelect(where: Prisma.MemberWhereInput = {}) {
    return prisma.member.findMany({
      where: { AND: [where, { deletedAt: null }] },
      select: { id: true, fullName: true, memberCode: true },
      orderBy: { fullName: "asc" },
      take: 500,
    });
  },

  count() {
    return prisma.member.count();
  },
};
