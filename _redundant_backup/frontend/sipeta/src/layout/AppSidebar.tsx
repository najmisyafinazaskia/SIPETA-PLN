import React, { useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom"; // Gunakan react-router-dom agar sinkron
import {
  GridIcon,
  CalenderIcon,
  ListIcon,
  TableIcon,
  ChevronDownIcon
} from "../icons";
import { useSidebar } from "../context/SidebarContext";

const navItems = [
  {
    name: "Dashboard",
    icon: <GridIcon />,
    subItems: [
      { name: "Region", path: "/dashboard/region" },
      { name: "Kota/Kabupaten", path: "/dashboard" },
      { name: "Kecamatan", path: "/dashboard/kecamatan" },
      { name: "Desa", path: "/dashboard/desa" },
      { name: "Dusun", path: "/dashboard/dusun" },
    ],
  },
  {
    name: "UP3",
    icon: <ListIcon />,
    subItems: [{ name: "UP3 Aceh", path: "/dashboard/up3" }],
  },
  {
    name: "ULP",
    icon: <TableIcon />,
    subItems: [{ name: "ULP Aceh", path: "/dashboard/ulp" }],
  },
  {
    name: "Verifikasi",
    icon: <CalenderIcon />,
    path: "/dashboard/verifikasi", // ✅ Perbaiki path agar sesuai App.tsx
  }
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState<number | null>(0);

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  const isParentActive = (subItems?: { path: string }[]) => {
    if (!subItems) return false;
    return subItems.some(item => isActive(item.path));
  };

  return (
    <>
      <aside
        className={`fixed top-0 left-0 z-[20000] h-screen transition-all duration-300 shadow-xl
          bg-[#ffffff] border-r border-gray-100 dark:bg-[#121826] dark:border-gray-800/50
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} 
          sm:translate-x-0 ${isExpanded || isHovered ? "w-72" : "w-24"}`}
        onMouseEnter={() => !isExpanded && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="h-full overflow-y-auto no-scrollbar flex flex-col font-outfit">

          {/* Logo Branding */}
          <div className={`flex items-center px-6 py-4 mb-6 border-b border-gray-100 dark:border-gray-800/50 
            ${!isExpanded && !isHovered ? "justify-center" : "justify-start"}`}>

            <div className="h-20 w-48 flex items-center justify-start overflow-hidden">
              <img
                src="/images/logo/logo-light.png"
                alt="Logo SIPETA"
                className="block dark:hidden w-full h-full object-contain object-left"
              />
              <img
                src="/images/logo/logo-dark.png"
                alt="Logo SIPETA"
                className="hidden dark:block w-full h-full object-contain object-left"
              />
            </div>
          </div>

          <div className="px-4">
            <ul className="space-y-2">
              {navItems.map((nav, index) => {
                const hasSub = !!nav.subItems;
                const isSubOpen = openSubmenu === index;
                const activeParent = isParentActive(nav.subItems);
                const activeSingle = nav.path ? isActive(nav.path) : false;
                const isHighlighted = activeParent || activeSingle;

                return (
                  <li key={nav.name}>
                    {hasSub ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setOpenSubmenu(isSubOpen ? null : index)}
                          className={`flex items-center w-full p-3 rounded-xl transition-all duration-200 group
                            ${isHighlighted
                              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                              : "text-[#1C2434]/70 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-white/[0.03]"}`}
                        >
                          <span className={`flex-shrink-0 transition duration-200 [&>svg]:size-6 ${isHighlighted ? "text-white" : ""}`}>
                            {nav.icon}
                          </span>
                          {(isExpanded || isHovered) && (
                            <>
                              <span className="ms-3 flex-1 text-left whitespace-nowrap text-base font-bold">{nav.name}</span>
                              <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isSubOpen ? 'rotate-180' : ''}`} />
                            </>
                          )}
                        </button>

                        {(isExpanded || isHovered) && isSubOpen && (
                          <ul className="mt-2 space-y-1 px-2 border-l border-slate-100 dark:border-slate-800 ml-6">
                            {nav.subItems?.map((sub) => (
                              <li key={sub.name}>
                                <Link
                                  to={sub.path}
                                  className={`flex items-center w-full py-2 px-4 transition-all rounded-lg text-sm font-bold
                                    ${isActive(sub.path)
                                      ? "text-blue-600 bg-blue-50 dark:bg-blue-600/10 dark:text-blue-400"
                                      : "text-[#1C2434]/60 hover:text-[#1C2434] dark:text-slate-500 dark:hover:text-slate-200 hover:translate-x-1"}`}
                                >
                                  {isActive(sub.path) && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 me-2" />}
                                  {sub.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    ) : (
                      <Link
                        to={nav.path || "#"}
                        className={`flex items-center p-3 rounded-xl transition-all duration-200 group
                          ${activeSingle
                            ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                            : "text-[#1C2434]/70 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-white/[0.03]"}`}
                      >
                        <span className={`flex-shrink-0 transition duration-200 [&>svg]:size-6 ${activeSingle ? "text-white" : ""}`}>
                          {nav.icon}
                        </span>
                        {(isExpanded || isHovered) && <span className="ms-3 text-base font-bold">{nav.name}</span>}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;