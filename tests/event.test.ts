import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    event: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    eventRegistration: {
      count: vi.fn().mockResolvedValue(10),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    guest: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    eventCheckIn: {
      create: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn((cb) => cb(prismaMock)),
  },
}));

const prismaMock = {
  event: {
    create: vi.fn(),
  },
  guest: {
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  eventRegistration: {
    create: vi.fn(),
  },
  eventCheckIn: {
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
import { createEvent, registerForEvent, checkInRegistration } from "@/services/event.service";

describe("Event & Checkin Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.$transaction as any).mockImplementation((cb: any) => cb(prismaMock));
  });

  it("tạo mới sự kiện và tự động sinh slug hợp lệ", async () => {
    (getActor as any).mockResolvedValue({
      userId: "u1",
      role: "SUPER_ADMIN",
      organizationId: "org1",
    });

    (prisma.event.findUnique as any).mockResolvedValue(null);

    prismaMock.event.create.mockResolvedValue({
      id: "e1",
      title: "Họp Mặt Saigon Chapter",
      slug: "hop-mat-saigon-chapter",
    });

    const result = await createEvent({
      title: "Họp Mặt Saigon Chapter",
      startAt: "2026-10-01T08:00",
      endAt: "2026-10-01T11:00",
      status: "UPCOMING",
      registrationEnabled: true,
    });

    expect(result).toHaveProperty("slug", "hop-mat-saigon-chapter");
    expect(prismaMock.event.create).toHaveBeenCalled();
  });

  it("cho phép khách mời đăng ký tham dự sự kiện và sinh mã REG-XXXXXX", async () => {
    (prisma.event.findUnique as any).mockResolvedValue({
      id: "e1",
      registrationEnabled: true,
      status: "UPCOMING",
      capacity: 50,
      territoryId: "t1",
      chapterId: "c1",
    });

    prismaMock.guest.findFirst.mockResolvedValue(null);
    prismaMock.guest.create.mockResolvedValue({ id: "g1" });
    prismaMock.eventRegistration.create.mockResolvedValue({
      id: "r1",
      eventId: "e1",
      fullName: "Trần Văn B",
      code: "REG-001011",
    });

    const reg = await registerForEvent({
      eventId: "e1",
      fullName: "Trần Văn B",
      phone: "0918888888",
      email: "b@demo.local",
    });

    expect(reg).toHaveProperty("code", "REG-001011");
    expect(prismaMock.eventRegistration.create).toHaveBeenCalled();
  });

  it("thực hiện điểm danh check-in và ghi nhận AuditLog", async () => {
    (getActor as any).mockResolvedValue({
      userId: "u1",
      role: "ADMIN",
      organizationId: "org1",
    });

    (prisma.eventRegistration.findFirst as any).mockResolvedValue({
      id: "r1",
      eventId: "e1",
      code: "REG-001011",
      fullName: "Trần Văn B",
      guestId: "g1",
      checkIn: null,
    });

    prismaMock.eventCheckIn.create.mockResolvedValue({ id: "ci1", checkedInAt: new Date() });
    prismaMock.guest.update.mockResolvedValue({ id: "g1", status: "ATTENDED" });

    const result = await checkInRegistration({
      eventId: "e1",
      registrationCode: "REG-001011",
    });

    expect(result.registration).toHaveProperty("fullName", "Trần Văn B");
    expect(prismaMock.eventCheckIn.create).toHaveBeenCalled();
    expect(prismaMock.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: "CHECK_IN", entity: "EventRegistration" }),
      })
    );
  });
});
