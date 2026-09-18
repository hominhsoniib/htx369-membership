export function StatusBadge({
  active,
  activeLabel = "Đang hoạt động",
  inactiveLabel = "Tạm ngưng",
}: {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
        active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
      }`}
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}
