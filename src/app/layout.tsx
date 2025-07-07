import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TaskTraker",
  description: "日々のタスクを管理しよう",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${inter.className} bg-gray-800 text-gray-100`}>
        <div className="flex min-h-screen">
          <aside className="w-64 flex-shrink-0 bg-gray-900 p-4 border-r border-gray-700">
            <nav>
              <ul>
                <li className="mb-2">
                  <a
                    href="/"
                    className="text-gray-300 hover:text-white font-semibold text-lg"
                  >
                    ホーム
                  </a>
                </li>
                <li className="mb-2">
                  <a href="/about" className="text-gray-300 hover:text-white">
                    このアプリについて
                  </a>
                </li>
                <li className="mb-2">
                  <a href="/help" className="text-gray-300 hover:text-white">
                    ヘルプ
                  </a>
                </li>
                <li className="mb-2">
                  <a href="/terms" className="text-gray-300 hover:text-white">
                    利用規約
                  </a>
                </li>
                <li className="mb-2">
                  <a href="/privacy" className="text-gray-300 hover:text-white">
                    プライバシーポリシー
                  </a>
                </li>
              </ul>
            </nav>
          </aside>
          <main className="flex-1 p-6 lg:p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
