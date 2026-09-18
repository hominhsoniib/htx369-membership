import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";

// Mock Prisma singleton trước khi import module dùng nó
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import { authorizeCredentials } from "@/lib/auth";

describe("authorizeCredentials (Phase 3 — Authentication)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("trả về null khi input không hợp lệ (thiếu password)", async () => {
    const result = await authorizeCredentials({ email: "a@b.com" });
    expect(result).toBeNull();
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("trả về null khi email không tồn tại", async () => {
    (prisma.user.findUnique as any).mockResolvedValue(null);
    const result = await authorizeCredentials({ email: "notfound@demo.local", password: "Demo@12345" });
    expect(result).toBeNull();
  });

  it("trả về null khi tài khoản bị vô hiệu hoá (isActive=false)", async () => {
    (prisma.user.findUnique as any).mockResolvedValue({
      id: "u1", email: "a@b.com", passwordHash: await bcrypt.hash("Demo@12345", 10), isActive: false,
    });
    const result = await authorizeCredentials({ email: "a@b.com", password: "Demo@12345" });
    expect(result).toBeNull();
  });

  it("trả về null khi sai mật khẩu", async () => {
    (prisma.user.findUnique as any).mockResolvedValue({
      id: "u1", email: "a@b.com", passwordHash: await bcrypt.hash("Demo@12345", 10), isActive: true,
    });
    const result = await authorizeCredentials({ email: "a@b.com", password: "sai-mat-khau" });
    expect(result).toBeNull();
  });

  it("trả về user + role/territoryId/chapterId khi đăng nhập thành công, và ghi AuditLog LOGIN", async () => {
    const hash = await bcrypt.hash("Demo@12345", 10);
    (prisma.user.findUnique as any).mockResolvedValue({
      id: "u1",
      email: "chapter.leader@demo.local",
      fullName: "Chapter Leader Demo",
      passwordHash: hash,
      isActive: true,
      role: "CHAPTER_LEADER",
      organizationId: "org1",
      member: { territoryId: "t1", chapterId: "c1" },
    });

    const result = await authorizeCredentials({ email: "chapter.leader@demo.local", password: "Demo@12345" });

    expect(result).toMatchObject({
      id: "u1",
      role: "CHAPTER_LEADER",
      territoryId: "t1",
      chapterId: "c1",
    });
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "u1" } })
    );
    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ action: "LOGIN", userId: "u1" }) })
    );
  });
});
