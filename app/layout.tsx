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
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
