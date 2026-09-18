"use client";

import { useRef, type ReactNode } from "react";

export function ConfirmDialog({
  title,
  description,
  confirmLabel = "Xác nhận",
  onConfirm,
  trigger,
}: {
  title: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  trigger: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  return (
    <>
      <span onClick={() => ref.current?.showModal()}>{trigger}</span>
      <dialog
        ref={ref}
        className="rounded-lg border border-gray-200 p-0 shadow-lg backdrop:bg-black/30"
      >
        <div className="w-80 p-5">
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => ref.current?.close()}
              className="rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
            >
              Huỷ
            </button>
            <button
              type="button"
              onClick={() => {
                ref.current?.close();
                onConfirm();
              }}
              className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
