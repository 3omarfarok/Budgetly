import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PlusCircle, Filter, X, User, DollarSign } from "lucide-react";
import ConfirmModal from "../components/ConfirmModal";
import ExpensesList from "../components/expenses/ExpensesList";
import ExpenseDetailsModal from "../components/expenses/ExpenseDetailsModal";
import { useExpenses } from "../hooks/useExpenses";

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
      {/* Header with title and buttons */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          المصاريف
        </h1>
        <div className="flex items-center gap-3">
          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all duration-200 font-medium shadow-sm hover:shadow-md ${
              showFilters || hasActiveFilters
                ? "bg-(--color-primary) text-white"
                : "bg-white dark:bg-[#1C1C1E] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
            style={
              showFilters || hasActiveFilters
                ? { backgroundColor: "var(--color-primary)" }
                : {}
            }
          >
            <Filter size={18} />
            <span>فلترة</span>
            {hasActiveFilters && (
              <span className="flex items-center justify-center w-5 h-5 bg-white/20 rounded-full text-xs">
                !
              </span>
            )}
          </button>

          {user.role === "admin" && (
            <Link
              to="/add-expense"
              className="flex items-center gap-2 px-4 py-2.5 bg-(--color-primary) text-white rounded-2xl hover:bg-(--color-primary)/80 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
            >
              <PlusCircle size={20} />
              <span>سجّل مصروف جديد</span>
            </Link>
          )}
        </div>
      </div>

      {/* Filter Section */}
      {showFilters && (
        <div
          className="mb-6 p-5 rounded-2xl shadow-sm animate-in slide-in-from-top-2 duration-200"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className="font-semibold flex items-center gap-2"
              style={{ color: "var(--color-dark)" }}
            >
              <Filter size={18} style={{ color: "var(--color-primary)" }} />
              خيارات الفلترة
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors"
                style={{
                  color: "var(--color-error)",
                  backgroundColor: "var(--color-status-rejected-bg)",
                }}
              >
                <X size={14} />
                مسح الكل
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* User Filter */}
            <div>
              <label
                className="block text-sm font-medium mb-2 flex items-center gap-1.5"
                style={{ color: "var(--color-secondary)" }}
              >
                <User size={14} />
                المستخدم
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl outline-none transition-all duration-200"
                style={{
                  backgroundColor: "var(--color-light)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-dark)",
                }}
              >
                <option value="">كل المستخدمين</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Min Amount */}
            <div>
              <label
                className="block text-sm font-medium mb-2 flex items-center gap-1.5"
                style={{ color: "var(--color-secondary)" }}
              >
                <DollarSign size={14} />
                الحد الأدنى (جنيه)
              </label>
              <input
                type="number"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2.5 rounded-xl outline-none transition-all duration-200"
                style={{
                  backgroundColor: "var(--color-light)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-dark)",
                }}
              />
            </div>

            {/* Max Amount */}
            <div>
              <label
                className="block text-sm font-medium mb-2 flex items-center gap-1.5"
                style={{ color: "var(--color-secondary)" }}
              >
                <DollarSign size={14} />
                الحد الأقصى (جنيه)
              </label>
              <input
                type="number"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                placeholder="∞"
                min="0"
                className="w-full px-4 py-2.5 rounded-xl outline-none transition-all duration-200"
                style={{
                  backgroundColor: "var(--color-light)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-dark)",
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      {hasActiveFilters && !loading && (
        <div
          className="mb-4 px-4 py-2 rounded-xl text-sm"
          style={{
            backgroundColor: "var(--color-light)",
            color: "var(--color-secondary)",
          }}
        >
          عدد النتائج: <strong>{expenses.length}</strong> مصروف
        </div>
      )}

      {/* Expenses Grid */}
      <ExpensesList
        expenses={expenses}
        loading={loading}
        onDelete={handleDeleteClick}
        onViewDetails={handleViewDetails}
        isAdmin={user.role === "admin"}
      />

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className={`px-4 py-2 rounded-xl transition-all ${
              page === 1
                ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                : "bg-white dark:bg-[#1C1C1E] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm"
            }`}
          >
            السابق
          </button>
          <span className="text-gray-600 dark:text-gray-300 font-bold">
            صفحة {page} من {totalPages}
          </span>
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className={`px-4 py-2 rounded-xl transition-all ${
              page === totalPages
                ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                : "bg-white dark:bg-[#1C1C1E] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm"
            }`}
          >
            التالي
          </button>
        </div>
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
