import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  loading,
}) {
  if (loading || totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-4 mt-8">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={`p-2 rounded-xl transition-all ${
          currentPage === 1
            ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-400"
            : "hover:bg-gray-100 dark:hover:bg-gray-800 bg-white dark:bg-[#1C1C1E] text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
        }`}
      >
        <ChevronRight size={20} className="rtl:rotate-180" />
      </button>
      <span className="font-bold text-sm text-gray-700 dark:text-gray-200">
        صفحة {currentPage} من {totalPages}
      </span>
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={`p-2 rounded-xl transition-all ${
          currentPage === totalPages
            ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-400"
            : "hover:bg-gray-100 dark:hover:bg-gray-800 bg-white dark:bg-[#1C1C1E] text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
        }`}
      >
        <ChevronLeft size={20} className="rtl:rotate-180" />
      </button>
    </div>
  );
}
