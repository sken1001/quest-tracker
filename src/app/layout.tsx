import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TaskTraker", // あなたのアプリ名
  description: "日々のタスクを管理しよう",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${inter.className} bg-gray-900 text-gray-100`}>
        <div className="flex min-h-screen">
          {/* ここに、後で左のメニューバーのコードを入れます */}
          <aside className="w-64 flex-shrink-0 bg-gray-800 p-4">
            {/* 左メニューバーの中身 */}
            <p>（ここにナビゲーション）</p>
          </aside>
          {/* childrenが、各ページの本体になります */}
          <main className="flex-1 p-6 lg:p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
