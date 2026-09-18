"use server";

import { changePassword } from "@/services/user.service";
import { changePasswordSchema } from "@/schemas/auth";

export async function changePasswordAction(input: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  try {
    const validated = changePasswordSchema.safeParse(input);
    if (!validated.success) {
      const errorMsg = validated.error.errors[0]?.message || "Dữ liệu nhập vào không hợp lệ.";
      return { success: false, error: errorMsg };
    }

    await changePassword(validated.data);
    return { success: true, message: "Đổi mật khẩu thành công!" };
  } catch (err: any) {
    return { success: false, error: err.message || "Đã xảy ra lỗi khi đổi mật khẩu." };
  }
}
