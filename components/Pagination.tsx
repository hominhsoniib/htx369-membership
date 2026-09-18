import Link from "next/link";

export function Pagination({
  page,
  totalPages,
  basePath,
  searchParams,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  function hrefFor(p: number) {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    params.set("page", String(p));
    return `${basePath}?${params.toString()}`;
  }

  return (
    <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
      <span>
        Trang {page} / {totalPages}
      </span>
      <div className="flex gap-2">
        <Link
          href={hrefFor(Math.max(1, page - 1))}
          aria-disabled={page <= 1}
          className={`rounded-md border border-gray-300 px-3 py-1.5 ${
            page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-gray-50"
          }`}
        >
          Trước
        </Link>
        <Link
          href={hrefFor(Math.min(totalPages, page + 1))}
          aria-disabled={page >= totalPages}
          className={`rounded-md border border-gray-300 px-3 py-1.5 ${
            page >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-gray-50"
          }`}
        >
          Sau
        </Link>
      </div>
    </div>
  );
}
