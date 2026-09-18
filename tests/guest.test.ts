import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Prisma & Session before importing service modules
vi.mock("@/lib/prisma", () => ({
  prisma: {
    guest: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn().mockResolvedValue(10),
    },
    member: {
      count: vi.fn().mockResolvedValue(50),
      create: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(prismaMock)),
  },
}));

const prismaMock = {
  guest: {
    create: vi.fn(),
    update: vi.fn(),
  },
  member: {
    create: vi.fn(),
  },
  auditLog: {
    create: vi.fn(),
  },
};

vi.mock("@/lib/session", () => ({
  getActor: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { getActor } from "@/lib/session";
import { createGuest, convertGuestToMember } from "@/services/guest.service";

describe("Guest Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.$transaction as any).mockImplementation((cb: any) => cb(prismaMock));
  });

  it("cho phép SUPER_ADMIN tạo mới khách mời", async () => {
    (getActor as any).mockResolvedValue({
      userId: "u1",
      role: "SUPER_ADMIN",
      organizationId: "org1",
    });

    prismaMock.guest.create.mockResolvedValue({
      id: "g1",
      fullName: "Nguyễn Văn A",
      phone: "0901234567",
      status: "REGISTERED",
    });

    const result = await createGuest({
      fullName: "Nguyễn Văn A",
      phone: "0901234567",
      status: "REGISTERED",
    });

    expect(result).toHaveProperty("id", "g1");
    expect(prismaMock.guest.create).toHaveBeenCalled();
    expect(prismaMock.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: "CREATE", entity: "Guest" }),
      })
    );
  });

  it("chuyển đổi Khách mời sang Hội viên chính thức thành công", async () => {
    (getActor as any).mockResolvedValue({
      userId: "u1",
      role: "SUPER_ADMIN",
      organizationId: "org1",
    });

    (prisma.guest.findUnique as any).mockResolvedValue({
      id: "g1",
      fullName: "Khách Mời 1",
      phone: "0909999999",
      email: "km1@demo.local",
      status: "ATTENDED",
      convertedMemberId: null,
    });

    prismaMock.member.create.mockResolvedValue({
      id: "m1",
      memberCode: "HV-000051",
      fullName: "Khách Mời 1",
      email: "km1@demo.local",
      phone: "0909999999",
    });

    prismaMock.guest.update.mockResolvedValue({
      id: "g1",
      status: "JOINED",
      convertedMemberId: "m1",
    });

    const result = await convertGuestToMember({
      guestId: "g1",
      territoryId: "t1",
      chapterId: "c1",
      fullName: "Khách Mời 1",
      email: "km1@demo.local",
      phone: "0909999999",
    });

    expect(result).toHaveProperty("id", "m1");
    expect(prismaMock.guest.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "g1" },
        data: expect.objectContaining({ status: "JOINED", convertedMemberId: "m1" }),
      })
    );
    expect(prismaMock.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: "CONVERT_GUEST", entity: "Guest" }),
      })
    );
  });
});
