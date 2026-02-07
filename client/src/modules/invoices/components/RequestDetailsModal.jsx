import { format } from "date-fns";
import { X, CreditCard, User as UserIcon } from "lucide-react";

export default function RequestDetailsModal({ isOpen, onClose, request }) {
  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-(--color-surface) rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-(--color-border) transform transition-all scale-100 max-h-[90vh] flex flex-col"
        dir="rtl"
      >
        <div className="p-4 sm:p-6 border-b border-(--color-border) flex justify-between items-start shrink-0">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-(--color-dark) flex items-center gap-2">
              <CreditCard className="text-(--color-primary)" size={24} />
              تفاصيل الفاتورة
            </h3>
            <p className="text-xs sm:text-sm text-(--color-secondary) mt-1">
              تم الإنشاء بواسطة {request.createdBy?.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-(--color-secondary) hover:text-(--color-error) transition-colors p-1"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-(--color-bg) p-4 rounded-xl border border-(--color-border)">
              <p className="text-xs text-(--color-secondary) mb-1">الوصف</p>
              <p className="font-semibold text-(--color-dark)">{request.description}</p>
            </div>
            <div className="bg-(--color-bg) p-4 rounded-xl border border-(--color-border)">
              <p className="text-xs text-(--color-secondary) mb-1">المبلغ الكلي</p>
              <p className="font-bold text-xl text-(--color-primary)">{request.totalAmount} جنيه</p>
            </div>
            <div className="bg-(--color-bg) p-4 rounded-xl border border-(--color-border)">
              <p className="text-xs text-(--color-secondary) mb-1">التاريخ</p>
              <p className="font-medium text-(--color-dark)">
                {format(new Date(request.createdAt), "MMM d, yyyy")}
              </p>
            </div>
            <div className="bg-(--color-bg) p-4 rounded-xl border border-(--color-border)">
              <p className="text-xs text-(--color-secondary) mb-1">الفئة</p>
              <p className="font-medium text-(--color-dark)">{request.category || "عام"}</p>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-(--color-dark) mb-3 flex items-center gap-2">
              <UserIcon size={18} />
              المشاركون في الدفع
            </h4>
            <div className="space-y-3 custom-scrollbar">
              {request.splits?.map((split, index) => {
                const isPayer = split.user._id === request.createdBy._id;
                return (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 rounded-lg bg-(--color-bg) border border-(--color-border)"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-(--color-surface) border border-(--color-border) flex items-center justify-center text-sm font-bold text-(--color-primary)">
                        {split.user.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-(--color-dark) text-sm sm:text-base">
                          {split.user.name}
                        </p>
                        {isPayer && (
                          <span className="text-[10px] bg-(--color-status-approved-bg) text-(--color-status-approved) px-2 py-0.5 rounded-full font-bold">
                            الدافع
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-(--color-dark) text-sm sm:text-base">
                      {split.amount.toFixed(2)} جنيه
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 border-t border-(--color-border) bg-(--color-bg) flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 bg-(--color-surface) border border-(--color-border) text-(--color-dark) rounded-xl hover:bg-(--color-hover) font-medium transition-all"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
