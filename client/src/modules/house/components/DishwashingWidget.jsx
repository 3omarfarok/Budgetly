import { UtensilsCrossed, Calendar, User } from "lucide-react";
import useDishwashing from "../hooks/useDishwashing";

const DishwashingWidget = ({ houseId }) => {
  const { today, loadingToday, schedule, loadingSchedule } =
    useDishwashing(houseId);

  if (loadingToday) {
    return (
      <div
        className="p-4 rounded-2xl animate-pulse"
        style={{ backgroundColor: "var(--color-surface)" }}
      >
        <div className="h-20 bg-(--color-light) rounded-xl" />
      </div>
    );
  }

  // Not enabled or configured
  if (!today?.enabled) {
    return null;
  }

  // Rotation hasn't started yet
  if (today?.notStarted) {
    return (
      <div
        className="p-4 rounded-2xl border shadow-sm"
        style={{
          backgroundColor: "var(--color-surface)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: "var(--color-light)" }}
          >
            <UtensilsCrossed
              size={20}
              style={{ color: "var(--color-muted)" }}
            />
          </div>
          <div>
            <h4 className="font-bold" style={{ color: "var(--color-dark)" }}>
              جدول غسيل الأطباق
            </h4>
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              يبدأ في {today.startDate}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border shadow-sm overflow-hidden"
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      {/* Today's Assignment */}
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: "var(--color-primary-light)" }}
          >
            <UtensilsCrossed
              size={20}
              style={{ color: "var(--color-primary)" }}
            />
          </div>
          <div>
            <h4 className="font-bold" style={{ color: "var(--color-dark)" }}>
              غسيل الأطباق اليوم
            </h4>
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              {today?.dayName} - {today?.date}
            </p>
          </div>
        </div>

        {/* Assigned User */}
        <div
          className="flex items-center gap-3 p-3 rounded-xl"
          style={{
            backgroundColor: today?.isCurrentUser
              ? "var(--color-primary)"
              : "var(--color-light)",
          }}
        >
          {today?.assignedUser?.profilePicture ? (
            <img
              src={`/profiles/${today.assignedUser.profilePicture}`}
              alt={today.assignedUser.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg"
              style={{
                backgroundColor: today?.isCurrentUser
                  ? "rgba(255,255,255,0.2)"
                  : "var(--color-primary-light)",
                color: today?.isCurrentUser ? "white" : "var(--color-primary)",
              }}
            >
              {today?.assignedUser?.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <p
              className="font-bold"
              style={{
                color: today?.isCurrentUser ? "white" : "var(--color-dark)",
              }}
            >
              {today?.assignedUser?.name}
              {today?.isCurrentUser && (
                <span className="text-xs opacity-75 mr-2">(أنت)</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Upcoming Schedule (condensed) */}
      {!loadingSchedule && schedule?.length > 1 && (
        <div
          className="px-4 py-3 border-t"
          style={{ borderColor: "var(--color-border)" }}
        >
          <p
            className="text-xs font-medium mb-2"
            style={{ color: "var(--color-muted)" }}
          >
            الأيام القادمة
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {schedule.slice(1, 5).map((day) => (
              <div
                key={day.date}
                className="flex-shrink-0 text-center px-3 py-2 rounded-lg"
                style={{ backgroundColor: "var(--color-light)" }}
              >
                <p
                  className="text-xs font-medium"
                  style={{ color: "var(--color-muted)" }}
                >
                  {day.dayName}
                </p>
                <p
                  className="text-sm font-bold"
                  style={{ color: "var(--color-dark)" }}
                >
                  {day.user?.name?.split(" ")[0]}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DishwashingWidget;
