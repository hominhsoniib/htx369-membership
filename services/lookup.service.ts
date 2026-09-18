import { prisma } from "@/lib/prisma";

export function listIndustries() {
  return prisma.industry.findMany({ orderBy: { name: "asc" } });
}

export async function getLookupData() {
  const [territories, chapters, industries] = await Promise.all([
    prisma.territory.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.chapter.findMany({ where: { isActive: true }, select: { id: true, name: true, territoryId: true }, orderBy: { name: "asc" } }),
    prisma.industry.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return { territories, chapters, industries };
}
