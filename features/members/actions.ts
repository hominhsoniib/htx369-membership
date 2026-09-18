"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { memberFormSchema } from "@/schemas/member";
import { createMember, removeMember, updateMember } from "@/services/member.service";

export type ActionResult = { error: string } | { success: true };

export async function createMemberAction(values: unknown): Promise<ActionResult | undefined> {
  const parsed = memberFormSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." };

  let newId: string;
  try {
    const member = await createMember(parsed.data);
    newId = member.id;
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    throw err;
  }

  revalidatePath("/admin/members");
  redirect(`/admin/members/${newId}`);
}

export async function updateMemberAction(id: string, values: unknown): Promise<ActionResult | undefined> {
  const parsed = memberFormSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." };

  try {
    await updateMember(id, parsed.data);
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    throw err;
  }

  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${id}`);
  redirect(`/admin/members/${id}`);
}

export async function removeMemberAction(id: string): Promise<ActionResult> {
  try {
    await removeMember(id);
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    throw err;
  }

  revalidatePath("/admin/members");
  revalidatePath(`/admin/members/${id}`);
  return { success: true };
}
