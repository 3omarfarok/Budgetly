import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Search, Check, X, ArrowUpDown } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import StatusBadge from "./StatusBadge";
import MobileInvoiceCard from "./MobileInvoiceCard";

export default function InvoicesTable({
  data,
  loading,
  onApprove,
  onReject,
  showUserColumn = true,
}) {
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
          <span className="text-(--color-dark) font-medium">{info.getValue()}</span>
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
                    className="p-1.5 bg-(--color-status-approved-bg) text-(--color-status-approved) rounded-lg hover:opacity-80 transition-colors"
                    title="موافقة"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => onReject(invoice._id)}
                    className="p-1.5 bg-(--color-status-rejected-bg) text-(--color-status-rejected) rounded-lg hover:opacity-80 transition-colors"
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
            <span className="font-medium text-(--color-dark) text-sm">{info.getValue()}</span>
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

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-(--color-primary)"></div>
        </div>
      ) : table.getRowModel().rows.length === 0 ? (
        <div className="text-center py-12 bg-(--color-bg) rounded-xl border-dashed border-2 border-(--color-border)">
          <p className="text-(--color-secondary)">لا توجد فواتير</p>
        </div>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto border border-(--color-border) rounded-xl">
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
                          {flexRender(header.column.columnDef.header, header.getContext())}
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
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-(--color-hover) transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="py-3 px-4 text-sm text-start">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-4">
            {table.getRowModel().rows.map((row) => (
              <MobileInvoiceCard
                key={row.id}
                invoice={row.original}
                onApprove={onApprove}
                onReject={onReject}
                showUser={showUserColumn}
              />
            ))}
          </div>
        </>
      )}

      <div className="flex items-center justify-between text-xs text-(--color-secondary) pt-4 border-t border-(--color-border)">
        <div className="flex gap-2">
          <button
            className="px-3 py-1 border rounded hover:bg-(--color-hover) disabled:opacity-50 transition-colors"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            السابق
          </button>
          <button
            className="px-3 py-1 border rounded hover:bg-(--color-hover) disabled:opacity-50 transition-colors"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            التالي
          </button>
        </div>
        <span>
          صفحة {table.getState().pagination.pageIndex + 1} من {table.getPageCount()}
        </span>
      </div>
    </div>
  );
}
