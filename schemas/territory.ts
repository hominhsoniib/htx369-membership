import { z } from "zod";

export const territoryFormSchema = z.object({
  name: z.string().min(2, "Tên tối thiểu 2 ký tự.").max(200),
  code: z
    .string()
    .min(2, "Mã tối thiểu 2 ký tự.")
    .max(20)
    .regex(/^[A-Z0-9_-]+$/, "Mã chỉ gồm chữ hoa, số, - hoặc _."),
  description: z.string().max(2000).optional().or(z.literal("")),
  foundedAt: z.string().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

export type TerritoryFormInput = z.infer<typeof territoryFormSchema>;
