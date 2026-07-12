"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronLeft, ChevronRight, Menu, X } from "lucide-react";

export default function Sidebar({ menuItems = [], userName = "Utilisateur" }) {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState([]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (href) => pathname === href;

  const checkSubActive = (subItems) => {
    return subItems?.some((item) => pathname === item.href);
  };

  const toggleDropdown = (index) => {
    setOpenDropdown((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  const SidebarContent = ({ collapsed = false }) => (
    <>
      {/* LOGO */}
      <div className={`px-5 py-5 border-b border-green-600/30 flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
        <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-green-700 font-bold text-sm shadow-sm flex-shrink-0">
          WT
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h2 className="font-bold text-white text-base leading-tight">
              Waste Tracker
            </h2>
            <p className="text-green-300 text-[10px] uppercase tracking-widest">
              Gestion des déchets
            </p>
          </div>
        )}
      </div>

      {/* MENU */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item, index) => {
          if (item.isDropdown) {
            const isOpen = openDropdown.includes(index);
            const isSubActive = checkSubActive(item.subItems);

            return (
              <div key={index}>
                <button
                  onClick={() => toggleDropdown(index)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center ${collapsed ? "justify-center" : "justify-between"} px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isSubActive
                      ? "bg-white/15 text-white shadow-sm"
                      : "text-green-100 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg flex-shrink-0 opacity-80">{item.icon}</span>
                    {!collapsed && <span>{item.label}</span>}
                  </div>
                  {!collapsed && (
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 opacity-60 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>

                {isOpen && !collapsed && (
                  <div className="ml-5 mt-1 space-y-0.5 border-l-2 border-green-500/30 pl-3 animate-slide-down">
                    {item.subItems.map((subItem, subIndex) => (
                      <Link
                        key={subIndex}
                        href={subItem.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                          isActive(subItem.href)
                            ? "bg-white text-green-700 font-semibold shadow-sm"
                            : "text-green-200 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={index}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                collapsed ? "justify-center" : ""
              } ${
                isActive(item.href)
                  ? "bg-white text-green-700 shadow-sm"
                  : "text-green-100 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="text-lg flex-shrink-0 opacity-80">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* FOOTER USER */}
      <div className="border-t border-green-600/30 p-3">
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} px-2 py-2.5 rounded-xl bg-white/10`}>
          <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-green-700 font-bold text-sm shadow-sm flex-shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0 animate-fade-in">
              <p className="text-sm font-semibold text-white truncate">
                {userName}
              </p>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-400 rounded-full" style={{ animation: "pulse-dot 2s infinite" }}></span>
                <p className="text-[11px] text-green-300">En ligne</p>
              </div>
            </div>
          )}
        </div>

        {/* Collapse toggle - desktop only */}
        {!isMobileOpen && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex w-full mt-2 items-center justify-center py-1.5 text-green-300 hover:text-white transition-colors rounded-lg hover:bg-white/10"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-green-700 text-white rounded-xl shadow-lg hover:bg-green-800 transition"
      >
        {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-30 animate-fade-in"
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex h-screen bg-gradient-to-b from-green-700 to-green-800 flex-col shadow-xl transition-all duration-300 ${
          isCollapsed ? "w-[72px]" : "w-[260px]"
        }`}
      >
        <SidebarContent collapsed={isCollapsed} />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed top-0 left-0 w-[260px] h-screen bg-gradient-to-b from-green-700 to-green-800 flex flex-col shadow-2xl z-40 transition-transform duration-300 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}