import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HTX 369 Membership Platform",
  description: "Nền tảng Quản lý Hội viên & Mạng lưới Doanh nghiệp HTX 369",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
