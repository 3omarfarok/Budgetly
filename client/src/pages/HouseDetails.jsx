import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Users,
  Settings,
  LogOut,
  Trash2,
  Shield,
  Key,
  Home,
  UserX,
  Copy,
  CheckCheck,
  Download,
  FileSpreadsheet,
  AlertTriangle,
  UtensilsCrossed,
} from "lucide-react";
import Loader from "../components/Loader";
import Input from "../components/Input";
import ConfirmModal from "../components/ConfirmModal";
import useHouse from "../hooks/useHouse";
import DishwashingSettings from "../components/dishwashing/DishwashingSettings";

const HouseDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const userId = user?.id || user?._id;

  const houseId =
    id || (typeof user?.house === "object" ? user?.house?._id : user?.house);

  const {
    house,
    loading,
    error,
    updateName,
    updatePassword,
    removeMember,
    leaveHouse,
    deleteHouse,
    clearAllData,
    exportData,
    isUpdatingName,
    isUpdatingPassword,
    isClearingData,
  } = useHouse(houseId);

  const [activeTab, setActiveTab] = useState("members");

  // Edit Name State
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");

  // Edit Password State
  const [editingPassword, setEditingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  // Modals State
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showClearDataModal, setShowClearDataModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);

  // Copy ID State
  const [copiedId, setCopiedId] = useState(false);

  // Initialize newName when house is loaded
  useEffect(() => {
    if (house) {
      setNewName(house.name);
    }
  }, [house]);

  const isAdmin = house?.admin?._id === userId;

  const handleCopyId = () => {
    navigator.clipboard.writeText(house._id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleUpdateName = async () => {
    if (!newName.trim()) return;
    try {
      await updateName(newName.trim());
      setEditingName(false);
    } catch {
      // Handled in hook
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword.trim()) return;
    try {
      await updatePassword(newPassword.trim());
      setEditingPassword(false);
      setNewPassword("");
    } catch {
      // Handled in hook
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    try {
      await removeMember(memberToRemove._id);
      setMemberToRemove(null);
    } catch {
      // Handled in hook
    }
  };

  const handleLeaveHouse = async () => {
    try {
      await leaveHouse();
    } catch {
      // Handled in hook
    }
  };

  const handleDeleteHouse = async () => {
    try {
      await deleteHouse();
    } catch {
      // Handled in hook
    }
  };

  const handleClearAllData = async () => {
    try {
      await clearAllData();
      setShowClearDataModal(false);
    } catch {
      // Handled in hook
    }
  };

  const handleExport = async (type) => {
    await exportData(type);
  };

  if (loading) return <Loader text="بنحمّل تفاصيل البيت..." />;

  if (error || !house) {
    return (
      <div className="text-center py-20 text-red-500">
        مش قادرين نحمل تفاصيل البيت حالياً
      </div>
    );
  }

  return (
    <div className="pb-8 px-3 sm:px-4 max-w-4xl mx-auto font-primary">
      {/* Header */}
      <div className="bg-(--color-surface) rounded-2xl p-4 sm:p-6 shadow-sm border border-(--color-border) mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="p-3 bg-(--color-primary)/10 rounded-xl">
              <Home className="text-(--color-primary)" size={32} />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-(--color-dark) break-words">
                {house.name}
              </h1>
              <div
                className="flex items-start sm:items-center gap-2 text-xs sm:text-sm text-(--color-muted) cursor-pointer hover:text-(--color-primary) transition-colors break-all"
                onClick={handleCopyId}
                title="نسخ كود البيت"
              >
                <span className="leading-relaxed">ID: {house._id}</span>
                {copiedId ? <CheckCheck size={14} /> : <Copy size={14} />}
              </div>
            </div>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setNewName(house.name);
                  setEditingName(true);
                }}
                className="p-2 hover:bg-(--color-bg) rounded-xl transition-colors text-(--color-primary)"
                title="تعديل الاسم"
              >
                <Settings size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Edit Name Form */}
        {editingName && (
          <div className="mb-4 p-4 bg-(--color-bg) rounded-xl border border-(--color-border)">
            <h3 className="font-bold mb-3 text-sm">تغيير اسم البيت</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="اسم البيت الجديد"
                className="flex-1"
              />
              <button
                onClick={handleUpdateName}
                disabled={isUpdatingName}
                className="px-4 py-2 bg-(--color-primary) text-white rounded-xl font-bold disabled:opacity-50"
              >
                {isUpdatingName ? "حفظ..." : "حفظ"}
              </button>
              <button
                onClick={() => setEditingName(false)}
                className="px-4 py-2 bg-(--color-surface) border border-(--color-border) rounded-xl font-bold"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="p-4 bg-(--color-bg) rounded-xl text-center">
            <p className="text-(--color-muted) text-sm mb-1">الأعضاء</p>
            <p className="text-2xl font-bold text-(--color-dark)">
              {house.members.length}
            </p>
          </div>
          <div className="p-4 bg-(--color-bg) rounded-xl text-center">
            <p className="text-(--color-muted) text-sm mb-1">الأدمن</p>
            <p className="font-bold text-(--color-primary)">
              {house.admin.name}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 p-1 bg-(--color-surface) rounded-xl border border-(--color-border) overflow-x-auto">
        <div className="flex gap-2 min-w-full">
        <button
          onClick={() => setActiveTab("members")}
          className={`min-w-[120px] sm:min-w-0 sm:flex-1 py-2 px-4 rounded-lg font-bold whitespace-nowrap transition-all ${
            activeTab === "members"
              ? "bg-(--color-primary) text-white shadow-md"
              : "text-(--color-muted) hover:bg-(--color-bg)"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Users size={18} />
            <span>الأعضاء</span>
          </div>
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab("settings")}
            className={`min-w-[120px] sm:min-w-0 sm:flex-1 py-2 px-4 rounded-lg font-bold whitespace-nowrap transition-all ${
              activeTab === "settings"
                ? "bg-(--color-primary) text-white shadow-md"
                : "text-(--color-muted) hover:bg-(--color-bg)"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Settings size={18} />
              <span>إعدادات</span>
            </div>
          </button>
        )}
        {isAdmin && (
          <button
            onClick={() => setActiveTab("dishwashing")}
            className={`min-w-[120px] sm:min-w-0 sm:flex-1 py-2 px-4 rounded-lg font-bold whitespace-nowrap transition-all ${
              activeTab === "dishwashing"
                ? "bg-(--color-primary) text-white shadow-md"
                : "text-(--color-muted) hover:bg-(--color-bg)"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <UtensilsCrossed size={18} />
              <span>الأطباق</span>
            </div>
          </button>
        )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === "members" && (
          <div className="space-y-3">
            {house.members.map((member) => (
              <div
                key={member._id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-(--color-surface) rounded-xl border border-(--color-border) shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative">
                    {member.profilePicture ? (
                      <img
                        src={`/profiles/${member.profilePicture}`}
                        alt={member.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-(--color-border)"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-(--color-primary)/10 flex items-center justify-center text-(--color-primary) font-bold text-lg border-2 border-(--color-primary)/20">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {house.admin._id === member._id && (
                      <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-white p-1 rounded-full shadow-sm">
                        <Shield size={10} fill="currentColor" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-(--color-dark) break-words">
                      {member.name}
                      {userId === member._id && (
                        <span className="text-xs text-(--color-muted) mr-2">
                          (أنت)
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-(--color-muted) break-all">
                      @{member.username}
                    </p>
                  </div>
                </div>

                {isAdmin && member._id !== userId && (
                  <button
                    onClick={() => setMemberToRemove(member)}
                    className="self-end sm:self-auto p-2 text-(--color-error) hover:bg-(--color-error)/10 cursor-pointer rounded-lg transition-colors"
                    title="حذف العضو"
                  >
                    <UserX size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === "settings" && isAdmin && (
          <div className="space-y-6">
            {/* Change Password */}
            <div className="bg-(--color-surface) p-4 sm:p-6 rounded-2xl border border-(--color-border) shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-(--color-primary)/10 text-(--color-primary) rounded-lg">
                  <Key size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-(--color-dark)">
                    باسوورد البيت
                  </h3>
                  <p className="text-xs text-(--color-muted)">
                    تغيير الباسوورد المستخدم للانضمام للبيت
                  </p>
                </div>
              </div>

              {editingPassword ? (
                <div className="space-y-3">
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="الباسوورد الجديد"
                  />
                  <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
                    <button
                      onClick={() => setEditingPassword(false)}
                      className="px-4 py-2 text-sm font-bold  cursor-pointer text-(--color-muted) hover:bg-(--color-bg) rounded-xl"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={handleUpdatePassword}
                      disabled={isUpdatingPassword}
                      className="px-4 py-2 text-sm font-bold cursor-pointer bg-(--color-primary) text-white rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {isUpdatingPassword
                        ? "جاري التغيير..."
                        : "تغيير الباسوورد"}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setEditingPassword(true)}
                  className="w-full py-3 border-2 border-dashed border-(--color-border) rounded-xl text-(--color-muted) font-bold hover:border-(--color-primary) hover:text-(--color-primary) transition-all"
                >
                  تغيير الباسوورد
                </button>
              )}
            </div>

            {/* Data Export Section */}
            <div className="bg-(--color-surface) p-4 sm:p-6 rounded-2xl border border-(--color-border) shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-(--color-success)/10 text-(--color-success) rounded-lg">
                  <Download size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-(--color-dark)">
                    تصدير البيانات
                  </h3>
                  <p className="text-xs text-(--color-muted)">
                    تحميل البيانات كملف CSV
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => handleExport("expenses")}
                  className="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-(--color-border) rounded-xl text-(--color-secondary) font-bold hover:border-(--color-success) hover:text-(--color-success) transition-all"
                >
                  <FileSpreadsheet size={18} />
                  تصدير المصاريف
                </button>
                <button
                  onClick={() => handleExport("invoices")}
                  className="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-(--color-border) rounded-xl text-(--color-secondary) font-bold hover:border-(--color-success) hover:text-(--color-success) transition-all"
                >
                  <FileSpreadsheet size={18} />
                  تصدير الفواتير
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-(--color-surface) p-4 sm:p-6 rounded-2xl border border-(--color-error)/30 shadow-sm">
              <h3 className="font-bold text-(--color-error) mb-4 flex items-center gap-2">
                <div className="p-2 bg-(--color-error)/10 text-(--color-error) rounded-lg">
                  <AlertTriangle size={20} />
                </div>
                منطقة الخطر
              </h3>

              <div className="flex flex-col gap-3">
                {/* Clear All Data */}
                <button
                  onClick={() => setShowClearDataModal(true)}
                  disabled={isClearingData}
                  className="flex items-center justify-between p-4 hover:bg-(--color-warning)/10 rounded-xl border border-(--color-warning) text-(--color-warning) cursor-pointer transition-all shadow-sm group disabled:opacity-50"
                >
                  <div className="text-right">
                    <span className="font-bold block">مسح كل البيانات</span>
                    <span className="text-xs opacity-75">
                      حذف جميع المصاريف والفواتير
                    </span>
                  </div>
                  <Trash2
                    size={20}
                    className="group-hover:scale-110 transition-transform"
                  />
                </button>

                {/* Delete House */}
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center justify-between p-4 hover:bg-(--color-error)/20 rounded-xl border border-(--color-error) text-(--color-error) cursor-pointer transition-all shadow-sm group"
                >
                  <div className="text-right">
                    <span className="font-bold block">حذف البيت بالكامل</span>
                    <span className="text-xs opacity-75">
                      إجراء نهائي لا يمكن التراجع عنه
                    </span>
                  </div>
                  <Trash2
                    size={20}
                    className="group-hover:scale-110 transition-transform"
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "dishwashing" && isAdmin && (
          <DishwashingSettings
            houseId={houseId}
            members={house?.members || []}
            isAdmin={isAdmin}
          />
        )}
      </div>

      {/* Leave House Button (Visible to everyone) */}
      <div className="mt-8 pt-6 border-t border-(--color-border)">
        <button
          onClick={() => setShowLeaveModal(true)}
          className="w-full border cursor-pointer flex items-center justify-center gap-2 py-3 text-(--color-error) font-bold hover:bg-(--color-error)/10 rounded-xl transition-all"
        >
          <LogOut size={20} />
          مغادرة البيت
        </button>
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleRemoveMember}
        title="حذف عضو"
        message={`متأكد إنك عايز تحذف ${memberToRemove?.name} من البيت؟`}
        confirmText="حذف"
        cancelText="إلغاء"
        type="danger"
      />

      <ConfirmModal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        onConfirm={handleLeaveHouse}
        title="مغادرة البيت"
        message="متأكد إنك عايز تخرج من البيت ده؟ مش هتقدر تشوف المصاريف تاني."
        confirmText="مغادرة"
        cancelText="إلغاء"
        type="danger"
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteHouse}
        title="حذف البيت"
        message="تحذير: الإجراء ده نهائي! كل البيانات والمصاريف هتتحذف تماماً ومحدش هيقدر يرجعها. متأكد؟"
        confirmText="حذف نهائي"
        cancelText="إلغاء"
        type="danger"
      />

      <ConfirmModal
        isOpen={showClearDataModal}
        onClose={() => setShowClearDataModal(false)}
        onConfirm={handleClearAllData}
        title="مسح كل البيانات"
        message="هيتم حذف كل المصاريف والفواتير والمدفوعات. البيت والأعضاء هيفضلوا زي ما هم. متأكد؟"
        confirmText="مسح البيانات"
        cancelText="إلغاء"
        type="danger"
      />
    </div>
  );
};

export default HouseDetails;
