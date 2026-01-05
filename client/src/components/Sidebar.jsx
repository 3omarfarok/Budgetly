import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  LayoutDashboard,
  Receipt,
  Users,
  LogOut,
  Palette,
  Banknote,
  BarChart3,
  User,
  Info,
  Home,
  Lock,
  StickyNote,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Settings,
  Bot,
} from "lucide-react";
import { BiColorFill } from "react-icons/bi";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { currentTheme, changeTheme, availableThemes } = useTheme();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  if (!user) return null;

  const isActive = (path) => location.pathname === path;
  const isLocked = !user.house; // Check if user has no house

  const navItems = [
    {
      path: "/",
      label: "المشرف",
      icon: LayoutDashboard,
      roles: ["admin", "user"],
    },
    {
      path: "/expenses",
      label: "المصاريف",
      icon: Receipt,
      roles: ["admin", "user"],
    },
    {
      path: user.role === "admin" ? "/all-invoices" : "/my-invoices",
      label: "الفواتير",
      icon: Banknote,
      roles: ["admin", "user"],
    },

    {
      path: "/analytics",
      label: "التقارير",
      icon: BarChart3,
      roles: ["admin"],
    },
    {
      path: "/ai",
      label: "المساعد الذكي",
      icon: Bot,
      roles: ["admin", "user"],
    },
    {
      path: "/notes",
      label: "الملاحظات",
      icon: StickyNote,
      roles: ["admin", "user"],
    },
    {
      path: "/house-details",
      label: "البيت",
      icon: Home,
      roles: ["admin", "user"],
    },
    {
      path: "/profile",
      label: "الملف الشخصي",
      icon: User,
      roles: ["admin", "user"],
    },
    {
      path: "/about",
      label: "عن التطبيق",
      icon: Info,
      roles: ["admin", "user"],
    },
  ];

  const handleLogout = () => {
    if (window.confirm("هل أنت متأكد أنك تريد تسجيل الخروج؟")) {
      logout();
    }
  };

  return (
    <aside
      className={`hidden md:flex flex-col h-screen sticky top-0 transition-all duration-300 border-l z-40 ${
        collapsed ? "w-20" : "w-64"
      }`}
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      {/* Header / Logo */}
      <div
        className="p-4 flex items-center justify-between border-b"
        style={{ borderColor: "var(--color-border)" }}
      >
        {!collapsed && (
          <div className="flex items-center gap-2">
            <img
              src="/assets/logo.png"
              alt="Budgetly"
              className=" h-14 dark:invert transition-all"
            />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-(--color-surface) transition-colors hover:text-(--color-primary) text-(--color-secondary) cursor-pointer"
        >
          {collapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-hidden py-4 px-3 space-y-2 custom-scrollbar">
        {isLocked && !collapsed && (
          <div
            className="mb-4 px-3 py-2 rounded-lg flex items-center gap-2 text-xs"
            style={{
              backgroundColor: "var(--color-status-pending-bg)",
              color: "var(--color-status-pending)",
              border: "1px solid var(--color-status-pending-border)",
            }}
          >
            <Lock size={14} />
            <span>انضم لبيت أولاً</span>
          </div>
        )}

        {navItems.map((item) => {
          if (item.roles && !item.roles.includes(user.role)) return null;

          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                isLocked &&
                item.path !== "/profile" &&
                item.path !== "/house-selection"
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              style={{
                backgroundColor: active
                  ? "var(--color-primary)"
                  : "transparent",
                color: active ? "white" : "var(--color-secondary)",
              }}
              onClick={(e) => {
                if (
                  isLocked &&
                  item.path !== "/profile" &&
                  item.path !== "/house-selection"
                ) {
                  e.preventDefault();
                }
              }}
            >
              <item.icon
                size={22}
                className={`${
                  active
                    ? "text-white"
                    : "text-[var(--color-secondary)] group-hover:text-[var(--color-primary)]"
                } transition-colors`}
              />

              {!collapsed && (
                <span
                  className={`font-medium ${
                    active ? "text-white" : "text-[var(--color-dark)]"
                  }`}
                >
                  {item.label}
                </span>
              )}

              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute right-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none mr-2">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer / User Tools */}
      <div
        className="p-4 border-t"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div
          className={`flex ${
            collapsed
              ? "flex-col gap-4 items-center"
              : "flex-row items-center justify-between"
          }`}
        >
          {/* Theme Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="p-2 rounded-lg hover:bg-[var(--color-bg)] transition-colors text-[var(--color-secondary)]"
              title="تغيير المظهر"
            >
              <BiColorFill size={22} />
              {collapsed && showThemeMenu && (
                <div className="fixed right-16 bottom-20 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl p-2 z-50 min-w-[150px]">
                  {availableThemes.map((theme) => (
                    <div
                      key={theme.key}
                      onClick={(e) => {
                        e.stopPropagation();
                        changeTheme(theme.key);
                        setShowThemeMenu(false);
                      }}
                      className="px-3 py-2 hover:bg-[var(--color-bg)] rounded cursor-pointer text-sm text-[var(--color-dark)] flex items-center justify-between"
                    >
                      {theme.name}
                      {currentTheme === theme.key && (
                        <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]"></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </button>

            {/* Desktop expanded theme menu */}
            {!collapsed && showThemeMenu && (
              <div className="absolute bottom-full right-0 mb-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl p-2 z-50 min-w-[200px]">
                {availableThemes.map((theme) => (
                  <button
                    key={theme.key}
                    onClick={() => {
                      changeTheme(theme.key);
                      setShowThemeMenu(false);
                    }}
                    className="w-full px-3 py-2 hover:bg-[var(--color-bg)] rounded cursor-pointer text-sm text-[var(--color-dark)] flex items-center justify-between text-right"
                  >
                    {theme.name}
                    {currentTheme === theme.key && (
                      <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]"></div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Info (Expanded only) */}
          {!collapsed && (
            <div className="flex flex-col items-end">
              <span className="text-sm font-semibold text-[var(--color-dark)]">
                {user.name}
              </span>
              <span className="text-xs text-[var(--color-secondary)]">
                {user.role === "admin" ? "مشرف" : "عضو"}
              </span>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-red-50 text-[var(--color-error)] transition-colors"
            title="تسجيل الخروج"
          >
            <LogOut size={22} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
