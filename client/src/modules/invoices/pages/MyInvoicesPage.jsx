import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ConfirmModal } from "../../../shared/components";
import { useMyInvoices } from "../hooks";
import {
  InvoiceCard,
  RequestCard,
  MyInvoicesHeader,
  MyInvoicesFilters,
  MyInvoicesPagination,
} from "../components";

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
    // Bulk Payment
    isBulkPayModalOpen,
    setIsBulkPayModalOpen,
    handleBulkPay,
    confirmBulkPayment,
    isBulkPaying,
    // Delete Request
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    handleDeleteRequest,
    confirmDeleteRequest,
    isDeleting,
  } = useMyInvoices();

  // Calculate pending invoices count and total for bulk payment
  const pendingInvoicesCount = filteredData
    ? filteredData.filter((item) => item.status === "pending").length
    : 0;

  const pendingInvoicesTotal = filteredData
    ? filteredData
        .filter((item) => item.status === "pending")
        .reduce((sum, item) => sum + (item.amount || 0), 0)
    : 0;

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Calculate paginated data
  const totalPages = Math.ceil((filteredData?.length || 0) / itemsPerPage);
  const paginatedData = filteredData
    ? filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
      )
    : [];

  // Reset to page 1 when tab or filter changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6" dir="rtl">
      <MyInvoicesHeader
        activeTab={activeTab}
        pendingInvoicesCount={pendingInvoicesCount}
        pendingInvoicesTotal={pendingInvoicesTotal}
        onBulkPay={handleBulkPay}
        onCreateRequest={() => navigate("/add-expense")}
        totalPending={totalPending}
      />

      <MyInvoicesFilters
        activeTab={activeTab}
        onTabChange={handleTabChange}
        filterStatus={filterStatus}
        onFilterChange={handleFilterChange}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

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
          {paginatedData.map((item) =>
            activeTab === "invoices" ? (
              <InvoiceCard key={item._id} invoice={item} onPay={handlePay} />
            ) : (
              <RequestCard
                key={item._id}
                request={item}
                onDelete={handleDeleteRequest}
              />
            ),
          )}
        </div>
      )}

      <MyInvoicesPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onPrevious={() => setCurrentPage((p) => Math.max(1, p - 1))}
        onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
      />
      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmPayment}
        title="تأكيد الدفع"
        message="هل أنت متأكد من دفع هذه الفاتورة؟ سيتم إرسال إشعار للمسؤول للموافقة."
        confirmText={isPaying ? "جاري الدفع..." : "تأكيد الدفع"}
        cancelText="إلغاء"
        isLoading={isPaying}
      />

      <ConfirmModal
        isOpen={isBulkPayModalOpen}
        onClose={() => setIsBulkPayModalOpen(false)}
        onConfirm={confirmBulkPayment}
        title={`دفع الكل (${pendingInvoicesCount} فواتير)`}
        message={`هل أنت متأكد من دفع جميع الفواتير المعلقة بإجمالي ${pendingInvoicesTotal.toLocaleString()} ج.م؟ سيتم إرسال طلبات دفع للمسؤول.`}
        confirmText={isBulkPaying ? "جاري الدفع..." : "تأكيد الدفع للكل"}
        cancelText="إلغاء"
        isLoading={isBulkPaying}
        type="primary"
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteRequest}
        title="حذف الطلب"
        message="هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText={isDeleting ? "جاري الحذف..." : "تأكيد الحذف"}
        cancelText="إلغاء"
        isLoading={isDeleting}
        type="danger"
      />
    </div>
  );
}
