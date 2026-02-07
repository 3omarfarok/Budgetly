import { useState, useEffect } from "react";
import {
  UtensilsCrossed,
  Save,
  GripVertical,
  Calendar,
  Users,
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
} from "lucide-react";
import useDishwashing from "../hooks/useDishwashing";

const DishwashingSettings = ({ houseId, members, isAdmin }) => {
  const { settings, loadingSettings, updateSettings, isUpdatingSettings } =
    useDishwashing(houseId);

  const [enabled, setEnabled] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [order, setOrder] = useState([]);
  const [availableMembers, setAvailableMembers] = useState([]);

  // Initialize form when settings load
  useEffect(() => {
    if (settings) {
      setEnabled(settings.enabled || false);
      setStartDate(settings.startDate || "");
      setOrder(settings.order?.map((u) => u._id) || []);
    }
  }, [settings]);

  // Update available members when order or members change
  useEffect(() => {
    if (members) {
      const selectedIds = order;
      const available = members.filter((m) => !selectedIds.includes(m._id));
      setAvailableMembers(available);
    }
  }, [members, order]);

  const handleAddMember = (memberId) => {
    if (memberId && !order.includes(memberId)) {
      setOrder([...order, memberId]);
    }
  };

  const handleRemoveFromOrder = (memberId) => {
    setOrder(order.filter((id) => id !== memberId));
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newOrder = [...order];
    [newOrder[index - 1], newOrder[index]] = [
      newOrder[index],
      newOrder[index - 1],
    ];
    setOrder(newOrder);
  };

  const handleMoveDown = (index) => {
    if (index === order.length - 1) return;
    const newOrder = [...order];
    [newOrder[index], newOrder[index + 1]] = [
      newOrder[index + 1],
      newOrder[index],
    ];
    setOrder(newOrder);
  };

  const handleSave = async () => {
    try {
      await updateSettings({ enabled, startDate, order });
    } catch {
      // Handled in hook
    }
  };

  const getMemberById = (id) => members?.find((m) => m._id === id);

  if (!isAdmin) return null;
  if (loadingSettings) {
    return (
      <div className="p-6 text-center text-(--color-muted)">
        جاري تحميل الإعدادات...
      </div>
    );
  }

  return (
    <div className="bg-(--color-surface) rounded-2xl border border-(--color-border) shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-(--color-border) flex items-center gap-3">
        <div className="p-2 bg-(--color-primary)/10 text-(--color-primary) rounded-lg">
          <UtensilsCrossed size={24} />
        </div>
        <div>
          <h3 className="font-bold text-(--color-dark)">جدول غسيل الأطباق</h3>
          <p className="text-xs text-(--color-muted)">
            تنظيم الدور بين أعضاء البيت
          </p>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* Enable Toggle */}
        <div className="flex items-center justify-between">
          <label className="font-medium text-(--color-dark)">
            تفعيل الجدول
          </label>
          <button
            onClick={() => setEnabled(!enabled)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              enabled ? "bg-(--color-primary)" : "bg-(--color-muted)/30"
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                enabled ? "right-1" : "left-1"
              }`}
            />
          </button>
        </div>

        {enabled && (
          <>
            {/* Start Date */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-(--color-secondary) mb-2">
                <Calendar size={16} />
                تاريخ البداية
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl outline-none transition-all"
                style={{
                  backgroundColor: "var(--color-light)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-dark)",
                }}
              />
            </div>

            {/* Order List */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-(--color-secondary) mb-2">
                <Users size={16} />
                ترتيب الأعضاء ({order.length})
              </label>

              {order.length > 0 && (
                <div className="space-y-2 mb-3">
                  {order.map((memberId, index) => {
                    const member = getMemberById(memberId);
                    if (!member) return null;
                    return (
                      <div
                        key={memberId}
                        className="flex items-center gap-2 p-3 rounded-xl"
                        style={{ backgroundColor: "var(--color-light)" }}
                      >
                        <GripVertical
                          size={16}
                          className="text-(--color-muted)"
                        />
                        <span className="flex-1 font-medium text-(--color-dark)">
                          {index + 1}. {member.name}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleMoveUp(index)}
                            disabled={index === 0}
                            className="p-1 rounded hover:bg-(--color-surface) disabled:opacity-30"
                          >
                            <ChevronUp size={18} />
                          </button>
                          <button
                            onClick={() => handleMoveDown(index)}
                            disabled={index === order.length - 1}
                            className="p-1 rounded hover:bg-(--color-surface) disabled:opacity-30"
                          >
                            <ChevronDown size={18} />
                          </button>
                          <button
                            onClick={() => handleRemoveFromOrder(memberId)}
                            className="p-1 rounded text-(--color-error) hover:bg-(--color-error)/10"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add Member */}
              {availableMembers.length > 0 && (
                <div className="flex gap-2">
                  <select
                    id="addMemberSelect"
                    className="flex-1 px-4 py-2.5 rounded-xl outline-none"
                    style={{
                      backgroundColor: "var(--color-light)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-dark)",
                    }}
                    defaultValue=""
                    onChange={(e) => {
                      handleAddMember(e.target.value);
                      e.target.value = "";
                    }}
                  >
                    <option value="" disabled>
                      اختر عضو للإضافة...
                    </option>
                    {availableMembers.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {order.length < 2 && (
                <p className="text-sm text-(--color-warning) mt-2">
                  ⚠️ يجب اختيار عضوين على الأقل
                </p>
              )}
            </div>
          </>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isUpdatingSettings || (enabled && order.length < 2)}
          className="w-full py-3 bg-(--color-primary) text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={18} />
          {isUpdatingSettings ? "جاري الحفظ..." : "حفظ الإعدادات"}
        </button>
      </div>
    </div>
  );
};

export default DishwashingSettings;
