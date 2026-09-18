"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { territoryFormSchema } from "@/schemas/territory";
import { createTerritoryAction, updateTerritoryAction } from "./actions";

type FormValues = z.infer<typeof territoryFormSchema>;

export function TerritoryForm({
  territoryId,
  defaultValues,
}: {
  territoryId?: string;
  defaultValues?: Partial<FormValues>;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(territoryFormSchema),
    defaultValues: { isActive: true, ...defaultValues },
  });

  const onSubmit = (values: FormValues) => {
    setError(null);
    startTransition(async () => {
      const result = territoryId
        ? await updateTerritoryAction(territoryId, values)
        : await createTerritoryAction(values);
      if (result && "error" in result) setError(result.error);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-4" noValidate>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Tên địa bàn *</label>
        <input {...register("name")} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Mã *</label>
        <input
          {...register("code")}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm uppercase"
          placeholder="VD: T01"
        />
        {errors.code && <p className="mt-1 text-xs text-red-600">{errors.code.message}</p>}
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
