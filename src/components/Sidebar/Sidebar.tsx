import React from "react";
import Link from "next/link";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-gray-800 text-white w-64 flex-shrink-0 p-4 border-r border-gray-700 transform transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav>
          <ul>
            <li className="mb-2">
              <Link
                href="/"
                className="text-gray-300 hover:text-white font-semibold text-lg"
              >
                ホーム
              </Link>
            </li>
            <li className="mb-2">
              <Link
                href="/progress-tracker"
                className="text-gray-300 hover:text-white"
              >
                進捗トラッカー
              </Link>
            </li>
            <li className="mb-2">
              <Link
                href="/damage-calculator"
                className="text-gray-300 hover:text-white"
              >
                ダメージ計算機
              </Link>
            </li>
            <li className="mb-2">
              <Link href="/about" className="text-gray-300 hover:text-white">
                このアプリについて
              </Link>
            </li>
            {/* <li className="mb-2">
              <Link href="/help" className="text-gray-300 hover:text-white">
                ヘルプ
              </Link>
            </li>
            <li className="mb-2">
              <Link href="/terms" className="text-gray-300 hover:text-white">
                利用規約
              </Link>
            </li>
            <li className="mb-2">
              <Link href="/privacy" className="text-gray-300 hover:text-white">
                プライバシーポリシー
              </Link>
            </li> */}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
