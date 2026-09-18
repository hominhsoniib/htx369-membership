import type { SystemRole } from "@prisma/client";

export type PermissionAction =
  | "organization:view" | "organization:update"
  | "territory:view" | "territory:create" | "territory:update" | "territory:delete"
  | "chapter:view" | "chapter:create" | "chapter:update" | "chapter:delete"
  | "member:view" | "member:create" | "member:update" | "member:delete"
  | "guest:view" | "guest:create" | "guest:update"
  | "event:view" | "event:create" | "event:update" | "event:delete" | "event:checkin"
  | "report:view" | "export:data";

type Scope = "none" | "own" | "full";

const ALL_ACTIONS: PermissionAction[] = [
  "organization:view", "organization:update",
  "territory:view", "territory:create", "territory:update", "territory:delete",
  "chapter:view", "chapter:create", "chapter:update", "chapter:delete",
  "member:view", "member:create", "member:update", "member:delete",
  "guest:view", "guest:create", "guest:update",
  "event:view", "event:create", "event:update", "event:delete", "event:checkin",
  "report:view", "export:data",
];

function fullAccess(): Record<PermissionAction, Scope> {
  return Object.fromEntries(ALL_ACTIONS.map((a) => [a, "full"])) as Record<PermissionAction, Scope>;
}

// Bảng quyền — khớp với "Role/Permission matrix" trong docs/RBAC.md
const MATRIX: Record<SystemRole, Partial<Record<PermissionAction, Scope>>> = {
  SUPER_ADMIN: fullAccess(),
  ADMIN: fullAccess(),
  REGIONAL_LEADER: {
    "territory:view": "own",
    "chapter:view": "own", "chapter:create": "own", "chapter:update": "own", "chapter:delete": "own",
    "member:view": "own", "member:create": "own", "member:update": "own", "member:delete": "own",
    "guest:view": "own", "guest:create": "own", "guest:update": "own",
    "event:view": "own", "event:create": "own", "event:update": "own", "event:delete": "own", "event:checkin": "own",
    "report:view": "own", "export:data": "own",
  },
  CHAPTER_LEADER: {
    "territory:view": "own",
    "chapter:view": "own", "chapter:update": "own",
    "member:view": "own", "member:create": "own", "member:update": "own", "member:delete": "own",
    "guest:view": "own", "guest:create": "own", "guest:update": "own",
    "event:view": "own", "event:create": "own", "event:update": "own", "event:delete": "own", "event:checkin": "own",
    "report:view": "own",
  },
  MEMBER: {
    "territory:view": "own",
    "chapter:view": "own",
    "member:view": "own",
    "guest:view": "own", "guest:create": "own",
    "event:view": "own",
  },
};

export function getScope(role: SystemRole, action: PermissionAction): Scope {
  return MATRIX[role]?.[action] ?? "none";
}

export function can(role: SystemRole, action: PermissionAction): boolean {
  return getScope(role, action) !== "none";
}

/**
 * Kiểm tra quyền CÓ áp scope territory/chapter isolation (Rule 6: Leader chỉ xem được
 * dữ liệu trong phạm vi quyền; Rule 7: Admin xem toàn hệ thống; Rule 8: Member không
 * truy cập admin functions). Luôn gọi hàm này ở Service Layer, KHÔNG kiểm tra permission
 * chỉ ở UI.
 */
export function canActOnScope(
  role: SystemRole,
  action: PermissionAction,
  actor: { territoryId?: string | null; chapterId?: string | null },
  subject: { territoryId?: string | null; chapterId?: string | null }
): boolean {
  const scope = getScope(role, action);
  if (scope === "none") return false;
  if (scope === "full") return true;

  // scope === "own": subject phải nằm trong territory/chapter của actor
  if (actor.territoryId && subject.territoryId && actor.territoryId !== subject.territoryId) {
    return false;
  }
  if (actor.chapterId && subject.chapterId && actor.chapterId !== subject.chapterId) {
    return false;
  }
  return true;
}

/**
 * Ném lỗi 403 dạng chuẩn để Server Action/Route Handler bắt và trả response phù hợp.
 * Dùng ở đầu mọi Service function trước khi chạm Repository.
 */
export class ForbiddenError extends Error {
  constructor(action: PermissionAction) {
    super(`Không có quyền thực hiện: ${action}`);
    this.name = "ForbiddenError";
  }
}

export function assertCan(role: SystemRole, action: PermissionAction): void {
  if (!can(role, action)) throw new ForbiddenError(action);
}
