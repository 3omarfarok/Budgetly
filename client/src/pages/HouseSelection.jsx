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
    <div className="min-h-screen flex items-center justify-center px-4 py-6 sm:p-4 font-primary">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 border animate-bounce rounded-full mb-3 sm:mb-4 shadow-lg"
            style={{
              borderColor: "var(--color-border)",
              backgroundColor: "var(--color-primary)",
            }}
          >
            <Home className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1
            className="text-2xl sm:text-4xl font-bold mb-2"
            style={{ color: "var(--color-dark)" }}
          >
            اختر بيتك
          </h1>
          <p
            className="text-base sm:text-lg"
            style={{ color: "var(--color-muted)" }}
          >
            انضم لبيت موجود أو أنشئ بيت جديد
          </p>
        </div>

        {error && (
          <Toast message={error} type="error" onClose={() => setError("")} />
        )}

        <div
          className="rounded-2xl shadow-2xl p-4 sm:p-8 border"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
          }}
        >
          {/* Create New House Button */}
          {!showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              disabled={submitting}
              className="w-full mb-4 sm:mb-6 cursor-pointer text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm sm:text-base"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              <Plus className="w-5 h-5" />
              إنشاء بيت جديد
            </button>
          )}

          {/* Create House Form */}
          {showCreateForm && (
            <form
              onSubmit={handleCreateHouse}
              className="mb-4 sm:mb-6 p-4 sm:p-6 rounded-xl"
              style={{ backgroundColor: "var(--color-hover)" }}
            >
              <h3
                className="text-base sm:text-lg font-semibold mb-3 sm:mb-4"
                style={{ color: "var(--color-dark)" }}
              >
                إنشاء بيت جديد
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newHouseName}
                  onChange={(e) => setNewHouseName(e.target.value)}
                  placeholder="اسم البيت (مثال: عائلة أحمد)"
                  className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:border-transparent text-sm sm:text-base"
                  style={{
                    backgroundColor: "var(--color-bg)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-dark)",
                  }}
                  disabled={submitting}
                  autoFocus
                />
                <input
                  type="password"
                  value={newHousePassword}
                  onChange={(e) => setNewHousePassword(e.target.value)}
                  placeholder="كلمة المرور (4 أحرف على الأقل)"
                  className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:border-transparent text-sm sm:text-base"
                  style={{
                    backgroundColor: "var(--color-bg)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-dark)",
                  }}
                  disabled={submitting}
                  minLength={4}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  style={{ backgroundColor: "var(--color-primary)" }}
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
                  className="px-6 py-3 rounded-xl font-semibold transition-all text-sm sm:text-base"
                  style={{
                    backgroundColor: "var(--color-light)",
                    color: "var(--color-dark)",
                  }}
                >
                  إلغاء
                </button>
              </div>
            </form>
          )}

          {/* Available Houses List */}
          <div>
            <h3
              className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2"
              style={{ color: "var(--color-dark)" }}
            >
              <Users className="w-5 h-5" />
              البيوت المتاحة
            </h3>

            {houses.length === 0 ? (
              <div
                className="text-center py-8 sm:py-12"
                style={{ color: "var(--color-muted)" }}
              >
                <Home className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 opacity-50" />
                <p className="text-sm sm:text-base">لا توجد بيوت حالياً</p>
                <p className="text-xs sm:text-sm mt-2">كن أول من ينشئ بيت!</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:gap-4">
                {houses.map((house) => (
                  <div
                    key={house._id}
                    className="p-4 sm:p-5 rounded-xl border-2 transition-all"
                    style={{
                      backgroundColor: "var(--color-bg)",
                      borderColor: "var(--color-border)",
                    }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                      <div className="flex-1">
                        <h4
                          className="text-base sm:text-lg font-semibold mb-1"
                          style={{ color: "var(--color-dark)" }}
                        >
                          {house.name}
                        </h4>
                        <div
                          className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm"
                          style={{ color: "var(--color-muted)" }}
                        >
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
                          className="w-full sm:w-auto text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                          style={{ backgroundColor: "var(--color-primary)" }}
                        >
                          <LogIn className="w-5 h-5" />
                          انضم
                        </button>
                      )}
                    </div>
                    {selectedHouse === house._id && (
                      <form
                        onSubmit={handleJoinSubmit}
                        className="mt-3 pt-3 border-t"
                        style={{ borderColor: "var(--color-border)" }}
                      >
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="password"
                            value={joinPassword}
                            onChange={(e) => setJoinPassword(e.target.value)}
                            placeholder="ادخل كلمة المرور"
                            className="flex-1 px-4 py-2.5 sm:py-2 rounded-xl border focus:ring-2 text-sm sm:text-base"
                            style={{
                              backgroundColor: "var(--color-bg)",
                              borderColor: "var(--color-border)",
                              color: "var(--color-dark)",
                            }}
                            disabled={submitting}
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              disabled={submitting}
                              className="flex-1 sm:flex-initial text-white px-4 py-2.5 sm:py-2 rounded-xl font-semibold transition-all disabled:opacity-50 text-sm sm:text-base"
                              style={{
                                backgroundColor: "var(--color-primary)",
                              }}
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
                              className="flex-1 sm:flex-initial px-4 py-2.5 sm:py-2 rounded-xl font-semibold transition-all text-sm sm:text-base"
                              style={{
                                backgroundColor: "var(--color-light)",
                                color: "var(--color-dark)",
                              }}
                            >
                              إلغاء
                            </button>
                          </div>
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
        <div
          className="mt-4 sm:mt-6 text-center text-xs sm:text-sm px-4"
          style={{ color: "var(--color-muted)" }}
        >
          <p>💡 البيت هو المجموعة التي تدير ميزانيتها معاً</p>
        </div>
      </div>
    </div>
  );
};

export default HouseSelection;
