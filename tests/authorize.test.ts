import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/session", () => ({
  getActor: vi.fn(),
}));

import { getActor } from "@/lib/session";
import { requireScope } from "@/lib/authorize";
import { ForbiddenError } from "@/lib/rbac";

describe("requireScope (Service Layer authorization helper)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("ném ForbiddenError khi actor không có permission cơ bản", async () => {
    (getActor as any).mockResolvedValue({
      userId: "u1", role: "MEMBER", organizationId: "o1", territoryId: "t1", chapterId: "c1",
    });
    await expect(requireScope("event:delete")).rejects.toThrow(ForbiddenError);
  });

  it("ném ForbiddenError khi có permission nhưng subject ngoài scope (chapter khác)", async () => {
    (getActor as any).mockResolvedValue({
      userId: "u1", role: "CHAPTER_LEADER", organizationId: "o1", territoryId: "t1", chapterId: "c1",
    });
    await expect(
      requireScope("member:update", { territoryId: "t1", chapterId: "c2" })
    ).rejects.toThrow(ForbiddenError);
  });

  it("trả về actor khi permission + scope hợp lệ", async () => {
    const actor = { userId: "u1", role: "CHAPTER_LEADER", organizationId: "o1", territoryId: "t1", chapterId: "c1" };
    (getActor as any).mockResolvedValue(actor);
    const result = await requireScope("member:update", { territoryId: "t1", chapterId: "c1" });
    expect(result).toEqual(actor);
  });

  it("ADMIN không bị chặn dù subject thuộc territory/chapter khác", async () => {
    (getActor as any).mockResolvedValue({
      userId: "u2", role: "ADMIN", organizationId: "o1", territoryId: null, chapterId: null,
    });
    const result = await requireScope("member:delete", { territoryId: "t9", chapterId: "c9" });
    expect(result.role).toBe("ADMIN");
  });
});
