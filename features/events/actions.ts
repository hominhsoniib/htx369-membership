"use server";

import { revalidatePath } from "next/cache";
import { createEvent, updateEvent, deleteEvent, registerForEvent, checkInRegistration } from "@/services/event.service";
import { eventFormSchema, publicRegistrationSchema, checkInSchema } from "@/schemas/event";

export async function createEventAction(_prevState: unknown, formData: FormData) {
  try {
    const raw = Object.fromEntries(formData.entries());
    const parsed = eventFormSchema.parse({
      ...raw,
      capacity: raw.capacity ? Number(raw.capacity) : undefined,
      registrationEnabled: raw.registrationEnabled === "true" || raw.registrationEnabled === "on",
    });
    const created = await createEvent(parsed);
    revalidatePath("/admin/events");
    return { success: true, message: "Tạo sự kiện thành công.", event: created };
  } catch (err: any) {
    return { success: false, error: err.message || "Không thể tạo sự kiện." };
  }
}

export async function updateEventAction(id: string, _prevState: unknown, formData: FormData) {
  try {
    const raw = Object.fromEntries(formData.entries());
    const parsed = eventFormSchema.parse({
      ...raw,
      capacity: raw.capacity ? Number(raw.capacity) : undefined,
      registrationEnabled: raw.registrationEnabled === "true" || raw.registrationEnabled === "on",
    });
    await updateEvent(id, parsed);
    revalidatePath("/admin/events");
    return { success: true, message: "Cập nhật sự kiện thành công." };
  } catch (err: any) {
    return { success: false, error: err.message || "Không thể cập nhật sự kiện." };
  }
}

export async function deleteEventAction(id: string) {
  try {
    await deleteEvent(id);
    revalidatePath("/admin/events");
    return { success: true, message: "Xóa sự kiện thành công." };
  } catch (err: any) {
    return { success: false, error: err.message || "Không thể xóa sự kiện." };
  }
}

export async function registerEventAction(_prevState: unknown, formData: FormData) {
  try {
    const raw = Object.fromEntries(formData.entries());
    const parsed = publicRegistrationSchema.parse(raw);
    const reg = await registerForEvent(parsed);
    return { success: true, message: `Đăng ký thành công! Mã tham dự của bạn là ${reg.code}.`, code: reg.code };
  } catch (err: any) {
    return { success: false, error: err.message || "Đăng ký không thành công." };
  }
}

export async function checkInAction(_prevState: unknown, formData: FormData) {
  try {
    const raw = Object.fromEntries(formData.entries());
    const parsed = checkInSchema.parse(raw);
    const result = await checkInRegistration(parsed);
    revalidatePath(`/admin/events/${parsed.eventId}/checkin`);
    return {
      success: true,
      message: `Điểm danh thành công cho ${result.registration.fullName} (${result.registration.code}).`,
      registration: result.registration,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Điểm danh không thành công." };
  }
}
