import { useNavigate } from "react-router-dom";
import { CheckSquare, Square, PlusCircle } from "lucide-react";
import ConfirmModal from "../components/ConfirmModal";
import usePayments from "../hooks/usePayments";
import PaymentFilters from "../components/payments/PaymentFilters";
import PaymentsList from "../components/payments/PaymentsList";
import BulkActions from "../components/payments/BulkActions";
import Pagination from "../components/Pagination";
import { useAuth } from "../context/AuthContext";

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

  return (
    <div className="pb-24 px-4 max-w-5xl mx-auto font-primary relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pt-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-(--color-dark)">المدفوعات</h1>
          <p className="text-sm mt-1 text-(--color-secondary)">
            إدارة وتتبع كل المعاملات المالية
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          {user.role === "admin" && (
            <>
              {/* Select Mode Toggle */}
              <button
                onClick={() => setIsSelectionMode(!isSelectionMode)}
                className={`px-4 py-2.5 font-semibold rounded-2xl transition-all shadow-lg flex items-center gap-2 ${
                  isSelectionMode
                    ? "bg-(--color-secondary) text-white"
                    : "bg-(--color-surface) text-(--color-dark) border border-(--color-border)"
                }`}
              >
                <CheckSquare size={18} />
                <span className="hidden sm:inline">
                  {isSelectionMode ? "إلغاء" : "تحديد"}
                </span>
              </button>

              {/* Select All Button */}
              {isSelectionMode && (
                <button
                  onClick={toggleSelectAll}
                  className="px-4 py-2.5 font-semibold rounded-2xl transition-all shadow-lg flex items-center gap-2 bg-(--color-surface) text-(--color-primary) border border-(--color-primary)"
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
                className="px-4 py-2.5 text-white font-semibold rounded-2xl transition-all shadow-lg flex items-center gap-2 justify-center bg-(--color-primary)"
              >
                <PlusCircle size={18} />
                <span className="hidden sm:inline">سجّل دفعة</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <PaymentFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterDate={filterDate}
        setFilterDate={setFilterDate}
      />

      {/* List */}
      <PaymentsList
        loading={loading}
        payments={paginatedPayments}
        selectedPayments={selectedPayments}
        isSelectionMode={isSelectionMode}
        toggleSelect={toggleSelect}
        isAdmin={user.role === "admin"}
        handleApprove={handleApprove}
        handleReject={handleReject}
        handleDeleteClick={handleDeleteClick}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        loading={loading}
      />

      {/* Bulk Actions */}
      <BulkActions
        count={selectedPayments.length}
        onApprove={handleBulkApprove}
        onDelete={handleBulkDeleteClick}
      />

      {/* Confirm Modal */}
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
