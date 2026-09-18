import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const guestRepository = {
  async findMany(params: {
    where?: Prisma.GuestWhereInput;
    search?: string;
    skip?: number;
    take?: number;
  } = {}) {
    const { where = {}, search, skip = 0, take = 20 } = params;

    const searchWhere: Prisma.GuestWhereInput = search
      ? {
          OR: [
            { fullName: { contains: search } },
            { email: { contains: search } },
            { phone: { contains: search } },
            { company: { contains: search } },
          ],
        }
      : {};

    const finalWhere: Prisma.GuestWhereInput = { AND: [where, searchWhere] };

    const [rows, total] = await Promise.all([
      prisma.guest.findMany({
        where: finalWhere,
        orderBy: { createdAt: "desc" },
        skip,
        take,
        include: {
          territory: { select: { id: true, name: true } },
          chapter: { select: { id: true, name: true } },
          industry: { select: { id: true, name: true } },
          referrerMember: { select: { id: true, fullName: true, memberCode: true } },
          convertedMember: { select: { id: true, fullName: true, memberCode: true } },
        },
      }),
      prisma.guest.count({ where: finalWhere }),
    ]);

    return { rows, total };
  },

  findById(id: string) {
    return prisma.guest.findUnique({
      where: { id },
      include: {
        territory: { select: { id: true, name: true } },
        chapter: { select: { id: true, name: true } },
        industry: { select: { id: true, name: true } },
        referrerMember: { select: { id: true, fullName: true, memberCode: true } },
        convertedMember: { select: { id: true, fullName: true, memberCode: true } },
        registrations: {
          include: {
            event: { select: { id: true, title: true, startAt: true } },
            checkIn: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  },

  findByPhone(phone: string) {
    return prisma.guest.findFirst({ where: { phone } });
  },

  count(where: Prisma.GuestWhereInput = {}) {
    return prisma.guest.count({ where });
  },
};
