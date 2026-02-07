import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import {
  User,
  Mail,
  Shield,
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
  Edit,
} from "lucide-react";
import { Input, Loader } from "../../../shared/components";
import useProfile from "../hooks/useProfile";

// Available profile pictures
const availableAvatars = [
  "botttsNeutral-1763768541507.png",
  "botttsNeutral-1763768546369.png",
  "botttsNeutral-1763768550746.png",
  "botttsNeutral-1763768560012.png",
  "botttsNeutral-1763768565019.png",
  "botttsNeutral-1763768569238.png",
  "botttsNeutral-1763768572840.png",
  "botttsNeutral-1763768577274.png",
  "botttsNeutral-1763768581968.png",
  "botttsNeutral-1763768586146.png",
  "botttsNeutral-1763768589940.png",
  "botttsNeutral-1763768594623.png",
  "botttsNeutral-1763768601505.png",
  "botttsNeutral-1763768605149.png",
  "botttsNeutral-1763768608769.png",
  "botttsNeutral-1763768613011.png",
  "botttsNeutral-1763768617031.png",
  "botttsNeutral-1763768621235.png",
  "botttsNeutral-1763768624817.png",
  "botttsNeutral-1763768628084.png",
];

const Profile = () => {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const {
    stats,
    loadingStats,
    updateAvatar,
    updateUsername,
    updateName,
    updateEmail,
    // isUpdatingAvatar removed
    isUpdatingUsername,
    isUpdatingName,
    isUpdatingEmail,
  } = useProfile(user, updateUser);

  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(
    user.profilePicture || null
  );

  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(user.username || "");

  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user.name || "");

  const [editingEmail, setEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState(user.email || "");

  const handleSaveAvatar = async () => {
    await updateAvatar(selectedAvatar);
    setShowAvatarModal(false);
  };

  const handleSaveUsername = async () => {
    // Validation
    if (!newUsername || newUsername.trim() === "") {
      toast.warning("اليوزرنيم مينفعش يكون فاضي");
      return;
    }

    if (newUsername.trim() === user.username) {
      setEditingUsername(false);
      return;
    }

    try {
      await updateUsername(newUsername.trim());
      setEditingUsername(false);
    } catch {
      // Error handled in hook
    }
  };

  const handleCancelEdit = () => {
    setNewUsername(user.username);
    setEditingUsername(false);
  };

  const handleSaveName = async () => {
    // Validation
    if (!newName || newName.trim() === "") {
      toast.warning("الاسم مينفعش يكون فاضي");
      return;
    }

    if (newName.trim() === user.name) {
      setEditingName(false);
      return;
    }

    try {
      await updateName(newName.trim());
      setEditingName(false);
    } catch {
      // Error handled in hook
    }
  };

  const handleCancelNameEdit = () => {
    setNewName(user.name);
    setEditingName(false);
  };

  const handleSaveEmail = async () => {
    // Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newEmail || !emailRegex.test(newEmail)) {
      toast.warning("من فضلك أدخل بريد إلكتروني صحيح");
      return;
    }

    if (newEmail.trim() === user.email) {
      setEditingEmail(false);
      return;
    }

    try {
      await updateEmail(newEmail.trim());
      setEditingEmail(false);
    } catch {
      // Error handled in hook
    }
  };

  const handleCancelEmailEdit = () => {
    setNewEmail(user.email || "");
    setEditingEmail(false);
  };

  if (loadingStats) return <Loader text="بنحمّل بياناتك..." />;

  // Safely handle missing stats
  if (!stats) return null;

  return (
    <div className="pb-8 px-3 sm:px-4 max-w-4xl mx-auto font-primary">
      {/* Header */}
      <div className="flex items-start sm:items-center gap-3 mb-6 sm:mb-8">
        <div
          className="p-3 rounded-2xl border border-(--color-border)"
          style={{ backgroundColor: "var(--color-surface)" }}
        >
          <User size={32} color="var(--color-primary)" />
        </div>
        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold"
            style={{ color: "var(--color-dark)" }}
          >
            الملف الشخصي
          </h1>
          <p className="text-sm" style={{ color: "var(--color-secondary)" }}>
            شوف معلوماتك وإحصائياتك
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <div
        className="backdrop-blur-xl p-4 sm:p-8 rounded-3xl shadow-lg mb-6"
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        {/* Avatar and Name */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6 mb-6">
          <div className="relative">
            {user.profilePicture ? (
              <img
                src={`/profiles/${user.profilePicture}`}
                alt={user.name}
                className="w-24 h-24 rounded-full shadow-lg object-cover"
                style={{ border: "3px solid var(--color-primary)" }}
              />
            ) : (
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-lg"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-primary) 0%, var(--color-info) 100%)",
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <button
              onClick={() => setShowAvatarModal(true)}
              className="absolute bottom-0 right-0 p-2 rounded-full shadow-lg transition-all hover:scale-110"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "white",
              }}
            >
              <Edit size={16} className="cursor-pointer" />
            </button>
          </div>
          <div className="flex-1 min-w-0 w-full">
            {/* Editable Name */}
            <div className="flex items-center gap-2 mb-2 sm:mb-1">
              {editingName ? (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 w-full">
                  <Input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="الاسم"
                    disabled={isUpdatingName}
                    variant="filled"
                    size="sm"
                    wrapperClassName="flex-1"
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={isUpdatingName}
                    className="px-3 py-2 sm:py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap"
                    style={{
                      backgroundColor: "var(--color-success)",
                      color: "white",
                      opacity: isUpdatingName ? 0.6 : 1,
                    }}
                  >
                    {isUpdatingName ? "..." : "حفظ"}
                  </button>
                  <button
                    onClick={handleCancelNameEdit}
                    disabled={isUpdatingName}
                    className="px-3 py-2 sm:py-1 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      backgroundColor: "var(--color-muted-bg)",
                      color: "var(--color-secondary)",
                    }}
                  >
                    إلغاء
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 min-w-0">
                  <h2
                    className="text-xl sm:text-2xl font-bold break-words"
                    style={{ color: "var(--color-dark)" }}
                  >
                    {user.name}
                  </h2>
                  <button
                    onClick={() => setEditingName(true)}
                    className="p-1 rounded-lg hover:bg-opacity-10 transition-all"
                    style={{
                      color: "var(--color-primary)",
                    }}
                    title="تعديل الاسم"
                  >
                    <Edit size={16} className="cursor-pointer" />
                  </button>
                </div>
              )}
            </div>
            {/* Editable Email */}
            <div className="flex items-start gap-2 mb-2">
              <Mail
                size={16}
                style={{ color: "var(--color-secondary)" }}
                className="mt-1 shrink-0"
              />
              {editingEmail ? (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 min-w-0">
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="example@mail.com"
                    disabled={isUpdatingEmail}
                    variant="filled"
                    size="sm"
                    wrapperClassName="flex-1"
                    className="dir-ltr text-left"
                  />
                  <button
                    onClick={handleSaveEmail}
                    disabled={isUpdatingEmail}
                    className="px-3 py-2 sm:py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap"
                    style={{
                      backgroundColor: "var(--color-success)",
                      color: "white",
                      opacity: isUpdatingEmail ? 0.6 : 1,
                    }}
                  >
                    {isUpdatingEmail ? "..." : "حفظ"}
                  </button>
                  <button
                    onClick={handleCancelEmailEdit}
                    disabled={isUpdatingEmail}
                    className="px-3 py-2 sm:py-1 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      backgroundColor: "var(--color-muted-bg)",
                      color: "var(--color-secondary)",
                    }}
                  >
                    إلغاء
                  </button>
                </div>
              ) : (
                <div className="flex items-start sm:items-center gap-2 min-w-0">
                  <span
                    style={{
                      color: user.email
                        ? "var(--color-secondary)"
                        : "var(--color-error)",
                    }}
                    className={`${!user.email ? "italic" : ""} text-sm break-all`}
                  >
                    {user.email || "أضف بريدك الإلكتروني لاسترجاع الباسورد"}
                  </span>
                  <button
                    onClick={() => setEditingEmail(true)}
                    className="p-1 rounded-lg hover:bg-opacity-10 transition-all"
                    style={{
                      color: "var(--color-primary)",
                    }}
                    title="تعديل البريد الإلكتروني"
                  >
                    <Edit size={14} className="cursor-pointer" />
                  </button>
                </div>
              )}
            </div>
            {/* Editable Username */}
            <div className="flex items-start gap-2 mb-2">
              <User
                size={16}
                style={{ color: "var(--color-secondary)" }}
                className="mt-1 shrink-0"
              />
              {editingUsername ? (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 min-w-0">
                  <Input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="اليوزرنيم"
                    disabled={isUpdatingUsername}
                    variant="filled"
                    size="sm"
                    wrapperClassName="flex-1"
                  />
                  <button
                    onClick={handleSaveUsername}
                    disabled={isUpdatingUsername}
                    className="px-3 py-2 sm:py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap"
                    style={{
                      backgroundColor: "var(--color-success)",
                      color: "white",
                      opacity: isUpdatingUsername ? 0.6 : 1,
                    }}
                  >
                    {isUpdatingUsername ? "..." : "حفظ"}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isUpdatingUsername}
                    className="px-3 py-2 sm:py-1 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      backgroundColor: "var(--color-muted-bg)",
                      color: "var(--color-secondary)",
                    }}
                  >
                    إلغاء
                  </button>
                </div>
              ) : (
                <div className="flex items-start sm:items-center gap-2 min-w-0">
                  <span className="break-all" style={{ color: "var(--color-secondary)" }}>
                    @{user.username}
                  </span>
                  <button
                    onClick={() => setEditingUsername(true)}
                    className="p-1 rounded-lg hover:bg-opacity-10 transition-all"
                    style={{
                      color: "var(--color-primary)",
                    }}
                    title="تعديل اليوزرنيم"
                  >
                    <Edit size={14} className="cursor-pointer" />
                  </button>
                </div>
              )}
            </div>
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase mt-2"
              style={{
                backgroundColor:
                  user.role === "admin"
                    ? "var(--color-status-pending-bg)"
                    : "var(--color-primary-bg)",
                color:
                  user.role === "admin"
                    ? "var(--color-status-pending)"
                    : "var(--color-primary)",
                border:
                  user.role === "admin"
                    ? "1px solid var(--color-status-pending-border)"
                    : "1px solid var(--color-primary-border)",
              }}
            >
              {user.role === "admin" ? (
                <>
                  <Shield size={12} />
                  أدمن
                </>
              ) : (
                <>
                  <User size={12} />
                  عضو
                </>
              )}
            </span>
          </div>
        </div>

        {/* User Info Grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{ backgroundColor: "var(--color-bg)" }}
          >
            <Calendar size={20} style={{ color: "var(--color-primary)" }} />
            <div>
              <p
                className="text-xs"
                style={{ color: "var(--color-secondary)" }}
              >
                عضو من
              </p>
              <p
                className="font-semibold"
                style={{ color: "var(--color-dark)" }}
              >
                {new Date(user.createdAt).toLocaleDateString("ar-EG", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          <div
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{ backgroundColor: "var(--color-bg)" }}
          >
            <DollarSign
              size={20}
              style={{
                color:
                  stats.balance < 0
                    ? "var(--color-error)"
                    : "var(--color-success)",
              }}
            />
            <div>
              <p
                className="text-xs"
                style={{ color: "var(--color-secondary)" }}
              >
                الرصيد الحالي
              </p>
              <p
                className="font-semibold text-lg"
                style={{
                  color:
                    stats.balance < 0
                      ? "var(--color-error)"
                      : "var(--color-success)",
                }}
              >
                {stats.balance < 0
                  ? `عليك ${Math.abs(stats.balance).toFixed(2)}`
                  : stats.balance > 0
                  ? `ليك ${stats.balance.toFixed(2)}`
                  : "0.00"}{" "}
                جنيه
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div
          className="p-5 rounded-2xl"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} style={{ color: "var(--color-error)" }} />
            <p className="text-sm" style={{ color: "var(--color-secondary)" }}>
              إجمالي المصاريف
            </p>
          </div>
          <p
            className="text-2xl font-bold"
            style={{ color: "var(--color-dark)" }}
          >
            {stats.totalOwed.toFixed(2)}
          </p>
          <p className="text-xs" style={{ color: "var(--color-muted)" }}>
            جنيه
          </p>
        </div>

        <div
          className="p-5 rounded-2xl"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={18} style={{ color: "var(--color-success)" }} />
            <p className="text-sm" style={{ color: "var(--color-secondary)" }}>
              إجمالي المدفوع
            </p>
          </div>
          <p
            className="text-2xl font-bold"
            style={{ color: "var(--color-dark)" }}
          >
            {stats.totalPaid.toFixed(2)}
          </p>
          <p className="text-xs" style={{ color: "var(--color-muted)" }}>
            جنيه
          </p>
        </div>

        <div
          className="p-5 rounded-2xl"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} style={{ color: "var(--color-info)" }} />
            <p className="text-sm" style={{ color: "var(--color-secondary)" }}>
              عدد المصاريف
            </p>
          </div>
          <p
            className="text-2xl font-bold"
            style={{ color: "var(--color-dark)" }}
          >
            {stats.expensesCount}
          </p>
          <p className="text-xs" style={{ color: "var(--color-muted)" }}>
            مصروف
          </p>
        </div>

        <div
          className="p-5 rounded-2xl"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={18} style={{ color: "var(--color-primary)" }} />
            <p className="text-sm" style={{ color: "var(--color-secondary)" }}>
              عدد الدفعات
            </p>
          </div>
          <p
            className="text-2xl font-bold"
            style={{ color: "var(--color-dark)" }}
          >
            {stats.paymentsCount}
          </p>
          <p className="text-xs" style={{ color: "var(--color-muted)" }}>
            دفعة
          </p>
        </div>
      </div>

      {/* Payments Status */}
      <div
        className="backdrop-blur-xl p-6 rounded-3xl shadow-lg"
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <h3
          className="text-lg font-bold mb-4"
          style={{ color: "var(--color-dark)" }}
        >
          حالة الدفعات
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className="p-4 rounded-xl"
            style={{ backgroundColor: "var(--color-bg)" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock
                size={18}
                style={{ color: "var(--color-status-pending)" }}
              />
              <p
                className="text-sm font-semibold"
                style={{ color: "var(--color-secondary)" }}
              >
                دفعات منتظرة
              </p>
            </div>
            <p
              className="text-3xl font-bold"
              style={{ color: "var(--color-status-pending)" }}
            >
              {stats.pendingPayments}
            </p>
          </div>

          <div
            className="p-4 rounded-xl"
            style={{ backgroundColor: "var(--color-bg)" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle
                size={18}
                style={{ color: "var(--color-status-approved)" }}
              />
              <p
                className="text-sm font-semibold"
                style={{ color: "var(--color-secondary)" }}
              >
                دفعات موافق عليها
              </p>
            </div>
            <p
              className="text-3xl font-bold"
              style={{ color: "var(--color-status-approved)" }}
            >
              {stats.approvedPayments}
            </p>
          </div>
        </div>
      </div>

      {/* Avatar Selector Modal */}
      {showAvatarModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAvatarModal(false)}
        >
          <div
            className="backdrop-blur-xl p-4 sm:p-6 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
              <h3
                className="text-xl sm:text-2xl font-bold mb-4"
                style={{ color: "var(--color-dark)" }}
              >
                اختر صورة الملف الشخصي
              </h3>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4 mb-6">
              {availableAvatars.map((avatar) => (
                <div
                  key={avatar}
                  onClick={() => setSelectedAvatar(avatar)}
                  className="cursor-pointer transition-all hover:scale-105"
                  style={{
                    padding: "4px",
                    borderRadius: "16px",
                    border:
                      selectedAvatar === avatar
                        ? "3px solid var(--color-primary)"
                        : "3px solid transparent",
                  }}
                >
                  <img
                    src={`/profiles/${avatar}`}
                    alt="Avatar"
                    className="w-full h-full rounded-xl object-cover"
                    style={{ aspectRatio: "1/1" }}
                  />
                </div>
              ))}
            </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3">
              <button
                onClick={handleSaveAvatar}
                className="flex-1 py-3 px-4 text-white font-bold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
                style={{ backgroundColor: "var(--color-primary)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--color-dark)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--color-primary)")
                }
              >
                احفظ
              </button>
              <button
                onClick={() => setShowAvatarModal(false)}
                className="flex-1 py-3 px-4 font-bold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
                style={{
                  backgroundColor: "var(--color-bg)",
                  color: "var(--color-dark)",
                  border: "1px solid var(--color-border)",
                }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
