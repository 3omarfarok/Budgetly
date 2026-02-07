import { format } from "date-fns";
import { CreditCard, CheckCircle, Clock } from "lucide-react";

export default function InvoiceCard({ invoice, onPay }) {
  const statusColors = {
    pending:
      "bg-(--color-status-pending-bg) text-(--color-status-pending) border-(--color-status-pending-border)",
    awaiting_approval:
      "bg-(--color-primary-bg) text-(--color-info) border-(--color-primary-border)",
    paid: "bg-(--color-status-approved-bg) text-(--color-status-approved) border-(--color-status-approved-border)",
  };

  const statusLabels = {
    pending: "مطلوب سداده",
    awaiting_approval: "في انتظار الموافقة",
    paid: "تم الدفع",
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
          <h3 className="font-semibold text-(--color-dark)">{invoice.description}</h3>
          <p className="text-sm text-(--color-secondary)">
            {categoryTranslations[invoice.expense?.category] || "عام"} • {format(new Date(invoice.createdAt), "MMM d, yyyy")}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium border ${
            statusColors[invoice.status]
          }`}
        >
          {statusLabels[invoice.status]}
        </span>
      </div>

      <div className="flex justify-between items-center mt-4">
        <span className="text-2xl font-bold text-(--color-dark) relative inline-block pl-1">
          {invoice.amount.toFixed(2)}{" "}
          <span className="text-xs absolute top-2 -left-6 text-(--color-secondary)">جنيه</span>
        </span>
        {invoice.status === "pending" && (
          <button
            onClick={() => onPay(invoice._id)}
            className="flex items-center gap-2 px-4 py-2 bg-(--color-primary) text-white rounded-lg hover:brightness-90 transition-all shadow-sm active:scale-95"
          >
            <CreditCard size={18} />
            ادفع الآن
          </button>
        )}
        {invoice.status === "awaiting_approval" && (
          <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
            <Clock size={18} />
            جاري المعالجة
          </div>
        )}
        {invoice.status === "paid" && (
          <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
            <CheckCircle size={18} />
            تم الدفع
          </div>
        )}
      </div>
    </div>
  );
}
