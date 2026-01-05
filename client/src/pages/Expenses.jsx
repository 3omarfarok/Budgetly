import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PlusCircle } from "lucide-react";
import ConfirmModal from "../components/ConfirmModal";
import ExpensesList from "../components/expenses/ExpensesList";
import { useExpenses } from "../hooks/useExpenses";

const Expenses = () => {
  const { user } = useAuth();
  const { expenses, loading, page, setPage, totalPages, deleteExpense } =
    useExpenses();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingExpenseId, setDeletingExpenseId] = useState(null);

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

  return (
    <div className="pb-8 px-4 max-w-6xl mx-auto font-primary">
      {/* Header with title and add button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          المصاريف
        </h1>
        {user.role === "admin" && (
          <Link
            to="/add-expense"
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
          >
            <PlusCircle size={20} />
            <span>سجّل مصروف جديد</span>
          </Link>
        )}
      </div>

      {/* Expenses Grid */}
      <ExpensesList
        expenses={expenses}
        loading={loading}
        onDelete={handleDeleteClick}
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
    </div>
  );
};

export default Expenses;
