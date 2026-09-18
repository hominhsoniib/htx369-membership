import { notFound } from "next/navigation";
import { getChapterById } from "@/services/chapter.service";
import { listTerritories } from "@/services/territory.service";
import { PageHeader } from "@/components/PageHeader";
import { ChapterForm } from "@/features/chapters/chapter-form";

export default async function EditChapterPage({ params }: { params: { id: string } }) {
  const [chapter, territories] = await Promise.all([getChapterById(params.id), listTerritories()]);
  if (!chapter) notFound();

  return (
    <div>
      <PageHeader title={`Sửa: ${chapter.name}`} />
      <ChapterForm
        chapterId={chapter.id}
        territoryOptions={territories.map((t) => ({ id: t.id, name: t.name }))}
        defaultValues={{
          territoryId: chapter.territoryId,
          name: chapter.name,
          code: chapter.code,
          description: chapter.description ?? "",
          meetingLocation: chapter.meetingLocation ?? "",
          meetingSchedule: chapter.meetingSchedule ?? "",
          foundedAt: chapter.foundedAt ? chapter.foundedAt.toISOString().slice(0, 10) : "",
          isActive: chapter.isActive,
        }}
      />
    </div>
  );
}
