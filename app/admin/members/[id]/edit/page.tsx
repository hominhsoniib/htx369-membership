import { notFound } from "next/navigation";
import { getMemberById } from "@/services/member.service";
import { listTerritories } from "@/services/territory.service";
import { listChapters } from "@/services/chapter.service";
import { listIndustries } from "@/services/lookup.service";
import { memberRepository } from "@/repositories/member.repository";
import { PageHeader } from "@/components/PageHeader";
import { MemberForm } from "@/features/members/member-form";

export default async function EditMemberPage({ params }: { params: { id: string } }) {
  const [member, territories, chapters, industries, referrers] = await Promise.all([
    getMemberById(params.id),
    listTerritories(),
    listChapters(),
    listIndustries(),
    memberRepository.findAllForSelect(),
  ]);
  if (!member) notFound();

  return (
    <div>
      <PageHeader title={`Sửa: ${member.fullName}`} />
      <MemberForm
        memberId={member.id}
        territoryOptions={territories.map((t) => ({ id: t.id, name: t.name }))}
        chapterOptions={chapters.map((c) => ({ id: c.id, name: c.name, territoryId: c.territoryId }))}
        industryOptions={industries.map((i) => ({ id: i.id, name: i.name }))}
        referrerOptions={referrers.filter((r) => r.id !== member.id)}
        defaultValues={{
          territoryId: member.territoryId,
          chapterId: member.chapterId,
          industryId: member.industryId ?? "",
          fullName: member.fullName,
          email: member.email,
          phone: member.phone,
          company: member.company ?? "",
          position: member.position ?? "",
          joinedAt: member.joinedAt.toISOString().slice(0, 10),
          status: member.status,
          referrerId: member.referrerId ?? "",
        }}
      />
    </div>
  );
}
