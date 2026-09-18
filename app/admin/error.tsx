"use client";

export default function AdminError({ error }: { error: Error & { digest?: string } }) {
  const isForbidden = error.name === "ForbiddenError";

  return (
    <div className="rounded-md border border-dashed border-gray-300 py-12 text-center text-sm text-gray-400">
      {isForbidden ? "Bạn không có quyền truy cập trang này." : "Đã có lỗi xảy ra. Vui lòng thử lại."}
    </div>
  );
}
