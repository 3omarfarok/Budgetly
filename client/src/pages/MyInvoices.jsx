import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Search,
  CreditCard,
  CheckCircle,
  Clock,
  Plus,
  ArrowUpDown,
} from "lucide-react";
import ConfirmModal from "../components/ConfirmModal";
import { useMyInvoices } from "../hooks/useMyInvoices";

// Invoice Card Component
const InvoiceCard = ({ invoice, onPay }) => {
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
          <h3 className="font-semibold text-(--color-dark)">
            {invoice.description}
          </h3>
          <p className="text-sm text-(--color-secondary)">
            {categoryTranslations[invoice.expense?.category] || "عام"} •{" "}
            {format(new Date(invoice.createdAt), "MMM d, yyyy")}
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
          <span className="text-xs absolute top-2 -left-6 text-(--color-secondary)">
            جنيه
          </span>
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
};

// Request Card Component
const RequestCard = ({ request }) => {
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
          <h3 className="font-semibold text-(--color-dark)">
            {request.description}
          </h3>
          <p className="text-sm text-(--color-secondary)">
            {categoryTranslations[request.category] || "عام"} •{" "}
            {format(new Date(request.createdAt), "MMM d, yyyy")}
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
          <span className="text-xs absolute top-0 -left-6 text-(--color-secondary)">
            جنيه
          </span>
        </span>
        {/* Actions or Status Details */}
        {request.status === "rejected" && request.adminNotes && (
          <div className="text-xs text-red-500 mt-2">
            سبب الرفض: {request.adminNotes}
          </div>
        )}
      </div>
    </div>
  );
};

export default function MyInvoices() {
  const navigate = useNavigate();

  const {
    activeTab,
    setActiveTab,
    loading,
    filterStatus,
    setFilterStatus,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    filteredData,
    totalPending,
    isConfirmModalOpen,
    setIsConfirmModalOpen,
    handlePay,
    confirmPayment,
    isPaying,
  } = useMyInvoices();

  const statusFilterLabels =
    activeTab === "invoices"
      ? {
          all: "الكل",
          pending: "مطلوب سداده",
          awaiting_approval: "في انتظار الموافقة",
          paid: "تم الدفع",
        }
      : {
          all: "الكل",
          pending: "قيد المراجعة",
          approved: "تمت الموافقة",
          rejected: "مرفوض",
        };

  const filterOptions =
    activeTab === "invoices"
      ? ["all", "pending", "awaiting_approval", "paid"]
      : ["all", "pending", "approved", "rejected"];

  return (
    <div className="space-y-6" dir="rtl">
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
          <button
            onClick={() => navigate("/add-expense")}
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

      {/* Tabs */}
      <div className="flex bg-(--color-surface) p-1 rounded-xl border border-(--color-border) w-fit">
        <button
          onClick={() => setActiveTab("invoices")}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === "invoices"
              ? "bg-(--color-primary) text-white shadow-sm"
              : "text-(--color-secondary) hover:bg-(--color-hover)"
          }`}
        >
          فواتيري
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === "requests"
              ? "bg-(--color-primary) text-white shadow-sm"
              : "text-(--color-secondary) hover:bg-(--color-hover)"
          }`}
        >
          طلباتي
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-(--color-surface) p-4 rounded-xl shadow-sm border border-(--color-border)">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={
              activeTab === "invoices"
                ? "ابحث في الفواتير..."
                : "ابحث في الطلبات..."
            }
            className="w-full pr-10 pl-4 py-2 bg-(--color-bg) border border-(--color-border) rounded-lg focus:ring-2 focus:ring-(--color-primary) focus:border-transparent outline-none transition-all text-(--color-dark)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none pl-8 pr-4 py-2 bg-(--color-bg) border border-(--color-border) rounded-lg focus:ring-2 focus:ring-(--color-primary) focus:border-transparent outline-none transition-all text-(--color-dark) cursor-pointer min-w-[160px]"
          >
            <option value="date_desc">الأحدث أولاً</option>
            <option value="date_asc">الأقدم أولاً</option>
            <option value="amount_desc">المبلغ: الأعلى</option>
            <option value="amount_asc">المبلغ: الأقل</option>
            <option value="status">الحالة</option>
          </select>
          <ArrowUpDown
            className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            size={16}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {filterOptions.map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filterStatus === status
                  ? "bg-(--color-primary) text-white"
                  : "bg-(--color-bg) text-(--color-secondary) hover:bg-(--color-hover)"
              }`}
            >
              {statusFilterLabels[status]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-(--color-primary)"></div>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="text-center py-12 bg-(--color-bg) rounded-xl border-2 border-dashed border-(--color-border)">
          <p className="text-(--color-secondary)">
            {activeTab === "invoices"
              ? "لا توجد فواتير تطابق بحثك."
              : "لا توجد طلبات تطابق بحثك."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map((item) =>
            activeTab === "invoices" ? (
              <InvoiceCard key={item._id} invoice={item} onPay={handlePay} />
            ) : (
              <RequestCard key={item._id} request={item} />
            )
          )}
        </div>
      )}
      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmPayment}
        title="تأكيد الدفع"
        message="هل أنت متأكد أنك تريد دفع هذه الفاتورة؟ سيتم إرسال طلب للموافقة."
        type="info"
        loading={isPaying}
      />
    </div>
  );
}
