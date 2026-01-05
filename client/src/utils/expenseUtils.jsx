import { ShoppingBag, Car, Zap, Home, Smile, Package } from "lucide-react";

export const getCategoryIcon = (category) => {
  const icons = {
    Food: <ShoppingBag size={20} />,
    Transport: <Car size={20} />,
    Utilities: <Zap size={20} />,
    Housing: <Home size={20} />,
    Entertainment: <Smile size={20} />,
    General: <Package size={20} />,
  };
  return icons[category] || <Package size={20} />;
};

export const getCategoryStyles = (category) => {
  const styles = {
    Food: {
      backgroundColor: "var(--color-status-pending-bg)",
      color: "var(--color-status-pending)",
    },
    Transport: {
      backgroundColor: "var(--color-primary-bg)",
      color: "var(--color-primary)",
    },
    Utilities: {
      backgroundColor: "var(--color-status-pending-bg)",
      color: "var(--color-status-pending)",
    },
    Housing: {
      backgroundColor: "var(--color-primary-bg)",
      color: "var(--color-primary)",
    },
    Entertainment: {
      backgroundColor: "var(--color-status-rejected-bg)",
      color: "var(--color-status-rejected)",
    },
    General: {
      backgroundColor: "var(--color-surface)",
      color: "var(--color-secondary)",
      border: "1px solid var(--color-border)",
    },
    Other: {
      backgroundColor: "var(--color-surface)",
      color: "var(--color-secondary)",
      border: "1px solid var(--color-border)",
    },
  };
  return (
    styles[category] || {
      backgroundColor: "var(--color-surface)",
      color: "var(--color-secondary)",
    }
  );
};

export const translateCategory = (category) => {
  const translations = {
    Food: "أكل وشرب",
    Transport: "مواصلات",
    Utilities: "فواتير",
    Housing: "سكن",
    Entertainment: "ترفيه",
    CashOut: "سحب كاش",
    General: "عام",
  };
  return translations[category] || category;
};

export const expenseCategories = [
  { id: "Food", label: "أكل وشرب", icon: "Food" },
  { id: "Transport", label: "مواصلات", icon: "Transport" },
  { id: "Utilities", label: "فواتير", icon: "Utilities" },
  { id: "Housing", label: "سكن", icon: "Housing" },
  { id: "Entertainment", label: "ترفيه", icon: "Entertainment" },
  { id: "CashOut", label: "سحب كاش", icon: "General" },
  { id: "General", label: "عام", icon: "General" },
];
