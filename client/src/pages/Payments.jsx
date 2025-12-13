import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Banknote,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  PlusCircle,
  ArrowUpCircle,
  ArrowDownCircle,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
} from "lucide-react";

import Loader from "../components/Loader";
import Input from "../components/Input";
import ConfirmModal from "../components/ConfirmModal";
import usePayments from "../hooks/usePayments";

const Payments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    loading,
    paginatedPayments,
    totalPages,
    currentPage,
    setCurrentPage,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    filterStatus,
    setFilterStatus,
    filterDate,
    setFilterDate,
    selectedPayments,
    isSelectionMode,
    setIsSelectionMode,
    toggleSelect,
    toggleSelectAll,
    handleDeleteClick,
    handleBulkDeleteClick,
    handleBulkApprove,
    handleApprove,
    handleReject,
    showDeleteModal,
    setShowDeleteModal,
    deletingPaymentId,
    setDeletingPaymentId,
    confirmDelete,
  } = usePayments();

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

  if (loading) return <Loader text="بنحمّل المدفوعات..." />;

  return (
    <div className="pb-24 px-4 max-w-5xl mx-auto font-primary relative">
      {/* الهيدر */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pt-4 gap-4">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--color-dark)" }}
          >
            المدفوعات
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--color-secondary)" }}
          >
            إدارة وتتبع كل المعاملات المالية
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          {user.role === "admin" && (
            <>
              {/* Select Mode Toggle */}
              <button
                onClick={() => {
                  setIsSelectionMode(!isSelectionMode);
                }}
                className={`px-4 py-2.5 font-semibold rounded-2xl transition-all shadow-lg flex items-center gap-2 ${
                  isSelectionMode
                    ? "bg-[var(--color-secondary)] text-white"
                    : "bg-[var(--color-surface)] text-[var(--color-dark)] border border-[var(--color-border)]"
                }`}
              >
                <CheckSquare size={18} />
                <span className="hidden sm:inline">
                  {isSelectionMode ? "إلغاء" : "تحديد"}
                </span>
              </button>

              {/* Select All Button (Visible in Selection Mode) */}
              {isSelectionMode && (
                <button
                  onClick={toggleSelectAll}
                  className="px-4 py-2.5 font-semibold rounded-2xl transition-all shadow-lg flex items-center gap-2 bg-[var(--color-surface)] text-[var(--color-primary)] border border-[var(--color-primary)]"
                >
                  {selectedPayments.length === paginatedPayments.length &&
                  paginatedPayments.length > 0 ? (
                    <CheckSquare size={18} />
                  ) : (
                    <Square size={18} />
                  )}
                  <span className="hidden sm:inline">تحديد الكل</span>
                </button>
              )}

              <button
                onClick={() => navigate("/add-payment")}
                className="px-4 py-2.5 text-white font-semibold rounded-2xl transition-all shadow-lg flex items-center gap-2 justify-center"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                <PlusCircle size={18} />
                <span className="hidden sm:inline">سجّل دفعة</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filters Section */}
      <div
        className="p-4 rounded-3xl shadow-sm mb-6 space-y-4"
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder="ابحث بالاسم أو الوصف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <select
              className="p-3 rounded-xl outline-none transition-all cursor-pointer font-medium text-sm appearance-none"
              style={{
                backgroundColor: "var(--color-bg)",
                border: "1px solid var(--color-border)",
                color: "var(--color-dark)",
              }}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">كل العمليات</option>
              <option value="payment">مدفوعات (Paid)</option>
              <option value="received">مستلمات (Received)</option>
            </select>

            <select
              className="p-3 rounded-xl outline-none transition-all cursor-pointer font-medium text-sm appearance-none"
              style={{
                backgroundColor: "var(--color-bg)",
                border: "1px solid var(--color-border)",
                color: "var(--color-dark)",
              }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">كل الحالات</option>
              <option value="pending">مستني (Pending)</option>
              <option value="approved">موافق (Approved)</option>
              <option value="rejected">مرفوض (Rejected)</option>
            </select>

            <input
              type="date"
              className="p-3 rounded-xl outline-none transition-all cursor-pointer font-medium text-sm col-span-2 md:col-span-1"
              style={{
                backgroundColor: "var(--color-bg)",
                border: "1px solid var(--color-border)",
                color: "var(--color-dark)",
              }}
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* عرض البطاقات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {!loading &&
          paginatedPayments.map((payment) => {
            const statusBadge = getStatusBadge(payment.status);
            const StatusIcon = statusBadge.icon;
            const isSelected = selectedPayments.includes(payment._id);

            return (
              <div
                key={payment._id}
                onClick={() =>
                  isSelectionMode ? toggleSelect(payment._id) : null
                }
                className={`group rounded-2xl p-5 shadow-sm transition-all duration-200 hover:shadow-md relative ${
                  isSelectionMode ? "cursor-pointer" : ""
                } ${
                  isSelected
                    ? "ring-2 ring-[var(--color-primary)] bg-[var(--color-primary-light)]"
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
                      <CheckSquare
                        size={24}
                        style={{ color: "var(--color-primary)" }}
                      />
                    ) : (
                      <Square
                        size={24}
                        style={{ color: "var(--color-border)" }}
                      />
                    )}
                  </div>
                )}

                {/* Delete Button for Admin (Only if NOT in selection mode) */}
                {user.role === "admin" && !isSelectionMode && (
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
                    <span className="text-xs font-semibold">
                      {statusBadge.text}
                    </span>
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
                        {payment.transactionType === "received"
                          ? "استلام"
                          : "دفع"}
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
                    className="mb-4 text-sm break-words"
                    style={{ color: "var(--color-secondary)" }}
                  >
                    {payment.description}
                  </p>
                )}

                {/* المعلومات */}
                <div
                  className="flex items-center justify-between pt-4"
                  style={{ borderTop: "1px solid var(--color-border)" }}
                >
                  <div
                    className="flex flex-col gap-1 text-xs"
                    style={{ color: "var(--color-secondary)" }}
                  >
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      <span>
                        {new Date(
                          payment.date || payment.createdAt
                        ).toLocaleDateString("ar-EG", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          calendar: "gregory",
                        })}
                      </span>
                    </div>
                    {payment.recordedBy && (
                      <div className="flex items-center gap-1.5">
                        <User size={12} />
                        <span>سجله: {payment.recordedBy?.name || "أدمن"}</span>
                      </div>
                    )}
                  </div>

                  {/* أزرار الموافقة/الرفض (للأدمن بس / PENDING) - Hidden in selection mode */}
                  {user.role === "admin" &&
                    payment.status === "pending" &&
                    !isSelectionMode && (
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApprove(payment._id);
                          }}
                          className="p-2 rounded-lg transition-colors"
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
                          className="p-2 rounded-lg transition-colors"
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
          })}
      </div>

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`p-2 rounded-xl transition-all ${
              currentPage === 1
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-[--color-bg]"
            }`}
            style={{ border: "1px solid var(--color-border)" }}
          >
            <ChevronRight size={20} />
          </button>
          <span
            className="font-bold text-sm"
            style={{ color: "var(--color-dark)" }}
          >
            صفحة {currentPage} من {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-xl transition-all ${
              currentPage === totalPages
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-[--color-bg]"
            }`}
            style={{ border: "1px solid var(--color-border)" }}
          >
            <ChevronLeft size={20} />
          </button>
        </div>
      )}

      {/* Bulk Actions Floating Bar */}
      {selectedPayments.length > 0 && (
        <div
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-[var(--color-dark)] text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-4 z-50 animate-bounce-in"
          style={{ maxWidth: "90%" }}
        >
          <span className="font-bold text-lg">
            {selectedPayments.length} محدد
          </span>
          <div className="h-6 w-[1px] bg-gray-600"></div>
          <button
            onClick={handleBulkApprove}
            className="flex items-center gap-2 hover:text-[var(--color-success)] transition-colors"
          >
            <CheckCircle size={20} />
            <span className="hidden sm:inline">موافقة</span>
          </button>
          <button
            onClick={handleBulkDeleteClick}
            className="flex items-center gap-2 hover:text-[var(--color-error)] transition-colors"
          >
            <Trash2 size={20} />
            <span className="hidden sm:inline">حذف</span>
          </button>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingPaymentId(null);
        }}
        onConfirm={confirmDelete}
        title={deletingPaymentId === "bulk" ? "حذف جماعي" : "حذف الدفعة"}
        message={
          deletingPaymentId === "bulk"
            ? `متأكد إنك عايز تمسح ${selectedPayments.length} عنصر؟`
            : "متأكد إنك عايز تمسح الدفعة دي نهائياً؟"
        }
        type="danger"
      />
    </div>
  );
};

export default Payments;
