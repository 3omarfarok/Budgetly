import { CheckCircle, Trash2 } from "lucide-react";

export default function BulkActions({ count, onApprove, onDelete }) {
  if (count === 0) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-[var(--color-dark)] text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-4 z-50 animate-bounce-in"
      style={{ maxWidth: "90%" }}
    >
      <span className="font-bold text-lg">{count} محدد</span>
      <div className="h-6 w-[1px] bg-gray-600"></div>
      <button
        onClick={onApprove}
        className="flex items-center gap-2 hover:text-[var(--color-success)] transition-colors"
      >
        <CheckCircle size={20} />
        <span className="hidden sm:inline">موافقة</span>
      </button>
      <button
        onClick={onDelete}
        className="flex items-center gap-2 hover:text-[var(--color-error)] transition-colors"
      >
        <Trash2 size={20} />
        <span className="hidden sm:inline">حذف</span>
      </button>
    </div>
  );
}
