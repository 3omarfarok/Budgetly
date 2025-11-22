import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../utils/api";
import { PlusCircle, Check } from "lucide-react";

import Loader from "../components/Loader";

// صفحة إضافة مصروف - تصميم iOS
const AddExpense = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    description: "",
    category: "General",
    totalAmount: "",
    splitType: "equal",
  });
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/");
    }
    fetchUsers();
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/users");
      setUsers(data);
    } catch (error) {
      console.error("خطأ في تحميل المستخدمين:", error);
      toast.error("فيه مشكلة في تحميل المستخدمين");
    } finally {
      setLoading(false);
    }
  };

  const handleSplitTypeChange = (e) => {
    const newSplitType = e.target.value;
    setFormData({ ...formData, splitType: newSplitType });
    if (newSplitType === "equal") {
      setSelectedUsers([]);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.splitType === "specific" && selectedUsers.length === 0) {
      toast.warning("يرجى اختيار مستخدم واحد على الأقل");
      return;
    }

    try {
      const expenseData = {
        ...formData,
        totalAmount: Number(formData.totalAmount),
      };

      if (formData.splitType === "specific") {
        expenseData.selectedUsers = selectedUsers;
      }

      await api.post("/expenses", expenseData);
      toast.success("تم تسجيل المصروف بنجاح!");
      navigate("/expenses");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "خطأ في إنشاء المصروف";
      toast.error(errorMessage);
      setError(errorMessage);
    }
  };

  if (user?.role !== "admin") return null;
  if (loading) return <Loader text="بنحمّل البيانات..." />;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div
          className="p-3 rounded-2xl"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--color-primary) 10%, transparent)",
          }}
        >
          <PlusCircle style={{ color: "var(--color-primary)" }} size={32} />
        </div>
        <h1
          className="text-3xl font-bold"
          style={{ color: "var(--color-dark)" }}
        >
          سجّل مصروف جديد
        </h1>
      </div>

      {error && (
        <div
          className="p-4 rounded-2xl mb-6"
          style={{
            backgroundColor: "var(--color-status-rejected-bg)",
            color: "var(--color-error)",
            border: "1px solid var(--color-status-rejected-border)",
          }}
        >
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="backdrop-blur-xl p-8 rounded-3xl space-y-6 shadow-lg"
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div>
          <label
            className="block text-sm font-semibold mb-2"
            style={{ color: "var(--color-dark)" }}
          >
            وصف المصروف
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-5 py-3.5 rounded-2xl transition-all focus:outline-none focus:ring-2"
            style={{
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              color: "var(--color-dark)",
            }}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: "var(--color-dark)" }}
            >
              النوع
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-5 py-3.5 rounded-2xl transition-all focus:outline-none focus:ring-2 appearance-none  "
              style={{
                backgroundColor: "var(--color-bg)",
                border: "1px solid var(--color-border)",
                color: "var(--color-dark)",
              }}
            >
              <option value="General">عام</option>
              <option value="Food">أكل وشرب</option>
              <option value="Transport">مواصلات</option>
              <option value="Utilities">فواتير</option>
              <option value="Entertainment">ترفيه</option>
              <option value="Housing">سكن</option>
              <option value="Other">حاجات تانية</option>
            </select>
          </div>

          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: "var(--color-dark)" }}
            >
              الفلوس (جنيه)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.totalAmount}
              onChange={(e) =>
                setFormData({ ...formData, totalAmount: e.target.value })
              }
              className="w-full px-5 py-3.5 rounded-2xl transition-all focus:outline-none focus:ring-2 appearance-none"
              style={{
                backgroundColor: "var(--color-bg)",
                border: "1px solid var(--color-border)",
                color: "var(--color-dark)",
              }}
              required
            />
          </div>
        </div>

        <div>
          <label
            className="block text-sm font-semibold mb-2"
            style={{ color: "var(--color-dark)" }}
          >
            هنقسمها إزاي
          </label>
          <select
            value={formData.splitType}
            onChange={handleSplitTypeChange}
            className="w-full px-5 py-3.5 rounded-2xl transition-all focus:outline-none focus:ring-2 appearance-none"
            style={{
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              color: "var(--color-dark)",
            }}
          >
            <option value="equal">قسّمها على الكل</option>
            <option value="specific">قسّمها على ناس معينة</option>
          </select>
        </div>

        {formData.splitType === "specific" && (
          <div
            className="p-5 rounded-2xl"
            style={{
              backgroundColor: "var(--color-muted-bg)",
              border: "1px solid var(--color-border)",
            }}
          >
            <label
              className="block text-sm font-semibold mb-3"
              style={{ color: "var(--color-dark)" }}
            >
              اختار مين هيدفع
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {users.map((u) => (
                <div
                  key={u._id}
                  onClick={() => toggleUserSelection(u._id)}
                  className="flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all"
                  style={
                    selectedUsers.includes(u._id)
                      ? {
                          backgroundColor: "var(--color-primary-bg)",
                          border: "1px solid var(--color-primary-border)",
                        }
                      : {
                          backgroundColor: "var(--color-surface)",
                          border: "1px solid var(--color-border)",
                        }
                  }
                  onMouseEnter={(e) => {
                    if (!selectedUsers.includes(u._id)) {
                      e.currentTarget.style.backgroundColor =
                        "var(--color-hover)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!selectedUsers.includes(u._id)) {
                      e.currentTarget.style.backgroundColor =
                        "var(--color-surface)";
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
                      style={
                        selectedUsers.includes(u._id)
                          ? {
                              backgroundColor: "var(--color-primary)",
                              borderColor: "var(--color-primary)",
                            }
                          : {
                              borderColor: "var(--color-secondary)",
                            }
                      }
                    >
                      {selectedUsers.includes(u._id) && (
                        <Check size={16} className="text-white" />
                      )}
                    </div>
                    <span
                      className="font-semibold"
                      style={{ color: "var(--color-dark)" }}
                    >
                      {u.name}
                    </span>
                  </div>
                  <span
                    className="text-sm"
                    style={{ color: "var(--color-secondary)" }}
                  >
                    @{u.username}
                  </span>
                </div>
              ))}
            </div>
            <p
              className="text-xs mt-3"
              style={{ color: "var(--color-secondary)" }}
            >
              اخترت: {selectedUsers.length} من {users.length} شخص
            </p>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-4 px-4 cursor-pointer text-white font-bold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl  mt-4 flex items-center justify-center gap-2"
          style={{ backgroundColor: "var(--color-primary)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--color-dark)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--color-primary)")
          }
        >
          سجّل المصروف
        </button>
      </form>
    </div>
  );
};

export default AddExpense;
