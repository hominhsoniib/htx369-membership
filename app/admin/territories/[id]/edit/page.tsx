import { notFound } from "next/navigation";
import { getTerritoryById } from "@/services/territory.service";
import { PageHeader } from "@/components/PageHeader";
import { TerritoryForm } from "@/features/territories/territory-form";

export default async function EditTerritoryPage({ params }: { params: { id: string } }) {
  const territory = await getTerritoryById(params.id);
  if (!territory) notFound();

  return (
    <div>
      <PageHeader title={`Sửa: ${territory.name}`} />
      <TerritoryForm
        territoryId={territory.id}
        defaultValues={{
          name: territory.name,
          code: territory.code,
          description: territory.description ?? "",
          foundedAt: territory.foundedAt ? territory.foundedAt.toISOString().slice(0, 10) : "",
          isActive: territory.isActive,
        }}
      />
    </div>
  );
}
