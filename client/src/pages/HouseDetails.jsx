import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import Loader from "../components/Loader";
import Toast from "../components/Toast";
import Input from "../components/Input";
import {
  Home,
  Users,
  Crown,
  Edit2,
  Save,
  X,
  LogOut,
  UserX,
  Trash2,
} from "lucide-react";

import ConfirmModal from "../components/ConfirmModal";

const HouseDetails = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [houseData, setHouseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [newHouseName, setNewHouseName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Modal State
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "danger",
    onConfirm: () => {},
  });

  useEffect(() => {
    if (!user?.house) {
      navigate("/house-selection");
      return;
    }
    fetchHouseDetails();
  }, [user, navigate]);

  const fetchHouseDetails = async () => {
    try {
      const { data } = await api.get(`/houses/${user.house._id}`);
      setHouseData(data);
      setNewHouseName(data.name);
    } catch (err) {
      setError("فشل تحميل بيانات البيت");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateHouseName = async (e) => {
    e.preventDefault();
    if (!newHouseName.trim()) {
      setError("اسم البيت لا يمكن أن يكون فارغاً");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await api.patch(`/houses/${user.house._id}/name`, {
        name: newHouseName.trim(),
      });
      setSuccess("تم تحديث اسم البيت بنجاح");
      setIsEditing(false);
      await fetchHouseDetails();
      // Refresh user data
      const { data: userData } = await api.get("/auth/me");
      updateUser(userData);
    } catch (err) {
      setError(err.response?.data?.message || "فشل تحديث اسم البيت");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmAction = (title, message, action, type = "danger") => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      type,
      onConfirm: async () => {
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
        await action();
      },
    });
  };

  const handleRemoveMember = (memberId, memberName) => {
    confirmAction(
      "إزالة عضو",
      `هل أنت متأكد من إزالة ${memberName} من البيت؟`,
      async () => {
        setSubmitting(true);
        setError("");
        setSuccess("");
        try {
          await api.delete(`/houses/${user.house._id}/members/${memberId}`);
          setSuccess(`تم إزالة ${memberName} من البيت بنجاح`);
          await fetchHouseDetails();
        } catch (err) {
          setError(err.response?.data?.message || "فشل إزالة العضو");
        } finally {
          setSubmitting(false);
        }
      }
    );
  };

  const handleLeaveHouse = () => {
    confirmAction(
      "مغادرة البيت",
      "هل أنت متأكد من الخروج من هذا البيت؟",
      async () => {
        setSubmitting(true);
        setError("");
        try {
          await api.post(`/houses/${user.house._id}/leave`);
          setSuccess("تم الخروج من البيت بنجاح");
          // Refresh user data and redirect
          const { data: userData } = await api.get("/auth/me");
          updateUser(userData);
          setTimeout(() => {
            navigate("/house-selection");
          }, 1500);
        } catch (err) {
          setError(err.response?.data?.message || "فشل الخروج من البيت");
        } finally {
          setSubmitting(false);
        }
      }
    );
  };

  const handleDeleteHouse = () => {
    confirmAction(
      "حذف البيت نهائياً",
      "هل أنت متأكد من حذف البيت نهائياً؟ هذا الإجراء لا يمكن التراجع عنه وسيتم إخراج جميع الأعضاء.",
      async () => {
        setSubmitting(true);
        setError("");
        try {
          await api.delete(`/houses/${user.house._id}`);
          setSuccess("تم حذف البيت بنجاح");
          // Refresh user data and redirect
          const { data: userData } = await api.get("/auth/me");
          updateUser(userData);
          setTimeout(() => {
            navigate("/house-selection");
          }, 1500);
        } catch (err) {
          setError(err.response?.data?.message || "فشل حذف البيت");
        } finally {
          setSubmitting(false);
        }
      }
    );
  };

  const isAdmin = user?.house && houseData && user.id === houseData.admin._id;

  if (loading) {
    return <Loader text="بنحمّل بيانات البيت..." />;
  }

  if (!houseData) {
    return (
      <div className="text-center py-12">
        <p style={{ color: "var(--color-muted)" }}>
          لم يتم العثور على بيانات البيت
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto font-primary">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="p-3 rounded-xl"
            style={{ backgroundColor: "var(--color-primary-bg)" }}
          >
            <Home
              className="w-8 h-8"
              style={{ color: "var(--color-primary)" }}
            />
          </div>
          <h1
            className="text-3xl font-bold font-headings"
            style={{ color: "var(--color-dark)" }}
          >
            تفاصيل البيت
          </h1>
        </div>
        <p style={{ color: "var(--color-muted)" }}>
          معلومات وإدارة البيت الخاص بك
        </p>
      </div>

      {error && (
        <Toast message={error} type="error" onClose={() => setError("")} />
      )}
      {success && (
        <Toast
          message={success}
          type="success"
          onClose={() => setSuccess("")}
        />
      )}

      <div className="space-y-6">
        {/* House Name Card */}
        <div
          className="rounded-2xl shadow-lg p-6"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
            borderWidth: "1px",
            borderStyle: "solid",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-xl font-semibold"
              style={{ color: "var(--color-dark)" }}
            >
              اسم البيت
            </h2>
            {isAdmin && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 transition-colors"
                style={{ color: "var(--color-primary)" }}
              >
                <Edit2 className="w-4 h-4" />
                تعديل
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleUpdateHouseName} className="flex gap-3">
              <Input
                value={newHouseName}
                onChange={(e) => setNewHouseName(e.target.value)}
                disabled={submitting}
                autoFocus
                variant="filled" // Using filled variant to match general style
                wrapperClassName="flex-1"
              />
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "white",
                }}
              >
                <Save className="w-5 h-5" />
                حفظ
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setNewHouseName(houseData.name);
                }}
                disabled={submitting}
                className="px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
                style={{
                  backgroundColor: "var(--color-light)",
                  color: "var(--color-dark)",
                }}
              >
                <X className="w-5 h-5" />
                إلغاء
              </button>
            </form>
          ) : (
            <p
              className="text-2xl font-bold"
              style={{ color: "var(--color-dark)" }}
            >
              {houseData.name}
            </p>
          )}
        </div>

        {/* Admin Info Card */}
        <div
          className="rounded-2xl shadow-lg p-6"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
            borderWidth: "1px",
            borderStyle: "solid",
          }}
        >
          <h2
            className="text-xl font-semibold mb-4 flex items-center gap-2"
            style={{ color: "var(--color-dark)" }}
          >
            <Crown className="w-5 h-5" style={{ color: "#eab308" }} />
            مدير البيت
          </h2>
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
              style={{
                background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                color: "white",
              }}
            >
              {houseData.admin.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p
                className="font-semibold"
                style={{ color: "var(--color-dark)" }}
              >
                {houseData.admin.name}
              </p>
              <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                @{houseData.admin.username}
              </p>
            </div>
            {isAdmin && (
              <span
                className="mr-auto px-3 py-1 rounded-full text-sm font-semibold"
                style={{
                  backgroundColor: "#fef3c7",
                  color: "#92400e",
                }}
              >
                أنت المدير
              </span>
            )}
          </div>
        </div>

        {/* Members Card */}
        <div
          className="rounded-2xl shadow-lg p-6"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
            borderWidth: "1px",
            borderStyle: "solid",
          }}
        >
          <h2
            className="text-xl font-semibold mb-4 flex items-center gap-2"
            style={{ color: "var(--color-dark)" }}
          >
            <Users
              className="w-5 h-5"
              style={{ color: "var(--color-primary)" }}
            />
            الأعضاء ({houseData.members.length})
          </h2>
          <div className="space-y-3">
            {houseData.members.map((member) => (
              <div
                key={member._id}
                className="flex items-center gap-4 p-4 rounded-xl"
                style={{
                  backgroundColor: "var(--color-hover)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                  style={{
                    background:
                      "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
                    color: "white",
                  }}
                >
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p
                    className="font-semibold"
                    style={{ color: "var(--color-dark)" }}
                  >
                    {member.name}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: "var(--color-muted)" }}
                  >
                    @{member.username}
                  </p>
                </div>
                {member._id === houseData.admin._id && (
                  <span
                    className="px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
                    style={{
                      backgroundColor: "#fef3c7",
                      color: "#92400e",
                    }}
                  >
                    <Crown className="w-3 h-3" />
                    مدير
                  </span>
                )}
                {member._id === user.id &&
                  member._id !== houseData.admin._id && (
                    <span
                      className="px-2 py-1 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: "var(--color-primary-bg)",
                        color: "var(--color-primary)",
                      }}
                    >
                      أنت
                    </span>
                  )}
                {isAdmin && member._id !== houseData.admin._id && (
                  <button
                    onClick={() => handleRemoveMember(member._id, member.name)}
                    disabled={submitting}
                    className="p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      color: "var(--color-error)",
                      backgroundColor: "var(--color-status-rejected-bg)",
                    }}
                    title="إزالة من البيت"
                  >
                    <UserX className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions Card */}
        <div
          className="rounded-2xl shadow-lg p-6"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
            borderWidth: "1px",
            borderStyle: "solid",
          }}
        >
          <h2
            className="text-xl font-semibold mb-4"
            style={{ color: "var(--color-dark)" }}
          >
            الإجراءات
          </h2>
          {isAdmin ? (
            <button
              onClick={handleDeleteHouse}
              disabled={submitting}
              className="w-full font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              style={{
                backgroundColor: "var(--color-error)",
                color: "white",
              }}
            >
              <Trash2 className="w-5 h-5" />
              حذف البيت نهائياً
            </button>
          ) : (
            <button
              onClick={handleLeaveHouse}
              disabled={submitting}
              className="w-full font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              style={{
                backgroundColor: "var(--color-error)",
                color: "white",
              }}
            >
              <LogOut className="w-5 h-5" />
              مغادرة البيت
            </button>
          )}
        </div>
      </div>

      {/* Reusable Confirm Modal */}
      <ConfirmModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
      />
    </div>
  );
};

export default HouseDetails;
