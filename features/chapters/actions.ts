"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { chapterFormSchema } from "@/schemas/chapter";
import { createChapter, disableChapter, updateChapter } from "@/services/chapter.service";

export type ActionResult = { error: string } | { success: true };

export async function createChapterAction(values: unknown): Promise<ActionResult | undefined> {
  const parsed = chapterFormSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." };

  let newId: string;
  try {
    const chapter = await createChapter(parsed.data);
    newId = chapter.id;
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    throw err;
  }

  revalidatePath("/admin/chapters");
  redirect(`/admin/chapters/${newId}`);
}

export async function updateChapterAction(id: string, values: unknown): Promise<ActionResult | undefined> {
  const parsed = chapterFormSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." };

  try {
    await updateChapter(id, parsed.data);
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    throw err;
  }

  revalidatePath("/admin/chapters");
  revalidatePath(`/admin/chapters/${id}`);
  redirect(`/admin/chapters/${id}`);
}

export async function disableChapterAction(id: string): Promise<ActionResult> {
  try {
    await disableChapter(id);
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    throw err;
  }

  revalidatePath("/admin/chapters");
  revalidatePath(`/admin/chapters/${id}`);
  return { success: true };
}
