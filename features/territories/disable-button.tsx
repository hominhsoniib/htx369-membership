"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { disableTerritoryAction } from "./actions";

export function DisableTerritoryButton({ territoryId, isActive }: { territoryId: string; isActive: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (!isActive) return null;

  return (
    <ConfirmDialog
      title="Vô hiệu hoá địa bàn?"
      description="Địa bàn chuyển sang trạng thái tạm ngưng. Dữ liệu Chapter/Member liên quan được giữ nguyên."
      confirmLabel="Vô hiệu hoá"
      trigger={
        <button
          type="button"
          disabled={isPending}
          className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          Vô hiệu hoá
        </button>
      }
      onConfirm={() =>
        startTransition(async () => {
          await disableTerritoryAction(territoryId);
          router.refresh();
        })
      }
    />
  );
}
