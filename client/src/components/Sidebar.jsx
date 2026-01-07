import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import ConfirmModal from "./ConfirmModal";
import {
  LayoutDashboard,
  Receipt,
  LogOut,
  Banknote,
  BarChart3,
  User,
  Info,
  Home,
  Lock,
  StickyNote,
  ChevronLeft,
  ChevronRight,
  Mail,
  Sun,
  Moon,
} from "lucide-react";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { themeMode, changeThemeMode } = useTheme();

  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  if (!user) return null;

  const isActive = (path) => location.pathname === path;
  const isLocked = !user.house; // Check if user has no house

  const navGroups = [
    {
      title: "الرئيسية",
      items: [
        {
          path: "/",
          label: "لوحة التحكم",
          icon: LayoutDashboard,
          roles: ["admin", "user"],
        },
        {
          path: "/house-details",
          label: "تفاصيل البيت",
          icon: Home,
          roles: ["admin", "user"],
        },
      ],
    },
    {
      title: "المالية",
      items: [
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
          label: "التقارير والإحصائيات",
          icon: BarChart3,
          roles: ["admin"],
        },
      ],
    },
    {
      title: "الأدوات",
      items: [
        {
          path: "/notes",
          label: "الملاحظات",
          icon: StickyNote,
          roles: ["admin", "user"],
        },
      ],
    },
    {
      title: "الحساب",
      items: [
        {
          path: "/profile",
          label: "الملف الشخصي",
          icon: User,
          roles: ["admin", "user"],
        },
        {
          path: "/contact",
          label: "تواصل معنا",
          icon: Mail,
          roles: ["admin", "user"],
        },
        {
          path: "/about",
          label: "عن التطبيق",
          icon: Info,
          roles: ["admin", "user"],
        },
      ],
    },
  ];

  const handleLogoutConfirmation = () => {
    logout();
    setShowLogoutModal(false);
  };

  const toggleTheme = () => {
    changeThemeMode(themeMode === "dark" ? "light" : "dark");
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

      <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar space-y-6">
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

        {navGroups.map((group, groupIndex) => (
          <div key={groupIndex}>
            {!collapsed && (
              <h3
                className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider opacity-50"
                style={{ color: "var(--color-secondary)" }}
              >
                {group.title}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                if (item.roles && !item.roles.includes(user.role)) return null;

                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
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
                      size={20}
                      className={`${
                        active
                          ? "text-white"
                          : "text-(--color-secondary) group-hover:text-(--color-primary)"
                      } transition-colors`}
                    />

                    {!collapsed && (
                      <span
                        className={`font-medium text-sm ${
                          active ? "text-white" : "text-(--color-dark)"
                        }`}
                      >
                        {item.label}
                      </span>
                    )}

                    {collapsed && (
                      <div className="absolute right-full top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none mr-2 shadow-lg">
                        {item.label}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer / User Tools */}
      <div
        className="p-4 border-t relative"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div
          className={`flex ${
            collapsed
              ? "flex-col gap-4 items-center"
              : "flex-row items-center justify-between"
          }`}
        >
          <div className="flex items-center gap-1">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-(--color-bg) transition-colors text-(--color-secondary)"
              title={themeMode === "dark" ? "الوضع النهاري" : "الوضع الليلي"}
            >
              {themeMode === "dark" ? <Sun size={22} /> : <Moon size={22} />}
            </button>
          </div>

          {/* User Info (Expanded only) */}
          {!collapsed && (
            <div className="flex flex-col items-end">
              <span className="text-sm font-semibold text-(--color-dark)">
                {user.name}
              </span>
              <span className="text-xs text-(--color-secondary)">
                {user.role === "admin" ? "مشرف" : "عضو"}
              </span>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="p-2 rounded-lg hover:bg-(--color-error)/10 cursor-pointer text-(--color-error) transition-colors"
            title="تسجيل الخروج"
          >
            <LogOut size={22} />
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirmation}
        title="تسجيل الخروج"
        message="هل أنت متأكد أنك تريد تسجيل الخروج؟"
        type="danger"
      />
    </aside>
  );
};

export default Sidebar;
