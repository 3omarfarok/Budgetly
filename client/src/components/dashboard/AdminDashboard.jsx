import { TrendingUp, TrendingDown, Users } from "lucide-react";
import StatCard from "./StatCard";

export default function AdminDashboard({ stats }) {
  return (
    <div className="space-y-8">
      <section aria-labelledby="overview-heading">
        <h2 id="overview-heading" className="sr-only">
          نظرة عامة
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="إجمالي المصاريف"
            value={`${stats.overview.totalExpenseAmount.toFixed(2)} جنيه`}
            icon={TrendingUp}
          />
          <StatCard
            title="إجمالي المستحق"
            value={`${stats.overview.totalOwed.toFixed(2)} جنيه`}
            icon={TrendingDown}
          />
          <StatCard
            title="عدد الأعضاء"
            value={stats.overview.totalUsers}
            icon={Users}
          />
        </div>
      </section>

      <section
        aria-labelledby="debtors-heading"
        className="bg-ios-surface backdrop-blur-xl rounded-3xl border border-ios-border overflow-hidden shadow-md"
      >
        <div className="p-6 border-b border-ios-border">
          <h2 id="debtors-heading" className="text-xl font-bold text-ios-dark">
            الناس اللي عليها فلوس
          </h2>
        </div>
        <div className="divide-y divide-ios-border">
          {stats.usersOwing.length > 0 ? (
            <ul className="divide-y divide-ios-border">
              {stats.usersOwing.map((u) => (
                <li
                  key={u.userId}
                  className="p-5 flex justify-between items-center hover:bg-ios-hover transition-colors"
                >
                  <span className="font-semibold text-ios-dark">
                    {u.name}{" "}
                    <span className="text-ios-secondary text-sm">
                      (@{u.username})
                    </span>
                  </span>
                  <span className="text-ios-error font-bold">
                    عليه {u.owes.toFixed(2)} جنيه
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-6 text-ios-secondary text-center">
              مفيش حد عليه فلوس!
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
