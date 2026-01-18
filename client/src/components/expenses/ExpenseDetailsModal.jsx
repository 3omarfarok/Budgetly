import {
  X,
  Calendar,
  User,
  Users,
  DollarSign,
  Tag,
  FileText,
} from "lucide-react";
import {
  translateCategory,
  getCategoryIcon,
  getCategoryStyles,
} from "../../utils/expenseUtils.jsx";

export default function ExpenseDetailsModal({ expense, isOpen, onClose }) {
  if (!isOpen || !expense) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      calendar: "gregory",
    });
  };

  const getSplitTypeLabel = (type) => {
    switch (type) {
      case "equal":
        return "تقسيم بالتساوي";
      case "specific":
        return "مستخدمين محددين";
      case "custom":
        return "تقسيم مخصص";
      default:
        return type;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: {
        bg: "var(--color-status-pending-bg)",
        color: "var(--color-status-pending)",
      },
      approved: {
        bg: "var(--color-status-paid-bg)",
        color: "var(--color-status-paid)",
      },
      rejected: {
        bg: "var(--color-status-rejected-bg)",
        color: "var(--color-status-rejected)",
      },
    };
    const style = styles[status] || styles.pending;
    const labels = {
      pending: "قيد الانتظار",
      approved: "موافق عليه",
      rejected: "مرفوض",
    };

    return (
      <span
        className="px-3 py-1 rounded-full text-sm font-medium"
        style={{ backgroundColor: style.bg, color: style.color }}
      >
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
        style={{ backgroundColor: "var(--color-surface)" }}
      >
        {/* Header */}
        <div
          className="p-6 border-b"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className="p-3 rounded-xl"
                style={getCategoryStyles(expense.category)}
              >
                {getCategoryIcon(expense.category)}
              </div>
              <div>
                <h2
                  className="text-xl font-bold"
                  style={{ color: "var(--color-dark)" }}
                >
                  تفاصيل المصروف
                </h2>
                <span
                  className="text-sm"
                  style={{ color: "var(--color-muted)" }}
                >
                  {translateCategory(expense.category)}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              style={{ color: "var(--color-muted)" }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Description */}
          <div className="flex items-start gap-3">
            <FileText size={20} style={{ color: "var(--color-primary)" }} />
            <div>
              <p
                className="text-sm mb-1"
                style={{ color: "var(--color-muted)" }}
              >
                الوصف
              </p>
              <p className="font-medium" style={{ color: "var(--color-dark)" }}>
                {expense.description}
              </p>
            </div>
          </div>

          {/* Amount */}
          <div className="flex items-start gap-3">
            <DollarSign size={20} style={{ color: "var(--color-success)" }} />
            <div>
              <p
                className="text-sm mb-1"
                style={{ color: "var(--color-muted)" }}
              >
                المبلغ الإجمالي
              </p>
              <p
                className="font-bold text-xl"
                style={{ color: "var(--color-dark)" }}
              >
                {expense.totalAmount.toFixed(2)}{" "}
                <span className="text-sm font-normal">جنيه</span>
              </p>
            </div>
          </div>

          {/* Date */}
          <div className="flex items-start gap-3">
            <Calendar size={20} style={{ color: "var(--color-info)" }} />
            <div>
              <p
                className="text-sm mb-1"
                style={{ color: "var(--color-muted)" }}
              >
                التاريخ
              </p>
              <p className="font-medium" style={{ color: "var(--color-dark)" }}>
                {formatDate(expense.date)}
              </p>
            </div>
          </div>

          {/* Created By */}
          <div className="flex items-start gap-3">
            <User size={20} style={{ color: "var(--color-warning)" }} />
            <div>
              <p
                className="text-sm mb-1"
                style={{ color: "var(--color-muted)" }}
              >
                أُنشئ بواسطة
              </p>
              <p className="font-medium" style={{ color: "var(--color-dark)" }}>
                {expense.createdBy?.name || "مستخدم محذوف"}
              </p>
            </div>
          </div>

          {/* Split Type */}
          <div className="flex items-start gap-3">
            <Tag size={20} style={{ color: "var(--color-secondary)" }} />
            <div>
              <p
                className="text-sm mb-1"
                style={{ color: "var(--color-muted)" }}
              >
                نوع التقسيم
              </p>
              <p className="font-medium" style={{ color: "var(--color-dark)" }}>
                {getSplitTypeLabel(expense.splitType)}
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-start gap-3">
            <div
              className="w-5 h-5 rounded-full"
              style={{ backgroundColor: "var(--color-light)" }}
            />
            <div>
              <p
                className="text-sm mb-1"
                style={{ color: "var(--color-muted)" }}
              >
                الحالة
              </p>
              {getStatusBadge(expense.status)}
            </div>
          </div>

          {/* Splits Section */}
          {expense.splits && expense.splits.length > 0 && (
            <div
              className="p-4 rounded-2xl"
              style={{ backgroundColor: "var(--color-light)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Users size={18} style={{ color: "var(--color-primary)" }} />
                <h3
                  className="font-semibold"
                  style={{ color: "var(--color-dark)" }}
                >
                  تفاصيل التقسيم ({expense.splits.length} أشخاص)
                </h3>
              </div>
              <div className="space-y-2">
                {expense.splits.map((split, index) => (
                  <div
                    key={split.user?._id || index}
                    className="flex items-center justify-between p-3 rounded-xl"
                    style={{ backgroundColor: "var(--color-surface)" }}
                  >
                    <span
                      className="font-medium"
                      style={{ color: "var(--color-secondary)" }}
                    >
                      {split.user?.name || "مستخدم محذوف"}
                    </span>
                    <span
                      className="font-bold"
                      style={{ color: "var(--color-primary)" }}
                    >
                      {split.amount.toFixed(2)} جنيه
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="p-4 border-t"
          style={{ borderColor: "var(--color-border)" }}
        >
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl font-medium transition-colors"
            style={{
              backgroundColor: "var(--color-light)",
              color: "var(--color-secondary)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--color-border)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--color-light)";
            }}
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
