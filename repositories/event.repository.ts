import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const eventRepository = {
  async findMany(params: {
    where?: Prisma.EventWhereInput;
    search?: string;
    skip?: number;
    take?: number;
  } = {}) {
    const { where = {}, search, skip = 0, take = 20 } = params;

    const searchWhere: Prisma.EventWhereInput = search
      ? {
          OR: [
            { title: { contains: search } },
            { location: { contains: search } },
            { description: { contains: search } },
          ],
        }
      : {};

    const finalWhere: Prisma.EventWhereInput = { AND: [where, searchWhere] };

    const [rows, total] = await Promise.all([
      prisma.event.findMany({
        where: finalWhere,
        orderBy: { startAt: "desc" },
        skip,
        take,
        include: {
          territory: { select: { id: true, name: true } },
          chapter: { select: { id: true, name: true } },
          _count: {
            select: {
              registrations: true,
              checkIns: true,
            },
          },
        },
      }),
      prisma.event.count({ where: finalWhere }),
    ]);

    return { rows, total };
  },

  findById(id: string) {
    return prisma.event.findUnique({
      where: { id },
      include: {
        territory: { select: { id: true, name: true } },
        chapter: { select: { id: true, name: true } },
        organization: { select: { id: true, name: true } },
        registrations: {
          include: {
            checkIn: true,
            guest: { select: { id: true, fullName: true, phone: true } },
            member: { select: { id: true, fullName: true, memberCode: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { registrations: true, checkIns: true },
        },
      },
    });
  },

  findBySlug(slug: string) {
    return prisma.event.findUnique({
      where: { slug },
      include: {
        territory: { select: { id: true, name: true } },
        chapter: { select: { id: true, name: true } },
        organization: { select: { id: true, name: true } },
        _count: { select: { registrations: true } },
      },
    });
  },

  count(where: Prisma.EventWhereInput = {}) {
    return prisma.event.count({ where });
  },

  async findRegistrationByCode(eventId: string, code: string) {
    return prisma.eventRegistration.findFirst({
      where: {
        eventId,
        code: code.trim().toUpperCase(),
      },
      include: {
        checkIn: true,
      },
    });
  },
};
