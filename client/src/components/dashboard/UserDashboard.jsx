import { Wallet, TrendingDown, DollarSign } from "lucide-react";
import StatCard from "./StatCard";

export default function UserDashboard({ stats }) {
  return (
    <div className="space-y-8">
      <section aria-labelledby="balance-heading">
        <h2 id="balance-heading" className="sr-only">
          رصيدي
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard
            title="رصيدي"
            value={`${Math.abs(stats.balance).toFixed(2)} جنيه`}
            subtext={stats.balance >= 0 ? "(مفيش فلوس عليك)" : "( عليك فلوس)"}
            type={stats.balance >= 0 ? "positive" : "negative"}
            icon={Wallet}
          />
          <StatCard
            title="اللي دفعته"
            value={`${stats.totalPaid.toFixed(2)} جنيه`}
            icon={DollarSign}
          />
          <StatCard
            title="اجمالي المصاريف"
            value={`${stats.totalOwed.toFixed(2)} جنيه`}
            icon={TrendingDown}
          />
        </div>
      </section>

      <section
        aria-labelledby="activity-heading"
        className="bg-ios-surface backdrop-blur-xl rounded-3xl border border-ios-border overflow-hidden shadow-md"
      >
        <div className="p-6 border-b border-ios-border">
          <h2 id="activity-heading" className="text-xl font-bold text-ios-dark">
            آخر المصاريف
          </h2>
        </div>
        <div className="divide-y divide-ios-border">
          {stats.recentExpenses?.length > 0 ? (
            <ul className="divide-y divide-ios-border">
              {stats.recentExpenses.map((expense) => (
                <li
                  key={expense._id}
                  className="p-5 flex justify-between items-center hover:bg-ios-hover transition-colors"
                >
                  <span className="text-ios-dark font-medium">
                    {expense.description}
                  </span>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-bold text-ios-primary">
                      {expense.totalAmount.toFixed(2)} جنيه
                    </span>
                    {expense.userShare && (
                      <span className="text-sm text-ios-error">
                        حصتك: {expense.userShare.toFixed(2)} جنيه
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-6 text-ios-secondary text-center">
              مفيش مصاريف لسه
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
