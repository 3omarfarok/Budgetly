import { Search } from "lucide-react";
import Input from "../Input";

export default function PaymentFilters({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  filterStatus,
  setFilterStatus,
  filterDate,
  setFilterDate,
}) {
  return (
    <div className="p-4 rounded-3xl shadow-sm mb-6 space-y-4 bg-(--color-surface) border border-(--color-border)">
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
            className="p-3 rounded-xl outline-none transition-all cursor-pointer font-medium text-sm appearance-none bg-(--color-bg) border border-(--color-border) text-(--color-dark)"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">كل العمليات</option>
            <option value="payment">مدفوعات (Paid)</option>
            <option value="received">مستلمات (Received)</option>
          </select>

          <select
            className="p-3 rounded-xl outline-none transition-all cursor-pointer font-medium text-sm appearance-none bg-(--color-bg) border border-(--color-border) text-(--color-dark)"
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
            className="p-3 rounded-xl outline-none transition-all cursor-pointer font-medium text-sm col-span-2 md:col-span-1 bg-(--color-bg) border border-(--color-border) text-(--color-dark)"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
