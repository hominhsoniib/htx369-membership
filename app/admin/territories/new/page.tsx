import { PageHeader } from "@/components/PageHeader";
import { TerritoryForm } from "@/features/territories/territory-form";

export default function NewTerritoryPage() {
  return (
    <div>
      <PageHeader title="Thêm địa bàn" />
      <TerritoryForm />
    </div>
  );
}
