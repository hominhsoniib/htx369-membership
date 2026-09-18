import { getActor } from "@/lib/session";
import { assertCan, canActOnScope, ForbiddenError, type PermissionAction } from "@/lib/rbac";

/**
 * Dùng ở dòng đầu tiên của MỌI Service function public (Phase 5 trở đi):
 *
 *   const actor = await requireScope("member:update", { territoryId, chapterId });
 *
 * - Lấy actor từ session (ném UnauthenticatedError nếu chưa đăng nhập).
 * - Kiểm tra permission cơ bản theo role (ForbiddenError nếu không có quyền action).
 * - Kiểm tra scope isolation territory/chapter (ForbiddenError nếu subject ngoài phạm vi).
 * - Trả về actor để Service dùng tiếp (vd. ghi AuditLog với actor.userId).
 *
 * Không gọi Repository (Prisma) trực tiếp từ Server Action — luôn đi qua Service
 * có requireScope() để đảm bảo không có đường nào bỏ qua RBAC.
 */
export async function requireScope(
  action: PermissionAction,
  subject: { territoryId?: string | null; chapterId?: string | null } = {}
) {
  const actor = await getActor();
  assertCan(actor.role, action);
  if (!canActOnScope(actor.role, action, actor, subject)) {
    throw new ForbiddenError(action);
  }
  return actor;
}
