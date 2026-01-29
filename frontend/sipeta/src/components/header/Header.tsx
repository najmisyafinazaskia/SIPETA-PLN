import { useState } from "react";
import { ThemeToggleButton } from "../common/ThemeToggleButton";
import UserDropdown from "./UserDropdown";
import { Link } from "react-router";

interface HeaderProps {
  onToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggle }) => {
  return (
    <header
      className="sticky top-0 z-[999] flex w-full border-b border-gray-10 bg-white dark:border-gray-800/50 dark:bg-[#121826] transition-all duration-300"
    >
      <div className="flex flex-grow items-center justify-between px-4 py-3 md:px-6 2xl:px-11">

        {/* SISI KIRI: Toggle Sidebar */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            className="flex items-center justify-center w-10 h-10 text-gray-500 border border-gray-200 rounded-lg dark:border-gray-800 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
            onClick={onToggle}
            aria-label="Toggle Sidebar"
          >
            <svg width="20" height="16" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0.583252 1H15.4166M0.583252 11H15.4166M0.583252 6H8.74992" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          <Link to="/" className="lg:hidden">
            <img className="dark:hidden h-8" src="/images/logo/logo.svg" alt="Logo" />
            <img className="hidden dark:block h-8" src="/images/logo/logo-dark.svg" alt="Logo" />
          </Link>
        </div>

        {/* SISI KANAN: User Profile */}
        <div className="flex items-center gap-3 2xsm:gap-7">
          <ThemeToggleButton />
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default Header;