import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../utils/api";
import { Users, UserPlus, ShieldCheck, User as UserIcon } from "lucide-react";

import Loader from "../components/Loader";

// صفحة الأعضاء - تصميم iOS
const Members = () => {
  const [members, setMembers] = useState([]);
  const { user } = useAuth();
  const toast = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/users");
      setMembers(data);
    } catch (error) {
      console.error("خطأ في تحميل الأعضاء:", error);
      toast.error("فيه مشكلة في تحميل الأعضاء");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/users", formData);
      setMembers([...members, data]);
      setShowAddForm(false);
      setFormData({ username: "", password: "", name: "" });
      setError("");
      toast.success("تم إضافة العضو بنجاح!");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "خطأ في إضافة العضو";
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm("هل أنت متأكد من تعطيل هذا المستخدم؟")) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success("تم حذف العضو بنجاح");
      fetchMembers();
    } catch (error) {
      console.error("خطأ في تعطيل المستخدم:", error);
      toast.error("فيه مشكلة في حذف العضو");
    }
  };

  if (loading) return <Loader text="بنحمّل الأعضاء..." />;

  return (
    <div className="pb-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-ios-primary/10 rounded-2xl">
            <Users className="text-ios-primary" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-(--color-dark)">الناس</h1>
        </div>
        {user.role === "admin" && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-5 py-3 bg-ios-primary hover:bg-ios-dark text-white font-semibold rounded-2xl transition-all shadow-lg flex items-center gap-2"
          >
            <UserPlus size={20} />
            {showAddForm ? "إلغاء" : "ضيف حد"}
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="bg-[--color-surface] backdrop-blur-xl p-6 rounded-3xl border border-[--color-border] mb-8 max-w-lg mx-auto shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-[--color-dark]">
            ضيف واحد جديد
          </h3>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-2xl mb-4 text-sm border border-red-200">
              {error}
            </div>
          )}
          <form onSubmit={handleAddMember} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[--color-dark] mb-1">
                الاسم
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 bg-[--color-bg] border border-[--color-border] rounded-2xl text-[--color-dark] focus:outline-none focus:border-ios-primary focus:ring-2 focus:ring-ios-primary/20 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[--color-dark] mb-1">
                اسم المستخدم
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full px-4 py-3 bg-[--color-bg] border border-[--color-border] rounded-2xl text-[--color-dark] focus:outline-none focus:border-ios-primary focus:ring-2 focus:ring-ios-primary/20 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[--color-dark] mb-1">
                كلمة المرور
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-3 bg-[--color-bg] border border-[--color-border] rounded-2xl text-[--color-dark] focus:outline-none focus:border-ios-primary focus:ring-2 focus:ring-ios-primary/20 transition-all"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 px-4 bg-ios-primary hover:bg-ios-dark text-white font-bold rounded-2xl transition-all shadow-lg"
            >
              ضيفه
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <div
            key={member._id}
            className="bg-[--color-surface] backdrop-blur-xl p-6 rounded-3xl border border-[--color-border] flex flex-col items-center text-center hover:shadow-lg transition-all"
          >
            {member.profilePicture ? (
              <img
                src={`/profiles/${member.profilePicture}`}
                alt={member.name}
                className="w-20 h-20 rounded-full shadow-lg object-cover mb-4"
                style={{ border: "3px solid var(--color-primary)" }}
              />
            ) : (
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-4 shadow-lg"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-primary) 0%, var(--color-info) 100%)",
                }}
              >
                {member.name.charAt(0).toUpperCase()}
              </div>
            )}
            <h3 className="text-lg font-bold text-[--color-dark] mb-1">
              {member.name}
            </h3>
            <p className="text-[  --color-secondary] text-sm mb-4">
              @{member.username}
            </p>

            <span
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide mb-4 flex items-center gap-1.5 ${
                member.role === "admin"
                  ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                  : "bg-ios-primary/10 text-ios-primary border border-ios-primary/20"
              }`}
            >
              {member.role === "admin" ? (
                <ShieldCheck size={14} />
              ) : (
                <UserIcon size={14} />
              )}
              {member.role === "admin" ? "أدمن" : "عضو"}
            </span>

            {user.role === "admin" && member.role !== "admin" && (
              <button
                onClick={() => handleDeactivate(member._id)}
                className="mt-auto px-4 py-2 border-2 border-red-200 text-red-600 hover:bg-red-50 rounded-2xl text-sm font-semibold transition-all w-full"
              >
                امسحه
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Members;
