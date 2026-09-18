"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { chapterFormSchema } from "@/schemas/chapter";
import { createChapterAction, updateChapterAction } from "./actions";

type FormValues = z.infer<typeof chapterFormSchema>;

export function ChapterForm({
  chapterId,
  territoryOptions,
  defaultValues,
}: {
  chapterId?: string;
  territoryOptions: { id: string; name: string }[];
  defaultValues?: Partial<FormValues>;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(chapterFormSchema),
    defaultValues: { isActive: true, ...defaultValues },
  });

  const onSubmit = (values: FormValues) => {
    setError(null);
    startTransition(async () => {
      const result = chapterId
        ? await updateChapterAction(chapterId, values)
        : await createChapterAction(values);
      if (result && "error" in result) setError(result.error);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-4" noValidate>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Địa bàn *</label>
        <select
          {...register("territoryId")}
          disabled={!!chapterId}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-400"
        >
          <option value="">-- Chọn địa bàn --</option>
          {territoryOptions.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        {chapterId && <p className="mt-1 text-xs text-gray-400">Không thể đổi địa bàn sau khi tạo.</p>}
        {errors.territoryId && <p className="mt-1 text-xs text-red-600">{errors.territoryId.message}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Tên chapter *</label>
        <input {...register("name")} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Mã *</label>
        <input
          {...register("code")}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm uppercase"
          placeholder="VD: T01-C1"
        />
        {errors.code && <p className="mt-1 text-xs text-red-600">{errors.code.message}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Địa điểm họp</label>
        <input {...register("meetingLocation")} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Lịch họp</label>
        <input
          {...register("meetingSchedule")}
          placeholder="VD: Thứ 5 hàng tuần, 8:00"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Mô tả</label>
        <textarea
          {...register("description")}
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Ngày thành lập</label>
        <input type="date" {...register("foundedAt")} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" {...register("isActive")} className="rounded border-gray-300" />
        Đang hoạt động
      </label>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {isPending ? "Đang lưu..." : "Lưu"}
      </button>
    </form>
  );
}
