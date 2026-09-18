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
      className="w-64 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-900 focus:outline-none"
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        if (e.target.value) params.set("q", e.target.value);
        else params.delete("q");
        router.replace(`${pathname}?${params.toString()}`);
      }}
    />
  );
}
