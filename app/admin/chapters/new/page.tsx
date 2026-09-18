import { PageHeader } from "@/components/PageHeader";
import { ChapterForm } from "@/features/chapters/chapter-form";
import { listTerritories } from "@/services/territory.service";

export default async function NewChapterPage() {
  const territories = await listTerritories();

  return (
    <div>
      <PageHeader title="Thêm chapter" />
      <ChapterForm territoryOptions={territories.map((t) => ({ id: t.id, name: t.name }))} />
    </div>
  );
}
