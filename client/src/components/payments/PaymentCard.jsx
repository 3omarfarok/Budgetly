import {
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  CheckSquare,
  Square,
  Trash2,
} from "lucide-react";

export default function PaymentCard({
  payment,
  isSelectionMode,
  isSelected,
  toggleSelect,
  isAdmin,
  handleApprove,
  handleReject,
  handleDeleteClick,
}) {
  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        color: {
          backgroundColor: "var(--color-status-pending-bg)",
          color: "var(--color-status-pending)",
          border: "1px solid var(--color-status-pending-border)",
        },
        icon: Clock,
        text: "مستني",
      },
      approved: {
        color: {
          backgroundColor: "var(--color-status-approved-bg)",
          color: "var(--color-status-approved)",
          border: "1px solid var(--color-status-approved-border)",
        },
        icon: CheckCircle,
        text: "موافق عليه",
      },
      rejected: {
        color: {
          backgroundColor: "var(--color-status-rejected-bg)",
          color: "var(--color-status-rejected)",
          border: "1px solid var(--color-status-rejected-border)",
        },
        icon: XCircle,
        text: "مرفوض",
      },
    };
    return badges[status] || badges.pending;
  };

  const statusBadge = getStatusBadge(payment.status);
  const StatusIcon = statusBadge.icon;

  return (
    <div
      onClick={() => (isSelectionMode ? toggleSelect(payment._id) : null)}
      className={`group rounded-2xl p-5 shadow-sm transition-all duration-200 hover:shadow-md relative h-full flex flex-col ${
        isSelectionMode ? "cursor-pointer" : ""
      } ${
        isSelected
          ? "ring-2 ring-(--color-primary) bg-(--color-primary-light)"
          : ""
      }`}
      style={{
        backgroundColor: isSelected
          ? "color-mix(in srgb, var(--color-primary) 5%, var(--color-surface))"
          : "var(--color-surface)",
        border: isSelected
          ? "1px solid var(--color-primary)"
          : "1px solid var(--color-border)",
      }}
    >
      {/* Selection Checkbox */}
      {isSelectionMode && (
        <div className="absolute top-4 right-4 z-10">
          {isSelected ? (
            <CheckSquare size={24} style={{ color: "var(--color-primary)" }} />
          ) : (
            <Square size={24} style={{ color: "var(--color-border)" }} />
          )}
        </div>
      )}

      {/* Delete Button for Admin (Only if NOT in selection mode) */}
      {isAdmin && !isSelectionMode && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteClick(payment._id);
          }}
          className="absolute top-4 left-4 p-2 rounded-xl transition-all"
          style={{
            color: "var(--color-error)",
          }}
          title="حذف"
        >
          <Trash2 size={16} />
        </button>
      )}

      <div className="flex justify-between items-start mb-3">
        {/* بادج الحالة */}
        <div
          className="px-3 py-1.5 rounded-xl flex items-center gap-1.5"
          style={statusBadge.color}
        >
          <StatusIcon size={14} />
          <span className="text-xs font-semibold">{statusBadge.text}</span>
        </div>

        {/* المبلغ */}
        <div className="text-right mt-8">
          <div className="flex items-center gap-1.5 justify-end mb-1">
            {payment.transactionType === "received" ? (
              <ArrowDownCircle
                size={16}
                style={{ color: "var(--color-success)" }}
              />
            ) : (
              <ArrowUpCircle
                size={16}
                style={{ color: "var(--color-error)" }}
              />
            )}
            <span
              className="text-xs font-semibold"
              style={{
                color:
                  payment.transactionType === "received"
                    ? "var(--color-success)"
                    : "var(--color-error)",
              }}
            >
              {payment.transactionType === "received" ? "استلام" : "دفع"}
            </span>
          </div>
          <span
            className="block text-xl font-bold"
            style={{
              color:
                payment.transactionType === "received"
                  ? "var(--color-success)"
                  : "var(--color-dark)",
            }}
          >
            {payment.transactionType === "received" ? "+" : "-"}
            {payment.amount?.toFixed(2) || "0.00"}
            <span
              className="text-xs font-normal mr-1"
              style={{ color: "var(--color-secondary)" }}
            >
              جنيه
            </span>
          </span>
        </div>
      </div>

      {/* اسم الدافع */}
      <h3
        className="font-semibold mb-2 mt-2"
        style={{ color: "var(--color-dark)" }}
      >
        {payment.user?.name || payment.paidBy?.name || "مستخدم"}
      </h3>

      {payment.description && (
        <p
          className="mb-4 text-sm wrap-words line-clamp-2"
          style={{ color: "var(--color-secondary)" }}
          title={payment.description}
        >
          {payment.description}
        </p>
      )}

      {/* المعلومات */}
      <div
        className="flex items-center justify-between pt-4 mt-auto"
        style={{ borderTop: "1px solid var(--color-border)" }}
      >
        <div
          className="flex flex-col gap-1 text-xs"
          style={{ color: "var(--color-secondary)" }}
        >
          <div className="flex items-center gap-1.5">
            <Calendar size={12} />
            <span>
              {new Date(payment.date || payment.createdAt).toLocaleDateString(
                "ar-EG",
                {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  calendar: "gregory",
                }
              )}
            </span>
          </div>
          {payment.recordedBy && (
            <div className="flex items-center gap-1.5">
              <User size={12} />
              <span>سجله: {payment.recordedBy?.name || "أدمن"}</span>
            </div>
          )}
        </div>

        {/* أزرار الموافقة/الرفض */}
        {isAdmin && payment.status === "pending" && !isSelectionMode && (
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleApprove(payment._id);
              }}
              className="p-2 rounded-lg transition-colors hover:bg-green-50 dark:hover:bg-green-900/20"
              style={{ color: "var(--color-success)" }}
              title="وافق"
            >
              <CheckCircle size={18} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleReject(payment._id);
              }}
              className="p-2 rounded-lg transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
              style={{ color: "var(--color-error)" }}
              title="ارفض"
            >
              <XCircle size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
