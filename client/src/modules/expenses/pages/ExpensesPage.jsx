import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { ConfirmModal } from "../../../shared/components";
import { useExpenses } from "../hooks";
import {
  ExpenseDetailsModal,
  ExpensesFiltersPanel,
  ExpensesHeader,
  ExpensesList,
  ExpensesPagination,
  ExpensesResultsSummary,
} from "../components";

const Expenses = () => {
  const { user } = useAuth();
  const {
    expenses,
    loading,
    page,
    setPage,
    totalPages,
    deleteExpense,
    users,
    selectedUserId,
    setSelectedUserId,
    minAmount,
    setMinAmount,
    maxAmount,
    setMaxAmount,
    clearFilters,
    hasActiveFilters,
  } = useExpenses();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingExpenseId, setDeletingExpenseId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleDeleteClick = (id) => {
    setDeletingExpenseId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    const success = await deleteExpense(deletingExpenseId);
    if (success) {
      setShowDeleteModal(false);
      setDeletingExpenseId(null);
    }
  };

  const handleViewDetails = (expense) => {
    setSelectedExpense(expense);
    setShowDetailsModal(true);
  };

  return (
    <div className="pb-8 px-4 max-w-6xl mx-auto font-primary">
      <ExpensesHeader
        showFilters={showFilters}
        hasActiveFilters={hasActiveFilters}
        onToggleFilters={() => setShowFilters((prev) => !prev)}
        isAdmin={user.role === "admin"}
      />

      {showFilters && (
        <ExpensesFiltersPanel
          users={users}
          selectedUserId={selectedUserId}
          onUserChange={setSelectedUserId}
          minAmount={minAmount}
          onMinAmountChange={setMinAmount}
          maxAmount={maxAmount}
          onMaxAmountChange={setMaxAmount}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />
      )}

      {hasActiveFilters && !loading && (
        <ExpensesResultsSummary count={expenses.length} />
      )}

      {/* Expenses Grid */}
      <ExpensesList
        expenses={expenses}
        loading={loading}
        onDelete={handleDeleteClick}
        onViewDetails={handleViewDetails}
        isAdmin={user.role === "admin"}
      />

      {!loading && (
        <ExpensesPagination
          page={page}
          totalPages={totalPages}
          onPrev={() => setPage((prev) => Math.max(prev - 1, 1))}
          onNext={() => setPage((prev) => Math.min(prev + 1, totalPages))}
        />
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingExpenseId(null);
        }}
        onConfirm={confirmDelete}
        title="حذف المصروف"
        message="متأكد تمسح المصروف ده؟"
        type="danger"
      />

      {/* Expense Details Modal */}
      <ExpenseDetailsModal
        expense={selectedExpense}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedExpense(null);
        }}
      />
    </div>
  );
};

export default Expenses;
