import PaymentCard from "./PaymentCard";
import Loader from "../Loader";
import { Banknote } from "lucide-react";

export default function PaymentsList({
  loading,
  payments,
  selectedPayments,
  isSelectionMode,
  toggleSelect,
  isAdmin,
  handleApprove,
  handleReject,
  handleDeleteClick,
}) {
  if (loading) return <Loader text="بنحمّل المدفوعات..." />;

  if (payments.length === 0) {
    return (
      <div className="text-center py-20 bg-(--color-surface) rounded-3xl border-2 border-dashed border-[--color-border]">
        <Banknote size={48} className="mx-auto mb-3 text-(--color-border)" />
        <p className="text-(--color-muted) font-medium">
          مفيش مدفوعات متسجلة لسه
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {payments.map((payment) => (
        <PaymentCard
          key={payment._id}
          payment={payment}
          isSelected={selectedPayments.includes(payment._id)}
          isSelectionMode={isSelectionMode}
          toggleSelect={toggleSelect}
          isAdmin={isAdmin}
          handleApprove={handleApprove}
          handleReject={handleReject}
          handleDeleteClick={handleDeleteClick}
        />
      ))}
    </div>
  );
}
