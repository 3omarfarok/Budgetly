import { format } from "date-fns";
import { Check, X } from "lucide-react";
import StatusBadge from "./StatusBadge";

export default function MobileInvoiceCard({
  invoice,
  onApprove,
  onReject,
  showUser,
}) {
  return (
    <div className="p-4 bg-(--color-surface) border border-(--color-border) rounded-xl shadow-sm space-y-3">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          {showUser && (
            <div className="w-10 h-10 rounded-full bg-(--color-primary-bg) text-(--color-primary) flex items-center justify-center text-sm font-bold">
              {invoice.user?.name?.charAt(0) || "?"}
            </div>
          )}
          <div>
            {showUser && (
              <h4 className="font-bold text-(--color-dark)">{invoice.user?.name}</h4>
            )}
            <p className="text-sm text-(--color-secondary)">
              {format(new Date(invoice.createdAt), "MMM d, yyyy")}
            </p>
          </div>
        </div>
        <StatusBadge status={invoice.status} />
      </div>

      <div>
        <p className="font-medium text-(--color-dark) line-clamp-2">{invoice.description}</p>
        <p className="text-xl font-bold text-(--color-primary) mt-1">
          {Number(invoice.amount).toFixed(2)} جنيه
        </p>
      </div>

      {invoice.status === "awaiting_approval" && (
        <div className="flex gap-2 pt-2 border-t border-(--color-border)">
          <button
            onClick={() => onApprove(invoice._id)}
            className="flex-1 py-2 bg-(--color-status-approved-bg) text-(--color-status-approved) rounded-lg hover:opacity-80 text-sm font-bold transition-colors flex items-center justify-center gap-2"
          >
            <Check size={16} /> موافقة
          </button>
          <button
            onClick={() => onReject(invoice._id)}
            className="flex-1 py-2 bg-(--color-status-rejected-bg) text-(--color-status-rejected) rounded-lg hover:opacity-80 text-sm font-bold transition-colors flex items-center justify-center gap-2"
          >
            <X size={16} /> رفض
          </button>
        </div>
      )}
    </div>
  );
}
