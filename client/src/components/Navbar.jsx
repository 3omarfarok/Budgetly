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
} from "lucide-react";
import { BiColorFill } from "react-icons/bi";

import { useState } from "react";

import ConfirmModal from "./ConfirmModal";

// مكون شريط التنقل - محسّن للإتاحة
const Navbar = () => {
  const { user, logout } = useAuth();
  const { currentTheme, changeTheme, availableThemes } = useTheme();
  const location = useLocation();
  const toast = useToast();
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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

  const navLinkClass = (path) => {
    const baseClass = `flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all duration-200 font-medium`;
    const lockedClass = isLocked ? "opacity-50 cursor-not-allowed" : "";
    return `${baseClass} ${lockedClass}`;
  };

  return (
    <>
      <nav
        className="backdrop-blur-xl border-b px-4 sm:px-6 py-3 sticky top-0 z-50 shadow-sm font-primary"
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
              {...(isLocked && { pointerEvents: "none" })}
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
              {...(isLocked && { pointerEvents: "none" })}
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
                {...(isLocked && { pointerEvents: "none" })}
              >
                <BarChart3 size={18} aria-hidden="true" />
                <span>التحليلات</span>
              </Link>
            )}
            <Link
              to={user.role === "admin" ? "/payments" : "/my-payments"}
              className={navLinkClass(
                user.role === "admin" ? "/payments" : "/my-payments"
              )}
              style={navLinkStyle(
                user.role === "admin" ? "/payments" : "/my-payments"
              )}
              role="menuitem"
              aria-current={
                isActive("/payments") || isActive("/my-payments")
                  ? "page"
                  : undefined
              }
              onClick={handleLockedLinkClick}
              {...(isLocked && { pointerEvents: "none" })}
            >
              <Banknote size={18} aria-hidden="true" />
              <span>المدفوعات</span>
            </Link>
            <Link
              to="/profile"
              className={navLinkClass("/profile")}
              style={navLinkStyle("/profile")}
              role="menuitem"
              aria-current={isActive("/profile") ? "page" : undefined}
              onClick={handleLockedLinkClick}
              {...(isLocked && { pointerEvents: "none" })}
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
              {...(isLocked && { pointerEvents: "none" })}
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
              {...(isLocked && { pointerEvents: "none" })}
            >
              <Home size={18} aria-hidden="true" />
              <span>البيت</span>
            </Link>
          </div>

          {/* الأدوات */}
          <div className="flex items-center gap-3">
            {/* قائمة الثيمات */}
            <div className="relative">
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="p-2.5 rounded-full transition-all"
                style={{ color: "var(--color-primary)" }}
                aria-label="غيّر الألوان"
                aria-expanded={showThemeMenu}
                aria-haspopup="true"
              >
                <BiColorFill size={20} aria-hidden="true" />
              </button>

              {showThemeMenu && (
                <div
                  className="absolute left-0 mt-2 rounded-2xl shadow-lg py-2 min-w-[140px] z-50"
                  style={{
                    backgroundColor: "var(--color-surface)",
                    borderColor: "var(--color-border)",
                    borderWidth: "1px",
                    borderStyle: "solid",
                  }}
                  role="menu"
                  aria-label="خيارات الثيم"
                >
                  {availableThemes.map((theme) => (
                    <button
                      key={theme.key}
                      onClick={() => {
                        changeTheme(theme.key);
                        setShowThemeMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-right text-sm font-medium transition-colors flex items-center justify-between"
                      style={{
                        backgroundColor:
                          currentTheme === theme.key
                            ? "var(--color-primary-bg)"
                            : "transparent",
                        color:
                          currentTheme === theme.key
                            ? "var(--color-primary)"
                            : "var(--color-dark)",
                      }}
                      role="menuitem"
                      aria-current={
                        currentTheme === theme.key ? "true" : undefined
                      }
                    >
                      {theme.name}
                      {currentTheme === theme.key && (
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: "var(--color-primary)" }}
                          aria-label="محدد"
                        ></div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

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
          <div className="flex justify-around items-center px-2">
            <Link
              to="/"
              onClick={handleLockedLinkClick}
              {...(isLocked && { pointerEvents: "none" })}
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
              {...(isLocked && { pointerEvents: "none" })}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                isLocked ? "opacity-50 cursor-not-allowed" : ""
              }`}
              style={{
                color:
                  isActive("/expenses") || isActive("/add-expense")
                    ? "var(--color-primary)"
                    : "var(--color-secondary)",
                backgroundColor:
                  isActive("/expenses") || isActive("/add-expense")
                    ? "var(--color-hover)"
                    : "transparent",
              }}
              aria-label="المصاريف"
              aria-current={
                isActive("/expenses") || isActive("/add-expense")
                  ? "page"
                  : undefined
              }
              role="menuitem"
            >
              <Receipt size={22} aria-hidden="true" />
              <span className="text-xs font-medium">المصاريف</span>
            </Link>

            <Link
              to={user.role === "admin" ? "/payments" : "/my-payments"}
              onClick={handleLockedLinkClick}
              {...(isLocked && { pointerEvents: "none" })}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                isLocked ? "opacity-50 cursor-not-allowed" : ""
              }`}
              style={{
                color:
                  isActive("/payments") || isActive("/my-payments")
                    ? "var(--color-primary)"
                    : "var(--color-secondary)",
                backgroundColor:
                  isActive("/payments") || isActive("/my-payments")
                    ? "var(--color-hover)"
                    : "transparent",
              }}
              aria-label="المدفوعات"
              aria-current={
                isActive("/payments") || isActive("/my-payments")
                  ? "page"
                  : undefined
              }
              role="menuitem"
            >
              <Banknote size={22} aria-hidden="true" />
              <span className="text-xs font-medium">الفلوس</span>
            </Link>
            <Link
              to="/profile"
              onClick={handleLockedLinkClick}
              {...(isLocked && { pointerEvents: "none" })}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
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
              role="menuitem"
            >
              <User size={22} aria-hidden="true" />
              <span className="text-xs font-medium">الملف</span>
            </Link>
            <Link
              to="/house-details"
              onClick={handleLockedLinkClick}
              {...(isLocked && { pointerEvents: "none" })}
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
            <Link
              to="/ai"
              onClick={handleLockedLinkClick}
              {...(isLocked && { pointerEvents: "none" })}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                isLocked ? "opacity-50 cursor-not-allowed" : ""
              }`}
              style={{
                color: isActive("/ai")
                  ? "var(--color-primary)"
                  : "var(--color-secondary)",
                backgroundColor: isActive("/ai")
                  ? "var(--color-hover)"
                  : "transparent",
              }}
              aria-label="المساعد"
              aria-current={isActive("/ai") ? "page" : undefined}
              role="menuitem"
            >
              <Bot size={22} aria-hidden="true" />
              <span className="text-xs font-medium">AI</span>
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
