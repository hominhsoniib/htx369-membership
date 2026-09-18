"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { organizationFormSchema } from "@/schemas/organization";
import { updateOrganizationAction } from "./actions";

type FormValues = z.infer<typeof organizationFormSchema>;

export function OrganizationForm({ defaultValues }: { defaultValues: FormValues }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(organizationFormSchema), defaultValues });

  const onSubmit = (values: FormValues) => {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateOrganizationAction(values);
      if ("error" in result) setError(result.error);
      else setSaved(true);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-4" noValidate>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Tên tổ chức *</label>
        <input {...register("name")} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Logo URL</label>
        <input {...register("logoUrl")} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        {errors.logoUrl && <p className="mt-1 text-xs text-red-600">{errors.logoUrl.message}</p>}
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
        <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
        <input {...register("email")} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Điện thoại</label>
        <input {...register("phone")} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Website</label>
        <input {...register("website")} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        {errors.website && <p className="mt-1 text-xs text-red-600">{errors.website.message}</p>}
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
      {saved && <p className="text-sm text-green-600">Đã lưu.</p>}

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
