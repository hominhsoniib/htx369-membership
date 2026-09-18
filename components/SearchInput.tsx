"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function SearchInput({ placeholder = "Tìm kiếm..." }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <input
      type="search"
      defaultValue={searchParams.get("q") ?? ""}
      placeholder={placeholder}
      className="w-full sm:w-64 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs md:text-sm text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        if (e.target.value) params.set("q", e.target.value);
        else params.delete("q");
        router.replace(`${pathname}?${params.toString()}`);
      }}
    />
  );
}
