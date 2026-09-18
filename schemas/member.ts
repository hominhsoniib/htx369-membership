import { z } from "zod";

export const memberStatusEnum = z.enum(["ACTIVE", "SUSPENDED", "LEFT"]);

export const memberFormSchema = z.object({
  territoryId: z.string().min(1, "Vui lòng chọn địa bàn."),
  chapterId: z.string().min(1, "Vui lòng chọn chapter."),
  industryId: z.string().optional().or(z.literal("")),
  fullName: z.string().min(2, "Tên tối thiểu 2 ký tự.").max(200),
  email: z.string().email("Email không hợp lệ."),
  phone: z.string().min(8, "Số điện thoại không hợp lệ.").max(20),
  company: z.string().max(200).optional().or(z.literal("")),
  position: z.string().max(200).optional().or(z.literal("")),
  joinedAt: z.string().optional().or(z.literal("")),
  status: memberStatusEnum.default("ACTIVE"),
  referrerId: z.string().optional().or(z.literal("")),
});

export type MemberFormInput = z.infer<typeof memberFormSchema>;
