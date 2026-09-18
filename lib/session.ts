import type { SystemRole } from "@prisma/client";
import { auth } from "@/lib/auth";

export type Actor = {
  userId: string;
  fullName: string;
  role: SystemRole;
  organizationId: string;
  territoryId: string | null;
  chapterId: string | null;
};

export class UnauthenticatedError extends Error {
  constructor() {
    super("Chưa đăng nhập.");
    this.name = "UnauthenticatedError";
  }
}

/**
 * Lấy actor hiện tại từ session. Dùng ở đầu MỌI Service function cần kiểm tra
 * quyền — không tin tưởng tuyệt đối vào middleware là lớp bảo vệ duy nhất
 * (defense in depth, xem app/admin/layout.tsx).
 */
export async function getActor(): Promise<Actor> {
  const session = await auth();
  if (!session?.user) throw new UnauthenticatedError();

  return {
    userId: session.user.id,
    fullName: session.user.name || "Người dùng",
    role: session.user.role,
    organizationId: session.user.organizationId,
    territoryId: session.user.territoryId,
    chapterId: session.user.chapterId,
  };
}
