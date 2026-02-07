export default function StatusBadge({ status }) {
  const styles = {
    pending: "bg-(--color-status-pending-bg) text-(--color-status-pending)",
    awaiting_approval: "bg-(--color-info-bg) text-(--color-info)",
    paid: "bg-(--color-status-approved-bg) text-(--color-status-approved)",
    rejected: "bg-(--color-status-rejected-bg) text-(--color-status-rejected)",
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
}
