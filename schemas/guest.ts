import { z } from "zod";

export const guestStatusEnum = z.enum([
  "REGISTERED",
  "CONFIRMED",
  "ATTENDED",
  "NO_SHOW",
  "FOLLOW_UP",
  "JOINED",
]);

export const guestFormSchema = z.object({
  territoryId: z.string().optional().or(z.literal("")),
  chapterId: z.string().optional().or(z.literal("")),
  industryId: z.string().optional().or(z.literal("")),
  fullName: z.string().min(2, "Họ và tên tối thiểu 2 ký tự.").max(200),
  phone: z.string().min(8, "Số điện thoại không hợp lệ.").max(20),
  email: z.string().email("Email không hợp lệ.").optional().or(z.literal("")),
  company: z.string().max(200).optional().or(z.literal("")),
  position: z.string().max(200).optional().or(z.literal("")),
  source: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  status: guestStatusEnum.default("REGISTERED"),
  referrerMemberId: z.string().optional().or(z.literal("")),
});

export type GuestFormInput = z.infer<typeof guestFormSchema>;

export const convertGuestSchema = z.object({
  guestId: z.string().min(1, "Thiếu Guest ID."),
  territoryId: z.string().min(1, "Vui lòng chọn địa bàn."),
  chapterId: z.string().min(1, "Vui lòng chọn chapter."),
  industryId: z.string().optional().or(z.literal("")),
  fullName: z.string().min(2, "Tên tối thiểu 2 ký tự."),
  email: z.string().email("Email không hợp lệ."),
  phone: z.string().min(8, "Số điện thoại không hợp lệ."),
  company: z.string().optional().or(z.literal("")),
  position: z.string().optional().or(z.literal("")),
  referrerId: z.string().optional().or(z.literal("")),
});

export type ConvertGuestInput = z.infer<typeof convertGuestSchema>;
