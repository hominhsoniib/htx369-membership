"use client";

import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { memberFormSchema } from "@/schemas/member";
import { createMemberAction, updateMemberAction } from "./actions";

type FormValues = z.infer<typeof memberFormSchema>;

type Option = { id: string; name: string };
type ChapterOption = Option & { territoryId: string };
type ReferrerOption = { id: string; fullName: string; memberCode: string };

export function MemberForm({
  memberId,
  territoryOptions,
  chapterOptions,
  industryOptions,
  referrerOptions,
  defaultValues,
}: {
  memberId?: string;
  territoryOptions: Option[];
  chapterOptions: ChapterOption[];
  industryOptions: Option[];
  referrerOptions: ReferrerOption[];
  defaultValues?: Partial<FormValues>;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: { status: "ACTIVE", ...defaultValues },
  });

  const selectedTerritoryId = watch("territoryId");
  const filteredChapters = useMemo(
    () => chapterOptions.filter((c) => c.territoryId === selectedTerritoryId),
    [chapterOptions, selectedTerritoryId]
  );

  const onSubmit = (values: FormValues) => {
    setError(null);
    startTransition(async () => {
      const result = memberId ? await updateMemberAction(memberId, values) : await createMemberAction(values);
      if (result && "error" in result) setError(result.error);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-4" noValidate>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Địa bàn *</label>
          <select {...register("territoryId")} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
            <option value="">-- Chọn --</option>
            {territoryOptions.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          {errors.territoryId && <p className="mt-1 text-xs text-red-600">{errors.territoryId.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Chapter *</label>
          <select {...register("chapterId")} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
            <option value="">-- Chọn --</option>
            {filteredChapters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.chapterId && <p className="mt-1 text-xs text-red-600">{errors.chapterId.message}</p>}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Họ tên *</label>
        <input {...register("fullName")} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Email *</label>
          <input {...register("email")} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Số điện thoại *</label>
          <input {...register("phone")} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Công ty</label>
          <input {...register("company")} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Chức vụ</label>
          <input {...register("position")} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Ngành nghề</label>
        <select {...register("industryId")} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
          <option value="">-- Không chọn --</option>
          {industryOptions.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Người giới thiệu</label>
        <select {...register("referrerId")} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
          <option value="">-- Không có --</option>
          {referrerOptions.map((r) => (
            <option key={r.id} value={r.id}>
              {r.fullName} ({r.memberCode})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Ngày gia nhập</label>
          <input type="date" {...register("joinedAt")} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Trạng thái</label>
          <select {...register("status")} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="SUSPENDED">Tạm ngưng</option>
            <option value="LEFT">Đã rời</option>
          </select>
        </div>
      </div>

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
