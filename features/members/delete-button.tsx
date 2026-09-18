"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { removeMemberAction } from "./actions";

export function RemoveMemberButton({ memberId, status }: { memberId: string; status: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (status === "LEFT") return null;

  return (
    <ConfirmDialog
      title="Đánh dấu hội viên đã rời?"
      description="Hồ sơ chuyển sang trạng thái 'Đã rời' và được lưu trữ (không xoá cứng, lịch sử giới thiệu/audit log giữ nguyên)."
      confirmLabel="Xác nhận"
      trigger={
        <button
          type="button"
          disabled={isPending}
          className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          Đánh dấu đã rời
        </button>
      }
      onConfirm={() =>
        startTransition(async () => {
          await removeMemberAction(memberId);
          router.refresh();
        })
      }
    />
  );
}
