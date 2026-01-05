import {
  Banknote,
  PlusCircle,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";

import Loader from "../components/Loader";
import ConfirmModal from "../components/ConfirmModal";
import Input from "../components/Input";
import { useMyPayments } from "../hooks/useMyPayments";

const MyPayments = () => {
  const {
    payments,
    loading,
    showAddForm,
    setShowAddForm,
    editingPayment,
    userBalance,
    formData,
    setFormData,
    error,
    showDeleteModal,
    setShowDeleteModal,
    deletingPaymentId,
    setDeletingPaymentId,
    isSubmitting,
    handleSubmit,
    handleEdit,
    handleDelete,
    confirmDelete,
    handleCancelEdit,
    totalPaid,
    totalReceived,
    pendingAmount,
    amountOwed,
  } = useMyPayments();

  const getStatusStyle = (status) => {
    const styles = {
      pending: {
        backgroundColor: "var(--color-status-pending-bg)",
        color: "var(--color-status-pending)",
        borderColor: "var(--color-status-pending-border)",
      },
      approved: {
        backgroundColor: "var(--color-status-approved-bg)",
        color: "var(--color-status-approved)",
        borderColor: "var(--color-status-approved-border)",
      },
      rejected: {
        backgroundColor: "var(--color-status-rejected-bg)",
        color: "var(--color-status-rejected)",
        borderColor: "var(--color-status-rejected-border)",
      },
    };
    return styles[status] || styles.pending;
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        icon: Clock,
        text: "مستني",
      },
      approved: {
        icon: CheckCircle,
        text: "موافق عليه",
      },
      rejected: {
        icon: XCircle,
        text: "مرفوض",
      },
    };
    return badges[status] || badges.pending;
  };

  if (loading) return <Loader text="بنحمّل مدفوعاتك..." />;

  return (
    <div className="pb-8 px-4 max-w-4xl mx-auto font-primary">
      {/* الهيدر */}
      <div className="mb-8 pt-4">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ color: "var(--color-dark)" }}
            >
              مدفوعاتي
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
              سجّل الفلوس اللي دفعتها
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2.5 text-white font-semibold rounded-2xl transition-all shadow-lg flex items-center gap-2"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            <PlusCircle size={18} />
            {showAddForm ? "إلغاء" : "سجّل دفعة"}
          </button>
        </div>

        {/* ملخص المدفوعات */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* المبلغ المطلوب سداده */}
          <div
            className="p-4 rounded-2xl"
            style={{
              backgroundColor:
                amountOwed > 0
                  ? "var(--color-status-rejected-bg)"
                  : "var(--color-status-approved-bg)",
              borderColor:
                amountOwed > 0
                  ? "var(--color-status-rejected-border)"
                  : "var(--color-status-approved-border)",
              borderWidth: "1px",
              borderStyle: "solid",
            }}
          >
            <p
              className="text-sm mb-1 flex items-center gap-1"
              style={{
                color:
                  amountOwed > 0
                    ? "var(--color-status-rejected)"
                    : "var(--color-status-approved)",
              }}
            >
              {amountOwed > 0 ? "💸 المطلوب دفعه" : "✅ رصيدك"}
            </p>
            <p
              className="text-2xl font-bold"
              style={{
                color:
                  amountOwed > 0
                    ? "var(--color-error)"
                    : "var(--color-success)",
              }}
            >
              {amountOwed > 0
                ? amountOwed.toFixed(2)
                : Math.abs(userBalance).toFixed(2)}
              <span className="text-sm"> جنيه</span>
            </p>
          </div>

          <div
            className="p-4 rounded-2xl"
            style={{
              backgroundColor: "var(--color-status-approved-bg)",
              borderColor: "var(--color-status-approved-border)",
              borderWidth: "1px",
              borderStyle: "solid",
            }}
          >
            <p
              className="text-sm mb-1"
              style={{ color: "var(--color-status-approved)" }}
            >
              إجمالي المستلم
            </p>
            <p
              className="text-2xl font-bold"
              style={{ color: "var(--color-success)" }}
            >
              {totalReceived.toFixed(2)} <span className="text-sm">جنيه</span>
            </p>
          </div>

          <div
            className="p-4 rounded-2xl"
            style={{
              backgroundColor: "var(--color-status-rejected-bg)",
              borderColor: "var(--color-status-rejected-border)",
              borderWidth: "1px",
              borderStyle: "solid",
            }}
          >
            <p
              className="text-sm mb-1"
              style={{ color: "var(--color-status-rejected)" }}
            >
              إجمالي المدفوع
            </p>
            <p
              className="text-2xl font-bold"
              style={{ color: "var(--color-error)" }}
            >
              {totalPaid.toFixed(2)} <span className="text-sm">جنيه</span>
            </p>
          </div>

          <div
            className="p-4 rounded-2xl"
            style={{
              backgroundColor: "var(--color-status-pending-bg)",
              borderColor: "var(--color-status-pending-border)",
              borderWidth: "1px",
              borderStyle: "solid",
            }}
          >
            <p
              className="text-sm mb-1"
              style={{ color: "var(--color-status-pending)" }}
            >
              المستني موافقة
            </p>
            <p
              className="text-2xl font-bold"
              style={{ color: "var(--color-warning)" }}
            >
              {pendingAmount.toFixed(2)} <span className="text-sm">جنيه</span>
            </p>
          </div>
        </div>
      </div>

      {/* فورم إضافة/تعديل دفعة */}
      {showAddForm && (
        <div
          className="backdrop-blur-xl p-6 rounded-3xl mb-8 shadow-lg"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
            borderWidth: "1px",
            borderStyle: "solid",
          }}
        >
          <div className="flex justify-between items-start mb-4">
            <h3
              className="text-xl font-bold"
              style={{ color: "var(--color-dark)" }}
            >
              {editingPayment ? "عدّل الدفعة" : "سجّل دفعة جديدة"}
            </h3>
            {amountOwed > 0 && (
              <div
                className="px-4 py-2 rounded-xl"
                style={{
                  backgroundColor: "var(--color-status-rejected-bg)",
                  borderColor: "var(--color-status-rejected-border)",
                  borderWidth: "1px",
                  borderStyle: "solid",
                }}
              >
                <p
                  className="text-xs mb-0.5"
                  style={{ color: "var(--color-status-rejected)" }}
                >
                  المطلوب دفعه:
                </p>
                <p
                  className="text-lg font-bold"
                  style={{ color: "var(--color-error)" }}
                >
                  {amountOwed.toFixed(2)} جنيه
                </p>
              </div>
            )}
          </div>
          {error && (
            <div
              className="p-3 rounded-2xl mb-4 text-sm"
              style={{
                backgroundColor: "var(--color-status-rejected-bg)",
                color: "var(--color-error)",
                borderColor: "var(--color-status-rejected-border)",
                borderWidth: "1px",
                borderStyle: "solid",
              }}
            >
              {error}
            </div>
          )}

          {/* removed transaction type toggle */}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="المبلغ (جنيه)"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  placeholder="0.00"
                  required
                  autoFocus
                />
              </div>
              <div>
                <Input
                  label="التاريخ"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Input
                label="وصف (اختياري)"
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="مثال: دفعة شهر يناير"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 py-3 px-4 text-white font-bold rounded-2xl transition-all shadow-lg ${
                  isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
                style={{
                  backgroundColor: "var(--color-primary)",
                }}
              >
                {isSubmitting
                  ? "جاري الحفظ..."
                  : editingPayment
                  ? "حفظ التعديل"
                  : "سجّل الدفعة"}
              </button>
              {editingPayment && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-6 py-3 font-bold rounded-2xl transition-all"
                  style={{
                    backgroundColor: "var(--color-light)",
                    color: "var(--color-secondary)",
                  }}
                >
                  إلغاء
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* قائمة المدفوعات */}
      <div className="space-y-4">
        {!loading &&
          payments.map((payment) => {
            const statusBadge = getStatusBadge(payment.status);
            const StatusIcon = statusBadge.icon;
            const statusStyle = getStatusStyle(payment.status);

            return (
              <div
                key={payment._id}
                className="rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
                style={{
                  backgroundColor: "var(--color-surface)",
                  borderColor: "var(--color-border)",
                  borderWidth: "1px",
                  borderStyle: "solid",
                }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div
                    className="px-3 py-1.5 rounded-xl flex items-center gap-1.5"
                    style={statusStyle}
                  >
                    <StatusIcon size={14} />
                    <span className="text-xs font-semibold">
                      {statusBadge.text}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 justify-end mb-1">
                      {payment.transactionType === "received" ? (
                        <ArrowDownCircle
                          size={14}
                          style={{ color: "var(--color-success)" }}
                        />
                      ) : (
                        <ArrowUpCircle
                          size={14}
                          style={{ color: "var(--color-error)" }}
                        />
                      )}
                      <span
                        className="text-xs font-semibold"
                        style={{
                          color:
                            payment.transactionType === "received"
                              ? "var(--color-success)"
                              : "var(--color-error)",
                        }}
                      >
                        {payment.transactionType === "received"
                          ? "استلام"
                          : "دفع"}
                      </span>
                    </div>
                    <span
                      className="block text-xl font-bold"
                      style={{
                        color:
                          payment.transactionType === "received"
                            ? "var(--color-success)"
                            : "var(--color-dark)",
                      }}
                    >
                      {payment.transactionType === "received" ? "+" : "-"}
                      {payment.amount?.toFixed(2) || "0.00"}
                      <span
                        className="text-xs font-normal mr-1"
                        style={{ color: "var(--color-muted)" }}
                      >
                        جنيه
                      </span>
                    </span>
                  </div>
                </div>

                {payment.description && (
                  <p
                    className="mb-2"
                    style={{ color: "var(--color-secondary)" }}
                  >
                    {payment.description}
                  </p>
                )}

                <div
                  className="flex items-center gap-2 text-xs"
                  style={{ color: "var(--color-muted)" }}
                >
                  <Calendar size={12} />
                  <span>
                    {new Date(
                      payment.date || payment.createdAt
                    ).toLocaleDateString("ar-EG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      calendar: "gregory",
                    })}
                  </span>
                </div>

                {/* أزرار التعديل والحذف (للمدفوعات pending فقط) */}
                {payment.status === "pending" && (
                  <div
                    className="flex gap-2 mt-3 pt-3"
                    style={{
                      borderTopColor: "var(--color-border)",
                      borderTopWidth: "1px",
                      borderTopStyle: "solid",
                    }}
                  >
                    <button
                      onClick={() => handleEdit(payment)}
                      className="flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                      style={{
                        backgroundColor: "var(--color-primary-bg)",
                        color: "var(--color-primary)",
                      }}
                    >
                      <Edit2 size={14} />
                      عدّل
                    </button>
                    <button
                      onClick={() => handleDelete(payment._id)}
                      className="flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                      style={{
                        backgroundColor: "var(--color-status-rejected-bg)",
                        color: "var(--color-error)",
                      }}
                    >
                      <Trash2 size={14} />
                      امسح
                    </button>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* لو مفيش مدفوعات */}
      {!loading && payments.length === 0 && !showAddForm && (
        <div
          className="text-center py-20 rounded-3xl border-2 border-dashed"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
          }}
        >
          <Banknote
            size={48}
            className="mx-auto mb-3"
            style={{ color: "var(--color-muted)" }}
          />
          <p
            className="font-medium mb-3"
            style={{ color: "var(--color-muted)" }}
          >
            مسجلتش أي دفعة لسه
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-3 text-white font-semibold rounded-2xl transition-all shadow-lg inline-flex items-center gap-2"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            <PlusCircle size={18} />
            سجّل أول دفعة
          </button>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingPaymentId(null);
        }}
        onConfirm={confirmDelete}
        title="حذف الدفعة"
        message="متأكد إنك عايز تمسح الدفعة دي؟"
        type="danger"
      />
    </div>
  );
};

export default MyPayments;
