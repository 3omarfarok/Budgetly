import { useState } from "react";
import { format } from "date-fns";
import {
  RefreshCw,
  User as UserIcon,
  CreditCard,
  AlertCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { useAllInvoices } from "../hooks";
import {
  InvoicesTable,
  MobileRequestCard,
  RequestDetailsModal,
} from "../components";

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-(--color-dark)">إدارة الفواتير</h1>
          <p className="text-(--color-secondary)">متابعة الفواتير والمدفوعات لكل المستخدمين</p>
        </div>
        <button
          onClick={refreshData}
          className="self-end sm:self-auto p-2 bg-(--color-surface) border border-(--color-border) rounded-full hover:bg-(--color-bg) transition-colors text-(--color-dark)"
          title="تحديث البيانات"
        >
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {pendingRequests.length > 0 && (
        <div className="bg-(--color-surface) border border-(--color-border) rounded-2xl p-4 sm:p-6 shadow-sm border-r-4 border-r-(--color-status-pending)">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-(--color-dark)">
            <Clock className="text-(--color-status-pending)" />
            طلبات معلقة ({pendingRequests.length})
          </h2>

          <div className="hidden md:block overflow-x-auto">
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
                          className="px-3 py-1 bg-(--color-status-approved-bg) text-(--color-status-approved) rounded-lg hover:opacity-80 text-xs font-bold transition-colors"
                        >
                          موافقة
                        </button>
                        <button
                          onClick={() => handleRejectRequest(req._id)}
                          className="px-3 py-1 bg-(--color-status-rejected-bg) text-(--color-status-rejected) rounded-lg hover:opacity-80 text-xs font-bold transition-colors"
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

          <div className="md:hidden space-y-4">
            {pendingRequests.map((req) => (
              <MobileRequestCard
                key={req._id}
                request={req}
                onOpenDetails={openRequestDetails}
                onApprove={handleApproveRequest}
                onReject={handleRejectRequest}
              />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {userStats.map((u) => (
          <div
            key={u._id}
            onClick={() =>
              setSelectedUserId((prev) => (prev === u._id ? null : u._id))
            }
            className={`cursor-pointer rounded-xl p-3 sm:p-4 border transition-all duration-200 relative overflow-hidden group ${
              selectedUserId === u._id
                ? " text-(--color-primary) border-(--color-primary) shadow-lg transform scale-[1.02] bg-(--color-primary)/20"
                : " border-(--color-border) border hover:border-(--color-primary) hover:shadow-md"
            }`}
          >
            <div className="flex items-center gap-3 sm:gap-4 relative z-10">
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-sm sm:text-lg font-bold shadow-sm ${
                  selectedUserId === u._id
                    ? " border-(--color-primary) border text-(--color-primary)"
                    : "  text-(--color-primary)"
                }`}
              >
                {u.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <h3
                  className={`font-bold truncate ${
                    selectedUserId === u._id ? "text-white" : "text-(--color-dark)"
                  }`}
                >
                  {u.name}
                </h3>
                <p
                  className={`text-xs truncate ${
                    selectedUserId === u._id
                      ? "text-white/80"
                      : "text-(--color-secondary)"
                  }`}
                >
                  @{u.username}
                </p>
              </div>
            </div>

            <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2 relative z-10">
              {u.pendingCount > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] sm:text-xs flex items-center gap-1 ${
                    selectedUserId === u._id
                      ? " text-(--color-primary) font-bold shadow-sm bg-(--color-primary)/20"
                      : "bg-(--color-status-pending-bg) text-(--color-status-pending)"
                  }`}
                >
                  <AlertCircle size={10} /> {u.pendingCount} مطلوب
                </span>
              )}
              {u.awaitingCount > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] sm:text-xs flex items-center gap-1 ${
                    selectedUserId === u._id
                      ? "bg-white/90 text-(--color-primary) font-bold shadow-sm"
                      : "bg-(--color-info-bg) text-(--color-info)"
                  }`}
                >
                  <Clock size={10} /> {u.awaitingCount} انتظار
                </span>
              )}
              {u.pendingCount === 0 && u.awaitingCount === 0 && (
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] sm:text-xs flex items-center gap-1 ${
                    selectedUserId === u._id
                      ? "bg-white/90 text-(--color-primary) font-bold shadow-sm"
                      : "bg-(--color-success-bg) text-(--color-success)"
                  }`}
                >
                  <CheckCircle2 size={10} /> خالص
                </span>
              )}
            </div>

            {selectedUserId === u._id && (
              <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
                <UserIcon size={80} color="white" />
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedUser && (
        <div className="bg-(--color-surface) border border-(--color-border) rounded-2xl p-4 sm:p-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
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

      <div className="bg-(--color-surface) border border-(--color-border) rounded-2xl p-4 sm:p-6 shadow-sm">
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
