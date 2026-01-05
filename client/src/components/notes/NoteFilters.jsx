import { Search, Filter } from "lucide-react";

export default function NoteFilters({
  searchText,
  setSearchText,
  selectedUser,
  setSelectedUser,
  uniqueUsers,
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-muted) w-5 h-5" />
        <input
          type="text"
          placeholder="بحث في الملاحظات..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full bg-(--color-surface) border border-(--color-border) rounded-xl py-3 pr-10 pl-4 focus:outline-none focus:ring-2 focus:ring-(--color-primary) transition-all"
        />
      </div>
      <div className="relative min-w-[200px]">
        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-muted) w-5 h-5 pointer-events-none" />
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="w-full bg-(--color-surface) border border-(--color-border) rounded-xl py-3 pr-10 pl-4 focus:outline-none focus:ring-2 focus:ring-(--color-primary) appearance-none cursor-pointer transition-all"
        >
          <option value="">كل العائلة</option>
          {uniqueUsers.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
