import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../utils/api";
import { Trash2, Send, StickyNote } from "lucide-react";

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/notes");
      setNotes(data);
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast.error("فشل في تحميل الملاحظات");
    } finally {
      setLoading(false);
    }
  };

  const calculateRows = (text) => {
    if (!text) return 1;
    const newLines = (text.match(/\n/g) || []).length;
    return Math.min(Math.max(newLines + 1, 1), 6); // Min 1, Max 6 lines
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      setSubmitting(true);
      const { data } = await api.post("/notes", { content: newNote });
      setNotes([data, ...notes]);
      setNewNote("");
      toast.success("تم إضافة الملاحظة");
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error("فشل في إضافة الملاحظة");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm("متأكد أنك عايز تحذف الملاحظة دي؟")) return;

    try {
      await api.delete(`/notes/${id}`);
      setNotes(notes.filter((note) => note._id !== id));
      toast.success("تم حذف الملاحظة");
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("فشل في حذف الملاحظة");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ar-EG", {
      day: "numeric",
      month: "long",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-(--color-primary) mb-2 flex items-center justify-center gap-3">
          <StickyNote className="w-8 h-8" />
          ملاحظات البيت
        </h1>
        <p className="text-(--color-muted)">
          شارك أفكارك وملاحظاتك مع أهل البيت
        </p>
      </div>

      {/* Add Note Form */}
      <div className="bg-(--color-surface) rounded-2xl p-6 shadow-sm border border-(--color-border) mb-8">
        <form onSubmit={handleAddNote} className="relative">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="اكتب ملاحظة جديدة..."
            className="w-full bg-(--color-bg) border border-(--color-border) rounded-xl p-4 pl-12 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-(--color-primary) transition-all resize-none"
            rows={calculateRows(newNote)}
          />
          <button
            type="submit"
            disabled={submitting || !newNote.trim()}
            className="absolute bottom-4 left-4 p-2 bg-(--color-primary) text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">نشر</span>
                <Send size={18} />
              </div>
            )}
          </button>
        </form>
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10">
            <div className="w-8 h-8 border-4 border-(--color-primary) border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-(--color-muted)">جاري تحميل الملاحظات...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-10 bg-(--color-surface) rounded-2xl border border-dashed border-(--color-border)">
            <StickyNote className="w-12 h-12 text-(--color-border) mx-auto mb-3" />
            <p className="text-(--color-muted)">مفيش ملاحظات لسه</p>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note._id}
              className="bg-(--color-surface) rounded-2xl p-5 shadow-sm border border-(--color-border) hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-(--color-primary-bg) flex items-center justify-center text-(--color-primary) font-bold text-lg">
                    {note.createdBy?.name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <h3 className="font-bold text-(--color-text)">
                      {note.createdBy?.name || "مستخدم غير موجود"}
                    </h3>
                    <span className="text-xs text-(--color-muted)">
                      {formatDate(note.date)}
                    </span>
                  </div>
                </div>
                {(user.role === "admin" || user.id === note.createdBy?._id) && (
                  <button
                    onClick={() => handleDeleteNote(note._id)}
                    className="p-2 text-(--color-status-rejected) hover:bg-(--color-status-rejected-bg) rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    title="حذف الملاحظة"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
              <p className="text-(--color-text) whitespace-pre-wrap leading-relaxed">
                {note.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
