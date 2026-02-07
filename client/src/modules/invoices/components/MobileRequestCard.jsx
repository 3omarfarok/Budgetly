import { format } from "date-fns";

export default function MobileRequestCard({
  request,
  onOpenDetails,
  onApprove,
  onReject,
}) {
  return (
    <div className="p-4 bg-(--color-surface) border border-(--color-border) rounded-xl shadow-sm space-y-3">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-(--color-primary-bg) text-(--color-primary) flex items-center justify-center text-sm font-bold">
            {request.createdBy?.name?.charAt(0) || "?"}
          </div>
          <div>
            <h4 className="font-bold text-(--color-dark)">{request.createdBy?.name}</h4>
            <p className="text-sm text-(--color-secondary)">
              {format(new Date(request.createdAt), "MMM d, yyyy")}
            </p>
          </div>
        </div>
        <span className="px-2 py-1 bg-(--color-status-pending-bg) text-(--color-status-pending) rounded-full text-xs font-bold">
          معلق
        </span>
      </div>

      <div>
        <p className="font-medium text-(--color-dark) line-clamp-2">{request.description}</p>
        <p className="text-xl font-bold text-(--color-primary) mt-1">{request.totalAmount} جنيه</p>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-(--color-border)">
        <button
          onClick={() => onOpenDetails(request)}
          className="col-span-2 py-2 bg-(--color-bg) text-(--color-secondary) border border-(--color-border) rounded-lg hover:bg-(--color-hover) text-sm font-bold transition-colors"
        >
          عرض التفاصيل
        </button>
        <button
          onClick={() => onApprove(request._id)}
          className="py-2 bg-(--color-status-approved-bg) text-(--color-status-approved) rounded-lg hover:opacity-80 text-sm font-bold transition-colors"
        >
          موافقة
        </button>
        <button
          onClick={() => onReject(request._id)}
          className="py-2 bg-(--color-status-rejected-bg) text-(--color-status-rejected) rounded-lg hover:opacity-80 text-sm font-bold transition-colors"
        >
          رفض
        </button>
      </div>
    </div>
  );
}
