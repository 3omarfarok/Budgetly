export default function StatCard({
  title,
  value,
  subtext,
  type = "neutral",
  icon: Icon,
}) {
  const getColors = () => {
    switch (type) {
      case "positive":
        return "bg-ios-success/10 border-ios-success/20 text-ios-success";
      case "negative":
        return "bg-ios-error/10 border-ios-error/20 text-ios-error";
      default:
        return "bg-ios-surface border-ios-border text-ios-dark";
    }
  };

  return (
    <div
      className={`${getColors()} backdrop-blur-xl p-6 rounded-3xl border shadow-md hover:shadow-lg transition-all`}
      role="article"
    >
      {Icon && (
        <div className="mb-3" aria-hidden="true">
          <Icon size={24} className="opacity-60" />
        </div>
      )}
      <h3 className="text-sm font-semibold opacity-70 mb-2 tracking-wider">
        {title}
      </h3>
      <p className="text-3xl font-bold">
        {value}
        {subtext && (
          <span className="text-base font-normal opacity-60 mr-2">
            {subtext}
          </span>
        )}
      </p>
    </div>
  );
}
