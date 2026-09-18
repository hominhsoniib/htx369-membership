"use me";
"use server";

import { revalidatePath } from "next/cache";
import { createGuest, updateGuest, convertGuestToMember } from "@/services/guest.service";
import { guestFormSchema, convertGuestSchema } from "@/schemas/guest";

export async function createGuestAction(_prevState: unknown, formData: FormData) {
  try {
    const raw = Object.fromEntries(formData.entries());
    const parsed = guestFormSchema.parse(raw);
    await createGuest(parsed);
    revalidatePath("/admin/guests");
    return { success: true, message: "Thêm khách mời thành công." };
  } catch (err: any) {
    return { success: false, error: err.message || "Không thể thêm khách mời." };
  }
}

export async function updateGuestAction(id: string, _prevState: unknown, formData: FormData) {
  try {
    const raw = Object.fromEntries(formData.entries());
    const parsed = guestFormSchema.parse(raw);
    await updateGuest(id, parsed);
    revalidatePath("/admin/guests");
    return { success: true, message: "Cập nhật thông tin khách mời thành công." };
  } catch (err: any) {
    return { success: false, error: err.message || "Không thể cập nhật khách mời." };
  }
}

export async function convertGuestAction(_prevState: unknown, formData: FormData) {
  try {
    const raw = Object.fromEntries(formData.entries());
    const parsed = convertGuestSchema.parse(raw);
    const member = await convertGuestToMember(parsed);
    revalidatePath("/admin/guests");
    revalidatePath("/admin/members");
    return { success: true, message: `Đã chuyển đổi thành công sang Hội viên ${member.fullName} (${member.memberCode}).` };
  } catch (err: any) {
    return { success: false, error: err.message || "Chuyển đổi khách mời thất bại." };
  }
}
