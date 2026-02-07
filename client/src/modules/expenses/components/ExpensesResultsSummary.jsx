export default function ExpensesResultsSummary({ count }) {
  return (
    <div
      className="mb-4 px-4 py-2 rounded-xl text-sm"
      style={{
        backgroundColor: "var(--color-light)",
        color: "var(--color-secondary)",
      }}
    >
      عدد النتائج: <strong>{count}</strong> مصروف
    </div>
  );
}
