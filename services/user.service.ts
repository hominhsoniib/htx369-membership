import { prisma } from "@/lib/prisma";
import { getActor } from "@/lib/session";
import bcrypt from "bcryptjs";
import { changePasswordSchema, type ChangePasswordInput } from "@/schemas/auth";

export async function changePassword(input: ChangePasswordInput) {
  const actor = await getActor();
  
  const parsed = changePasswordSchema.parse(input);

  const user = await prisma.user.findUnique({
    where: { id: actor.userId },
  });

  if (!user) {
    throw new Error("Người dùng không tồn tại.");
  }

  const isPasswordValid = await bcrypt.compare(parsed.currentPassword, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error("Mật khẩu hiện tại không chính xác.");
  }

  const newPasswordHash = await bcrypt.hash(parsed.newPassword, 10);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: actor.userId },
      data: { passwordHash: newPasswordHash },
    });

    await tx.auditLog.create({
      data: {
        userId: actor.userId,
        action: "UPDATE",
        entity: "UserPassword",
        entityId: actor.userId,
        oldValue: {},
        newValue: { passwordUpdated: true },
      },
    });
  });

  return { success: true };
}
