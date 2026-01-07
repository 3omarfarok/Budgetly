import { useState } from "react";
import { Plus, Users, ArrowRight, Home } from "lucide-react";
import Loader from "../components/Loader";
import Input from "../components/Input";
import useHouseSelection from "../hooks/useHouseSelection";

const HouseSelection = () => {
  const {
    houses,
    loading,
    error,
    createHouse,
    joinHouse,
    isCreating,
    isJoining,
  } = useHouseSelection();

  const [view, setView] = useState("list"); // list, create, join
  const [selectedHouse, setSelectedHouse] = useState(null);

  // Form States
  const [newHouseName, setNewHouseName] = useState("");
  const [newHousePassword, setNewHousePassword] = useState("");
  const [joinPassword, setJoinPassword] = useState("");

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newHouseName || !newHousePassword) return;

    try {
      await createHouse({
        name: newHouseName,
        password: newHousePassword,
      });
    } catch (error) {
      // Handled in hook
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!selectedHouse || !joinPassword) return;

    try {
      await joinHouse({
        houseId: selectedHouse._id,
        password: joinPassword,
      });
    } catch (err) {
      // Handled in hook
    }
  };

  if (loading) return <Loader text="بنحمّل البيوت المتاحة..." />;

  // Initial error or data check
  if (error) {
    return (
      <div className="min-h-screen bg-(--color-bg) flex items-center justify-center">
        <p className="text-red-500">
          حدث خطأ في تحميل البيوت. يرجى المحاولة مرة أخرى.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--color-bg) p-6 flex items-center justify-center font-primary">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-4 rounded-3xl bg-(--color-surface)/10 text-(--color-primary) mb-4">
            <Home size={32} />
          </div>
          <h1 className="text-2xl font-bold text-(--color-dark) mb-2">
            أهلاً بيك في Budgetly
          </h1>
          <p className="text-(--color-muted)">
            علشان تبدأ، لازم تنضم لبيت أو تعمل بيت جديد
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-(--color-surface) rounded-3xl shadow-xl border border-(--color-border) overflow-hidden transition-all duration-300">
          {view === "list" && (
            <div className="p-6">
              <div className="grid gap-3 mb-6">
                <button
                  onClick={() => setView("create")}
                  className="p-4 rounded-2xl bg-(--color-primary) text-white hover:opacity-90 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <Plus size={20} />
                    </div>
                    <div className="text-right">
                      <span className="block font-bold">إنشاء بيت جديد</span>
                      <span className="text-xs opacity-80">
                        أعمل بيت وضيف صحابك
                      </span>
                    </div>
                  </div>
                  <ArrowRight
                    size={18}
                    className="transform rotate-180 group-hover:-translate-x-1 transition-transform"
                  />
                </button>

                {houses?.length > 0 && (
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-(--color-border)"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-(--color-surface) px-2 text-(--color-muted)">
                        أو انضم لبيت موجود
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {houses?.length > 0 ? (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                  {houses.map((house) => (
                    <button
                      key={house._id}
                      onClick={() => {
                        setSelectedHouse(house);
                        setView("join");
                      }}
                      className="w-full p-4 rounded-2xl bg-(--color-bg) hover:bg-(--color-hover) border border-(--color-border) transition-all flex items-center justify-between group text-right"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-(--color-surface) flex items-center justify-center text-(--color-primary) font-bold border border-(--color-border)">
                          {house.name.charAt(0)}
                        </div>
                        <div>
                          <span className="block font-bold text-(--color-dark)">
                            {house.name}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-(--color-muted)">
                            <Users size={12} />
                            <span>{house.membersCount} عضو</span>
                          </div>
                        </div>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-(--color-surface) text-xs font-semibold text-(--color-secondary) group-hover:bg-(--color-primary) group-hover:text-white transition-colors">
                        انضمام
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-(--color-muted)">
                  <p>مفيش بيوت متاحة حالياً</p>
                </div>
              )}
            </div>
          )}

          {view === "create" && (
            <div className="p-6">
              <div
                className="flex items-center gap-2 mb-6 text-(--color-muted) cursor-pointer hover:text-(--color-dark)"
                onClick={() => setView("list")}
              >
                <ArrowRight size={18} className="transform rotate-180" />
                <span className="text-sm font-bold">رجوع</span>
              </div>

              <h2 className="text-xl font-bold mb-4 text-(--color-dark)">
                إنشاء بيت جديد
              </h2>

              <form onSubmit={handleCreate} className="space-y-4">
                <Input
                  label="اسم البيت"
                  value={newHouseName}
                  onChange={(e) => setNewHouseName(e.target.value)}
                  placeholder="مثلاً: بيت العز"
                  required
                />
                <Input
                  label="باسوورد الانضمام"
                  type="password"
                  value={newHousePassword}
                  onChange={(e) => setNewHousePassword(e.target.value)}
                  placeholder="اللي هيدخل بيه صحابك"
                  required
                />
                <button
                  type="submit"
                  disabled={isCreating}
                  className="w-full py-3 rounded-2xl bg-(--color-primary) text-white font-bold hover:shadow-lg hover:bg-(--color-primary-dark) transition-all disabled:opacity-50"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  {isCreating ? "جاري الإنشاء..." : "إنشاء البيت"}
                </button>
              </form>
            </div>
          )}

          {view === "join" && selectedHouse && (
            <div className="p-6">
              <div
                className="flex items-center gap-2 mb-6 text-(--color-muted) cursor-pointer hover:text-(--color-dark)"
                onClick={() => {
                  setView("list");
                  setSelectedHouse(null);
                  setJoinPassword("");
                }}
              >
                <ArrowRight size={18} className="transform rotate-180" />
                <span className="text-sm font-bold">رجوع</span>
              </div>

              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-(--color-primary)/10 flex items-center justify-center text-(--color-primary) text-2xl font-bold mb-3">
                  {selectedHouse.name.charAt(0)}
                </div>
                <h2 className="text-xl font-bold text-(--color-dark)">
                  انضمام لـ {selectedHouse.name}
                </h2>
                <p className="text-sm text-(--color-muted)">
                  أدخل باسوورد البيت عشان تنضم
                </p>
              </div>

              <form onSubmit={handleJoin} className="space-y-4">
                <Input
                  type="password"
                  value={joinPassword}
                  onChange={(e) => setJoinPassword(e.target.value)}
                  placeholder="باسوورد البيت"
                  className="text-center"
                  autoFocus
                  required
                />
                <button
                  type="submit"
                  disabled={isJoining}
                  className="w-full py-3 rounded-2xl bg-(--color-primary) text-white font-bold hover:shadow-lg hover:bg-(--color-primary-dark) transition-all disabled:opacity-50"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  {isJoining ? "جاري الانضمام..." : "انضمام الآن"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HouseSelection;
