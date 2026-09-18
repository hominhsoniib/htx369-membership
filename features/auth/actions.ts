"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { loginSchema } from "@/schemas/auth";

export type LoginActionResult = { error: string } | void;

export async function loginAction(values: unknown): Promise<LoginActionResult> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Email hoặc mật khẩu không hợp lệ." };
  }

  try {
    await signIn("credentials", {
      ...parsed.data,
      redirectTo: "/admin/dashboard",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Email hoặc mật khẩu không đúng." };
    }
    // NEXT_REDIRECT là hành vi mong đợi của signIn khi thành công — ném lại để Next xử lý
    throw err;
  }
}
