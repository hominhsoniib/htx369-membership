import Link from "next/link";
import { notFound } from "next/navigation";
import { getMemberById } from "@/services/member.service";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { RemoveMemberButton } from "@/features/members/delete-button";

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Đang hoạt động",
  SUSPENDED: "Tạm ngưng",
  LEFT: "Đã rời",
};

const TABS = [
  { key: "info", label: "Thông tin" },
  { key: "history", label: "Lịch sử hoạt động" },
  { key: "guests", label: "Khách mời" },
  { key: "events", label: "Sự kiện" },
] as const;

export default async function MemberDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { tab?: string };
}) {
  const member = await getMemberById(params.id);
  if (!member) notFound();

  const activeTab = TABS.find((t) => t.key === searchParams.tab)?.key ?? "info";

  return (
    <div>
      <PageHeader
        title={member.fullName}
        description={`${member.memberCode} · ${member.chapter.name}`}
        action={
          <div className="flex gap-2">
            <Link
              href={`/admin/members/${member.id}/edit`}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Sửa
            </Link>
            <RemoveMemberButton memberId={member.id} status={member.status} />
          </div>
        }
      />

      <div className="mb-4 flex gap-1 border-b border-gray-200">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/admin/members/${member.id}?tab=${tab.key}`}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${
              activeTab === tab.key
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {activeTab === "info" && (
        <dl className="grid max-w-2xl grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <Field label="Trạng thái" value={<StatusBadge active={member.status === "ACTIVE"} inactiveLabel={STATUS_LABEL[member.status]} />} />
          <Field label="Địa bàn" value={member.territory.name} />
          <Field label="Chapter" value={member.chapter.name} />
          <Field label="Ngành nghề" value={member.industry?.name ?? "—"} />
          <Field label="Email" value={member.email} />
          <Field label="Số điện thoại" value={member.phone} />
          <Field label="Công ty" value={member.company ?? "—"} />
          <Field label="Chức vụ" value={member.position ?? "—"} />
          <Field label="Ngày gia nhập" value={member.joinedAt.toLocaleDateString("vi-VN")} />
          <Field
            label="Người giới thiệu"
            value={member.referrer ? `${member.referrer.fullName} (${member.referrer.memberCode})` : "—"}
          />
          {member.referrals.length > 0 && (
            <div className="col-span-2">
              <dt className="text-gray-500">Đã giới thiệu ({member.referrals.length})</dt>
              <dd className="mt-1 space-y-0.5">
                {member.referrals.map((r) => (
                  <Link
                    key={r.id}
                    href={`/admin/members/${r.id}`}
                    className="block text-gray-800 hover:underline"
                  >
                    {r.fullName} ({r.memberCode})
                  </Link>
                ))}
              </dd>
            </div>
          )}
        </dl>
      )}

      {activeTab === "history" && (
        <EmptyPlaceholder text="Lịch sử hoạt động (AuditLog theo hội viên) sẽ hiển thị đầy đủ khi module Audit Log hoàn thiện (Phase 14)." />
      )}
      {activeTab === "guests" && (
        <EmptyPlaceholder text="Danh sách khách mời do hội viên này giới thiệu sẽ hiển thị khi module Guest hoàn thiện (Phase 7)." />
      )}
      {activeTab === "events" && (
        <EmptyPlaceholder text="Lịch sử tham dự sự kiện sẽ hiển thị khi module Event hoàn thiện (Phase 8)." />
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-gray-500">{label}</dt>
      <dd className="mt-0.5 text-gray-900">{value}</dd>
    </div>
  );
}

function EmptyPlaceholder({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-dashed border-gray-300 py-12 text-center text-sm text-gray-400">
      {text}
    </div>
  );
}
