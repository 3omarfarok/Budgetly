import { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  Search,
  RefreshCw,
  Check,
  X,
  ArrowUpDown,
  User as UserIcon,
  CreditCard,
  AlertCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useAllInvoices } from "../hooks/useAllInvoices";

// --- Components ---

const StatusBadge = ({ status }) => {
  const styles = {
    pending:
      "bg-(--color-status-pending-bg) text-(--color-status-pending)",
    awaiting_approval: "bg-(--color-info-bg) text-(--color-info)",
    paid: "bg-(--color-status-approved-bg) text-(--color-status-approved)",
    rejected:
      "bg-(--color-status-rejected-bg) text-(--color-status-rejected)",
  };

  const labels = {
    pending: "مطلوب سداده",
    awaiting_approval: "في انتظار الموافقة",
    paid: "تم الدفع",
    rejected: "مرفوض",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        styles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {labels[status] || status}
    </span>
  );
};

const InvoicesTable = ({
  data,
  loading,
  onApprove,
  onReject,
  showUserColumn = true,
}) => {
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo(() => {
    const cols = [
      {
        accessorKey: "date",
        header: "التاريخ",
        accessorFn: (row) => row.createdAt,
        cell: (info) => (
          <span className="text-sm text-(--color-secondary)">
            {format(new Date(info.getValue()), "MMM d, yyyy")}
          </span>
        ),
      },
      {
        accessorKey: "description",
        header: "الوصف",
        cell: (info) => (
          <span className="text-(--color-dark) font-medium">
            {info.getValue()}
          </span>
        ),
      },
      {
        accessorKey: "amount",
        header: "المبلغ",
        cell: (info) => (
          <span className="font-bold text-(--color-dark)">
            {Number(info.getValue()).toFixed(2)} جنيه
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "الحالة",
        cell: (info) => <StatusBadge status={info.getValue()} />,
      },
      {
        id: "actions",
        header: "إجراءات",
        cell: ({ row }) => {
          const invoice = row.original;
          return (
            <div className="flex items-center justify-start gap-2">
              {invoice.status === "awaiting_approval" ? (
                <>
                  <button
                    onClick={() => onApprove(invoice._id)}
                    className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                    title="موافقة"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => onReject(invoice._id)}
                    className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    title="رفض"
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <span className="text-(--color-secondary) text-xs">-</span>
              )}
            </div>
          );
        },
      },
    ];

    if (showUserColumn) {
      cols.splice(1, 0, {
        accessorKey: "user",
        header: "المستخدم",
        accessorFn: (row) => row.user?.name,
        cell: (info) => (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-(--color-primary-bg) text-(--color-primary) flex items-center justify-center text-xs font-bold">
              {info.getValue()?.charAt(0) || "?"}
            </div>
            <span className="font-medium text-(--color-dark) text-sm">
              {info.getValue()}
            </span>
          </div>
        ),
      });
    }

    return cols;
  }, [showUserColumn, onApprove, onReject]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 bg-(--color-bg) p-2 rounded-lg border border-(--color-border) w-full md:w-64">
        <Search size={18} className="text-(--color-secondary)" />
        <input
          type="text"
          placeholder="بحث..."
          className="bg-transparent border-none outline-none text-sm w-full text-(--color-dark)"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto border border-(--color-border) rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead className="bg-(--color-bg)">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="py-3 px-4 text-xs font-semibold text-(--color-secondary) uppercase border-b border-(--color-border) cursor-pointer hover:text-(--color-primary) transition-colors"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getCanSort() && (
                        <ArrowUpDown size={12} className="opacity-50" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-(--color-border) bg-(--color-surface)">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-start">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-(--color-primary)"></div>
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-8 text-center text-(--color-secondary)"
                >
                  لا توجد فواتير
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-(--color-hover) transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="py-3 px-4 text-sm text-start">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-(--color-secondary)">
        <div className="flex gap-2">
          <button
            className="px-2 py-1 border rounded hover:bg-(--color-hover) disabled:opacity-50"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            السابق
          </button>
          <button
            className="px-2 py-1 border rounded hover:bg-(--color-hover) disabled:opacity-50"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            التالي
          </button>
        </div>
        <span>
          صفحة {table.getState().pagination.pageIndex + 1} من{" "}
          {table.getPageCount()}
        </span>
      </div>
    </div>
  );
};

// Request Details Modal
const RequestDetailsModal = ({ isOpen, onClose, request }) => {
  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-(--color-surface) rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-(--color-border) transform transition-all scale-100"
        dir="rtl"
      >
        <div className="p-6 border-b border-(--color-border) flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-(--color-dark) flex items-center gap-2">
              <CreditCard className="text-(--color-primary)" size={24} />
              تفاصيل الفاتورة
            </h3>
            <p className="text-sm text-(--color-secondary) mt-1">
              تم الإنشاء بواسطة {request.createdBy?.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-(--color-secondary) hover:text-(--color-error) transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Main Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-(--color-bg) p-4 rounded-xl border border-(--color-border)">
              <p className="text-xs text-(--color-secondary) mb-1">
                الوصف
              </p>
              <p className="font-semibold text-(--color-dark)">
                {request.description}
              </p>
            </div>
            <div className="bg-(--color-bg) p-4 rounded-xl border border-(--color-border)">
              <p className="text-xs text-(--color-secondary) mb-1">
                المبلغ الكلي
              </p>
              <p className="font-bold text-xl text-(--color-primary)">
                {request.totalAmount} جنيه
              </p>
            </div>
            <div className="bg-(--color-bg) p-4 rounded-xl border border-(--color-border)">
              <p className="text-xs text-(--color-secondary) mb-1">
                التاريخ
              </p>
              <p className="font-medium text-(--color-dark)">
                {format(new Date(request.createdAt), "MMM d, yyyy")}
              </p>
            </div>
            <div className="bg-(--color-bg) p-4 rounded-xl border border-(--color-border)">
              <p className="text-xs text-(--color-secondary) mb-1">
                الفئة
              </p>
              <p className="font-medium text-(--color-dark)">
                {request.category || "عام"}
              </p>
            </div>
          </div>

          {/* Splits Details */}
          <div>
            <h4 className="font-bold text-(--color-dark) mb-3 flex items-center gap-2">
              <UserIcon size={18} />
              المشاركون في الدفع
            </h4>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
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
                        <p className="font-medium text-(--color-dark)">
                          {split.user.name}
                        </p>
                        {isPayer && (
                          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                            الدافع (لن يتم إنشاء فاتورة)
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-(--color-dark)">
                      {split.amount.toFixed(2)} جنيه
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-(--color-border) bg-(--color-bg) flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-(--color-surface) border border-(--color-border) text-(--color-dark) rounded-xl hover:bg-(--color-hover) font-medium transition-all"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Page Component ---

export default function AllInvoices() {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const {
    invoices,
    pendingRequests,
    loading,
    refreshData,
    selectedUserId,
    setSelectedUserId,
    userStats,
    selectedUser,
    selectedUserInvoices,
    handleApprove,
    handleReject,
    handleApproveRequest,
    handleRejectRequest,
  } = useAllInvoices();

  const openRequestDetails = (request) => {
    setSelectedRequest(request);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="space-y-8 pb-20 md:pb-0" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-(--color-dark)">
            إدارة الفواتير
          </h1>
          <p className="text-(--color-secondary)">
            متابعة الفواتير والمدفوعات لكل المستخدمين
          </p>
        </div>
        <button
          onClick={refreshData}
          className="p-2 bg-(--color-surface) border border-(--color-border) rounded-full hover:bg-(--color-bg) transition-colors text-(--color-dark)"
          title="تحديث البيانات"
        >
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Pending Requests Section */}
      {pendingRequests.length > 0 && (
        <div className="bg-(--color-surface) border border-(--color-border) rounded-2xl p-6 shadow-sm border-r-4 border-r-(--color-status-pending)">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-(--color-dark)">
            <Clock className="text-(--color-status-pending)" />
            طلبات معلقة ({pendingRequests.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-(--color-bg) text-xs uppercase text-(--color-secondary)">
                  <th className="py-3 px-4 text-start rounded-r-lg">التاريخ</th>
                  <th className="py-3 px-4 text-start">المستخدم</th>
                  <th className="py-3 px-4 text-start">الوصف</th>
                  <th className="py-3 px-4 text-start">المبلغ الكلي</th>
                  <th className="py-3 px-4 text-start rounded-l-lg">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--color-border)">
                {pendingRequests.map((req) => (
                  <tr key={req._id} className="hover:bg-(--color-hover)">
                    <td className="py-3 px-4 text-sm text-(--color-secondary) text-start">
                      {format(new Date(req.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-(--color-dark) text-start">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-(--color-primary-bg) text-(--color-primary) flex items-center justify-center text-xs font-bold">
                          {req.createdBy?.name?.charAt(0) || "?"}
                        </div>
                        {req.createdBy?.name}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-(--color-dark) text-start">
                      {req.description}
                    </td>
                    <td className="py-3 px-4 text-sm font-bold text-(--color-dark) text-start">
                      {req.totalAmount} جنيه
                    </td>
                    <td className="py-3 px-4 text-start">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openRequestDetails(req)}
                          className="px-3 py-1 bg-(--color-bg) text-(--color-secondary) border border-(--color-border) rounded-lg hover:bg-(--color-hover) text-xs font-bold transition-colors"
                        >
                          تفاصيل
                        </button>
                        <button
                          onClick={() => handleApproveRequest(req._id)}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-xs font-bold transition-colors"
                        >
                          موافقة
                        </button>
                        <button
                          onClick={() => handleRejectRequest(req._id)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-xs font-bold transition-colors"
                        >
                          رفض
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {userStats.map((u) => (
          <div
            key={u._id}
            onClick={() =>
              setSelectedUserId((prev) => (prev === u._id ? null : u._id))
            }
            className={`cursor-pointer rounded-xl p-4 border transition-all duration-200 relative overflow-hidden group ${
              selectedUserId === u._id
                ? " text-white border-(--color-primary) shadow-lg transform scale-[1.02] bg-(--color-primary/0.50)"
                : " border-(--color-border) hover:border-(--color-primary) hover:shadow-md"
            }`}
          >
            <div className="flex items-center gap-4 relative z-10">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-sm ${
                  selectedUserId === u._id
                    ? " border-(--color-primary) border text-(--color-primary)"
                    : "  text-(--color-primary)"
                }`}
              >
                {u.name.charAt(0)}
              </div>
              <div>
                <h3
                  className={`font-bold ${
                    selectedUserId === u._id
                      ? "text-white"
                      : "text-(--color-dark)"
                  }`}
                >
                  {u.name}
                </h3>
                <p
                  className={`text-xs ${
                    selectedUserId === u._id
                      ? "text-white/80"
                      : "text-(--color-secondary)"
                  }`}
                >
                  @{u.username}
                </p>
              </div>
            </div>

            {/* Badges */}
            <div className="mt-4 flex gap-2 relative z-10">
              {u.pendingCount > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-md text-xs flex items-center gap-1 ${
                    selectedUserId === u._id
                      ? "bg-white/20 text-white"
                      : "bg-(--color-status-pending-bg) text-(--color-status-pending)"
                  }`}
                >
                  <AlertCircle size={10} /> {u.pendingCount} مطلوب
                </span>
              )}
              {u.awaitingCount > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-md text-xs flex items-center gap-1 ${
                    selectedUserId === u._id
                      ? "bg-white/20 text-white"
                      : "bg-(--color-info-bg) text-(--color-info)"
                  }`}
                >
                  <Clock size={10} /> {u.awaitingCount} انتظار
                </span>
              )}
              {u.pendingCount === 0 && u.awaitingCount === 0 && (
                <span
                  className={`px-2 py-0.5 rounded-md text-xs flex items-center gap-1 ${
                    selectedUserId === u._id
                      ? "bg-white/20 text-white"
                      : "bg-(--color-success-bg) text-(--color-success)"
                  }`}
                >
                  <CheckCircle2 size={10} /> خالص
                </span>
              )}
            </div>

            {selectedUserId === u._id && (
              <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
                <UserIcon size={100} color="white" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Selected User Details */}
      {selectedUser && (
        <div className="bg-(--color-surface) border border-(--color-border) rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-(--color-dark)">
              <UserIcon className="text-(--color-primary)" />
              فواتير {selectedUser.name}
            </h2>
            <button
              onClick={() => setSelectedUserId(null)}
              className="text-sm text-(--color-secondary) hover:text-(--color-primary) underline"
            >
              إغلاق
            </button>
          </div>

          <InvoicesTable
            data={selectedUserInvoices}
            loading={loading}
            onApprove={handleApprove}
            onReject={handleReject}
            showUserColumn={false}
          />
        </div>
      )}

      {/* All Invoices Table */}
      <div className="bg-(--color-surface) border border-(--color-border) rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-(--color-dark)">
          <CreditCard className="text-(--color-primary)" />
          كل الفواتير
        </h2>
        <InvoicesTable
          data={invoices}
          loading={loading}
          onApprove={handleApprove}
          onReject={handleReject}
          showUserColumn={true}
        />
      </div>

      <RequestDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        request={selectedRequest}
      />
    </div>
  );
}



