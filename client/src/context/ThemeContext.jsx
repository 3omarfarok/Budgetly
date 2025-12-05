import { createContext, useContext, useState, useEffect } from "react";

// تعريف الثيمات المحسّنة (WCAG-compliant)
export const themes = {
  light: {
    name: "نهاري",
    colors: {
      // نصوص وخلفيات بتباين 7:1 (AAA)
      dark: "#1A1A1A", // نصوص رئيسية
      primary: "#2563EB", // أزرق - 4.5:1 على أبيض
      secondary: "#475569", // رمادي داكن - 7:1
      light: "#E2E8F0", // رمادي فاتح
      bg: "#FFFFFF", // خلفية بيضاء
      surface: "#F8FAFC", // سطح البطاقات

      // حالات إضافية
      success: "#059669", // أخضر - 4.5:1
      error: "#DC2626", // أحمر - 4.5:1
      warning: "#D97706", // برتقالي - 4.5:1
      info: "#0284C7", // أزرق معلومات

      // حدود وفواصل
      border: "#CBD5E1",
      hover: "#F1F5F9",
    },
    gradient: "linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)",
    zigzag: "#F8FAFC",
  },
  dark: {
    name: "ليلي",
    colors: {
      // نصوص وخلفيات بتباين عالي
      dark: "#F8FAFC", // نصوص فاتحة
      primary: "#60A5FA", // أزرق فاتح - 7:1 على داكن
      secondary: "#94A3B8", // رمادي فاتح - 7:1
      light: "#334155", // رمادي داكن
      bg: "#0F172A", // خلفية داكنة
      surface: "#1E293B", // سطح البطاقات

      // حالات إضافية
      success: "#10B981", // أخضر فاتح
      error: "#EF4444", // أحمر فاتح
      warning: "#F59E0B", // برتقالي فاتح
      info: "#3B82F6", // أزرق معلومات

      // حدود وفواصل
      border: "#475569",
      hover: "#334155",
    },
    gradient: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
    zigzag: "#1E293B",
  },
  warm: {
    name: "دافئ",
    colors: {
      dark: "#1A0F08",
      primary: "#D97706", // برتقالي محسّن
      secondary: "#78716C",
      light: "#E7E5E4",
      bg: "#FAF8F6",
      surface: "#FAFAF9",

      success: "#059669",
      error: "#DC2626",
      warning: "#D97706",
      info: "#0284C7",

      border: "#D6D3D1",
      hover: "#F5F5F4",
    },
    gradient: "linear-gradient(135deg, #FAF8F6 0%, #E7E5E4 100%)",
    zigzag: "#FAF8F6",
  },
  ocean: {
    name: "محيطي",
    colors: {
      dark: "#0C4A6E",
      primary: "#0284C7",
      secondary: "#475569",
      light: "#E0F2FE",
      bg: "#F0F9FF",
      surface: "#F8FAFC",

      success: "#059669",
      error: "#DC2626",
      warning: "#D97706",
      info: "#0284C7",

      border: "#BAE6FD",
      hover: "#E0F2FE",
    },
    gradient: "linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)",
    zigzag: "#F0F9FF",
  },
};

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState("light");

  // تحميل الثيم المحفوظ
  useEffect(() => {
    const savedTheme = localStorage.getItem("budgetly-theme");
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  // تطبيق الثيم على الصفحة
  useEffect(() => {
    const theme = themes[currentTheme];

    // Toggle dark class on HTML element for Tailwind dark: utilities
    if (currentTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // تطبيق جميع المتغيرات
    Object.keys(theme.colors).forEach((key) => {
      document.documentElement.style.setProperty(
        `--color-${key}`,
        theme.colors[key]
      );
    });

    document.documentElement.style.setProperty("--gradient-bg", theme.gradient);
    document.documentElement.style.setProperty("--zigzag-color", theme.zigzag);

    // تحديث لون الخلفية
    document.body.style.background = theme.gradient;
  }, [currentTheme]);

  const changeTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
      localStorage.setItem("budgetly-theme", themeName);
    }
  };

  const value = {
    currentTheme,
    theme: themes[currentTheme],
    changeTheme,
    availableThemes: Object.keys(themes).map((key) => ({
      key,
      name: themes[key].name,
    })),
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
