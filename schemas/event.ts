import { z } from "zod";

export const eventStatusEnum = z.enum([
  "DRAFT",
  "UPCOMING",
  "ONGOING",
  "COMPLETED",
  "CANCELLED",
]);

export const eventFormSchema = z.object({
  title: z.string().min(3, "Tiêu đề tối thiểu 3 ký tự.").max(300),
  description: z.string().optional().or(z.literal("")),
  startAt: z.string().min(1, "Thời gian bắt đầu là bắt buộc."),
  endAt: z.string().min(1, "Thời gian kết thúc là bắt buộc."),
  location: z.string().optional().or(z.literal("")),
  capacity: z.number().int().min(1).optional().or(z.nan()),
  status: eventStatusEnum.default("UPCOMING"),
  registrationEnabled: z.boolean().default(true),
  territoryId: z.string().optional().or(z.literal("")),
  chapterId: z.string().optional().or(z.literal("")),
});

export type EventFormInput = z.infer<typeof eventFormSchema>;

export const publicRegistrationSchema = z.object({
  eventId: z.string().min(1, "Mã sự kiện không hợp lệ."),
  fullName: z.string().min(2, "Họ và tên tối thiểu 2 ký tự."),
  phone: z.string().min(8, "Số điện thoại không hợp lệ."),
  email: z.string().email("Email không hợp lệ.").optional().or(z.literal("")),
  company: z.string().optional().or(z.literal("")),
  position: z.string().optional().or(z.literal("")),
  industry: z.string().optional().or(z.literal("")),
  referrer: z.string().optional().or(z.literal("")),
});

export type PublicRegistrationInput = z.infer<typeof publicRegistrationSchema>;

export const checkInSchema = z.object({
  eventId: z.string().min(1, "Mã sự kiện là bắt buộc."),
  registrationCode: z.string().min(1, "Mã đăng ký là bắt buộc."),
});

export type CheckInInput = z.infer<typeof checkInSchema>;
