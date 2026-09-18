import { describe, it, expect } from "vitest";
import { can, getScope, canActOnScope, assertCan, ForbiddenError } from "@/lib/rbac";

describe("RBAC — permission matrix", () => {
  it("SUPER_ADMIN và ADMIN có full quyền trên mọi action", () => {
    expect(getScope("SUPER_ADMIN", "member:delete")).toBe("full");
    expect(getScope("ADMIN", "export:data")).toBe("full");
  });

  it("MEMBER không có quyền tạo/xoá Territory, Chapter, Member", () => {
    expect(can("MEMBER", "territory:create")).toBe(false);
    expect(can("MEMBER", "chapter:delete")).toBe(false);
    expect(can("MEMBER", "member:delete")).toBe(false);
  });

  it("MEMBER được xem hồ sơ và tạo Guest", () => {
    expect(can("MEMBER", "member:view")).toBe(true);
    expect(can("MEMBER", "guest:create")).toBe(true);
  });

  it("CHAPTER_LEADER được update Chapter nhưng không được xoá", () => {
    expect(can("CHAPTER_LEADER", "chapter:update")).toBe(true);
    expect(can("CHAPTER_LEADER", "chapter:delete")).toBe(false);
  });

  it("assertCan ném ForbiddenError khi role không có quyền", () => {
    expect(() => assertCan("MEMBER", "event:delete")).toThrow(ForbiddenError);
  });
});

describe("RBAC — Territory isolation (Rule 6)", () => {
  const regionalLeader = { territoryId: "t1", chapterId: null };

  it("REGIONAL_LEADER thao tác được Chapter trong Territory của mình", () => {
    expect(
      canActOnScope("REGIONAL_LEADER", "chapter:update", regionalLeader, { territoryId: "t1", chapterId: "c1" })
    ).toBe(true);
  });

  it("REGIONAL_LEADER KHÔNG thao tác được Chapter ở Territory khác", () => {
    expect(
      canActOnScope("REGIONAL_LEADER", "chapter:update", regionalLeader, { territoryId: "t2", chapterId: "c9" })
    ).toBe(false);
  });
});

describe("RBAC — Chapter isolation (Rule 6)", () => {
  const chapterLeader = { territoryId: "t1", chapterId: "c1" };

  it("CHAPTER_LEADER thao tác được Member trong Chapter của mình", () => {
    expect(
      canActOnScope("CHAPTER_LEADER", "member:update", chapterLeader, { territoryId: "t1", chapterId: "c1" })
    ).toBe(true);
  });

  it("CHAPTER_LEADER KHÔNG thao tác được Member ở Chapter khác dù cùng Territory", () => {
    expect(
      canActOnScope("CHAPTER_LEADER", "member:update", chapterLeader, { territoryId: "t1", chapterId: "c2" })
    ).toBe(false);
  });
});

describe("RBAC — Admin vs Member access (Rule 7/8)", () => {
  it("ADMIN xem được toàn hệ thống bất kể territory/chapter (scope full)", () => {
    const admin = { territoryId: null, chapterId: null };
    expect(canActOnScope("ADMIN", "member:view", admin, { territoryId: "t9", chapterId: "c9" })).toBe(true);
  });

  it("MEMBER không truy cập được các action quản trị", () => {
    const adminOnlyActions = [
      "territory:create", "chapter:create", "member:create", "event:create", "event:delete", "export:data",
    ] as const;
    for (const action of adminOnlyActions) {
      expect(can("MEMBER", action)).toBe(false);
    }
  });
});
