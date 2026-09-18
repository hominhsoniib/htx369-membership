import { z } from "zod";

export const chapterFormSchema = z.object({
  territoryId: z.string().min(1, "Vui lòng chọn địa bàn."),
  name: z.string().min(2, "Tên tối thiểu 2 ký tự.").max(200),
  code: z
    .string()
    .min(2, "Mã tối thiểu 2 ký tự.")
    .max(30)
    .regex(/^[A-Z0-9_-]+$/, "Mã chỉ gồm chữ hoa, số, - hoặc _."),
  description: z.string().max(2000).optional().or(z.literal("")),
  meetingLocation: z.string().max(500).optional().or(z.literal("")),
  meetingSchedule: z.string().max(200).optional().or(z.literal("")),
  foundedAt: z.string().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

export type ChapterFormInput = z.infer<typeof chapterFormSchema>;
