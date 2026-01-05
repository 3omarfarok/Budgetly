import { useState } from "react";
import {
  TrendingUp,
  Calendar,
  Filter,
  DollarSign,
  ArrowDownCircle,
} from "lucide-react";
import Loader from "../components/Loader";
import Input from "../components/Input";
import { useIncome } from "../hooks/useIncome";

const IncomePage = () => {
  const { incomes, loading, filters, setFilters, totalIncome } = useIncome();

  const [showFilters, setShowFilters] = useState(false);

  if (loading) return <Loader text="بنحمّل مصادر الدخل..." />;

  return (
    <div className="pb-8 font-primary">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div
            className="p-3 rounded-2xl"
            style={{ backgroundColor: "var(--color-status-approved-bg)" }}
          >
            <TrendingUp size={32} style={{ color: "var(--color-success)" }} />
          </div>
          <div>
            <h1
              className="text-3xl font-bold"
              style={{ color: "var(--color-dark)" }}
            >
              الدخل المستلم
            </h1>
            <p style={{ color: "var(--color-secondary)" }}>
              تابع كل الفلوس اللي دخلت البيت
            </p>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div
        className="p-6 rounded-3xl mb-8 shadow-lg"
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <DollarSign size={20} style={{ color: "var(--color-success)" }} />
          <h3 className="font-bold" style={{ color: "var(--color-secondary)" }}>
            إجمالي الدخل
          </h3>
        </div>
        <p
          className="text-4xl font-bold"
          style={{ color: "var(--color-success)" }}
        >
          {totalIncome.toFixed(2)}{" "}
          <span className="text-lg text-gray-400">جنيه</span>
        </p>
      </div>

      {/* Filters Toggle */}
      <div className="mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-semibold"
          style={{
            backgroundColor: showFilters
              ? "var(--color-primary)"
              : "var(--color-bg)",
            color: showFilters ? "white" : "var(--color-secondary)",
            border: "1px solid var(--color-border)",
          }}
        >
          <Filter size={18} />
          <span>فلترة النتائج</span>
        </button>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div
          className="p-6 rounded-3xl mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <Input
            label="من تاريخ"
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              setFilters({ ...filters, startDate: e.target.value })
            }
            icon={Calendar}
          />
          <Input
            label="إلى تاريخ"
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              setFilters({ ...filters, endDate: e.target.value })
            }
            icon={Calendar}
          />
        </div>
      )}

      {/* Income List */}
      <div className="space-y-4">
        {incomes.length > 0 ? (
          incomes.map((income) => (
            <div
              key={income._id}
              className="p-5 rounded-2xl flex justify-between items-center shadow-sm hover:shadow-md transition-all"
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="p-3 rounded-full"
                  style={{ backgroundColor: "var(--color-status-approved-bg)" }}
                >
                  <ArrowDownCircle
                    size={24}
                    style={{ color: "var(--color-success)" }}
                  />
                </div>
                <div>
                  <p
                    className="font-bold text-lg"
                    style={{ color: "var(--color-dark)" }}
                  >
                    {income.description || "بدون وصف"}
                  </p>
                  <p
                    className="text-sm flex items-center gap-1"
                    style={{ color: "var(--color-muted)" }}
                  >
                    <Calendar size={12} />
                    {new Date(income.date).toLocaleDateString("ar-EG")}
                    {income.user && income.user.name && (
                      <span className="mr-2">• بواسطة: {income.user.name}</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="text-left">
                <p
                  className="font-bold text-xl"
                  style={{ color: "var(--color-success)" }}
                >
                  +{income.amount.toFixed(2)}
                </p>
                <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                  جنيه
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p style={{ color: "var(--color-muted)" }}>
              مفيش أي دخل مسجل حالياً
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncomePage;
