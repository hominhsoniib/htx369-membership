"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { territoryFormSchema } from "@/schemas/territory";
import { createTerritory, disableTerritory, updateTerritory } from "@/services/territory.service";

export type ActionResult = { error: string } | { success: true };

export async function createTerritoryAction(values: unknown): Promise<ActionResult | undefined> {
  const parsed = territoryFormSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." };

  let newId: string;
  try {
    const territory = await createTerritory(parsed.data);
    newId = territory.id;
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    throw err;
  }

  revalidatePath("/admin/territories");
  redirect(`/admin/territories/${newId}`);
}

export async function updateTerritoryAction(id: string, values: unknown): Promise<ActionResult | undefined> {
  const parsed = territoryFormSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." };

  try {
    await updateTerritory(id, parsed.data);
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    throw err;
  }

  revalidatePath("/admin/territories");
  revalidatePath(`/admin/territories/${id}`);
  redirect(`/admin/territories/${id}`);
}

export async function disableTerritoryAction(id: string): Promise<ActionResult> {
  try {
    await disableTerritory(id);
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    throw err;
  }

  revalidatePath("/admin/territories");
  revalidatePath(`/admin/territories/${id}`);
  return { success: true };
}
