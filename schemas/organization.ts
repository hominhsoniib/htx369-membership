import { z } from "zod";

export const organizationFormSchema = z.object({
  name: z.string().min(2, "Tên tối thiểu 2 ký tự.").max(200),
  logoUrl: z.string().url("URL không hợp lệ.").optional().or(z.literal("")),
  description: z.string().max(2000).optional().or(z.literal("")),
  email: z.string().email("Email không hợp lệ.").optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
  website: z.string().url("URL không hợp lệ.").optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

export type OrganizationFormInput = z.infer<typeof organizationFormSchema>;
