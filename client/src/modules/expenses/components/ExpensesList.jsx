import { Receipt } from "lucide-react";
import ExpenseCard from "./ExpenseCard";
import { Loader } from "../../../shared/components";

export default function ExpensesList({
  expenses,
  loading,
  onDelete,
  onViewDetails,
  isAdmin,
}) {
  if (loading) {
    return <Loader text="بنحمّل المصاريف..." />;
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-50 dark:bg-[#1C1C1E] rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
        <Receipt
          size={48}
          className="mx-auto mb-3 text-gray-300 dark:text-gray-600"
        />
        <p className="text-gray-500 font-medium">مفيش مصاريف متسجلة لسه</p>
        <p className="text-gray-400 text-sm mt-1">ابدأ سجّل أول مصروف</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {expenses.map((expense) => (
        <ExpenseCard
          key={expense._id}
          expense={expense}
          onDelete={onDelete}
          onViewDetails={onViewDetails}
          isAdmin={isAdmin}
        />
      ))}
    </div>
  );
}
