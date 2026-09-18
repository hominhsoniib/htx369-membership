# RBAC — Roles & Permissions

## Roles

`SUPER_ADMIN` · `ADMIN` · `REGIONAL_LEADER` · `CHAPTER_LEADER` · `MEMBER`

Guest công khai không cần role đăng nhập (public registration route riêng, không qua middleware `/admin`).

## Permission matrix

| Action | SUPER_ADMIN | ADMIN | REGIONAL_LEADER | CHAPTER_LEADER | MEMBER |
| --- | --- | --- | --- | --- | --- |
| organization:view/update | full | full | – | – | – |
| territory:view | full | full | own | own | own |
| territory:create/update/delete | full | full | – | – | – |
| chapter:view | full | full | own | own | own |
| chapter:create/update/delete | full | full | own | update only | – |
| member:view | full | full | own | own | own (chính mình) |
| member:create/update/delete | full | full | own | own | – |
| guest:view/create/update | full | full | own | own | view/create |
| event:view | full | full | own | own | own |
| event:create/update/delete/checkin | full | full | own | own | – |
| report:view | full | full | own | own | – |
| export:data | full | full | own | – | – |

`own` = giới hạn theo `territoryId`/`chapterId` của actor (xem `lib/rbac.ts#canActOnScope`).

## Nguyên tắc bắt buộc

1. Permission luôn kiểm tra ở **Service Layer** (server), không bao giờ chỉ ẩn nút ở UI.
2. Mọi Service function public phải gọi `assertCan(role, action)` hoặc `canActOnScope(...)` trước khi chạm Repository.
3. Territory/Chapter isolation (Rule 6): Leader chỉ thao tác được dữ liệu trong phạm vi của mình — implement qua so sánh `territoryId`/`chapterId` giữa actor và subject, KHÔNG lọc bằng cách ẩn kết quả ở client.
4. Mọi hành động CREATE/UPDATE/DELETE/LOGIN/CHECK_IN/CONVERT_GUEST/ROLE_CHANGE phải ghi `AuditLog`.

## Cách dùng trong Service Layer

Không gọi `assertCan`/`canActOnScope` tay từng lần — dùng `requireScope()` (gộp `getActor` + 2 bước kiểm tra) ở dòng đầu tiên của mọi Service function:

```ts
import { requireScope } from "@/lib/authorize";

export async function updateMember(id: string, data: UpdateMemberInput) {
  const member = await prisma.member.findUniqueOrThrow({ where: { id } });

  const actor = await requireScope("member:update", {
    territoryId: member.territoryId,
    chapterId: member.chapterId,
  });

  // ... update + ghi AuditLog(actor.userId, "UPDATE", "Member", id, oldValue, newValue)
}
```

Xem `services/territory.service.ts` làm ví dụ mẫu đầy đủ. Repository (Prisma) **không bao giờ** được gọi trực tiếp từ Server Action — luôn đi qua Service có `requireScope()`.
