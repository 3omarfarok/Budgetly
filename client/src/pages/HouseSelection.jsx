import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import Loader from "../components/Loader";
import Toast from "../components/Toast";
import { Home, Users, Plus, LogIn } from "lucide-react";

const HouseSelection = () => {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newHouseName, setNewHouseName] = useState("");
  const [newHousePassword, setNewHousePassword] = useState("");
  const [joinPassword, setJoinPassword] = useState("");
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user, createHouse, joinHouse } = useAuth();

  useEffect(() => {
    // If user already has a house, redirect to dashboard
    if (user?.house) {
      navigate("/");
      return;
    }
    fetchHouses();
  }, [user, navigate]);

  const fetchHouses = async () => {
    try {
      const { data } = await api.get("/houses");
      setHouses(data);
    } catch (err) {
      setError("فشل تحميل البيوت المتاحة");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHouse = async (e) => {
    e.preventDefault();
    if (!newHouseName.trim()) {
      setError("يرجى إدخال اسم البيت");
      return;
    }

    if (!newHousePassword || newHousePassword.length < 4) {
      setError("كلمة المرور يجب أن تكون 4 أحرف على الأقل");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await createHouse(newHouseName.trim(), newHousePassword);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "فشل إنشاء البيت");
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinHouse = async (houseId) => {
    setSelectedHouse(houseId);
    setJoinPassword("");
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    if (!joinPassword) {
      setError("يرجى إدخال كلمة المرور");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await joinHouse(selectedHouse, joinPassword);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "فشل الانضمام للبيت");
    } finally {
      setSubmitting(false);
      setSelectedHouse(null);
      setJoinPassword("");
    }
  };

  if (loading) {
    return <Loader text="بنحمّل البيوت المتاحة..." />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-primary bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-4 shadow-lg">
            <Home className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 font-headings">
            اختر بيتك
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            انضم لبيت موجود أو أنشئ بيت جديد
          </p>
        </div>

        {error && (
          <Toast message={error} type="error" onClose={() => setError("")} />
        )}

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
          {/* Create New House Button */}
          {!showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              disabled={submitting}
              className="w-full mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              إنشاء بيت جديد
            </button>
          )}

          {/* Create House Form */}
          {showCreateForm && (
            <form
              onSubmit={handleCreateHouse}
              className="mb-6 p-6 bg-blue-50 dark:bg-gray-700 rounded-xl"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                إنشاء بيت جديد
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newHouseName}
                  onChange={(e) => setNewHouseName(e.target.value)}
                  placeholder="اسم البيت (مثال: عائلة أحمد)"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={submitting}
                  autoFocus
                />
                <input
                  type="password"
                  value={newHousePassword}
                  onChange={(e) => setNewHousePassword(e.target.value)}
                  placeholder="كلمة المرور (4 أحرف على الأقل)"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={submitting}
                  minLength={4}
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "جاري الإنشاء..." : "إنشاء"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewHouseName("");
                    setNewHousePassword("");
                  }}
                  disabled={submitting}
                  className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white px-6 py-3 rounded-xl font-semibold transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          )}

          {/* Available Houses List */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              البيوت المتاحة
            </h3>

            {houses.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Home className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>لا توجد بيوت حالياً</p>
                <p className="text-sm mt-2">كن أول من ينشئ بيت!</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {houses.map((house) => (
                  <div
                    key={house._id}
                    className="p-5 bg-gray-50 dark:bg-gray-700 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {house.name}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {house.memberCount} عضو
                          </span>
                          <span>مدير: {house.admin?.name}</span>
                        </div>
                      </div>
                      {selectedHouse !== house._id && (
                        <button
                          onClick={() => handleJoinHouse(house._id)}
                          disabled={submitting}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <LogIn className="w-5 h-5" />
                          انضم
                        </button>
                      )}
                    </div>
                    {selectedHouse === house._id && (
                      <form
                        onSubmit={handleJoinSubmit}
                        className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600"
                      >
                        <div className="flex gap-2">
                          <input
                            type="password"
                            value={joinPassword}
                            onChange={(e) => setJoinPassword(e.target.value)}
                            placeholder="ادخل كلمة المرور"
                            className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            disabled={submitting}
                            autoFocus
                          />
                          <button
                            type="submit"
                            disabled={submitting}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold transition-all disabled:opacity-50"
                          >
                            {submitting ? "..." : "تأكيد"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedHouse(null);
                              setJoinPassword("");
                            }}
                            disabled={submitting}
                            className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-xl font-semibold transition-all"
                          >
                            إلغاء
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info Message */}
        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>💡 البيت هو المجموعة التي تدير ميزانيتها معاً</p>
        </div>
      </div>
    </div>
  );
};

export default HouseSelection;
