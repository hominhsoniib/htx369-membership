import { PageHeader } from "@/components/PageHeader";
import { MemberForm } from "@/features/members/member-form";
import { listTerritories } from "@/services/territory.service";
import { listChapters } from "@/services/chapter.service";
import { listIndustries } from "@/services/lookup.service";
import { memberRepository } from "@/repositories/member.repository";

export default async function NewMemberPage() {
  const [territories, chapters, industries, referrers] = await Promise.all([
    listTerritories(),
    listChapters(),
    listIndustries(),
    memberRepository.findAllForSelect(),
  ]);

  return (
    <div>
      <PageHeader title="Thêm hội viên" />
      <MemberForm
        territoryOptions={territories.map((t) => ({ id: t.id, name: t.name }))}
        chapterOptions={chapters.map((c) => ({ id: c.id, name: c.name, territoryId: c.territoryId }))}
        industryOptions={industries.map((i) => ({ id: i.id, name: i.name }))}
        referrerOptions={referrers}
      />
    </div>
  );
}
