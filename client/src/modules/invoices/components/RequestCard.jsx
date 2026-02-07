import { format } from "date-fns";
import { Trash2 } from "lucide-react";

export default function RequestCard({ request, onDelete }) {
  const statusColors = {
    pending:
      "bg-(--color-status-pending-bg) text-(--color-status-pending) border-(--color-status-pending-border)",
    approved:
      "bg-(--color-status-approved-bg) text-(--color-status-approved) border-(--color-status-approved-border)",
    rejected:
      "bg-(--color-status-rejected-bg) text-(--color-status-rejected) border-(--color-status-rejected-border)",
  };

  const statusLabels = {
    pending: "قيد المراجعة",
    approved: "تمت الموافقة",
    rejected: "مرفوض",
  };

  const categoryTranslations = {
    General: "عام",
    Food: "أكل وشرب",
    Transport: "مواصلات",
    Utilities: "فواتير",
    Entertainment: "ترفيه",
    CashOut: "سحب كاش",
    Housing: "سكن",
    Other: "حاجات تانية",
  };

  return (
    <div className="bg-(--color-surface) rounded-xl shadow-sm border border-(--color-border) p-4 transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-(--color-dark)">{request.description}</h3>
          <p className="text-sm text-(--color-secondary)">
            {categoryTranslations[request.category] || "عام"} • {format(new Date(request.createdAt), "MMM d, yyyy")}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium border ${
            statusColors[request.status]
          }`}
        >
          {statusLabels[request.status] || request.status}
        </span>
      </div>

      <div className="flex justify-between items-center mt-4">
        <span className="text-2xl font-bold text-(--color-dark) relative inline-block pl-1">
          {request.totalAmount.toFixed(2)}{" "}
          <span className="text-xs absolute top-0 -left-6 text-(--color-secondary)">جنيه</span>
        </span>
        <div className="flex items-center gap-2">
          {request.status === "pending" && (
            <button
              onClick={() => onDelete(request._id)}
              className="flex items-center gap-2 px-3 py-2 bg-(--color-status-rejected-bg) text-(--color-status-rejected) border border-(--color-status-rejected-border) rounded-lg hover:brightness-95 transition-all text-sm font-medium active:scale-95"
              title="حذف الطلب"
            >
              <Trash2 size={16} />
              حذف
            </button>
          )}
          {request.status === "rejected" && request.adminNotes && (
            <div className="text-xs text-(--color-status-rejected)">
              سبب الرفض: {request.adminNotes}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
