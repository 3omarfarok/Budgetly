import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import {
  LayoutDashboard,
  Receipt,
  Users,
  LogOut,
  PlusCircle,
  Palette,
  Banknote,
  BarChart3,
  User,
  Info,
  Home,
  Lock,
  Bot,
  Sun,
  Moon,
  StickyNote,
} from "lucide-react";

import { useState } from "react";

import ConfirmModal from "./ConfirmModal";

// مكون شريط التنقل - محسّن للإتاحة
const Navbar = () => {
  const { user, logout } = useAuth();
  const {
    themeMode,
    changeThemeMode,
    currentPalette,
    changePalette,
    palettes,
  } = useTheme();
  const location = useLocation();
  const toast = useToast();
  const [showPaletteMenu, setShowPaletteMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const toggleTheme = () => {
    changeThemeMode(themeMode === "dark" ? "light" : "dark");
  };

  if (!user) return null;

  const isActive = (path) => location.pathname === path;
  const isLocked = !user.house; // Check if user has no house

  const handleLockedLinkClick = (e) => {
    if (isLocked) {
      e.preventDefault();
      toast.error("يرجى اختيار أو إنشاء بيت أولاً");
    }
  };

  const navLinkStyle = (path) => ({
    backgroundColor: isActive(path) ? "var(--color-primary)" : "transparent",
    color: isActive(path) ? "white" : "var(--color-dark)",
  });

  const navLinkClass = () => {
    const baseClass = `flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all duration-200 font-medium`;
    const lockedClass = isLocked ? "opacity-50 cursor-not-allowed" : "";
    return `${baseClass} ${lockedClass}`;
  };

  return (
    <>
      <nav
        className="md:hidden backdrop-blur-xl border-b px-4 sm:px-6 py-3 sticky top-0 z-50 shadow-sm font-primary"
        style={{
          backgroundColor: "var(--color-surface)",
          borderColor: "var(--color-border)",
        }}
        role="navigation"
        aria-label="التنقل الرئيسي"
      >
        {/* Skip to main content link */}
        <a href="#main-content" className="skip-link">
          روح للصفحة الرئيسية
        </a>

        {/* Locked Notification */}
        {isLocked && (
          <div
            className="mb-3 px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
            style={{
              backgroundColor: "var(--color-status-pending-bg)",
              borderColor: "var(--color-status-pending-border)",
              borderWidth: "1px",
              borderStyle: "solid",
              color: "var(--color-status-pending)",
            }}
          >
            <Lock size={16} />
            <span>يرجى اختيار بيت للوصول إلى المزيد من الخيارات</span>
          </div>
        )}

        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <img
              src="/assets/logo.png"
              alt="بدجتلي - Budgetly"
              className="w-20 h-auto dark:invert"
            />
          </div>

          {/* القائمة الرئيسية - سطح المكتب */}
          <div className="hidden md:flex items-center gap-2" role="menubar">
            <Link
              to="/"
              className={navLinkClass("/")}
              style={navLinkStyle("/")}
              role="menuitem"
              aria-current={isActive("/") ? "page" : undefined}
              onClick={handleLockedLinkClick}
            >
              <LayoutDashboard size={18} aria-hidden="true" />
              <span>الصفحة الرئيسية</span>
            </Link>
            <Link
              to="/expenses"
              className={navLinkClass("/expenses")}
              style={navLinkStyle("/expenses")}
              role="menuitem"
              aria-current={
                isActive("/expenses") || isActive("/add-expense")
                  ? "page"
                  : undefined
              }
              onClick={handleLockedLinkClick}
            >
              <Receipt size={18} aria-hidden="true" />
              <span>المصاريف</span>
            </Link>
            {user.role === "admin" && (
              <Link
                to="/analytics"
                className={navLinkClass("/analytics")}
                style={navLinkStyle("/analytics")}
                role="menuitem"
                aria-current={isActive("/analytics") ? "page" : undefined}
                onClick={handleLockedLinkClick}
              >
                <BarChart3 size={18} aria-hidden="true" />
                <span>التحليلات</span>
              </Link>
            )}
            <Link
              to={user.role === "admin" ? "/all-invoices" : "/my-invoices"}
              className={navLinkClass(
                user.role === "admin" ? "/all-invoices" : "/my-invoices"
              )}
              style={navLinkStyle(
                user.role === "admin" ? "/all-invoices" : "/my-invoices"
              )}
              role="menuitem"
              aria-current={
                isActive("/all-invoices") || isActive("/my-invoices")
                  ? "page"
                  : undefined
              }
              onClick={handleLockedLinkClick}
            >
              <Banknote size={18} aria-hidden="true" />
              <span>الفواتير</span>
            </Link>
            <Link
              to="/profile"
              className={navLinkClass("/profile")}
              style={navLinkStyle("/profile")}
              role="menuitem"
              aria-current={isActive("/profile") ? "page" : undefined}
              onClick={handleLockedLinkClick}
            >
              <User size={18} aria-hidden="true" />
              <span>الملف الشخصي</span>
            </Link>
            <Link
              to="/about"
              className={navLinkClass("/about")}
              style={navLinkStyle("/about")}
              role="menuitem"
              aria-current={isActive("/about") ? "page" : undefined}
              onClick={handleLockedLinkClick}
            >
              <Info size={18} aria-hidden="true" />
              <span>عن التطبيق</span>
            </Link>
            <Link
              to="/house-details"
              className={navLinkClass("/house-details")}
              style={navLinkStyle("/house-details")}
              role="menuitem"
              aria-current={isActive("/house-details") ? "page" : undefined}
              onClick={handleLockedLinkClick}
            >
              <Home size={18} aria-hidden="true" />
              <span>البيت</span>
            </Link>
            <Link
              to="/notes"
              className={navLinkClass("/notes")}
              style={navLinkStyle("/notes")}
              role="menuitem"
              aria-current={isActive("/notes") ? "page" : undefined}
              onClick={handleLockedLinkClick}
            >
              <StickyNote size={18} aria-hidden="true" />
              <span>الملاحظات</span>
            </Link>
          </div>

          {/* الأدوات */}
          <div className="flex items-center gap-3">
            {/* Theme & Palette */}
            <div className="relative flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-full transition-all"
                style={{ color: "var(--color-secondary)" }}
                aria-label={
                  themeMode === "dark" ? "الوضع النهاري" : "الوضع الليلي"
                }
              >
                {themeMode === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {themeMode === "dark" && (
                <div className="relative">
                  <button
                    onClick={() => setShowPaletteMenu(!showPaletteMenu)}
                    className="p-2.5 rounded-full transition-all"
                    style={{
                      color: showPaletteMenu
                        ? "var(--color-primary)"
                        : "var(--color-secondary)",
                    }}
                    aria-label="تغيير ألوان الثيم"
                  >
                    <Palette size={20} aria-hidden="true" />
                  </button>

                  {showPaletteMenu && (
                    <div
                      className="absolute left-0 mt-2 rounded-2xl shadow-lg py-2 min-w-[160px] z-50 overflow-hidden"
                      style={{
                        backgroundColor: "var(--color-surface)",
                        borderColor: "var(--color-border)",
                        borderWidth: "1px",
                        borderStyle: "solid",
                      }}
                      role="menu"
                    >
                      <div className="px-4 py-2 text-xs font-bold text-(--color-muted) border-b border-(--color-border) mb-1">
                        اختر الثيم
                      </div>

                      {/* Default Option */}
                      <button
                        onClick={() => {
                          changePalette("default");
                          setShowPaletteMenu(false);
                        }}
                        className="w-full px-4 py-2.5 text-right text-sm font-medium transition-colors flex items-center justify-between hover:bg-(--color-hover)"
                        style={{
                          color:
                            currentPalette === "default"
                              ? "var(--color-primary)"
                              : "var(--color-dark)",
                          fontWeight:
                            currentPalette === "default" ? "bold" : "normal",
                        }}
                      >
                        الافتراضي
                        {currentPalette === "default" && (
                          <div className="w-2 h-2 rounded-full bg-(--color-primary)"></div>
                        )}
                      </button>

                      {palettes
                        .filter((p) => p.id !== "default")
                        .map((p) => (
                          <button
                            key={p.id}
                            onClick={() => {
                              changePalette(p.id);
                              setShowPaletteMenu(false);
                            }}
                            className="w-full px-4 py-2.5 text-right text-sm font-medium transition-colors flex items-center justify-between hover:bg-(--color-hover)"
                            style={{
                              color:
                                currentPalette === p.id
                                  ? "var(--color-primary)"
                                  : "var(--color-dark)",
                              fontWeight:
                                currentPalette === p.id ? "bold" : "normal",
                            }}
                          >
                            {p.name}
                            {currentPalette === p.id && (
                              <div className="w-2 h-2 rounded-full bg-(--color-primary)"></div>
                            )}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <Link
              to="/profile"
              onClick={handleLockedLinkClick}
              className={`p-2.5 rounded-full transition-all ${
                isLocked ? "opacity-50 cursor-not-allowed" : ""
              }`}
              style={{
                color: isActive("/profile")
                  ? "var(--color-primary)"
                  : "var(--color-secondary)",
                backgroundColor: isActive("/profile")
                  ? "var(--color-hover)"
                  : "transparent",
              }}
              aria-label="الملف الشخصي"
              aria-current={isActive("/profile") ? "page" : undefined}
            >
              <User size={20} aria-hidden="true" />
            </Link>

            <button
              onClick={() => setShowLogoutModal(true)}
              className="p-2.5 rounded-full transition-all"
              style={{ color: "var(--color-error)" }}
              aria-label="اطلع"
            >
              <LogOut size={20} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* القائمة السفلية للجوال - Bottom Navigation */}
        <div
          className="md:hidden fixed bottom-0 left-0 right-0 backdrop-blur-xl border-t pt-2 pb-safe z-50 shadow-lg"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
          }}
        >
          <div className="flex justify-around items-end px-2 mb-2">
            <Link
              to="/"
              onClick={handleLockedLinkClick}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                isLocked ? "opacity-50 cursor-not-allowed" : ""
              }`}
              style={{
                color: isActive("/")
                  ? "var(--color-primary)"
                  : "var(--color-secondary)",
                backgroundColor: isActive("/")
                  ? "var(--color-hover)"
                  : "transparent",
              }}
              aria-label="الصفحة الرئيسية"
              aria-current={isActive("/") ? "page" : undefined}
              role="menuitem"
            >
              <LayoutDashboard size={22} aria-hidden="true" />
              <span className="text-xs font-medium">الرئيسية</span>
            </Link>
            <Link
              to="/expenses"
              onClick={handleLockedLinkClick}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                isLocked ? "opacity-50 cursor-not-allowed" : ""
              }`}
              style={{
                color: isActive("/expenses")
                  ? "var(--color-primary)"
                  : "var(--color-secondary)",
                backgroundColor: isActive("/expenses")
                  ? "var(--color-hover)"
                  : "transparent",
              }}
              aria-label="المصاريف"
              aria-current={isActive("/expenses") ? "page" : undefined}
              role="menuitem"
            >
              <Receipt size={22} aria-hidden="true" />
              <span className="text-xs font-medium">المصاريف</span>
            </Link>

            <Link
              to="/add-expense"
              onClick={handleLockedLinkClick}
              className={`flex flex-col items-center justify-center gap-1 px-4 py-3 rounded-3xl transition-all ${
                isLocked ? "opacity-50 cursor-not-allowed" : ""
              }`}
              style={{
                color: "#ffffff",
                backgroundColor: "var(--color-primary)",
                boxShadow: isActive("/add-expense")
                  ? "0 10px 24px rgba(0, 0, 0, 0.24)"
                  : "0 6px 16px rgba(0, 0, 0, 0.18)",
                transform: isActive("/add-expense")
                  ? "translateY(-4px) scale(1.03)"
                  : "translateY(-2px)",
              }}
              aria-label="إضافة مصروف"
              aria-current={isActive("/add-expense") ? "page" : undefined}
              role="menuitem"
            >
              <PlusCircle size={24} aria-hidden="true" />
              <span className="text-xs font-medium">إضافة</span>
            </Link>

            <Link
              to={user.role === "admin" ? "/all-invoices" : "/my-invoices"}
              onClick={handleLockedLinkClick}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                isLocked ? "opacity-50 cursor-not-allowed" : ""
              }`}
              style={{
                color:
                  isActive("/all-invoices") || isActive("/my-invoices")
                    ? "var(--color-primary)"
                    : "var(--color-secondary)",
                backgroundColor:
                  isActive("/all-invoices") || isActive("/my-invoices")
                    ? "var(--color-hover)"
                    : "transparent",
              }}
              aria-label="الفواتير"
              aria-current={
                isActive("/all-invoices") || isActive("/my-invoices")
                  ? "page"
                  : undefined
              }
              role="menuitem"
            >
              <Banknote size={22} aria-hidden="true" />
              <span className="text-xs font-medium">الفواتير</span>
            </Link>
            <Link
              to="/house-details"
              onClick={handleLockedLinkClick}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                isLocked ? "opacity-50 cursor-not-allowed" : ""
              }`}
              style={{
                color: isActive("/house-details")
                  ? "var(--color-primary)"
                  : "var(--color-secondary)",
                backgroundColor: isActive("/house-details")
                  ? "var(--color-hover)"
                  : "transparent",
              }}
              aria-label="البيت"
              aria-current={isActive("/house-details") ? "page" : undefined}
              role="menuitem"
            >
              <Home size={22} aria-hidden="true" />
              <span className="text-xs font-medium">البيت</span>
            </Link>
          </div>
        </div>
      </nav>

      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          logout();
          setShowLogoutModal(false);
        }}
        title="تسجيل الخروج"
        message="هل أنت متأكد أنك تريد تسجيل الخروج؟"
        type="danger"
      />
    </>
  );
};

export default Navbar;
