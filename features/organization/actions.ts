"use server";

import { revalidatePath } from "next/cache";
import { updateOrganization } from "@/services/organization.service";
import { organizationFormSchema, type OrganizationFormInput } from "@/schemas/organization";

export async function updateOrganizationAction(input: OrganizationFormInput) {
  try {
    const parsed = organizationFormSchema.parse(input);
    await updateOrganization(parsed);
    revalidatePath("/admin/settings");
    return { success: true, message: "Cập nhật thông tin tổ chức thành công." };
  } catch (err: any) {
    return { success: false, error: err.message || "Không thể cập nhật thông tin." };
  }
}
