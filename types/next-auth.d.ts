import type { SystemRole } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: SystemRole;
      organizationId: string;
      territoryId: string | null;
      chapterId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role?: SystemRole;
    organizationId?: string;
    territoryId?: string | null;
    chapterId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: SystemRole;
    organizationId: string;
    territoryId: string | null;
    chapterId: string | null;
  }
}
