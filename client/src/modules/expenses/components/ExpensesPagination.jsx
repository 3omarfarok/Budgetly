export default function ExpensesPagination({ page, totalPages, onPrev, onNext }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-4 mt-8">
      <button
        onClick={onPrev}
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
        onClick={onNext}
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
  );
}
