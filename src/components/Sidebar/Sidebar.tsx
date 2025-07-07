import React from "react";

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
    </>
  );
};

export default Sidebar;
