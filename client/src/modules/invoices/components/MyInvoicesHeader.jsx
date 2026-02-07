import { Clock, Plus, CheckCircle2 } from "lucide-react";

export default function MyInvoicesHeader({
  activeTab,
  pendingInvoicesCount,
  pendingInvoicesTotal,
  onBulkPay,
  onCreateRequest,
  totalPending,
}) {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-(--color-dark) relative inline-block">
          {activeTab === "invoices" ? "فواتيري" : "طلباتي"}
        </h1>
        <p className="text-(--color-secondary) mt-1">
          {activeTab === "invoices"
            ? "إدارة المصاريف المستحقة عليك"
            : "متابعة المصاريف التي قمت بإنشائها"}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {activeTab === "invoices" && pendingInvoicesCount > 0 && (
          <button
            onClick={onBulkPay}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-all font-medium shadow-sm hover:shadow-md"
          >
            <CheckCircle2 size={20} />
            <span className="hidden sm:inline">
              دفع الكل ({pendingInvoicesTotal.toLocaleString()} ج.م)
            </span>
            <span className="sm:hidden">دفع الكل</span>
          </button>
        )}

        <button
          onClick={onCreateRequest}
          className="flex items-center gap-2 bg-(--color-primary) text-white px-4 py-2 rounded-xl hover:brightness-90 transition-all font-medium shadow-sm hover:shadow-md"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">طلب جديد</span>
        </button>

        {activeTab === "invoices" && (
          <div className="bg-(--color-surface) px-4 py-2 rounded-xl shadow-sm border border-(--color-border) flex items-center gap-3">
            <div className="bg-(--color-status-pending-bg) p-2 rounded-full text-(--color-status-pending)">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs text-(--color-secondary) uppercase font-semibold">
                المبلغ المستحق
              </p>
              <p className="text-xl font-bold text-(--color-dark)">
                {totalPending.toFixed(2)} جنيه
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
