import NextAuth, { type User as NextAuthUser } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema, type LoginInput } from "@/schemas/auth";

/**
 * Tách riêng khỏi provider để unit test được trực tiếp (không phải mock toàn bộ NextAuth).
 * Trả về null cho MỌI trường hợp thất bại — không phân biệt "sai email" vs "sai mật khẩu"
 * trong message trả về client, tránh lộ thông tin tài khoản tồn tại hay không (user enumeration).
 */
export async function authorizeCredentials(raw: unknown): Promise<NextAuthUser | null> {
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) return null;

  const { email, password } = parsed.data as LoginInput;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { member: { select: { territoryId: true, chapterId: true } } },
  });
  if (!user || !user.isActive) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });
  await prisma.auditLog.create({
    data: { userId: user.id, action: "LOGIN", entity: "User", entityId: user.id },
  });

  return {
    id: user.id,
    email: user.email,
    name: user.fullName,
    // Các field dưới đây không thuộc chuẩn NextAuthUser — cast qua jwt callback
    role: user.role,
    organizationId: user.organizationId,
    territoryId: user.member?.territoryId ?? null,
    chapterId: user.member?.chapterId ?? null,
  } as NextAuthUser;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "credentials",
      credentials: { email: {}, password: {} },
      authorize: authorizeCredentials,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as any;
        token.role = u.role;
        token.organizationId = u.organizationId;
        token.territoryId = u.territoryId;
        token.chapterId = u.chapterId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        (session.user as any).role = token.role;
        (session.user as any).organizationId = token.organizationId;
        (session.user as any).territoryId = token.territoryId;
        (session.user as any).chapterId = token.chapterId;
      }
      return session;
    },
  },
});
