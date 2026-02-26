import React, { useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom"; // Gunakan react-router-dom agar sinkron
import {
  GridIcon,
  CalenderIcon,
  ChevronDownIcon
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { user } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState<number | null>(0);

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  const role = user?.role;
  const isSuperAdmin = role === "superadmin" || user?.unit === "UP2K";
  const isAdmin = role === "admin" || (user?.unit && user.unit !== "UP2K");

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
      icon: (
        <img
          src={theme === "dark" ? "/images/icons/up3-dark.png" : "/images/icons/up3-light.png"}
          alt="UP3"
          className={`size-6 object-contain transition-all duration-200 ${isActive("/dashboard/up3") ? "brightness-0 invert" : ""}`}
        />
      ),
      subItems: [{ name: "UP3 Aceh", path: "/dashboard/up3" }],
    },
    {
      name: "ULP",
      icon: (
        <img
          src={theme === "dark" ? "/images/icons/ulp-dark.png" : "/images/icons/ulp-light.png"}
          alt="ULP"
          className={`size-6 object-contain transition-all duration-200 ${isActive("/dashboard/ulp") ? "brightness-0 invert" : ""}`}
        />
      ),
      subItems: [{ name: "ULP Aceh", path: "/dashboard/ulp" }],
    },
    ...(isSuperAdmin
      ? [
        {
          name: "Berita Acara",
          icon: <CalenderIcon />,
          subItems: [{ name: "Verifikasi", path: "/dashboard/verifikasi" }],
        },
      ]
      : isAdmin
        ? [
          {
            name: "Berita Acara",
            icon: <CalenderIcon />,
            subItems: [{ name: "Upload", path: "/dashboard/verifikasi" }],
          },
        ]
        : [
          {
            name: "Berita Acara",
            icon: <CalenderIcon />,
            path: "/dashboard/verifikasi",
          },
        ]),
  ];

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
                alt="Logo SIPEDA"
                className="block dark:hidden w-full h-full object-contain object-left"
              />
              <img
                src="/images/logo/logo-dark.png"
                alt="Logo SIPEDA"
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
                                  onClick={(e) => {
                                    if (sub.path === "/dashboard/verifikasi") {
                                      e.preventDefault();
                                      window.location.href = sub.path;
                                    }
                                  }}
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

          {/* Footer Call Center */}
          {(isExpanded || isHovered) && (
            <div className="mt-auto px-12 pb-6">
              <Link
                to="/dashboard/call-center"
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 group
                  ${isActive("/dashboard/call-center")
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                    : "bg-slate-50 text-[#1C2434]/70 hover:bg-blue-50 hover:text-blue-600 dark:bg-white/[0.03] dark:text-slate-400 dark:hover:bg-blue-600/10 dark:hover:text-blue-400"}`}
              >
                <div className={`p-1.5 rounded-xl mb-1.5 transition-colors duration-300
                  ${isActive("/dashboard/call-center")
                    ? "bg-white/20"
                    : "bg-white dark:bg-gray-800 shadow-sm group-hover:bg-blue-600"}`}>
                  <img
                    src={theme === "dark" ? "/images/icons/callcenter-dark.png" : "/images/icons/call-center.png"}
                    alt="Call Center"
                    className={`size-7 object-contain transition-all duration-300 ${isActive("/dashboard/call-center") && theme !== "dark" ? "brightness-0 invert" : ""}`}
                  />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider">Call Center</span>
              </Link>
            </div>
          )}

        </div>
      </aside>
    </>
  );
};

export default AppSidebar;