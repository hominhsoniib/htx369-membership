# Demo Accounts

⚠️ Chỉ dùng ở môi trường **dev/staging**. Không seed các tài khoản này ở production.

Mật khẩu chung: `Demo@12345`

| Role | Email | Ghi chú |
| --- | --- | --- |
| SUPER_ADMIN | superadmin@demo.local | Toàn quyền hệ thống |
| ADMIN | admin@demo.local | Toàn quyền hệ thống |
| REGIONAL_LEADER | regional.leader@demo.local | Lãnh đạo Territory đầu tiên trong seed data |
| CHAPTER_LEADER | chapter.leader@demo.local | Lãnh đạo Chapter đầu tiên trong seed data |
| MEMBER | member@demo.local | Hội viên thuộc Chapter đầu tiên |

Tạo bằng `prisma/seed.ts` → chạy `npx prisma db seed` sau khi migrate.
