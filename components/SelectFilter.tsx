"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function SelectFilter({
  paramKey,
  options,
  placeholder,
}: {
  paramKey: string;
  options: { value: string; label: string }[];
  placeholder: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <select
      defaultValue={searchParams.get(paramKey) ?? ""}
      className="w-full sm:w-auto rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs md:text-sm text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        if (e.target.value) params.set(paramKey, e.target.value);
        else params.delete(paramKey);
        params.set("page", "1"); // đổi filter luôn quay về trang 1
        router.replace(`${pathname}?${params.toString()}`);
      }}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
